import express from "express";
import type { Request, Response } from "express";
import {
	createHome,
	getHomeById,
	updateHome,
	deleteHome,
	getHomeByCode,
	// addMember,
	// removeMember,
} from "../models/Home-Services.js";
import mongoose from "mongoose";

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

homeRouter.patch("/homes/:id", async (req: Request, res: Response) => {
	try {
		const id = req.params.id;

		if (typeof id !== "string" || !mongoose.Types.ObjectId.isValid(id)) {
			return res.status(400).json({ error: "Invalid id" });
		}

		const objectId = new mongoose.Types.ObjectId(id);

		const updated = await updateHome(objectId, req.body);

		if (!updated) {
			return res.status(404).json({ error: "Home not found" });
		}

		res.status(200).json(updated);
	} catch (error) {
		console.error(error);

		res.status(400).json({ error: "Invalid ID" });
	}
});

homeRouter.get("/homes/id/:id", async (req: Request, res: Response) => {
	try {
		const id = req.params.id;

		if (typeof id !== "string" || !mongoose.Types.ObjectId.isValid(id)) {
			return res.status(400).json({ error: "Invalid id" });
		}

		const objectId = new mongoose.Types.ObjectId(id);

		const home = await getHomeById(objectId);
		if (!home) {
			return res.status(404).json({ error: "Home not found" });
		}
		res.status(200).json(home);
	} catch (error) {
		console.error(error);

		res.status(400).json({ error: "Invalid ID" });
	}
});
homeRouter.get("/homes/code/:code", async (req: Request, res: Response) => {
	try {
		const code = req.params.code;

		if (typeof code !== "string") {
			return res.status(400).json({ error: "Invalid code" });
		}

		const home = await getHomeByCode(code);

		if (!home) {
			return res.status(404).json({ error: "Home not found" });
		}
		res.status(200).json(home);
	} catch (error) {
		console.error(error);

		res.status(400).json({ error: "Code" });
	}
});

homeRouter.delete("/homes/id/:id", async (req: Request, res: Response) => {
	try {
		const id = req.params.id;

		if (typeof id !== "string" || !mongoose.Types.ObjectId.isValid(id)) {
			return res.status(400).json({ error: "Invalid id" });
		}
		const objectId = new mongoose.Types.ObjectId(id);

		const home = await deleteHome(objectId);
		if (!home) {
			return res.status(404).json({ error: "Home not found" });
		}
		res.status(204).json(home);
	} catch (error) {
		console.error(error);

		res.status(400).json({ error: "Invalid ID" });
	}
});
