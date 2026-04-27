import mongoose from "mongoose";
import {
	expect,
	test,
	describe,
	beforeAll,
	afterAll,
	beforeEach,
	afterEach,
} from "@jest/globals";
import {
	getEventsByHome,
	getEventById,
	createEvent,
	removeEventById,
	updateEvent,
} from "./Event-Services";
import { Event } from "./Event";
import { config } from "dotenv";
config();
let e: any; // FIXME type this later
const homeId = new mongoose.Types.ObjectId();
const basicEventData = {
	title: "Test Event Service",
	description: "This is a test event for the Event Services tests.",
	start: Date.now(),
	end: Date.now() + 3600000, // 1 hour later
	eventType: "HOME",
	homeId: homeId, // This will be set to the actual homeId in beforeEach
};
const basicEventData2 = {
	title: "Test Event Service 2",
	description: "This is a second test event for the Event Services tests.",
	start: Date.now(),
	end: Date.now() + 7200000, // 1 hour later
	eventType: "PERSONAL",
	homeId: homeId, // This will be set to the actual homeId in beforeEach
};

beforeAll(async () => {
	// FOR WHEN WE SWITCH TO CLOUD MONGO DB
	// const uri = process.env.MONGODB_URI;
	// if (!uri) throw new Error("Set MONGODB_URI for tests");
	// await mongoose.connect(uri);
	const uri = process.env.MONGO_URI_TEST;
	if (!uri) throw new Error("MONGO_URI_TEST not defined");

	await mongoose.connect(uri);
});

afterAll(async () => {
	await mongoose.connection.dropDatabase();
	await mongoose.connection.close();
});

beforeEach(async () => {
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
	expect(e.eventType).toBe(basicEventData.eventType);
	expect(e.homeId.toString()).toBe(basicEventData.homeId.toString());
});

test("Getting an event by ID", async () => {
	const eventId = e._id;
	const fetched = await getEventById(eventId);
	expect(fetched).toBeDefined();
	if (!fetched) return;
	expect(fetched._id.toString()).toBe(eventId.toString());
});
test("Getting an events by  home ID", async () => {
	const homeId = new mongoose.Types.ObjectId();

	const e1 = await createEvent({ ...basicEventData, homeId });
	expect(e1).toBeDefined();
	if (!e1) return;

	const e2 = await createEvent({ ...basicEventData2, homeId });
	expect(e2).toBeDefined();
	if (!e2) return;

	const events = await getEventsByHome(homeId);
	expect(events).toBeDefined();
	if (!events) return;
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
		eventType: "TOGETHER",
		homeId: new mongoose.Types.ObjectId(), // This will be set to the actual homeId in beforeEach
	};

	const fetched = await updateEvent(eventId, updated);
	expect(fetched).toBeDefined();
	if (!fetched) return;
	expect(fetched._id.toString()).toBe(eventId.toString());
	expect(fetched.title).toBe(updated.title);
	expect(fetched.description).toBe(updated.description);
	expect(fetched.start.getTime()).toBe(updated.start);
	expect(fetched.end.getTime()).toBe(updated.end);
	expect(fetched.eventType).toBe(updated.eventType);
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
		end: Date.now() - 3600000, // 1 hour before start
	};
	await expect(createEvent(invalidEventData)).rejects.toThrow(
		"End must be after start time"
	);
});
