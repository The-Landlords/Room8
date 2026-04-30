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
		return {
			name: resident.name,
			allergens: resident.allergens,
			pronouns: canSee(
				resident.visiblity.pronounsVisible,
				userOneRelation
			)
				? resident.pronouns
				: undefined,
			DOB: canSee(resident.visiblity.dobVisible, userOneRelation)
				? resident.DOB
				: undefined,
			likes: canSee(resident.visiblity.likesVisible, userOneRelation)
				? resident.likes
				: undefined,
			dislikes: canSee(
				resident.visiblity.dislikesVisible,
				userOneRelation
			)
				? resident.dislikes
				: undefined,
			emergencyContact: canSee(
				resident.visiblity.emergencyContactVisible,
				userOneRelation
			)
				? resident.emergencyContact
				: undefined,
		};
	});
}

function canSee(
	fieldVisible: string | undefined,
	userOneRelation: string
): boolean {
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
	"auth/:usernameOne/:homeCode",
	async (req: Request, res: Response) => {
		const { usernameOne, homeCode } = req.params;
		const userOne = await getUserByUsername(usernameOne);
		const home = await getHomeByCode(homeCode);
		const residents = await getUsersByHomeAndRelation(home._id, "RESIDENT");
		if (!userOne || !home) {
			return res.status(404).json({ error: "User or home not found" });
		}
		if (residents.length === 0) {
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
			return res
				.status(404)
				.json({ error: "No shared home found between users" });
		}
		const filteredUsers = filterResidents(residents, userOneRelation);
		console.log(filteredUsers);
		res.status(200).json(filteredUsers);
	}
);
