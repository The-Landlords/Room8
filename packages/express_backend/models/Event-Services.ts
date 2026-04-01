// event-services.ts
import { Event } from "./Event";
import ics from "ics";
import mongoose from "mongoose";
import { title } from "node:process";
/**
 * @param homeId the home id to be searched
 * @returns
 */
export function getEventsByHome(homeId: mongoose.Types.ObjectId) {
	return Event.find({ homeId });
}

export function getEventById(eventId: mongoose.Types.ObjectId) {
	return Event.findById(eventId);
}

export function createEvent(data: any) {
	return Event.create(data);
}

export function removeEventById(eventId: mongoose.Types.ObjectId) {
	return Event.findByIdAndDelete({ _id: eventId });
}

export function updateEvent(eventId: mongoose.Types.ObjectId, data: any) {
	return Event.findByIdAndUpdate(eventId, data, {
		returnDocument: "after",
		runValidators: true,
	});
}

// FIXME should only be run if status ofe eventis confirmed
/**
 * Converts a JS Date object to an ics-compatible time array [YYYY, MM, DD, HH, mm]
 * @param {Date} date - The JavaScript Date object to convert
 * @returns {Array<number>}
 */
export const eventToICSData = async (
	eventId: mongoose.Types.ObjectId
): Promise<string | null> => {
	const e = await Event.findById(eventId);
	if (!e) return null;

	const start = e.start;
	const end = e.end;

	const startArray: [number, number, number, number, number] = [
		start.getUTCFullYear(),
		start.getUTCMonth() + 1,
		start.getUTCDate(),
		start.getUTCHours(),
		start.getUTCMinutes(),
	];

	const endArray: [number, number, number, number, number] = [
		end.getUTCFullYear(),
		end.getUTCMonth() + 1,
		end.getUTCDate(),
		end.getUTCHours(),
		end.getUTCMinutes(),
	];

	const event = {
		title: e.title,
		description: e.description,
		start: startArray,
		end: endArray,
	};

	return new Promise((resolve, reject) => {
		ics.createEvent(event, (error, value) => {
			if (error) {
				console.error("ICS create error:", error);
				reject(error);
				return;
			}

			resolve(value);
		});
	});
};
