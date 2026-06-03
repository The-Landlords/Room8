import express from "express";
import type { Request, Response } from "express";
import mongoose from "mongoose";

import {
	getHomeByCode,
	getHomeByName,
	updateHome,
	getHomesByUser,
	getHomesByUserAndRelation,
} from "../models/Home-Services.js";

import {
	getUserById,
	getUsersByHomeAndRelation,
	updateUserById,
} from "../models/User-Services.js";

import { requireAuth } from "./userSessionAuth.js";
import { createGuestAscension, getGuestAscensionByGuest } from "../models/GuestAscension-Services.js";

export const relationRouter = express.Router();

//SESSION HELPER
function getSessionUserId(req: Request) {
	const sessionUserId = req.session.userId;

	if (
		typeof sessionUserId !== "string" ||
		!mongoose.Types.ObjectId.isValid(sessionUserId)
	) {
		return null;
	}

	return new mongoose.Types.ObjectId(sessionUserId);
}

//CREATE RELATION
relationRouter.post(
	"/relate/me/:homeCode",
	requireAuth,
	async (req: Request, res: Response) => {
		try {
			const homeCode = String(req.params.homeCode);

			const relationship = String(req.body.relationship || "")
				.toUpperCase()
				.trim();

			const home = await getHomeByCode(homeCode);
			if (!home) return res.status(404).json({ error: "Home not found" });

			const userId = getSessionUserId(req);
			if (!userId) {
				return res.status(400).json({ error: "Invalid session user id" });
			}

			const user = await getUserById(userId);
			if (!user) return res.status(404).json({ error: "User not found" });

			const alreadyLinked = await getHomesByUserAndRelation(
				user._id,
				relationship
			).then((homes) => homes.some((h) => h._id.equals(home._id)));

			if (alreadyLinked) {
				return res.status(400).json({ error: "Connection already exists" });
			}

			home.userIds.push({ userId: user._id, relationship });
			user.homeIds.push({ homeId: home._id, relationship });

			if (relationship === "GUEST") {
				const existing = await getGuestAscensionByGuest(
					user._id,
					home._id
				);

				if (!existing) {
					await createGuestAscension({
						homeId: home._id,
						guestId: user._id,
						status: "PENDING",
						votes: [],
					});
				}
			}

			await home.save();
			await user.save();

			return res.status(200).json(home);
		} catch (err) {
			console.error(err);
			return res.status(500).json({ error: "Failed to create relationship" });
		}
	}
);

//GET USER HOMES
relationRouter.get(
	"/relate/me",
	requireAuth,
	async (req: Request, res: Response) => {
		try {
			const userId = getSessionUserId(req);
			if (!userId) {
				return res.status(400).json({ error: "Invalid session user id" });
			}

			const user = await getUserById(userId);
			if (!user) return res.status(404).json({ error: "User not found" });

			const homes = await getHomesByUser(user._id);
			return res.status(200).json(homes);
		} catch (err) {
			console.error(err);
			return res.status(500).json({ error: "Failed to fetch homes" });
		}
	}
);

//REMOVE RELATION
relationRouter.patch(
	"/relate/me/:homeName",
	requireAuth,
	async (req: Request, res: Response) => {
		try {
			const homeName = String(req.params.homeName);

			const home = await getHomeByName(homeName);
			if (!home) return res.status(404).json({ error: "Home not found" });

			const userId = getSessionUserId(req);
			if (!userId) {
				return res.status(400).json({ error: "Invalid session user id" });
			}

			const user = await getUserById(userId);
			if (!user) return res.status(404).json({ error: "User not found" });

			const newHomeIds = user.homeIds.filter((h) => !h.homeId.equals(home._id));
			const newUserIds = home.userIds.filter((u) => !u.userId.equals(user._id));

			await updateHome(home._id, { userIds: newUserIds });
			await updateUserById(user._id, { homeIds: newHomeIds });

			return res.status(200).json(home);
		} catch (err) {
			console.error(err);
			return res.status(500).json({ error: "Failed to remove relationship" });
		}
	}
);

//UPDATE RELATION
relationRouter.patch(
	"/relate/me/:homeName/:newRelation",
	requireAuth,
	async (req: Request, res: Response) => {
		try {
			const homeName = String(req.params.homeName);
			const newRelation = String(req.params.newRelation)
				.toUpperCase()
				.trim();

			const home = await getHomeByName(homeName);
			if (!home) return res.status(404).json({ error: "Home not found" });

			const userId = getSessionUserId(req);
			if (!userId) {
				return res.status(400).json({ error: "Invalid session user id" });
			}

			const user = await getUserById(userId);
			if (!user) return res.status(404).json({ error: "User not found" });

			await updateHome(home._id, {
				userIds: home.userIds.map((u) =>
					u.userId.equals(user._id)
						? { userId: u.userId, relationship: newRelation }
						: u
				),
			});

			await updateUserById(user._id, {
				homeIds: user.homeIds.map((h) =>
					h.homeId.equals(home._id)
						? { homeId: h.homeId, relationship: newRelation }
						: h
				),
			});

			return res.status(200).json(home);
		} catch (err) {
			console.error(err);
			return res.status(500).json({ error: "Failed to update relationship" });
		}
	}
);

//GET USERS BY HOME + RELATION
relationRouter.get(
	"/relate/:homeCode/:relation",
	requireAuth,
	async (req: Request, res: Response) => {
		try {
			const home = await getHomeByCode(String(req.params.homeCode));
			if (!home) return res.status(404).json({ error: "Home not found" });

			const users = await getUsersByHomeAndRelation(
				home._id,
				String(req.params.relation).toUpperCase()
			);

			return res.status(200).json(users);
		} catch (err) {
			console.error(err);
			return res.status(500).json({ error: "Failed to fetch users" });
		}
	}
);

//RESIDENT COUNT
relationRouter.get(
	"/relate/home/:homeId/residents",
	requireAuth,
	async (req: Request, res: Response) => {
		try {
			if (!mongoose.Types.ObjectId.isValid(String(req.params.homeId))) {
				return res.status(400).json({ error: "Invalid home id" });
			}

			const residents = await getUsersByHomeAndRelation(
				new mongoose.Types.ObjectId(String(req.params.homeId)),
				"RESIDENT"
			);

			return res.status(200).json({ count: residents.length });
		} catch (err) {
			console.error(err);
			return res.status(500).json({ error: "Failed to fetch residents" });
		}
	}
);