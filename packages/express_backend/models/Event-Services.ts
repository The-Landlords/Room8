// event-services.ts
import { Event } from "./Event";
import mongoose from "mongoose";
/**
 * @param homeId the home id to be searched
 * @returns
 */
export function getEventsByHome(homeId: mongoose.Types.ObjectId | string) {
	return Event.find({ homeId });
}

export function getEventById(eventId: mongoose.Types.ObjectId | string) {
	return Event.findById(eventId);
}

export function createEvent(data: any) {
	return Event.create(data);
}

export function removeEventById(eventId: mongoose.Types.ObjectId | string) {
	return Event.findByIdAndDelete({ _id: eventId });
}

export function updateEvent(
	eventId: mongoose.Types.ObjectId | string,
	data: any
) {
	return Event.findByIdAndUpdate(eventId, data, {
		returnDocument: "after",
		runValidators: true,
	});
}
