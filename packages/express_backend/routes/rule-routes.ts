import express from "express";
import type { Request, Response } from "express";
export const ruleRouter = express.Router();
import {
	createRule,
	getRuleById,
	getRulesByHome,
	updateRule,
	removeRuleById,
} from "../models/Rules-Services";

// create
ruleRouter.post("/homes/rules", async (req: Request, res: Response) => {
	try {
		const rule = await createRule(req.body);
		res.status(201).json(rule);
	} catch (error) {
		console.error(error);
		res.status(400).json({ error: "Failed to create Rule" });
	}
});

// update
ruleRouter.put("/homes/rules/:id", async (req: Request, res: Response) => {
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

// get rules
ruleRouter.get("/homes/rules/:id", async (req: Request, res: Response) => {
	try {
		const event = await getRuleById(req.params.id);
		if (!event) {
			return res.status(404).json({ error: "Rule not found" });
		}
		res.status(200).json(event);
	} catch (error) {
		console.error(error);

		res.status(400).json({ error: "Invalid ID" });
	}
});
ruleRouter.get("/homes/rules/:homeId", async (req: Request, res: Response) => {
	try {
		const event = await getRulesByHome(req.params.homeId);
		if (!event) {
			return res.status(404).json({ error: "Rule not found" });
		}
		res.status(200).json(event);
	} catch (error) {
		console.error(error);

		res.status(400).json({ error: "Invalid ID" });
	}
});

// delete
ruleRouter.delete("/homes/rules/:id", async (req: Request, res: Response) => {
	try {
		const event = await removeRuleById(req.params.id);
		if (!event) {
			return res.status(404).json({ error: "Rule not found" });
		}
		res.status(204).json(event);
	} catch (error) {
		console.error(error);

		res.status(400).json({ error: "Invalid ID" });
	}
});
