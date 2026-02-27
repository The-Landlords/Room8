import express from "express";
import {
	getChoresByHome,
	getChoreById,
	createChore,
	removeChoreById,
	updateChore,
} from "../models/Chore-Services";
export const choreRouter = express.Router();

// get all chores for an apartment
choreRouter.get("/:homeId/chores", async (req, res) => {
	try {
		const { homeId } = req.params;
		const chores = await getChoresByHome(homeId);
		res.json(chores);
	} catch (err) {
		console.error(err);
		res.status(500).json({ error: "Failed to fetch chores" });
	}
});

// get a chore by its id
choreRouter.get("/:homeId/chores/:choreId", async (req, res) => {
	try {
		const { choreId } = req.params;
		const chore = await getChoreById(choreId);
		if (!chore) {
			return res.status(404).json({ error: "Chore not found" });
		}
		res.json(chore);
	} catch (err) {
		console.error(err);
		res.status(500).json({ error: "Failed to fetch chore" });
	}
});
// create chore
choreRouter.post("/:homeId/chores", async (req, res) => {
	try {
		const chore = await createChore(req.body);
		res.status(201).json(chore);
	} catch (error) {
		console.error(error);
		res.status(400).json({ error: "Failed to create chore" });
	}
});
// update chore by id
choreRouter.put("/:homeId/chores/:choreId", async (req, res) => {
	try {
		const chore = await updateChore(req.params.choreId, req.body);
		if (!chore) {
			return res.status(404).json({ error: "Chore not found" });
		}
		res.json(chore);
	} catch (error) {
		console.error(error);
		res.status(400).json({ error: "Failed to update chore" });
	}
});
// delete chore by id
choreRouter.delete("/:homeId/chores/:choreId", async (req, res) => {
	try {
		const deleted = await removeChoreById(req.params.choreId);
		if (!deleted) {
			return res.status(404).json({ error: "Chore not found" });
		}
		res.json({ message: "Chore deleted successfully" });
	} catch (error) {
		console.error(error);
		res.status(400).json({ error: "Failed to delete chore" });
	}
});
