import express from "express";
import type { Request, Response } from "express";

import {
	getUserHomeRelation,
	getUsersByHomeAndRelation,
	getUserById,
} from "../models/User-Services.js";

import { getUncompletedChoresByHome } from "../models/Chore-Services.js";
import { getApprovedRulesByHome } from "../models/Rules-Services.js";
import { getUpcomingEventsByHome } from "../models/Event-Services.js";

import { getCurrentGroceryItemsByHome } from "../models/Grocery-Services.js";

import { getHomeByCode } from "../models/Home-Services.js";
import mongoose from "mongoose";
import { requireAuth } from "./userSessionAuth.js";
import { decryptField } from "../utils/encryption.js";

export const authRouter = express.Router();

function safeDecryptField(data: any): string {
	if (!data) return "";

	try {
		return decryptField(data) ?? "";
	} catch {
		return "";
	}
}

function filterResidents(residents: any[], userOneRelation: string) {
	return residents.map((resident) => {
		return {
			_id: resident._id,
			fullName: resident.fullName,
			allergens: resident.allergens,
			phone: canSee(resident.visibility.phoneVisible, userOneRelation)
				? safeDecryptField(resident.phone)
				: undefined,
			pronouns: canSee(
				resident.visibility.pronounsVisible,
				userOneRelation
			)
				? resident.pronouns
				: undefined,
			DOB: canSee(resident.visibility.dobVisible, userOneRelation)
				? safeDecryptField(resident.DOB)
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
				? {
						...resident.emergencyContact,
						phone: safeDecryptField(
							resident.emergencyContact?.phone
						),
					}
				: undefined,
		};
	});
}

function filterGuests(guests: any[], userOneRelation: string) {
	return guests.map((guests) => {
		return {
			_id: guests._id,
			fullName: guests.fullName,
			allergens: guests.allergens,
			phone: canSeeGuest(guests.visibility.phoneVisible, userOneRelation)
				? safeDecryptField(guests.phone)
				: undefined,
			pronouns: canSeeGuest(
				guests.visibility.pronounsVisible,
				userOneRelation
			)
				? guests.pronouns
				: undefined,
			DOB: canSeeGuest(guests.visibility.dobVisible, userOneRelation)
				? safeDecryptField(guests.DOB)
				: undefined,
			likes: canSeeGuest(guests.visibility.likesVisible, userOneRelation)
				? guests.likes
				: undefined,
			dislikes: canSeeGuest(
				guests.visibility.dislikesVisible,
				userOneRelation
			)
				? guests.dislikes
				: undefined,
			emergencyContact: canSeeGuest(
				guests.visibility.emergencyContactVisible,
				userOneRelation
			)
				? {
						...guests.emergencyContact,
						phone: safeDecryptField(guests.emergencyContact?.phone),
					}
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
function canSeeGuest(fieldVisible: string, userOneRelation: string): boolean {
	if (!fieldVisible) {
		return false;
	}
	if (fieldVisible === "PUBLIC") {
		return true;
	}
	return false;
}

//gets residents of a home and their information based on the relationship of the user making the request to the home
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

//gets guests of a home and their information based on the relationship of the user making the request to the home
authRouter.get(
	"/auth/guests/me/:homeCode/",
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

		const guests = await getUsersByHomeAndRelation(home._id, "GUEST");

		if (guests.length === 0) {
			console.log("No guests found for home code: " + homeCode);
			return res.status(200).json([]);
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
		const filteredUsers = filterGuests(guests, userOneRelation);

		res.status(200).json(filteredUsers);
	}
);

authRouter.get(
	"/auth/homeDisplay/me/:homeCode/",
	requireAuth,
	async (req: Request, res: Response) => {
		const { homeCode } = req.params;
		const home = await getHomeByCode(homeCode.toString());
		if (!home) {
			return res.status(404).json({ error: "User or home not found" });
		}

		const userRelationObject = await getUserHomeRelation(
			new mongoose.Types.ObjectId(req.session.userId),
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
		} else {
			const homeDisplay = {
				name: home.homeName,
				homeCode: home.homeCode,
				rules: await getApprovedRulesByHome(home._id),
				events: await getUpcomingEventsByHome(home._id),
			};

			res.status(200).json(homeDisplay);
		}
	}
);

//gets a users relationship to a home based on the home code
authRouter.get(
	"/auth/relationship/me/:homeCode/",
	requireAuth,
	async (req: Request, res: Response) => {
		const { homeCode } = req.params;
		const home = await getHomeByCode(homeCode.toString());
		if (!home) {
			return res.status(404).json({ error: "User or home not found" });
		}

		const userRelationObject = await getUserHomeRelation(
			new mongoose.Types.ObjectId(req.session.userId),
			home._id
		);
		const userRelation = userRelationObject?.homeIds[0].relationship;
		if (!userRelation) {
			console.log("No shared home found between user and home");
			return res
				.status(404)
				.json({ error: "No shared home found between users" });
		}

		res.status(200).json({ relationship: userRelation });
	}
);
