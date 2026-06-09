import express from "express";
import type { Request, Response } from "express";
import {
	getHomeByCode,
	getHomesByUser,
	getHomeByName,
	updateHome,
	getHomesByUserAndRelation,
	deleteHome,
} from "../models/Home-Services.js";
import {
	getUserById,
	getUsersByHomeAndRelation,
	// getUsersByHomeAndRelation,
	updateUserById,
} from "../models/User-Services.js";
import { deleteRulesByHomeId } from "../models/Rules-Services.js";
import { deleteGroceryItemsByHomeId } from "../models/Grocery-Services.js";
import { deleteChoresByHomeId } from "../models/Chore-Services.js";
import { deleteEventsByHomeId } from "../models/Event-Services.js";
import {
	createGuestAscension,
	getGuestAscensionByGuest,
} from "../models/GuestAscension-Services.js";
import mongoose from "mongoose";
import { requireAuth } from "./userSessionAuth.js";

export const relationRouter = express.Router();

function getSessionUserId(req: Request) {
	const sessionUserId = req.session.userId;

	if (
		typeof sessionUserId !== "string" ||
		!mongoose.Types.ObjectId.isValid(sessionUserId)
	) {
		return null;
	}

	return new mongoose.Types.ObjectId(sessionUserId);
}

//creates a relation between user and home
relationRouter.post(
	"/relate/me/:homeCode",
	requireAuth,
	async (req: Request, res: Response) => {
		try {
			const homecode = req.params.homeCode;

			if (typeof homecode !== "string") {
				return res.status(400).json({ error: "Invalid home code" });
			}

			const relationship = String(req.body.relationship || "")
				.toUpperCase()
				.trim();

			if (
				!relationship ||
				!["RESIDENT", "GUEST"].includes(relationship)
			) {
				return res.status(400).json({ error: "Invalid relationship" });
			}

			const h = await getHomeByCode(homecode);

			if (!h) {
				return res.status(404).json({ error: "Home not found" });
			}

			const userId = getSessionUserId(req);
			if (!userId) {
				return res
					.status(400)
					.json({ error: "Invalid user id in session" });
			}

			const u = await getUserById(userId);

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

			const updatedHome = await updateHome(h._id, {
				userIds: [
					...h.userIds,
					{
						userId: u._id,
						relationship,
					},
				],
			});

			if (!updatedHome) {
				return res
					.status(404)
					.json({ error: "Home not found for update" });
			}

			const updatedUser = await updateUserById(u._id, {
				homeIds: [
					...u.homeIds,
					{
						homeId: h._id,
						relationship,
					},
				],
			});

			if (!updatedUser) {
				return res
					.status(404)
					.json({ error: "User not found for update" });
			}

			if (relationship === "GUEST") {
				const existing = await getGuestAscensionByGuest(u._id, h._id);

				if (!existing) {
					await createGuestAscension({
						homeId: h._id,
						guestId: u._id,
						status: "PENDING",
						votes: [],
					});
				}
			}

			console.log("added relation");
			res.status(200).json(updatedHome);
		} catch (err) {
			console.error(err);
			res.status(500).json({ error: "Failed to create relationship" });
		}
	}
);

//gets homes based off passed in user
relationRouter.get(
	"/relate/me",
	requireAuth,
	async (req: Request, res: Response) => {
		try {
			const userId = getSessionUserId(req);
			if (!userId) {
				return res
					.status(400)
					.json({ error: "Invalid user id in session" });
			}

			const u = await getUserById(userId);

			if (!u) {
				return res.status(404).json({ error: "User not found" });
			}

			let homes = [];
			homes = await getHomesByUser(u._id);
			const homesWithRelationship = homes.map((home: any) => {
				const homeObj = home.toObject ? home.toObject() : home;

				const currentUserHomeEntry = homeObj.userIds.find(
					(entry: any) => {
						return String(entry.userId) === String(u._id);
					}
				);

				const { userIds, ...homeWithoutUserIds } = homeObj;

				return {
					...homeWithoutUserIds,
					relationship: currentUserHomeEntry?.relationship ?? "",
				};
			});

			res.status(200).json(homesWithRelationship);
		} catch (err) {
			console.error(err);
			res.status(500).json({ error: "Failed to fetch homes from user" });
		}
	}
);

