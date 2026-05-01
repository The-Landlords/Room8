import express from "express";
import type { Request, Response } from "express";
import {
	getHomeByCode,
	getHomesByUser,
	getHomeByName,
	updateHome,
	getHomesByUserAndRelation,
} from "../models/Home-Services.js";
import {
	getUserByUsername,
	// getUsersByHomeAndRelation,
	updateUserById,
} from "../models/User-Services.js";
import mongoose from "mongoose";

export const relationRouter = express.Router();

//creates a relation between user and home
relationRouter.post(
	"/relate/:username/:homeCode",
	async (req: Request, res: Response) => {
		try {
			const homecode = req.params.homeCode;

			if (typeof homecode !== "string") {
				return res.status(400).json({ error: "Invalid home code" });
			}

			const relationship = req.body.relationship;

			const h = await getHomeByCode(homecode);

			if (!h) {
				return res.status(404).json({ error: "Home not found" });
			}

			const username = req.params.username;

			if (typeof username !== "string") {
				return res.status(400).json({ error: "Invalid username" });
			}

			const u = await getUserByUsername(username);

			if (!u) {
				return res.status(404).json({ error: "User not found" });
			}

			if (
				await getHomesByUserAndRelation(u._id, relationship).then(
					(homes) => homes.some((home) => home._id.equals(h._id))
				)
			) {
				return res
					.status(400)
					.json({ error: "Connection already exists" });
			}
			h.userIds.push({ userId: u._id, relationship: relationship });
			await h.save();
			u.homeIds.push({ homeId: h._id, relationship: relationship });
			await u.save();
			console.log("added relation");
			res.status(200).json(h);
		} catch (err) {
			console.error(err);
			res.status(500).json({ error: "Failed to create relationship" });
		}
	}
);

//gets homes based off passed in user
relationRouter.get("/relate/:username", async (req: Request, res: Response) => {
	try {
		const username = req.params.username;

		if (typeof username !== "string") {
			return res.status(400).json({ error: "Invalid username" });
		}

		const u = await getUserByUsername(username);

		if (!u) {
			return res.status(404).json({ error: "User not found" });
		}

		let homes = [];
		homes = await getHomesByUser(u._id);
		res.status(200).json(homes);
	} catch (err) {
		console.error(err);
		res.status(500).json({ error: "Failed to fetch homes from user" });
	}
});

//deletes a relation between user and home, used when a user leaves a home
relationRouter.patch(
	"/relate/:username/:homeName",
	async (req: Request, res: Response) => {
		try {
			console.log("Deleting relation!");

			const homename = req.params.homeName;

			if (typeof homename !== "string") {
				return res.status(400).json({ error: "Invalid home name" });
			}

			const h = await getHomeByName(homename);

			if (!h) {
				return res.status(404).json({ error: "Home not found" });
			}

			const username = req.params.username;

			if (typeof username !== "string") {
				return res.status(400).json({ error: "Invalid username" });
			}

			const u = await getUserByUsername(username);

			if (!u) {
				return res.status(404).json({ error: "User not found" });
			}
			const removeOneUser = h.userIds.filter(
				(user) => !user.userId.equals(u._id)
			);
			const removeOneHome = u.homeIds.filter(
				(home) => !home.homeId.equals(h._id)
			);

			const updatedHome = await updateHome(h._id, {
				userIds: removeOneUser,
			});
			if (!updatedHome) {
				return res
					.status(404)
					.json({ error: "Home not found for update" });
			}
			await h.save();
			const updatedUser = await updateUserById(u._id, {
				homeIds: removeOneHome,
			});
			if (!updatedUser) {
				return res
					.status(404)
					.json({ error: "User not found for update" });
			}
			await u.save();

			res.status(200).json(h);
		} catch (err) {
			console.error(err);
			res.status(500).json({ error: "Failed to remove relationship" });
		}
	}
);
