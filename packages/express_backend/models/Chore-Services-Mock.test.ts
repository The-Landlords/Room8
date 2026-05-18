import mockingoose from "mockingoose";
import mongoose from "mongoose";
import { expect, test, beforeEach, beforeAll } from "@jest/globals";
import { Chore } from "./Chore";
import {
	createChore,
	getChoreById,
	getChoresByHome,
	removeChoreById,
	updateChore,
} from "./Chore-Services";

const homeId = new mongoose.Types.ObjectId();

const choreData = {
	title: "Take out trash",
	description: "Kitchen + bathroom",
	homeId,
	isCompleted: false,
	isRecurring: false,
};

beforeEach(() => {
	mockingoose.resetAll();
});
beforeAll(() => {});
test("Creating a chore", async () => {
	const chore = new Chore(choreData);
	mockingoose(Chore).toReturn(chore, "save");

	const created = await createChore(choreData);

	expect(created).toBeDefined();
	expect(created.title).toBe(choreData.title);
	expect(created.description).toBe(choreData.description);
	expect(created.isCompleted).toBe(choreData.isCompleted);
	expect(created.isRecurring).toBe(choreData.isRecurring);
	expect(created.homeId.toString()).toBe(choreData.homeId.toString());
});

test("Getting a chore by ID", async () => {
	const chore = new Chore(choreData);
	mockingoose(Chore).toReturn(chore, "findOne");

	const fetched = await getChoreById(chore._id);

	expect(fetched).toBeDefined();

	expect(fetched?._id.toString()).toBe(chore._id.toString());
});

test("Getting chores by home ID", async () => {
	const chore1 = new Chore(choreData);
	const chore2 = new Chore({ ...choreData, title: "Do the dishes" });
	mockingoose(Chore).toReturn([chore1, chore2], "find");

	const chores = await getChoresByHome(choreData.homeId);

	expect(chores).toBeDefined();
	expect(chores.length).toBe(2);
	expect(chores[0].homeId.toString()).toBe(choreData.homeId.toString());
	expect(chores[1].homeId.toString()).toBe(choreData.homeId.toString());
});

test("Updating a chore", async () => {
	const chore = new Chore(choreData);
	const updatedData = { ...choreData, title: "Take out recycling" };
	const updatedDoc = new Chore(updatedData);
	updatedDoc._id = chore._id;
	mockingoose(Chore).toReturn(updatedDoc, "findOneAndUpdate");
	const updated = await updateChore(chore._id, updatedData);

	expect(updated).toBeDefined();
	expect(updated?.title).toBe(updatedData.title);
});

test("Removing a chore by ID", async () => {
	const chore = new Chore(choreData);
	mockingoose(Chore).toReturn(chore, "findOneAndDelete");

	const removed = await removeChoreById(chore._id);

	expect(removed).toBeDefined();
	expect(removed?._id.toString()).toBe(chore._id.toString());
});

test("Updating an event", async () => {
	const chore = new Chore(choreData);
	const choreId = chore._id;

	const updated = {
		title: "Updated Test Chore Service",
		description:
			"Updated This is a test chore for the chore Services tests.",
		isCompleted: true,
		isRecurring: true,
	};

	const updatedDoc = new Chore({
		...choreData,
		...updated,
		nextOccurrence: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
	});
	updatedDoc._id = choreId;

	mockingoose(Chore).toReturn(updatedDoc, "findOneAndUpdate");

	const fetched = await updateChore(choreId, updated);

	expect(fetched).toBeDefined();
	if (!fetched) return;

	expect(fetched._id.toString()).toBe(choreId.toString());
	expect(fetched.title).toBe(updated.title);
	expect(fetched.description).toBe(updated.description);
	expect(fetched.isCompleted).toBe(updated.isCompleted);
	expect(fetched.homeId.toString()).toBe(choreData.homeId.toString());

	const now = Date.now();
	const ONE_WEEK = 7 * 24 * 60 * 60 * 1000;
	const expected = now + ONE_WEEK;
	const diff = Math.abs(fetched.nextOccurrence.getTime() - expected);

	expect(diff).toBeLessThan(1000);
	expect(fetched.homeId.toString()).toBe(homeId.toString());
});

test("sets isRecurring to false by default", () => {
	const chore = new Chore({
		title: "Take out trash",
		homeId,
	});

	expect(chore.isRecurring).toBe(false);
	expect(chore.nextOccurrence).toBeUndefined();
});

test("sets nextOccurrence by default when isRecurring is true", () => {
	const before = Date.now();

	const chore = new Chore({
		title: "Vacuum",
		homeId,
		isRecurring: true,
	});

	const after = Date.now();

	expect(chore.isRecurring).toBe(true);
	expect(chore.nextOccurrence).toBeDefined();

	const next = chore.nextOccurrence.getTime();
	const minExpected = before + 7 * 24 * 60 * 60 * 1000;
	const maxExpected = after + 7 * 24 * 60 * 60 * 1000;

	expect(next).toBeGreaterThanOrEqual(minExpected);
	expect(next).toBeLessThanOrEqual(maxExpected);
});

test("requires nextOccurrence when isRecurring is true and no default is applied", async () => {
	const chore = new Chore({
		title: "Laundry",
		homeId,
		isRecurring: true,
	});

	await expect(chore.validate()).resolves.toBeUndefined();
});

test("nextOccurrence is required when isRecurring is true", async () => {
	const chore = new Chore({
		title: "Laundry",
		homeId,
		isRecurring: true,
	});

	chore.nextOccurrence = undefined as any;

	await expect(chore.validate()).rejects.toThrow();
});

test("nextOccurrence is not required when isRecurring is false", async () => {
	const chore = new Chore({
		title: "Dishes",
		homeId,
		isRecurring: false,
		nextOccurrence: undefined,
	});

	await expect(chore.validate()).resolves.toBeUndefined();
});
