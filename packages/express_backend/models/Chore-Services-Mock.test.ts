import mockingoose from "mockingoose";
import mongoose from "mongoose";
import { expect, test, describe, beforeEach, beforeAll } from "@jest/globals";
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

//error testing
