import express from "express";
import mongoose from "mongoose";
import type { Request, Response } from "express";
import {
	getUsersByHomeAndRelation,
	getUserByUsername,
} from "../models/User-Services.js";

import { getHomeByCode } from "../models/Home-Services.js";
import {
	createRule,
	getRulesByHome,
	removeRuleById,
	updateRule,
} from "../models/Rules-Services.js";
import { Rule } from "../models/Rule.js";

export const ruleRouter = express.Router();

const asString = (val: string | string[] | undefined): string => {
	if (!val) throw new Error("Missing param");
	return Array.isArray(val) ? val[0] : val;
};

// GET user by username
ruleRouter.get(
	"/auth/user/:username",
	async (req: Request, res: Response) => {
		try {
			const username = asString(req.params.username);

			const user = await getUserByUsername(username);

			if (!user) {
				return res.status(404).json({ error: "User not found" });
			}

			return res.status(200).json({
				_id: user._id,
				username: user.username,
				fullName: user.fullName,
			});
		} catch {
			return res.status(500).json({ error: "Failed to fetch user" });
		}
	}
);

// GET rules by home id
ruleRouter.get("/homeId/:homeId/rules", async (req: Request, res: Response) => {
	try {
		const homeId = asString(req.params.homeId);

		const rules = await getRulesByHome(new mongoose.Types.ObjectId(homeId));

		return res.status(200).json(rules);
	} catch {
		return res.status(400).json({ error: "Invalid homeId" });
	}
});

// GET rules by home code
ruleRouter.get(
	"/homes/rules/:homeCode",
	async (req: Request, res: Response) => {
		try {
			const homeCode = asString(req.params.homeCode);
			const rules = await getRulesByHome(homeCode);
			return res.status(200).json(rules);
		} catch (error) {
			console.error(error);
			return res.status(500).json({ error: "Failed to fetch rules" });
		}
	}
);

// Create rule
ruleRouter.post("/homes/rules", async (req, res) => {
	try {
		const home = await getHomeByCode(req.body.homeCode);

		if (!home) {
			return res.status(404).json({ error: "Home not found" });
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
	} catch (error) {
		console.error(error);
		return res.status(400).json({ error: "Failed to create rule" });
	}
});

// get number of residents
async function getResidentCount(homeId: mongoose.Types.ObjectId) {
	const residents = await getUsersByHomeAndRelation(homeId, "RESIDENT");
	return residents.length;
}

// Update rule
ruleRouter.put("/rules/:ruleId", async (req: Request, res: Response) => {
	try {
		const ruleId = asString(req.params.ruleId);

		const updated = await updateRule(
			new mongoose.Types.ObjectId(ruleId),
			req.body
		);

		if (!updated) {
			return res.status(404).json({ error: "Rule not found" });
		}

		return res.status(200).json(updated);
	} catch {
		return res.status(400).json({ error: "Update failed" });
	}
});

// Delete rule
ruleRouter.delete("/rules/:ruleId", async (req: Request, res: Response) => {
	try {
		const ruleId = asString(req.params.ruleId);

		if (
			typeof ruleId !== "string" ||
			!mongoose.Types.ObjectId.isValid(ruleId)
		) {
			return res.status(400).json({ error: "Invalid rule id" });
		}

		await removeRuleById(new mongoose.Types.ObjectId(ruleId));

		return res.sendStatus(204);
	} catch {
		return res.status(400).json({ error: "Delete failed" });
	}
});

// Voting system
ruleRouter.post("/rules/:ruleId/vote", async (req: Request, res: Response) => {
	try {
		const id = req.params.ruleId;

		if (typeof id !== "string" || !mongoose.Types.ObjectId.isValid(id)) {
			return res.status(400).json({ error: "Invalid id" });
		}

		const ruleId = new mongoose.Types.ObjectId(id);
		const { userId, vote } = req.body;

		console.log("BODY:", req.body);

		if (!mongoose.Types.ObjectId.isValid(userId)) {
			return res.status(400).json({ error: "Invalid user id" });
		}

		const rule = await Rule.findById(ruleId);

		if (!rule) {
			return res.status(404).json({ error: "Rule not found" });
		}

		const existingIndex = rule.votes.findIndex(
			(v) => v.userId.toString() === userId
		);

		if (existingIndex !== -1) {
			rule.votes[existingIndex].vote = vote;
		} else {
			rule.votes.push({
				userId: new mongoose.Types.ObjectId(userId),
				vote,
			});
		}

		const yes = rule.votes.filter(
			(v: { vote: string }) => v.vote === "YES"
		).length;

		const no = rule.votes.filter(
			(v: { vote: string }) => v.vote === "NO"
		).length;

		const TOTAL_RESIDENTS = await getResidentCount(rule.homeId);

		if (TOTAL_RESIDENTS === 0) {
			return res.status(400).json({
				error: "No residents found for home",
			});
		}

		if (no > 0) {
			rule.status = "REJECTED";
		} else if (yes >= TOTAL_RESIDENTS) {
			rule.status = "CONFIRMED";
		} else {
			rule.status = "PENDING";
		}

		await rule.save();

		return res.status(200).json(rule);
	} catch (error) {
		console.error(error);
		return res.status(400).json({ error: "Voting failed" });
	}
});

// Delete voting
ruleRouter.post(
	"/rules/:ruleId/delete-vote",
	async (req: Request, res: Response) => {
		try {
			const id = req.params.ruleId;

			if (
				typeof id !== "string" ||
				!mongoose.Types.ObjectId.isValid(id)
			) {
				return res.status(400).json({ error: "Invalid id" });
			}

			const ruleId = new mongoose.Types.ObjectId(id);
			const { userId, vote } = req.body;

			if (!mongoose.Types.ObjectId.isValid(userId)) {
				return res.status(400).json({ error: "Invalid user id" });
			}

			const rule = await Rule.findById(ruleId);

			if (!rule) {
				return res.status(404).json({ error: "Rule not found" });
			}

			const existingIndex = rule.deleteVotes.findIndex(
				(v) => v.userId.toString() === userId
			);

			if (existingIndex !== -1) {
				rule.deleteVotes[existingIndex].vote = vote;
			} else {
				rule.deleteVotes.push({
					userId: new mongoose.Types.ObjectId(userId),
					vote,
				});
			}

			await rule.save();

			const yes = rule.deleteVotes.filter(
				(v: { vote: string }) => v.vote === "YES"
			).length;

			const no = rule.deleteVotes.filter(
				(v: { vote: string }) => v.vote === "NO"
			).length;

			const TOTAL_RESIDENTS = await getResidentCount(rule.homeId);

			if (TOTAL_RESIDENTS === 0) {
				return res.status(400).json({
					error: "No residents found for home",
				});
			}

			if (no > 0) {
				rule.deleteStatus = "REJECTED";
				await rule.save();
				return res.status(200).json(rule);
			}

			if (yes >= TOTAL_RESIDENTS) {
				await removeRuleById(new mongoose.Types.ObjectId(ruleId));
				return res.status(200).json({ deleted: true });
			}

			rule.deleteStatus = "PENDING";

			await rule.save();

			return res.status(200).json(rule);
		} catch (error) {
			console.error(error);
			return res.status(400).json({ error: "Delete voting failed" });
		}
	}
);