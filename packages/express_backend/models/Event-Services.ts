// event-services.ts
import { Event } from "./Event";
/**
 * @param homeId the home id to be searched
 * @returns
 */
export function getEventsByHome(homeId: string) {
	return Event.find({ homeId });
}

export function getEventById(eventId: string) {
	return Event.findById(eventId);
}

export function createEvent(data: any) {
	return Event.create(data);
}

export function removeEventById(eventId: string) {
	return Event.findByIdAndDelete({ _id: eventId });
}

export function updateEvent(eventId: string, data: any) {
	return Event.findByIdAndUpdate(eventId, data, {
		returnDocument: "after",
		runValidators: true,
	});
}
