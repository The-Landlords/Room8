// event-services.ts
import mongoose from "mongoose";
import { Event } from "./Event";
/**
 * @param homeId the home id to be searched
 * @returns
 */
function getEventsByHome(homeId: string) {
	return Event.find({ homeId });
}

function getEventById(eventId: string) {
	return Event.findById(eventId);
}

function createEvent(data: any) {
	return Event.create(data);
}

function removeEventById(eventId: string) {
	return Event.findByIdAndDelete({ _id: eventId });
}

function updatehome(eventId: string, data: any) {
	return Event.findByIdAndUpdate(eventId, data);
}

export default {
	getEventsByHome,
	getEventById,
	createEvent,
	removeEventById,
	updatehome,
};
