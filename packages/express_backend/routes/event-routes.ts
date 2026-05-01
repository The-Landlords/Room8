import express from "express";
import {
	getEventsByHome,
	getEventById,
	createEvent,
	removeEventById,
	eventToICSData,
	updateEvent,
} from "../models/Event-Services.js";
import type { Request, Response } from "express";
import mongoose from "mongoose";
import { getHomeByCode } from "../models/Home-Services.js";

export const eventRouter = express.Router();

eventRouter.get("/events/ics/:id", async (req: Request, res: Response) => {
	try {
		const id = req.params.id;

		if (typeof id !== "string" || !mongoose.Types.ObjectId.isValid(id)) {
			return res.status(400).json({ error: "Invalid id" });
		}

		const objectId = new mongoose.Types.ObjectId(id);

		const result = await eventToICSData(objectId);

		if (!result) {
			console.log("event not found");
			return res.status(404).json({ error: "Event not found" });
		}

		res.setHeader("Content-Type", "text/calendar; charset=utf-8");
		res.setHeader(
			"Content-Disposition",
			`attachment; filename="event-${req.params.id}.ics"`
		);
		return res.send(result);
	} catch (err) {
		console.error("route error:", err);
		return res.status(500).json({ error: "Failed to generate ICS" });
	}
});

eventRouter.get("/homeId/:home/events", async (req: Request, res: Response) => {
	try {
		const id = req.params.home;

		if (typeof id !== "string" || !mongoose.Types.ObjectId.isValid(id)) {
			return res.status(400).json({ error: "Invalid id" });
		}

		const homeId = new mongoose.Types.ObjectId(id);
		const events = await getEventsByHome(homeId);
		res.status(200).json(events);
	} catch (error) {
		console.error(error);
		res.status(400).json({ error: "Invalid ID" });
	}
});

eventRouter.get("/:home/events/:id", async (req: Request, res: Response) => {
	try {
		const id = req.params.id;

		if (typeof id !== "string" || !mongoose.Types.ObjectId.isValid(id)) {
			return res.status(400).json({ error: "Invalid id" });
		}

		const objectId = new mongoose.Types.ObjectId(id);

		const event = await getEventById(objectId);
		if (!event) {
			return res.status(404).json({ error: "Event not found" });
		}
		res.status(200).json(event);
	} catch (error) {
		console.error(error);
		res.status(400).json({ error: "Invalid ID" });
	}
});

eventRouter.post("/:homeCode/events", async (req: Request, res: Response) => {
	try {
		const homeCode = req.params.homeCode as string;

		if (!homeCode) {
			return res.status(400).json({ error: "Missing homeCode" });
		}

		const home = await getHomeByCode(homeCode);

		if (!home) {
			return res.status(404).json({ error: "Home not found" });
		}

		const event = await createEvent({
			...req.body,
			homeId: home._id,
		});

		res.status(201).json(event);
	} catch (error) {
		console.error(error);
		res.status(400).json({ error: "Failed to create event" });
	}
});

eventRouter.delete("/events/:eventId", async (req: Request, res: Response) => {
	try {
		const id = req.params.eventId;

		if (typeof id !== "string" || !mongoose.Types.ObjectId.isValid(id)) {
			return res.status(400).json({ error: "Invalid id" });
		}

		const objectId = new mongoose.Types.ObjectId(id);

		const deletedEvent = await removeEventById(objectId);

		if (!deletedEvent) {
			return res.status(404).json({ error: "Event not found" });
		}

		return res.sendStatus(204);
	} catch (error) {
		console.error(error);
		return res.status(400).json({ error: "Invalid ID" });
	}
});

eventRouter.patch("/events/:eventId", async (req: Request, res: Response) => {
	try {
		const id = req.params.eventId;

		if (typeof id !== "string" || !mongoose.Types.ObjectId.isValid(id)) {
			return res.status(400).json({ error: "Invalid id" });
		}

		const objectId = new mongoose.Types.ObjectId(id);

		const updatedEvent = await updateEvent(objectId, req.body);

		if (!updatedEvent) {
			return res.status(404).json({ error: "Event not found" });
		}

		return res.status(200).json(updatedEvent);
	} catch (error) {
		console.error(error);
		res.status(400).json({ error: "Invalid ID" });
	}
});