//deletes a relation between user and home, used when a user leaves a home
// updated 2 June 2026 to use homeCode over home name
relationRouter.patch(
	"/relate/me/:homeCode",
	requireAuth,
	async (req: Request, res: Response) => {
		try {
			console.log("Deleting relation!");

			const homeCode = req.params.homeCode;

			if (typeof homeCode !== "string" || homeCode.trim() === "") {
				return res.status(400).json({ error: "Invalid home code" });
			}

			const h = await getHomeByCode(homeCode);

			if (!h) {
				return res.status(404).json({ error: "Home not found" });
			}

			const userId = getSessionUserId(req);
			if (!userId) {
				return res
					.status(400)
					.json({ error: "Invalid user id in session" });
			}

			const u = await getUserById(userId);

			if (!u) {
				return res.status(404).json({ error: "User not found" });
			}

			const userIsInHome = h.userIds.some((user: any) =>
				user.userId.equals(u._id)
			);

			if (!userIsInHome) {
				return res
					.status(404)
					.json({ error: "Relationship not found" });
			}

			const willDeleteHome = h.userIds.length === 1 && userIsInHome;

			// we want to prevent users from accidentally deleting a home by leaving it, so we require them to confirm if they are the last resident and will delete the home by leaving
			// this warning happens before the database is updated.
			if (willDeleteHome && req.body?.confirmDeleteHome !== true) {
				return res.status(409).json({
					error: "Leaving this home will delete it.",
					willDeleteHome: true,
				});
			}

			const removeOneUser = h.userIds.filter(
				(user: any) => !user.userId.equals(u._id)
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

			const updatedUser = await updateUserById(u._id, {
				homeIds: removeOneHome,
			});
			if (!updatedUser) {
				return res
					.status(404)
					.json({ error: "User not found for update" });
			}

			// ADD: here is where we shuld check whether a home is empty
			// TODO: Add a message saying "You are the last resident. Leaving this home will delete it. Are you sure you want to leave?" and only delete if they confirm
			// Further, delete all data of rules ,groceries, etc associated with that home.
			if (willDeleteHome) {
				// delete everything associated with that home
				await deleteRulesByHomeId(h._id);
				await deleteGroceryItemsByHomeId(h._id);
				await deleteChoresByHomeId(h._id);
				await deleteEventsByHomeId(h._id);

				// delete the home itself if there are no more users associated with it and no other data
				await deleteHome(h._id);

				console.log("Deleted home since there are no more residents");

				return res.status(200).json({
					_id: h._id.toString(),
					homeCode: h.homeCode,
					deletedHome: true,
					message: "Left home and deleted it",
				});
			} else {
				return res.status(200).json({
					leftHome: true,
					deletedHome: false,
					home: updatedHome,
				});
			}
		} catch (err) {
			console.error("Failed to remove relationship:", err);
			return res
				.status(500)
				.json({ error: "Failed to remove relationship" });
		}
	}
);

//patch route to update a users relationship to a home, used for changing resident to guest or vice versa
relationRouter.patch(
	"/relate/me/:homeName/:newRelation",
	requireAuth,
	async (req: Request, res: Response) => {
		try {
			console.log("Updating relation!");

			const homename = req.params.homeName;
			const newRelation = req.params.newRelation
				.toString()
				.toUpperCase()
				.trim();

			if (typeof homename !== "string") {
				return res.status(400).json({ error: "Invalid home name" });
			}

			const h = await getHomeByName(homename);

			if (!h) {
				return res.status(404).json({ error: "Home not found" });
			}

			const userId = getSessionUserId(req);
			if (!userId) {
				return res
					.status(400)
					.json({ error: "Invalid user id in session" });
			}

			const u = await getUserById(userId);

			if (!u) {
				return res.status(404).json({ error: "User not found" });
			}

			const updatedHome = await updateHome(h._id, {
				userIds: h.userIds.map((user: any) =>
					user.userId.equals(u._id)
						? { userId: user.userId, relationship: newRelation }
						: user
				),
			});

			if (!updatedHome) {
				return res
					.status(404)
					.json({ error: "Home not found for update" });
			}

			await h.save();

			const updatedUser = await updateUserById(u._id, {
				homeIds: u.homeIds.map((home) =>
					home.homeId.equals(h._id)
						? { homeId: home.homeId, relationship: newRelation }
						: home
				),
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
			res.status(500).json({ error: "Failed to update relationship" });
		}
	}
);

//get users based off passed in home and relation
relationRouter.get(
	"/relate/:homeCode/:relation",
	requireAuth,
	async (req: Request, res: Response) => {
		try {
			const h = await getHomeByCode(req.params.homeCode.toString());

			if (!h) {
				return res.status(404).json({ error: "Home not found" });
			}

			let users = [];

			users = await getUsersByHomeAndRelation(
				h._id,
				req.params.relation.toString().toUpperCase()
			);

			res.status(200).json(users);
		} catch (err) {
			console.error(err);
			res.status(500).json({ error: "Failed to fetch users from home" });
		}
	}
);

relationRouter.get(
	"/relate/home/:homeId/residents",
	requireAuth,
	async (req: Request, res: Response) => {
		try {
			if (
				!mongoose.Types.ObjectId.isValid(req.params.homeId.toString())
			) {
				return res.status(400).json({
					error: "Invalid home id",
				});
			}

			const residents = await getUsersByHomeAndRelation(
				new mongoose.Types.ObjectId(req.params.homeId.toString()),
				"RESIDENT"
			);

			res.status(200).json({
				count: residents.length,
			});
		} catch (err) {
			console.error(err);
			res.status(500).json({
				error: "Failed to fetch residents",
			});
		}
	}
);
