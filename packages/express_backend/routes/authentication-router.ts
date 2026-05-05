import express from "express";
import type { Request, Response } from "express";

import {
	getUserByUsername,
	getUserHomeRelation,
	getUsersByHomeAndRelation,
} from "../models/User-Services";
import { getHomeByCode } from "../models/Home-Services";

export const authRouter = express.Router();

function filterResidents(residents: any[], userOneRelation: string) {
	return residents.map((resident) => {
		console.log("Resdient:" + resident);
		console.log("UserOneRelation: " + userOneRelation);
		//console.log("Visible: " + resident visibility"]);
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
	console.log("FieldVisible: " + fieldVisible);
	console.log("UserOneRelation: " + userOneRelation);
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
	"/auth/:usernameOne/:homeCode",
	async (req: Request, res: Response) => {
		console.log("IN AUTH ROUTER");
		const { usernameOne, homeCode } = req.params;
		const userOne = await getUserByUsername(usernameOne);
		const home = await getHomeByCode(homeCode);
		if (!userOne || !home) {
			console.log("User or home not found");
			return res.status(404).json({ error: "User or home not found" });
		}
		console.log("HI!");
		const residents = await getUsersByHomeAndRelation(home._id, "RESIDENT");
		console.log(residents);
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
		console.log(filteredUsers);
		res.status(200).json(filteredUsers);
	}
);
