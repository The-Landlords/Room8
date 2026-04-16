import mongoose from "mongoose";

import {
	getEventsByHome,
	getEventById,
	createEvent,
	removeEventById,
	updateEvent,
	eventToICSData,
} from "./Event-Services";
import { Event } from "./Event";
import { config } from "dotenv";
import { createEvent as createIcsEvent } from "ics";

jest.mock("ics", () => ({
	createEvent: jest.fn(),
}));

const mockCreateIcsEvent = createIcsEvent as jest.Mock;
config();

let e: any; // FIXME type this later
const homeId = new mongoose.Types.ObjectId();

const basicEventData = {
	title: "Test Event Service",
	description: "This is a test event for the Event Services tests.",
	start: Date.now(),
	end: Date.now() + 3600000,
	homeId: homeId,
};

const basicEventData2 = {
	title: "Test Event Service 2",
	description: "This is a second test event for the Event Services tests.",
	start: Date.now(),
	end: Date.now() + 7200000,
	homeId: homeId,
};

beforeAll(async () => {
	const uri = process.env.MONGO_URI_TEST;
	if (!uri) throw new Error("MONGO_URI_TEST not defined");

	await mongoose.connect(uri);
});

afterAll(async () => {
	await mongoose.connection.dropDatabase();
	await mongoose.connection.close();
});

beforeEach(async () => {
	jest.clearAllMocks();

	e = await createEvent(basicEventData);
	expect(e).toBeDefined();
	if (!e) return;
});

afterEach(async () => {
	await Event.deleteMany();
});

test("Creating an event", async () => {
	expect(e._id).toBeDefined();
	expect(e.title).toBe(basicEventData.title);
	expect(e.description).toBe(basicEventData.description);
	expect(e.start.getTime()).toBe(basicEventData.start);
	expect(e.end.getTime()).toBe(basicEventData.end);
	expect(e.homeId.toString()).toBe(basicEventData.homeId.toString());
});

test("Getting an event by ID", async () => {
	const eventId = e._id;
	const fetched = await getEventById(eventId);
	expect(fetched).toBeDefined();
	if (!fetched) return;
	expect(fetched._id.toString()).toBe(eventId.toString());
});

test("Getting events by home ID", async () => {
	const otherHomeId = new mongoose.Types.ObjectId();

	const e1 = await createEvent({ ...basicEventData, homeId: otherHomeId });
	expect(e1).toBeDefined();
	if (!e1) return;

	const e2 = await createEvent({ ...basicEventData2, homeId: otherHomeId });
	expect(e2).toBeDefined();
	if (!e2) return;

	const events = await getEventsByHome(otherHomeId);
	expect(events).toBeDefined();
	expect(events.length).toBe(2);

	const ids = events.map((x) => x._id.toString()).sort();
	expect(ids).toEqual([e1._id.toString(), e2._id.toString()].sort());
});

test("Updating an event", async () => {
	const eventId = e._id;
	const updated = {
		title: "Updated Test Event Service",
		description:
			"Updated This is a test event for the Event Services tests.",
		start: Date.now(),
		end: Date.now() + 10800000,
		homeId: new mongoose.Types.ObjectId(),
	};

	const fetched = await updateEvent(eventId, updated);
	expect(fetched).toBeDefined();
	if (!fetched) return;

	expect(fetched._id.toString()).toBe(eventId.toString());
	expect(fetched.title).toBe(updated.title);
	expect(fetched.description).toBe(updated.description);
	expect(fetched.start.getTime()).toBe(updated.start);
	expect(fetched.end.getTime()).toBe(updated.end);
	expect(fetched.homeId.toString()).toBe(updated.homeId.toString());
});

test("Removing an event by ID", async () => {
	const eventId = e._id;
	const deletedEvent = await removeEventById(eventId);
	expect(deletedEvent).toBeDefined();
	expect(deletedEvent?._id.toString()).toBe(eventId.toString());

	const shouldBeNull = await getEventById(eventId);
	expect(shouldBeNull).toBeNull();
});

test("Creating an event with end time before start time should fail", async () => {
	const invalidEventData = {
		...basicEventData2,
		start: Date.now(),
		end: Date.now() - 3600000,
	};

	await expect(createEvent(invalidEventData)).rejects.toThrow(
		"End must be after start time"
	);
});
test("Converts an event to ICS data", async () => {
	mockCreateIcsEvent.mockImplementation((_event, cb) => {
		cb(
			undefined,
			`BEGIN:VCALENDAR
BEGIN:VEVENT
SUMMARY:${basicEventData.title}
DESCRIPTION:${basicEventData.description}
END:VEVENT
END:VCALENDAR`
		);
	});

	const eventId = e._id;
	const ics = await eventToICSData(eventId);

	expect(ics).toBeDefined();
	expect(ics).not.toBeNull();
	expect(ics).toContain("BEGIN:VCALENDAR");
	expect(ics).toContain("BEGIN:VEVENT");
	expect(ics).toContain(`SUMMARY:${basicEventData.title}`);
	expect(ics).toContain(`DESCRIPTION:${basicEventData.description}`);
});

test("eventToICSData rejects when createIcsEvent returns an error", async () => {
	mockCreateIcsEvent.mockImplementation((_event, cb) => {
		cb(new Error("ICS creation failed"), undefined);
	});

	await expect(eventToICSData(e._id)).rejects.toThrow("ICS creation failed");
});

test("eventToICSData rejects when createIcsEvent returns no data", async () => {
	mockCreateIcsEvent.mockImplementation((_event, cb) => {
		cb(undefined, undefined);
	});

	await expect(eventToICSData(e._id)).rejects.toThrow(
		"ICS generator returned no data"
	);
});

test("Converting a missing event to ICS data returns null", async () => {
	const missingId = new mongoose.Types.ObjectId();

	const ics = await eventToICSData(missingId);

	expect(ics).toBeNull();
});

test("eventToICSData rejects when createIcsEvent returns an error", async () => {
	mockCreateIcsEvent.mockImplementation((_event, cb) => {
		cb(new Error("ICS creation failed"), undefined);
	});

	await expect(eventToICSData(e._id)).rejects.toThrow("ICS creation failed");
});

test("eventToICSData rejects when createIcsEvent returns no data", async () => {
	mockCreateIcsEvent.mockImplementation((_event, cb) => {
		cb(undefined, undefined);
	});

	await expect(eventToICSData(e._id)).rejects.toThrow(
		"ICS generator returned no data"
	);
});

test("eventToICSData rejects when stored event has invalid start/end values", async () => {
	const rawId = new mongoose.Types.ObjectId();

	await Event.collection.insertOne({
		_id: rawId,
		title: "Bad Event",
		description: "Bad dates",
		start: null,
		end: null,
		homeId: homeId,
		createdAt: new Date(),
		updatedAt: new Date(),
	});

	await expect(eventToICSData(rawId)).rejects.toThrow();
});
