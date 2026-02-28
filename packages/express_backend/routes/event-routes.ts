import express from "express";
import {
	getEventsByHome,
	getEventById,
	createEvent,
	removeEventById,
	updatehome,
} from "../models/Event-Services";
import type { Request, Response } from "express";

export const eventRouter = express.Router();

eventRouter.get("/:home/events", async (req: Request, res: Response) => {
	// /:id
	try {
		const homeId = req.params.home;
		const event = await getEventsByHome(homeId);
		if (!event) {
			return res.status(404).json({ error: "Event not found" });
		}
		res.status(200).json(event);
	} catch (error) {
		console.error(error);
		res.status(400).json({ error: "Invalid ID" });
	}
});
eventRouter.get("/:home/events/:id", async (req: Request, res: Response) => {
	try {
		const event = await getEventById(req.params.id);
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
		const event = await removeEventById(req.params.id);
		if (!event) {
			return res.status(404).json({ error: "Event not found" });
		}
		res.status(204).json(event);
	} catch (error) {
		console.error(error);
		res.status(400).json({ error: "Invalid ID" });
	}
});
