import express from "express";
import type { Request, Response } from "express";

import {
	getUserHomeRelation,
	getUsersByHomeAndRelation,
	getUserById,
} from "../models/User-Services.js";
import { getHomeByCode } from "../models/Home-Services.js";
import mongoose from "mongoose";
import { requireAuth } from "./userSessionAuth.js";

export const authRouter = express.Router();

function filterResidents(residents: any[], userOneRelation: string) {
	return residents.map((resident) => {
		return {
			fullName: resident.fullName,
			allergens: resident.allergens,
			pronouns: canSee(
				resident.visibility.pronounsVisible,
				userOneRelation
			)
				? resident.pronouns
				: undefined,
			DOB: canSee(resident.visibility.dobVisible, userOneRelation)
				? resident.DOB
				: undefined,
			likes: canSee(resident.visibility.likesVisible, userOneRelation)
				? resident.likes
				: undefined,
			dislikes: canSee(
				resident.visibility.dislikesVisible,
				userOneRelation
			)
				? resident.dislikes
				: undefined,
			emergencyContact: canSee(
				resident.visibility.emergencyContactVisible,
				userOneRelation
			)
				? resident.emergencyContact
				: undefined,
		};
	});
}

function canSee(fieldVisible: string, userOneRelation: string): boolean {
	if (!fieldVisible) {
		return false;
	}
	if (fieldVisible === "PUBLIC") {
		return true;
	}
	if (fieldVisible === "RESIDENT" && userOneRelation === "RESIDENT") {
		return true;
	}
	return false;
}

authRouter.get(
	"/auth/residents/:homeCode/",
	requireAuth,
	async (req: Request, res: Response) => {
		const { homeCode } = req.params;
		// uses session cookies
		const userOne = await getUserById(
			new mongoose.Types.ObjectId(req.session.userId)
		);
		const home = await getHomeByCode(homeCode.toString());
		if (!userOne || !home) {
			console.log("User or home not found");
			return res.status(404).json({ error: "User or home not found" });
		}

		const residents = await getUsersByHomeAndRelation(home._id, "RESIDENT");

		if (residents.length === 0) {
			console.log("No residents found for home code: " + homeCode);
			return res.status(404).json({
				error: "No residents found for the provided home code",
			});
		}

		const userOneRelationObject = await getUserHomeRelation(
			userOne._id,
			home._id
		);
		const userOneRelation = userOneRelationObject?.homeIds[0].relationship;
		if (!userOneRelation) {
			console.log("No shared home found between user and home");
			return res
				.status(404)
				.json({ error: "No shared home found between users" });
		}
		const filteredUsers = filterResidents(residents, userOneRelation);

		res.status(200).json(filteredUsers);
	}
);
