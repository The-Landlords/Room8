import express from "express";
import type { Request, Response } from "express";
export const ruleRouter = express.Router();
import {
	createRule,
	getRulesByHome,
	removeRuleById,
	updateRule,
} from "../models/Rules-Services";

// List all rules for a home
ruleRouter.get("/homes/rules/:homeId", async (req: Request, res: Response) => {
	try {
		const rules = await getRulesByHome(req.params.homeId!);
		res.status(200).json(rules);
	} catch (error) {
		console.error(error);
		res.status(500).json({ error: "Failed to fetch rules" });
	}
});

// Create a rule
ruleRouter.post("/homes/rules", async (req: Request, res: Response) => {
	try {
		const rule = await createRule(req.body);
		res.status(201).json(rule);
	} catch (error) {
		console.error(error);
		res.status(400).json({ error: "Failed to create rule" });
	}
});

// Delete a rule
ruleRouter.delete("/homes/rules/:id", async (req: Request, res: Response) => {
	try {
		const rule = await removeRuleById(req.params.id!);
		if (!rule) return res.status(404).json({ error: "Rule not found" });
		res.status(204).send();
	} catch (error) {
		console.error(error);
		res.status(400).json({ error: "Delete failed" });
	}
});

ruleRouter.patch("/homes/events/:id", async (req: Request, res: Response) => {
	try {
		const updated = await updateRule(req.params.id, req.body);

		if (!updated) {
			return res.status(404).json({ error: "Rule not found" });
		}

		res.status(200).json(updated);
	} catch (error) {
		console.error(error);

		res.status(400).json({ error: "Invalid ID" });
	}
});
