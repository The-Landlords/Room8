import express from "express";
import mongoose from "mongoose";
import type { Request, Response } from "express";

import {
	getUsersByHomeAndRelation,
	getUserById,
} from "../models/User-Services.js";

import { getHomeByCode } from "../models/Home-Services.js";

import {
	createRule,
	getRulesByHome,
	removeRuleById,
} from "../models/Rules-Services.js";

import { Rule } from "../models/Rule.js";

import { requireAuth } from "./userSessionAuth.js";

export const ruleRouter = express.Router();

const asString = (val: string | string[] | undefined): string => {
	if (!val) throw new Error("Missing param");
	return Array.isArray(val) ? val[0] : val;
};

ruleRouter.get("/auth/me", requireAuth, async (req: Request, res: Response) => {
	try {
		if (!req.session.userId) {
			return res.status(401).json({
				error: "Not authenticated",
			});
		}

		const user = await getUserById(
			new mongoose.Types.ObjectId(asString(req.session.userId))
		);

		if (!user) {
			return res.status(404).json({ error: "User not found" });
		}

		return res.json(user);
	} catch {
		return res.status(500).json({
			error: "Failed to fetch user",
		});
	}
});

ruleRouter.get(
	"/homes/rules/:homeCode",
	async (req: Request, res: Response) => {
		try {
			const rules = await getRulesByHome(asString(req.params.homeCode));

			const cleanedRules = await Promise.all(
				rules.map(async (rule) => {
					if (!rule.homeId) {
						return rule;
					}

					const validVotes = await filterValidVotes(
						rule.homeId,
						rule.votes ?? []
					);

					const validDeleteVotes = await filterValidVotes(
						rule.homeId,
						rule.deleteVotes ?? []
					);

					let changed = false;

					if (validVotes.length !== (rule.votes ?? []).length) {
						rule.set("votes", validVotes);
						changed = true;
					}

					if (
						validDeleteVotes.length !==
						(rule.deleteVotes ?? []).length
					) {
						rule.set("deleteVotes", validDeleteVotes);
						changed = true;
					}

					const yes = validVotes.filter(
						(v) => v.vote === "YES"
					).length;

					const no = validVotes.filter((v) => v.vote === "NO").length;

					const TOTAL = await getResidentCount(rule.homeId);

					if (no > 0) {
						rule.status = "REJECTED";
					} else if (yes >= TOTAL) {
						rule.status = "CONFIRMED";
					} else {
						rule.status = "PENDING";
					}

					if (changed) {
						await rule.save();
					}

					return rule;
				})
			);

			return res.json(cleanedRules);
		} catch {
			return res.status(500).json({
				error: "Failed to fetch rules",
			});
		}
	}
);

// CREATE RULE
ruleRouter.post(
	"/homes/rules",
	requireAuth,
	async (req: Request, res: Response) => {
		try {
			const home = await getHomeByCode(req.body.homeCode);
			if (!home) {
				return res.status(404).json({
					error: "Home not found",
				});
			}
			const rule = await createRule({
				description: req.body.description,
				homeId: home._id,
				status: "PENDING",
				votes: [],
				deleteVotes: [],
				deleteStatus: "NONE",
			});
			return res.status(201).json(rule);
		} catch {
			return res.status(400).json({
				error: "Failed to create rule",
			});
		}
	}
);

// RESIDENT COUNT
async function getResidentCount(homeId: mongoose.Types.ObjectId) {
	const residents = await getUsersByHomeAndRelation(homeId, "RESIDENT");
	return residents.length;
}

// FILTER INVALID VOTES
async function filterValidVotes(
	homeId: mongoose.Types.ObjectId,
	votes: { voteId: string; vote: "YES" | "NO" }[]
) {
	const residents = await getUsersByHomeAndRelation(homeId, "RESIDENT");
	const residentIds = new Set(residents.map((r) => String(r._id)));

	return votes.filter((v) => residentIds.has(String(v.voteId)));
}

// RULE VOTE
ruleRouter.post(
	"/rules/:ruleId/vote",
	requireAuth,
	async (req: Request, res: Response) => {
		try {
			const ruleId = asString(req.params.ruleId);
			const { vote } = req.body;
			const voteId = asString(req.session.userId);

			if (!mongoose.Types.ObjectId.isValid(ruleId)) {
				return res.status(400).json({
					error: "Invalid rule id",
				});
			}

			if (!vote) {
				return res.status(400).json({
					error: "Missing vote",
				});
			}

			const rule = await Rule.findById(ruleId);
			if (!rule) {
				return res.status(404).json({
					error: "Rule not found",
				});
			}

			const votes = await filterValidVotes(rule.homeId, rule.votes ?? []);

			const idx = votes.findIndex(
				(v) => String(v.voteId) === String(voteId)
			);

			if (idx !== -1) {
				votes[idx].vote = vote;
			} else {
				votes.push({
					voteId: voteId,
					vote,
				});
			}

			rule.set("votes", votes);

			const yes = votes.filter((v) => v.vote === "YES").length;

			const no = votes.filter((v) => v.vote === "NO").length;

			const TOTAL = await getResidentCount(rule.homeId);

			if (no > 0) {
				rule.status = "REJECTED";
			} else if (yes >= TOTAL) {
				rule.status = "CONFIRMED";
			} else {
				rule.status = "PENDING";
			}

			await rule.save();

			return res.json(rule);
		} catch (e) {
			return res.status(400).json({
				error: "Voting failed",
				detail: String(e),
			});
		}
	}
);

// DELETE VOTE
ruleRouter.post(
	"/rules/:ruleId/delete-vote",
	requireAuth,
	async (req: Request, res: Response) => {
		try {
			const ruleId = asString(req.params.ruleId);
			const { vote } = req.body;

			const voteId = asString(req.session.userId);

			if (!mongoose.Types.ObjectId.isValid(ruleId)) {
				return res.status(400).json({
					error: "Invalid rule id",
				});
			}

			if (!vote) {
				return res.status(400).json({
					error: "Missing vote",
				});
			}

			const rule = await Rule.findById(ruleId);

			if (!rule) {
				return res.status(404).json({
					error: "Rule not found",
				});
			}

			const deleteVotes = await filterValidVotes(
				rule.homeId,
				rule.deleteVotes ?? []
			);

			const idx = deleteVotes.findIndex(
				(v) => String(v.voteId) === String(voteId)
			);

			if (idx !== -1) {
				deleteVotes[idx].vote = vote;
			} else {
				deleteVotes.push({
					voteId: voteId,
					vote,
				});
			}

			rule.set("deleteVotes", deleteVotes);

			const yes = deleteVotes.filter((v) => v.vote === "YES").length;

			const no = deleteVotes.filter((v) => v.vote === "NO").length;

			const TOTAL = await getResidentCount(rule.homeId);

			if (no > 0) {
				rule.deleteStatus = "REJECTED";

				await rule.save();

				return res.json(rule);
			}

			if (yes >= TOTAL) {
				await removeRuleById(rule._id);

				return res.json({
					deleted: true,
				});
			}
			rule.deleteStatus = "PENDING";
			await rule.save();
			return res.json(rule);
		} catch (e) {
			return res.status(400).json({
				error: "Delete voting failed",
				detail: String(e),
			});
		}
	}
);
