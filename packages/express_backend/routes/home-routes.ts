import mongoose from "mongoose";
import express from "express";
import type { Request, Response } from "express";
import {
	createHome,
	getHomeById,
	updateHome,
	deleteHome,
	addMember,
	removeMember,
} from "../models/Home-Services";
export const homeRouter = express.Router();

homeRouter.post("/homes", async (req: Request, res: Response) => {
	try {
		const home = await createHome(req.body);
		res.status(201).json(home);
	} catch (error) {
		console.error(error);
		res.status(400).json({ error: "Failed to create Home" });
	}
});

homeRouter.put("/homes/:id", async (req: Request, res: Response) => {
	try {
		const updated = await updateHome(req.params.id, req.body);

		if (!updated) {
			return res.status(404).json({ error: "Home not found" });
		}

		res.status(200).json(updated);
	} catch (error) {
		console.error(error);

		res.status(400).json({ error: "Invalid ID" });
	}
});

homeRouter.get("/homes/:id", async (req: Request, res: Response) => {
	try {
		const event = await getHomeById(req.params.id);
		if (!event) {
			return res.status(404).json({ error: "Home not found" });
		}
		res.status(200).json(event);
	} catch (error) {
		console.error(error);

		res.status(400).json({ error: "Invalid ID" });
	}
});

homeRouter.delete("/homes/:id", async (req: Request, res: Response) => {
	try {
		const event = await deleteHome(req.params.id);
		if (!event) {
			return res.status(404).json({ error: "Home not found" });
		}
		res.status(204).json(event);
	} catch (error) {
		console.error(error);

		res.status(400).json({ error: "Invalid ID" });
	}
});

//TODO AddMember and RemoveMember routes
