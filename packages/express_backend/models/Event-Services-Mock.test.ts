import mockingoose from "mockingoose";
import mongoose from "mongoose";
import { expect, test, beforeEach, jest } from "@jest/globals";
import { Event } from "./Event";
import {
	createEvent,
	getEventById,
	getEventsByHome,
	removeEventById,
	updateEvent,
	eventToICSData,
} from "./Event-Services";
import { createEvent as createIcsEvent } from "ics";
const homeId = new mongoose.Types.ObjectId();
const basicEventData = {
	title: "Test Event Service",
	description: "This is a test event for the Event Services tests.",
	start: new Date("2024-01-01T10:00:00Z").getTime(),
	end: new Date("2024-01-01T11:00:00Z").getTime(),
	eventType: "test",
	homeId,
};

jest.mock("ics", () => ({
	createEvent: jest.fn(),
}));

const mockCreateIcsEvent = createIcsEvent as jest.Mock;
beforeEach(() => {
	mockingoose.resetAll();
});

test("Creating an event", async () => {
	const e = new Event(basicEventData);
	mockingoose(Event).toReturn(e, "save");
	const event = await createEvent(basicEventData);

	expect(event).toBeDefined();
	expect(event.title).toBe(basicEventData.title);
	expect(event.description).toBe(basicEventData.description);
	expect(event.start.getTime()).toBe(basicEventData.start);
	expect(event.end.getTime()).toBe(basicEventData.end);
	expect(event.homeId.toString()).toBe(basicEventData.homeId.toString());
});

test("Getting an event by ID", async () => {
	const e = new Event(basicEventData);
	mockingoose(Event).toReturn(e, "findOne");
	const fetched = await getEventById(e._id);
	expect(fetched).toBeDefined();
	expect(fetched?._id.toString()).toBe(e._id.toString());
});

test("Getting events by home ID", async () => {
	const e1 = new Event(basicEventData);
	const e2 = new Event({ ...basicEventData, title: "Another Test Event" });
	mockingoose(Event).toReturn([e1, e2], "find");
	const events = await getEventsByHome(basicEventData.homeId);
	expect(events).toBeDefined();
	expect(events.length).toBe(2);
});

test("Updating an event", async () => {
	const e = new Event(basicEventData);
	const updatedData = { ...basicEventData, title: "Updated Event Title" };
	const updatedEvent = new Event(updatedData);
	mockingoose(Event).toReturn(updatedEvent, "findOneAndUpdate");
	const result = await updateEvent(e._id, { title: "Updated Event Title" });
	expect(result).toBeDefined();
	expect(result?.title).toBe("Updated Event Title");
});

test("Removing an event by ID", async () => {
	const e = new Event(basicEventData);
	mockingoose(Event).toReturn(e, "findOneAndDelete");
	const removed = await removeEventById(e._id);
	expect(removed).toBeDefined();
	expect(removed?._id.toString()).toBe(e._id.toString());
});

test("Converts an event to ICS data", async () => {
	const e = new Event(basicEventData);
	mockingoose(Event).toReturn(e, "findOne");

	(mockCreateIcsEvent as jest.Mock).mockImplementation(
		(_event: any, cb: any) => {
			cb(
				null,
				`BEGIN:VCALENDAR
BEGIN:VEVENT
SUMMARY:${basicEventData.title}
DESCRIPTION:${basicEventData.description}
END:VEVENT
END:VCALENDAR`
			);
		}
	);

	const ics = await eventToICSData(e._id);

	expect(ics).toBeDefined();
	expect(ics).not.toBeNull();
	expect(ics).toContain("BEGIN:VCALENDAR");
	expect(ics).toContain("BEGIN:VEVENT");
	expect(ics).toContain(`SUMMARY:${basicEventData.title}`);
	expect(ics).toContain(`DESCRIPTION:${basicEventData.description}`);
});

test("eventToICSData rejects when createIcsEvent returns an error", async () => {
	const e = new Event(basicEventData);
	mockingoose(Event).toReturn(e, "findOne");

	mockCreateIcsEvent.mockImplementation((_event: any, cb: any) => {
		cb(new Error("ICS creation failed"), undefined);
	});

	await expect(eventToICSData(e._id)).rejects.toThrow("ICS creation failed");
});

test("eventToICSData rejects when createIcsEvent returns no data", async () => {
	const e = new Event(basicEventData);
	mockingoose(Event).toReturn(e, "findOne");

	mockCreateIcsEvent.mockImplementation((_event: any, cb: any) => {
		cb(null, undefined);
	});

	await expect(eventToICSData(e._id)).rejects.toThrow(
		"ICS generator returned no data"
	);
});

test("Converting a missing event to ICS data returns null", async () => {
	mockingoose(Event).toReturn(null, "findOne");

	const missingId = new mongoose.Types.ObjectId();
	const ics = await eventToICSData(missingId);

	expect(ics).toBeNull();
});

test("eventToICSData rejects when stored event has invalid start/end values", async () => {
	const badEvent = new Event({
		_id: new mongoose.Types.ObjectId(),
		title: "Bad Event",
		description: "Bad dates",
		start: null,
		end: null,
		homeId,
	});

	mockingoose(Event).toReturn(badEvent, "findOne");

	mockCreateIcsEvent.mockImplementation((_event: any, cb: any) => {
		cb(new Error("Invalid event dates"), undefined);
	});

	await expect(eventToICSData(badEvent._id)).rejects.toThrow();
});

test("creates event with undefined description", async () => {
	const data = {
		...basicEventData,
		description: undefined,
	};

	const e = new Event({
		...data,
	});

	mockingoose(Event).toReturn(e, "save");

	const result = await createEvent(data);

	expect(result).toBeDefined();

	expect(result.description).toBeUndefined();

	expect("description" in result.toObject()).toBe(false);
});

test("keeps description when defined", async () => {
	const e = new Event({
		...basicEventData,
		description: "hello",
	});
	mockingoose(Event).toReturn(e, "findOne");

	(mockCreateIcsEvent as jest.Mock).mockImplementation(
		(_event: any, cb: any) => {
			expect(_event.description).toBe("hello"); // key assertion
			cb(null, "ok");
		}
	);

	await eventToICSData(e._id);
});
test("converts null description to undefined", async () => {
	const e = new Event({
		...basicEventData,
		description: null,
	});
	mockingoose(Event).toReturn(e, "findOne");

	(mockCreateIcsEvent as jest.Mock).mockImplementation(
		(_event: any, cb: any) => {
			expect(_event.description).toBeUndefined();
			cb(null, "ok");
		}
	);

	await eventToICSData(e._id);
});

test("fails validation when end is before or equal to start", async () => {
	const event = new Event({
		title: "Bad Event",
		start: new Date("2026-01-01T10:00:00Z"),
		end: new Date("2026-01-01T09:00:00Z"), // should fail
		homeId,
	});

	await expect(event.validate()).rejects.toThrow(
		"End must be after start time"
	);
});

test("fails validation when end equals start", async () => {
	const date = new Date("2026-01-01T10:00:00Z");

	const event = new Event({
		title: "Equal Time Event",
		start: date,
		end: date,
		homeId,
	});

	await expect(event.validate()).rejects.toThrow(
		"End must be after start time"
	);
});

test("passes validation when end is after start", async () => {
	const event = new Event({
		title: "Good Event",
		start: new Date("2026-01-01T10:00:00Z"),
		end: new Date("2026-01-01T11:00:00Z"),
		homeId,
	});

	await expect(event.validate()).resolves.toBeUndefined();
});
