import mockingoose from "mockingoose";
import mongoose from "mongoose";
import { expect, test, describe, beforeEach } from "@jest/globals";
import { Rule } from "./Rule";

import {
	createRule,
	getRuleById,
	getRulesByHome,
	updateRule,
	removeRuleById,
} from "./Rules-Services";

const homeId = new mongoose.Types.ObjectId();

const ruleData = {
	description:
		"This is a new rule that enforces washing your hands before using the kitchen",
	status: "PENDING",
	homeId,
};

beforeEach(() => {
	mockingoose.resetAll();
});

test("Creating a rule item", async () => {
	const rule = new Rule(ruleData);
	mockingoose(Rule).toReturn(rule, "save");

	const created = await createRule(ruleData);

	expect(created).toBeDefined();
	expect(created.description).toBe(ruleData.description);
	expect(created.status).toBe(ruleData.status);
	expect(created.homeId.toString()).toBe(ruleData.homeId.toString());
});

test("Getting a rule by ID", async () => {
	const rule = new Rule(ruleData);
	mockingoose(Rule).toReturn(rule, "findOne");

	const fetched = await getRuleById(rule._id);

	expect(fetched).toBeDefined();
	expect(fetched?._id.toString()).toBe(rule._id.toString());
});

test("Getting rules by home ID", async () => {
	const rule1 = new Rule(ruleData);
	const rule2 = new Rule({ ...ruleData, description: "Another rule" });
	mockingoose(Rule).toReturn([rule1, rule2], "find");

	const rules = await getRulesByHome(ruleData.homeId);

	expect(rules).toBeDefined();
	expect(rules.length).toBe(2);
	const descriptions = rules.map((x) => x.description).sort();
	expect(descriptions).toEqual([rule1.description, rule2.description].sort());
});

test("Updating a rule", async () => {
	const rule = new Rule(ruleData);
	const updatedDoc = new Rule({
		...ruleData,
		description: "Updated rule description",
	});
	updatedDoc._id = rule._id;
	mockingoose(Rule).toReturn(updatedDoc, "findOneAndUpdate");

	const updated = await updateRule(rule._id, {
		...ruleData,
		description: "Updated rule description",
	});

	expect(updated).toBeDefined();
	expect(updated?.description).toBe("Updated rule description");
});

test("Removing a rule by ID", async () => {
	const rule = new Rule(ruleData);
	mockingoose(Rule).toReturn(rule, "findOneAndDelete");

	const deleted = await removeRuleById(rule._id);

	expect(deleted).toBeDefined();
	expect(deleted?._id.toString()).toBe(rule._id.toString());
});
