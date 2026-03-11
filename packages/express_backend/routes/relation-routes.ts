import express from "express";
import type { Request, Response } from "express";
import { getHomeByCode } from "../models/Home-Services.ts";
import { getUserByUsername } from "../models/User-Services.ts";
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

relationRouter.post(
	"/relate/:username/:homeCode",
	async (req: Request, res: Response) => {
		try {
			console.log("Connected to relate route");
			const relationship = req.body.relationship;
			const h = await getHomeByCode(req.params.homeCode);

			if (!h) {
				return res.status(404).json({ error: "Home not found" });
			}

			const u = await getUserByUsername(req.params.username);

			if (!u) {
				return res.status(404).json({ error: "User not found" });
			}

			h.userIds.push({ userId: u._id, relationship: relationship });
			await h.save();
			u.homeIds.push({ homeId: h._id, relationship: relationship });
			await u.save();
			res.status(200).json({
				message: "Relationship created successfully",
			});
		} catch (err) {
			console.error(err);
			res.status(500).json({ error: "Failed to create relationship" });
		}
	}
);
