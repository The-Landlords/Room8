import express from "express";
import type { Request, Response } from "express";
import {
	createUser,
	getUserById,
	getUserByUsername,
	getUsersByHomeId,
	// updateUserById,
	removeUserById,
	updateUserByUsername,
} from "../models/User-Services.js";

import mongoose from "mongoose";

export const userRouter = express.Router();

// CREATE
userRouter.post("/users", async (req: Request, res: Response) => {
	try {
		const user = await createUser(req.body);
		res.status(201).json(user);
	} catch (error) {
		console.error(error);

		if (
			typeof error === "object" &&
			error !== null &&
			"code" in error &&
			error.code === 11000
		) {
			return res.status(400).json({ error: "Username already exists" });
		}

		res.status(400).json({ error: "Failed to create User" });
	}
});

// UPDATE
userRouter.patch("/users/:username", async (req: Request, res: Response) => {
	try {
		const username = req.params.username;

		if (typeof username !== "string") {
			return res.status(400).json({ error: "Invalid username" });
		}

		const updated = await updateUserByUsername(username, req.body);

		if (!updated) {
			return res.status(404).json({ error: "User not found" });
		}

		res.status(200).json(updated);
	} catch (error) {
		console.error(error);
		res.status(400).json({ error: "Invalid username" });
	}
});

// GET BY ID
userRouter.get("/users/:id", async (req: Request, res: Response) => {
	try {
		const id = req.params.id;

		if (typeof id !== "string" || !mongoose.Types.ObjectId.isValid(id)) {
			return res.status(400).json({ error: "Invalid id" });
		}

		const objectId = new mongoose.Types.ObjectId(id);
		const user = await getUserById(objectId);

		if (!user) {
			return res.status(404).json({ error: "User not found" });
		}

		res.status(200).json(user);
	} catch (error) {
		console.error(error);
		res.status(400).json({ error: "Invalid ID" });
	}
});

// GET BY USERNAME
userRouter.get(
	"/users/username/:username",
	async (req: Request, res: Response) => {
		try {
			const name = req.params.username;

			if (typeof name !== "string") {
				return res.status(400).json({ error: "Invalid username" });
			}

			const user = await getUserByUsername(name);

			if (!user) {
				return res.status(404).json({ error: "User not found" });
			}

			res.status(200).json(user);
		} catch (error) {
			console.error(error);
			res.status(400).json({ error: "Bad request" });
		}
	}
);

// GET USERS BY HOME
userRouter.get("/users/home/:homeId", async (req: Request, res: Response) => {
	try {
		const id = req.params.homeId;

		if (typeof id !== "string" || !mongoose.Types.ObjectId.isValid(id)) {
			return res.status(400).json({ error: "Invalid id" });
		}

		const objectId = new mongoose.Types.ObjectId(id);
		const users = await getUsersByHomeId(objectId);
		res.status(200).json(users);
	} catch (error) {
		console.error(error);
		res.status(400).json({ error: "Invalid apartment ID" });
	}
});

// DELETE
userRouter.delete("/users/:id", async (req: Request, res: Response) => {
	try {
		const id = req.params.id;

		if (typeof id !== "string" || !mongoose.Types.ObjectId.isValid(id)) {
			return res.status(400).json({ error: "Invalid id" });
		}

		const objectId = new mongoose.Types.ObjectId(id);
		const removed = await removeUserById(objectId);

		if (!removed) {
			return res.status(404).json({ error: "User not found" });
		}

		// typical is 204 with no body; your peer returns JSON, either is fine.
		res.status(204).send();
	} catch (error) {
		console.error(error);
		res.status(400).json({ error: "Invalid ID" });
	}
});
