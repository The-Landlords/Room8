import express from "express";
import mongoose from "mongoose";
import type { Request, Response } from "express";

import { requireAuth } from "./userSessionAuth.js";

import {
	createGuestAscension,
	getGuestAscensionByGuest,
	getGuestAscensionById,
	getGuestAscensionsByHome,
} from "../models/GuestAscension-Services.js";

import {
	getUserById,
	getUsersByHomeAndRelation,
} from "../models/User-Services.js";

import {
	getHomeByCode,
	getHomeById,
} from "../models/Home-Services.js";

export const guestAscensionRouter = express.Router();

async function getResidentCount(homeId: mongoose.Types.ObjectId) {
	const residents = await getUsersByHomeAndRelation(homeId, "RESIDENT");
	return residents.length;
}

async function filterValidVotes(
	homeId: mongoose.Types.ObjectId,
	votes: { voteId: any; vote: "YES" | "NO" }[]
) {
	const residents = await getUsersByHomeAndRelation(homeId, "RESIDENT");
	const residentIds = new Set(residents.map((r) => String(r._id)));

	return votes.filter((v) => residentIds.has(String(v.voteId)));
}

//STATUS
function computeStatus(yes: number, no: number, total: number) {
	if (no > 0) return "REJECTED";
	if (yes >= total) return "APPROVED";
	return "PENDING";
}

//CREATE ASCENSION
guestAscensionRouter.post(
	"/guest-ascension",
	requireAuth,
	async (req: Request, res: Response) => {
		try {
			const { homeCode, guestId } = req.body;

			if (!homeCode || !guestId) {
				return res.status(400).json({ error: "Missing fields" });
			}

			if (!mongoose.Types.ObjectId.isValid(guestId)) {
				return res.status(400).json({ error: "Invalid guest id" });
			}

			const home = await getHomeByCode(String(homeCode));
			if (!home) {
				return res.status(404).json({ error: "Home not found" });
			}

			const guestObjectId = new mongoose.Types.ObjectId(guestId);
			const guest = await getUserById(guestObjectId);

			if (!guest) {
				return res.status(404).json({ error: "Guest not found" });
			}

			const existing = await getGuestAscensionByGuest(
				guestObjectId,
				home._id
			);

			if (existing) {
				return res.status(400).json({ error: "Ascension already exists" });
			}

			const ascension = await createGuestAscension({
				homeId: home._id,
				guestId: guest._id,
				votes: [],
				status: "PENDING",
			});

			return res.status(201).json(ascension);
		} catch (err) {
			console.error(err);
			return res.status(500).json({ error: "Failed to create ascension request" });
		}
	}
);

//GET ASCENSIONS
guestAscensionRouter.get(
	"/guest-ascension/home/:homeCode",
	requireAuth,
	async (req: Request, res: Response) => {
		try {
			const homeCode = String(req.params.homeCode);

			const home = await getHomeByCode(homeCode);
			if (!home) {
				return res.status(404).json({ error: "Home not found" });
			}

			const ascensions = await getGuestAscensionsByHome(home._id);

			const cleaned = await Promise.all(
				ascensions.map(async (a) => {
					const votesArr = (a.votes ?? []) as any[];

					const validVotes = await filterValidVotes(
						home._id,
						votesArr
					);

					const yes = validVotes.filter(v => v.vote === "YES").length;
					const no = validVotes.filter(v => v.vote === "NO").length;
					const total = await getResidentCount(home._id);

					const newStatus = computeStatus(yes, no, total);

					let changed = false;

					if (
						newStatus !== a.status ||
						validVotes.length !== votesArr.length
					) {
						a.votes = validVotes as any;
						a.status = newStatus;
						changed = true;
					}

					if (changed) await a.save();

					const guest = await getUserById(a.guestId);

					return {
						...a.toObject(),
						guestId: guest
							? { _id: String(guest._id), fullName: guest.fullName }
							: String(a.guestId),
						yesVotes: yes,
						noVotes: no,
						totalResidents: total,
					};
				})
			);

			return res.json(cleaned);
		} catch (err) {
			console.error(err);
			return res.status(500).json({ error: "Failed to fetch ascensions" });
		}
	}
);

//VOTE
guestAscensionRouter.post(
	"/guest-ascension/:ascensionId/vote",
	requireAuth,
	async (req: Request, res: Response) => {
		try {
			const ascensionId = String(req.params.ascensionId);
			const vote = req.body.vote;
			const voterId = req.session.userId;

			if (!voterId) {
				return res.status(401).json({ error: "No session user" });
			}

			if (!mongoose.Types.ObjectId.isValid(ascensionId)) {
				return res.status(400).json({ error: "Invalid ascension id" });
			}

			const ascension = await getGuestAscensionById(
				new mongoose.Types.ObjectId(ascensionId)
			);

			if (!ascension) {
				return res.status(404).json({ error: "Not found" });
			}

			const home = await getHomeById(ascension.homeId);
			if (!home) {
				return res.status(404).json({ error: "Home not found" });
			}

			const residents = await getUsersByHomeAndRelation(
				home._id,
				"RESIDENT"
			);

			if (!residents.some(r => String(r._id) === String(voterId))) {
				return res.status(403).json({ error: "Only residents can vote" });
			}

			if (String(voterId) === String(ascension.guestId)) {
				return res.status(403).json({ error: "Guest cannot vote for themselves" });
			}

			const votes = (ascension.votes ?? []) as any[];

			const existing = votes.find(
				v => String(v.voteId) === String(voterId)
			);

			if (existing) {
				existing.vote = vote;
			} else {
				votes.push({
					voteId: new mongoose.Types.ObjectId(String(voterId)),
					vote,
				});
			}

			const validVotes = await filterValidVotes(ascension.homeId, votes);

			const yes = validVotes.filter(v => v.vote === "YES").length;
			const no = validVotes.filter(v => v.vote === "NO").length;

			const total = residents.length;

			ascension.votes = validVotes as any;
			ascension.status = computeStatus(yes, no, total);

			await ascension.save();

			const isApproved = yes >= total && no === 0;

			if (isApproved) {
				const guestId = new mongoose.Types.ObjectId(
					String(ascension.guestId)
				);

				const homeTarget = home.userIds.find(u =>
					u.userId.equals(guestId)
				);

				if (homeTarget) {
					homeTarget.relationship = "RESIDENT";
				}

				await home.save();

				const user = await getUserById(guestId);

				if (user) {
					const userTarget = user.homeIds.find(h =>
						h.homeId.equals(home._id)
					);

					if (userTarget) {
						userTarget.relationship = "RESIDENT";
					}

					await user.save();
				}

				await ascension.deleteOne();

				return res.json({ promoted: true });
			}

			return res.json(ascension);
		} catch (err) {
			console.error(err);
			return res.status(500).json({ error: "Voting failed" });
		}
	}
);

// DELETE ASCENSION
guestAscensionRouter.delete(
	"/guest-ascension/:ascensionId",
	requireAuth,
	async (req: Request, res: Response) => {
		try {
			const ascensionId = String(req.params.ascensionId);

			if (!mongoose.Types.ObjectId.isValid(ascensionId)) {
				return res.status(400).json({ error: "Invalid ascension id" });
			}

			const ascension = await getGuestAscensionById(
				new mongoose.Types.ObjectId(ascensionId)
			);

			if (!ascension) {
				return res.status(404).json({ error: "Not found" });
			}

			await ascension.deleteOne();

			return res.json({ deleted: true });
		} catch (err) {
			console.error(err);
			return res.status(500).json({ error: "Delete failed" });
		}
	}
);