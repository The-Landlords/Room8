import express from "express";
import type { Request, Response } from "express";

import {
	getUserByUsername,
	getUserHomeRelation,
	getUsersByHomeAndRelation,
} from "../models/User-Services.js";

import { getUncompletedChoresByHome } from "../models/Chore-Services.js";
import { getApprovedRulesByHome } from "../models/Rules-Services.js";
import { getUpcomingEventsByHome } from "../models/Event-Services.js";

import { getCurrentGroceryItemsByHome } from "../models/Grocery-Services.js";

import { getHomeByCode } from "../models/Home-Services.js";

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
	"/auth/residents/:usernameOne/:homeCode/",
	async (req: Request, res: Response) => {
		const { usernameOne, homeCode } = req.params;
		console.log("Received request for residents with params:", req.params);
		const userOne = await getUserByUsername(usernameOne.toString());
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

authRouter.get(
	"/auth/homeDisplay/:username/:homeCode/",
	async (req: Request, res: Response) => {
		console.log(
			"Received request for home display with params:",
			req.params
		);
		const { homeCode, username } = req.params;
		const home = await getHomeByCode(homeCode.toString());
		const user = await getUserByUsername(username.toString());
		if (!home || !user) {
			console.log("User or home not found");
			return res.status(404).json({ error: "User or home not found" });
		}

		const userRelationObject = await getUserHomeRelation(
			user._id,
			home._id
		);
		const userRelation = userRelationObject?.homeIds[0].relationship;
		if (!userRelation) {
			console.log("No shared home found between user and home");
			return res
				.status(404)
				.json({ error: "No shared home found between users" });
		}

		if (userRelation === "RESIDENT") {
			const homeDisplay = {
				id: home._id,
				name: home.homeName,
				homeCode: home.homeCode,
				groceries: await getCurrentGroceryItemsByHome(home._id),
				chores: await getUncompletedChoresByHome(home._id),
				rules: await getApprovedRulesByHome(home._id),
				events: await getUpcomingEventsByHome(home._id),
			};
			res.status(200).json(homeDisplay);
			console.log("Home Display for resident:", homeDisplay);
		} else {
			const homeDisplay = {
				name: home.homeName,
				homeCode: home.homeCode,
				rules: await getApprovedRulesByHome(home._id),
				events: await getUpcomingEventsByHome(home._id),
			};
			console.log("Home Display for non-resident:", homeDisplay);
			res.status(200).json(homeDisplay);
		}
	}
);
