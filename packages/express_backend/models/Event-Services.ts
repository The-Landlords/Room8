// event-services.ts
import mongoose from "mongoose";
import { Event } from "./Event";
/**
 * @param apartmentId the apartment id to be searched
 * @returns
 */
function getEventsByApartment(apartmentId: string) {
	return Event.find({ apartmentId });
}

function getEventById(eventId: string) {
	return Event.findById(eventId);
}

function createEvent(data: any) {
	return Event.create(data);
}

function removeEventById(eventId: string) {
	return Event.deleteOne({ _id: eventId });
}
//fixme update ??

export default {
	getEventsByApartment,
	getEventById,
	createEvent,
	removeEventById,
};
