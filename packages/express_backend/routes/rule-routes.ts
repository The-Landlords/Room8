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

import { Rule, type RuleVote } from "../models/Rule.js";

import { requireAuth } from "./userSessionAuth.js";

export const ruleRouter = express.Router();

const asString = (val: string | string[] | undefined): string => {
	if (!val) throw new Error("Missing param");
	return Array.isArray(val) ? val[0] : val;
};

const isRuleVote = (vote: unknown): vote is RuleVote["vote"] =>
	vote === "YES" || vote === "NO";

ruleRouter.get("/auth/me", requireAuth, async (req, res) => {
	try {
		const user = await getUserById(
			new mongoose.Types.ObjectId(req.session.userId)
		);

		if (!user) {
			return res.status(404).json({ error: "User not found" });
		}

		return res.json(user);
	} catch {
		return res.status(500).json({ error: "Failed to fetch user" });
	}
});

ruleRouter.get("/homes/rules/:homeCode", async (req, res) => {
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
					rule.votes = validVotes;
					changed = true;
				}

				if (
					validDeleteVotes.length !== (rule.deleteVotes ?? []).length
				) {
					rule.deleteVotes = validDeleteVotes;
					changed = true;
				}

				const yes = validVotes.filter((v) => v.vote === "YES").length;

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
});

// create rule
ruleRouter.post("/homes/rules", requireAuth, async (req, res) => {
	try {
		const home = await getHomeByCode(req.body.homeCode);

		if (!home) return res.status(404).json({ error: "Home not found" });

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
		return res.status(400).json({ error: "Failed to create rule" });
	}
});

// resident count
async function getResidentCount(homeId: mongoose.Types.ObjectId) {
	const res = await getUsersByHomeAndRelation(homeId, "RESIDENT");
	return res.length;
}

async function filterValidVotes(
	homeId: mongoose.Types.ObjectId,
	votes: RuleVote[]
) {
	const residents = await getUsersByHomeAndRelation(homeId, "RESIDENT");

	const residentIds = new Set(residents.map((r) => String(r._id)));

	return votes.filter((v) => residentIds.has(String(v.voteId)));
}

// dVOTE d
ruleRouter.post("/rules/:ruleId/vote", requireAuth, async (req, res) => {
	//ruleRouter.post("/rules/:ruleId/vote", async (req, res) => {
	try {
		const ruleId = asString(req.params.ruleId);
		const { vote } = req.body;

		const voteId = req.session.userId;

		if (!mongoose.Types.ObjectId.isValid(ruleId)) {
			return res.status(400).json({ error: "Invalid rule id" });
		}

		if (!isRuleVote(vote)) {
			return res.status(400).json({ error: "Invalid vote" });
		}

		const rule = await Rule.findById(ruleId);
		if (!rule) return res.status(404).json({ error: "Rule not found" });

		let votes = await filterValidVotes(rule.homeId, rule.votes ?? []);

		const idx = votes.findIndex((v) => String(v.voteId) === String(voteId));

		if (idx !== -1) {
			votes[idx].vote = vote; // ensures ONE vote per user
		} else {
			votes.push({ voteId: String(voteId), vote });
		}

		rule.votes = votes;

		const yes = votes.filter((v) => v.vote === "YES").length;
		const no = votes.filter((v) => v.vote === "NO").length;

		if (!rule.homeId) {
			return res.status(400).json({ error: "Missing homeId" });
		}

		const TOTAL = await getResidentCount(rule.homeId);

		if (no > 0) rule.status = "REJECTED";
		else if (yes >= TOTAL) rule.status = "CONFIRMED";
		else rule.status = "PENDING";

		await rule.save();

		return res.json(rule);
	} catch (e) {
		return res.status(400).json({
			error: "Voting failed",
			detail: String(e),
		});
	}
});

// ===================== DELETE VOTE =====================
ruleRouter.post("/rules/:ruleId/delete-vote", requireAuth, async (req, res) => {
	//ruleRouter.post("/rules/:ruleId/delete-vote", async (req, res) => {
	try {
		const ruleId = asString(req.params.ruleId);
		const { vote } = req.body;

		const voteId = req.session.userId;

		if (!mongoose.Types.ObjectId.isValid(ruleId)) {
			return res.status(400).json({ error: "Invalid rule id" });
		}

		if (!isRuleVote(vote)) {
			return res.status(400).json({ error: "Invalid vote" });
		}

		const rule = await Rule.findById(ruleId);
		if (!rule) return res.status(404).json({ error: "Rule not found" });

		let deleteVotes = await filterValidVotes(
			rule.homeId,
			rule.deleteVotes ?? []
		);

		const idx = deleteVotes.findIndex(
			(v) => String(v.voteId) === String(voteId)
		);

		if (idx !== -1) {
			deleteVotes[idx].vote = vote;
		} else {
			deleteVotes.push({ voteId: String(voteId), vote });
		}

		rule.deleteVotes = deleteVotes;

		const yes = deleteVotes.filter((v) => v.vote === "YES").length;
		const no = deleteVotes.filter((v) => v.vote === "NO").length;

		if (!rule.homeId) {
			return res.status(400).json({ error: "Missing homeId" });
		}

		const TOTAL = await getResidentCount(rule.homeId);

		if (no > 0) {
			rule.deleteStatus = "REJECTED";
			await rule.save();
			return res.json(rule);
		}

		if (yes >= TOTAL) {
			await removeRuleById(rule._id);
			return res.json({ deleted: true });
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
});
