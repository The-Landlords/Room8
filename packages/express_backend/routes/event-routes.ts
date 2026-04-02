import express from "express";
import {
	getEventsByHome,
	getEventById,
	createEvent,
	removeEventById,
	eventToICSData,
} from "../models/Event-Services";
import type { Request, Response } from "express";
import mongoose from "mongoose";

export const eventRouter = express.Router();

console.log("eventRouter loaded");

eventRouter.get("/test", (_req: Request, res: Response) => {
	console.log("hit /test");
	res.send("test ok");
});

eventRouter.get("/test/ics/:id", async (req: Request, res: Response) => {
	try {
		console.log("hit /test/ics/:id", req.params.id);

		const result = await eventToICSData(
			new mongoose.Types.ObjectId(req.params.id)
		);

		if (!result) {
			console.log("event not found");
			return res.status(404).json({ error: "Event not found" });
		}

		res.setHeader("Content-Type", "text/calendar; charset=utf-8");
		return res.send(result);
	} catch (err) {
		console.error("route error:", err);
		return res.status(500).json({ error: "Failed to generate ICS" });
	}
});

eventRouter.get("/:home/events", async (req: Request, res: Response) => {
	try {
		const homeId = new mongoose.Types.ObjectId(req.params.home);
		const events = await getEventsByHome(homeId);
		res.status(200).json(events);
	} catch (error) {
		console.error(error);
		res.status(400).json({ error: "Invalid ID" });
	}
});

eventRouter.get("/:home/events/:id", async (req: Request, res: Response) => {
	try {
		const event = await getEventById(
			new mongoose.Types.ObjectId(req.params.id)
		);
		if (!event) {
			return res.status(404).json({ error: "Event not found" });
		}
		res.status(200).json(event);
	} catch (error) {
		console.error(error);
		res.status(400).json({ error: "Invalid ID" });
	}
});

eventRouter.post("/:home/events", async (req: Request, res: Response) => {
	try {
		const event = await createEvent(req.body);
		res.status(201).json(event);
	} catch (error) {
		console.error(error);
		res.status(400).json({ error: "Failed to create event" });
	}
});

eventRouter.delete("/:home/events/:id", async (req: Request, res: Response) => {
	try {
		const event = await removeEventById(
			new mongoose.Types.ObjectId(req.params.id)
		);
		if (!event) {
			return res.status(404).json({ error: "Event not found" });
		}
		return res.sendStatus(204);
	} catch (error) {
		console.error(error);
		res.status(400).json({ error: "Invalid ID" });
	}
});
