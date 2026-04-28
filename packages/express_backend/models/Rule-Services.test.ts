import mongoose from "mongoose";
import { Rule } from "./Rule";
import { config } from "dotenv";
import {
	expect,
	test,
	beforeAll,
	afterAll,
	beforeEach,
	afterEach,
} from "@jest/globals";
config();

import {
	createRule,
	getRuleById,
	getRulesByHome,
	updateRule,
	removeRuleById,
} from "./Rules-Services";

let r: any; // FIXME type this later

const ruleData = {
	description:
		"This is a new rule that enforces washing your hands before using the kitchen",
	status: "PENDING",
	homeId: new mongoose.Types.ObjectId(),
};
beforeAll(async () => {
	// FOR WHEN WE SWITCH TO CLOUD MONGO DB
	// const uri = process.env.MONGODB_URI;
	// if (!uri) throw new Error("Set MONGODB_URI for tests");
	// await mongoose.connect(uri);

	// posts to / tests so that we arent messing anything up

	const uri = process.env.MONGO_URI_TEST;
	if (!uri) throw new Error("MONGO_URI_TEST not defined");
	await mongoose.connect(uri);
});

afterAll(async () => {
	await mongoose.connection.dropDatabase();
	await mongoose.connection.close();
});

beforeEach(async () => {
	r = await createRule(ruleData);
	expect(r).toBeDefined();
	if (!r) return;
});

afterEach(async () => {
	await Rule.deleteMany();
});

test("Creating a rule item", async () => {
	expect(r._id).toBeDefined();
	expect(r.description).toBe(ruleData.description);
	expect(r.homeId).toBe(ruleData.homeId);
	expect(r.status).toBe(ruleData.status);
});
test("Creating  invalid rule (max length exceeded)", async () => {
	const invalid1 = {
		description:
			"All apartment residents must respect shared spaces, keep noise reasonable, clean up after themselves, contribute fairly to shared expenses, report maintenance issues promptly, and communicate conflicts directly and respectfully.", // over max char limit
		status: "CONFIRMED",
		homeId: new mongoose.Types.ObjectId(),
	};

	await expect(createRule(invalid1)).rejects.toThrow();
});

test("Getting a rule by id", async () => {
	const fetched = await getRuleById(r._id);
	if (!fetched) return;
	expect(fetched).toBeDefined();
	expect(fetched._id.toString()).toBe(r._id.toString());
});

test("Getting rule items by home", async () => {
	const homeId = ruleData.homeId;

	const anotherRuleData = {
		description:
			"Quiet hours 10pm-8am; keep music/TV low and avoid loud chores during this time.",
		status: "CONFIRMED",
		homeId: homeId,
	};

	const r2 = await createRule(anotherRuleData);
	if (!r2) return;
	expect(r2).toBeDefined();

	const rules = await getRulesByHome(homeId);
	if (!rules) return;
	expect(rules).toBeDefined();
	expect(rules).toHaveLength(2);

	const ids = rules.map((x) => x._id.toString()).sort();
	expect(ids).toEqual([r._id.toString(), r2._id.toString()].sort());
});

test("Updating a rule item", async () => {
	const updatedRule = {
		description:
			"This is a new rule that enforces washing your hands before using the kitchen, UPDATED",
	};
	const updated = await updateRule(r._id, updatedRule);
	expect(updated).toBeDefined();
	if (!updated) return;
	expect(updated.description).toBe(updatedRule.description);
	expect(updated.status).toBe(ruleData.status);
});

test("Deleting a rule", async () => {
	const deletedItem = await removeRuleById(r._id);
	expect(deletedItem).toBeDefined();
	expect(deletedItem?._id.toString()).toBe(r._id.toString());
	const shouldBeNull = await getRuleById(r._id);
	expect(shouldBeNull).toBeNull();
});
