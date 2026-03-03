import mongoose from "mongoose";
import express from "express";
import type { Request, Response } from "express";
import {
	createUser,
	getUserById,
	getUserByUsername,
	getUsersByApartment,
	updateUser,
	removeUserById,
	addApartmentToUser,
	removeApartmentFromUser,
} from "../models/User-Services";

export const userRouter = express.Router();

// CREATE
userRouter.post("/users", async (req: Request, res: Response) => {
	try {
		const user = await createUser(req.body);
		res.status(201).json(user);
	} catch (error) {
		console.error(error);
		res.status(400).json({ error: "Failed to create User" });
	}
});

// UPDATE
userRouter.put("/users/:id", async (req: Request, res: Response) => {
	try {
		const updated = await updateUser(req.params.id, req.body);

		if (!updated) {
			return res.status(404).json({ error: "User not found" });
		}

		res.status(200).json(updated);
	} catch (error) {
		console.error(error);
		res.status(400).json({ error: "Invalid ID" });
	}
});

// GET BY ID
userRouter.get("/users/:id", async (req: Request, res: Response) => {
	try {
		const user = await getUserById(req.params.id);

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
			const user = await getUserByUsername(req.params.username);

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

// GET USERS BY APARTMENT
userRouter.get(
	"/users/apartment/:apartmentId",
	async (req: Request, res: Response) => {
		try {
			const users = await getUsersByApartment(req.params.apartmentId);
			res.status(200).json(users);
		} catch (error) {
			console.error(error);
			res.status(400).json({ error: "Invalid apartment ID" });
		}
	}
);

// DELETE
userRouter.delete("/users/:id", async (req: Request, res: Response) => {
	try {
		const removed = await removeUserById(req.params.id);

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

// ADD APARTMENT TO USER
// body: { apartmentId: "..." }
userRouter.post(
	"/users/:id/apartments",
	async (req: Request, res: Response) => {
		try {
			const { apartmentId } = req.body;

			if (!apartmentId) {
				return res
					.status(400)
					.json({ error: "apartmentId is required" });
			}

			const updated = await addApartmentToUser(
				req.params.id,
				apartmentId
			);

			if (!updated) {
				return res.status(404).json({ error: "User not found" });
			}

			res.status(200).json(updated);
		} catch (error) {
			console.error(error);
			res.status(400).json({ error: "Failed to add apartment" });
		}
	}
);

// REMOVE APARTMENT FROM USER
userRouter.delete(
	"/users/:id/apartments/:apartmentId",
	async (req: Request, res: Response) => {
		try {
			const updated = await removeApartmentFromUser(
				req.params.id,
				req.params.apartmentId
			);

			if (!updated) {
				return res.status(404).json({ error: "User not found" });
			}

			res.status(200).json(updated);
		} catch (error) {
			console.error(error);
			res.status(400).json({ error: "Failed to remove apartment" });
		}
	}
);
