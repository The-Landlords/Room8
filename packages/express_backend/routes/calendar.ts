import { Router } from "express";
import type { Request, Response } from "express";
import { Event } from "../models/Event.js";
import mongoose from "mongoose";
export const calendarRouter = Router();

calendarRouter.get(
	"/apartments/:apartmentId/calendar",
	async (req: Request, res: Response) => {
		const id = req.params.apartmentId;

		if (typeof id !== "string" || !mongoose.Types.ObjectId.isValid(id)) {
			return res.status(400).json({ error: "Invalid id" });
		}

		const objectId = new mongoose.Types.ObjectId(id);

		const events = await Event.find({ objectId }); // should find all events given an apartment id

		res.json(events);
	}
);
