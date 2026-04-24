import express from "express";
import type { Request, Response } from "express";
import {
	getChoresByHome,
	getChoreById,
	createChore,
	removeChoreById,
	updateChore,
} from "../models/Chore-Services";
import { Home } from "../models/Home";

export const choreRouter = express.Router();

// get all chores for an apartment
choreRouter.get("/:homeCode/chores", async (req: Request, res: Response) => {
	try {
		const { homeCode } = req.params;
		const home = await Home.findOne({ homeCode }).select("_id");

		if (!home) {
			return res.status(404).json({ error: "Home not found" });
		}

		const chores = await getChoresByHome(home._id);
		res.json(chores);
	} catch (err) {
		console.error(err);
		res.status(500).json({ error: "Failed to fetch chores" });
	}
});

// get a chore by its id
choreRouter.get(
	"/:homeCode/chores/:choreId",
	async (req: Request, res: Response) => {
		try {
			const { choreId } = req.params;
			const chore = await getChoreById(choreId);
			if (!chore) {
				return res.status(404).json({ error: "Chore not found" });
			}
			res.status(200).json(chore);
		} catch (err) {
			console.error(err);
			res.status(500).json({ error: "Failed to fetch chore" });
		}
	}
);

// create chore
choreRouter.post("/:homeCode/chores", async (req: Request, res: Response) => {
	try {
		const { homeCode } = req.params;
		const home = await Home.findOne({ homeCode }).select("_id");

		if (!home) {
			return res.status(404).json({ error: "Home not found" });
		}

		const chore = await createChore({
			...req.body,
			homeId: home._id,
		});
		res.status(201).json(chore);
	} catch (error) {
		console.error(error);
		res.status(400).json({ error: "Failed to create chore" });
	}
});

// update chore by id
choreRouter.patch(
	"/:homeCode/chores/:choreId",
	async (req: Request, res: Response) => {
		try {
			const chore = await updateChore(req.params.choreId, req.body);
			if (!chore) {
				return res.status(404).json({ error: "Chore not found" });
			}
			res.status(200).json(chore);
		} catch (error) {
			console.error(error);
			res.status(400).json({ error: "Failed to update chore" });
		}
	}
);

// delete chore by id
choreRouter.delete(
	"/:homeCode/chores/:choreId",
	async (req: Request, res: Response) => {
		try {
			const deleted = await removeChoreById(req.params.choreId);
			if (!deleted) {
				return res.status(404).json({ error: "Chore not found" });
			}
			res.status(204).json({ message: "Chore deleted successfully" });
		} catch (error) {
			console.error(error);
			res.status(400).json({ error: "Failed to delete chore" });
		}
	}
);
