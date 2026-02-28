import { Router } from "express";
import { Event } from "../models/Event";

export const calendarRouter = Router();

calendarRouter.get(
	"/apartments/:apartmentId/calendar",
	async (req: Request, res: Response) => {
		const { apartmentId } = req.params;

		const events = await Event.find({ apartmentId }); // should find all events given an apartment id

		res.json(events);
	}
);
