import mongoose, { mongo } from "mongoose";
import { config } from "dotenv";
config();

import { Chore } from "./Chore";

import {
	createChore,
	getChoreById,
	getChoresByHome,
	removeChoreById,
	updateChore,
} from "./Chore-Services";

let c: any; // FIXME type this later
const homeId = new mongoose.Types.ObjectId();

const choreData = {
	title: "Take out trash",
	description: "Kitchen + bathroom",
	homeId: homeId,
	isCompleted: false,
	isRecurring: false,
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
	c = await createChore(choreData);
	expect(c).toBeDefined();
	if (!c) return;
});

afterEach(async () => {
	await Chore.deleteMany();
});

test("Creating an event", async () => {
	expect(c._id).toBeDefined();
	expect(c.title).toBe(choreData.title);
	expect(c.description).toBe(choreData.description);
	expect(c.isCompleted).toBe(choreData.isCompleted);
	expect(c.isRecurring).toBe(choreData.isRecurring);
	expect(c.homeId.toString()).toBe(choreData.homeId.toString());
});

test("Getting an event by ID", async () => {
	const choreId = c._id;
	const fetched = await getChoreById(choreId);
	expect(fetched).toBeDefined();
	if (!fetched) return;
	expect(fetched._id.toString()).toBe(choreId.toString());
});

test("Deleting a chore", async () => {
	const deleted = await removeChoreById(c._id.toString());
	expect(deleted).toBeDefined();
	expect(deleted?._id.toString()).toBe(c._id.toString());

	const shouldBeNull = await getChoreById(c._id.toString());
	expect(shouldBeNull).toBeNull();
});

test("Getting an events by  home ID", async () => {
	const homeId = new mongoose.Types.ObjectId();
	const e1 = await createChore({ ...choreData, homeId });
	expect(e1).toBeDefined();
	if (!e1) return;

	const e2 = await createChore({ ...choreData, homeId });
	expect(e2).toBeDefined();
	if (!e2) return;

	const chores = await getChoresByHome(homeId);
	expect(chores).toBeDefined();
	if (!chores) return;
	expect(chores.length).toBe(2);
	const ids = chores.map((x) => x._id.toString()).sort();
	expect(ids).toEqual([e1._id.toString(), e2._id.toString()].sort());
});

test("Updating an event", async () => {
	const choreId = c._id;

	const updated = {
		title: "Updated Test Chore Service",
		description:
			"Updated This is a test chore for the chore Services tests.",
		isCompleted: true,
		isRecurring: true,
	};

	const fetched = await updateChore(choreId, updated);
	expect(fetched).toBeDefined();
	if (!fetched) return;
	expect(fetched._id.toString()).toBe(choreId.toString());
	expect(fetched.title).toBe(updated.title);
	expect(fetched.description).toBe(updated.description);
	expect(fetched.isCompleted).toBe(updated.isCompleted);
	const now = Date.now();
	const ONE_WEEK = 7 * 24 * 60 * 60 * 1000;
	const expected = now + ONE_WEEK;

	const diff = Math.abs(fetched.nextOccurrence.getTime() - expected);

	expect(diff).toBeLessThan(1000); // 1 second
	expect(fetched.homeId.toString()).toBe(homeId.toString());
});
