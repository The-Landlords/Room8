import mockingoose from "mockingoose";
import mongoose from "mongoose";
import { expect, test, describe, beforeEach } from "@jest/globals";
import { Event } from "./Event";
import {
	createEvent,
	getEventById,
	getEventsByHome,
	removeEventById,
	updateEvent,
} from "./Event-Services";

const homeId = new mongoose.Types.ObjectId();

const basicEventData = {
	title: "Test Event Service",
	description: "This is a test event for the Event Services tests.",
	start: new Date("2024-01-01T10:00:00Z").getTime(),
	end: new Date("2024-01-01T11:00:00Z").getTime(),
	eventType: "test",
	homeId,
};

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
	expect(event.eventType).toBe(basicEventData.eventType);
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
