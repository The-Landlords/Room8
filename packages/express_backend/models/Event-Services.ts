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
	return Event.findByIdAndDelete({ _id: eventId });
}

function updateApartment(eventId: string, data: any) {
	return Event.findByIdAndUpdate(eventId, data);
}

export default {
	getEventsByApartment,
	getEventById,
	createEvent,
	removeEventById,
	updateApartment,
};
