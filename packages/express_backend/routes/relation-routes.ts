import express from "express";
import type { Request, Response } from "express";
import { getHomeByCode, getHomesByUser } from "../models/Home-Services.ts";
import {
	getUserByUsername,
	getUsersByHomeAndRelation,
} from "../models/User-Services.ts";
import mongoose from "mongoose";

interface UserRelation {
	userId: mongoose.Schema.Types.ObjectId;
	relationship: string;
}
interface HomeRelation {
	userId: mongoose.Schema.Types.ObjectId;
	relationship: string;
}

export const relationRouter = express.Router();

//creates a relation between user and home
relationRouter.post(
	"/relate/:username/:homeCode",
	async (req: Request, res: Response) => {
		try {
			const relationship = req.body.relationship;

			const h = await getHomeByCode(req.params.homeCode);

			if (!h) {
				return res.status(404).json({ error: "Home not found" });
			}

			const u = await getUserByUsername(req.params.username);

			if (!u) {
				return res.status(404).json({ error: "User not found" });
			}
			if (
				await getUsersByHomeAndRelation(h._id, relationship).then(
					(users) => users.some((user) => user._id.equals(u._id))
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
		const u = await getUserByUsername(req.params.username);

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
