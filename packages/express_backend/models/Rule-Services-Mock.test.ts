import mockingoose from "mockingoose";
import mongoose from "mongoose";
import { expect, test, beforeEach } from "@jest/globals";
import { Rule } from "./Rule";

import {
	createRule,
	getRuleById,
	getRulesByHome,
	updateRule,
	removeRuleById,
} from "./Rules-Services";
import { Home } from "./Home";

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

test("Creating a rule with home code fails for invalid home code", async () => {
	mockingoose(Home).toReturn(null, "findOne"); // rewise mockinggoose to always return null for Home.findOne in this test

	await expect(
		createRule({ ...ruleData, homeCode: "MISSING" })
	).rejects.toThrow("Home not found for code: MISSING");
});

test("Creating a rule with home code fails for invalid home code", async () => {
	mockingoose(Home).toReturn(null, "findOne"); // rewise mockinggoose to always return null for Home.findOne in this test

	await expect(
		createRule({ ...ruleData, homeCode: "MISSING" })
	).rejects.toThrow("Home not found for code: MISSING");
});

test("Creating a rule with home code uses the home's _id", async () => {
	const home = new Home({
		_id: homeId,
		homeCode: "ABC123",
	});

	mockingoose(Home).toReturn(home, "findOne");

	const created = await createRule({
		...ruleData,
		homeCode: home.homeCode,
	});

	expect(created).toBeDefined();
	expect(created.homeId.toString()).toBe(homeId.toString());
	expect(created.description).toBe(ruleData.description);
	expect(created.status).toBe(ruleData.status);
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
test("Getting rules by home ID fails when given a nonexisting home code", async () => {
	mockingoose(Home).toReturn(null, "findOne");

	const rules = await getRulesByHome("NONEXISTING");
	expect(rules).toBeDefined();
	expect(Array.isArray(rules)).toBe(true);
	expect(rules.length).toBe(0);
});

test("returns rules when given a home code", async () => {
	const home = new Home({
		_id: homeId,
		homeCode: "ABC123",
	});

	const rules = [new Rule(ruleData)];

	mockingoose(Home).toReturn(home, "findOne");
	mockingoose(Rule).toReturn(rules, "find");

	const result = await getRulesByHome(home.homeCode);

	expect(result).toHaveLength(1);
	expect(result[0].homeId.toString()).toBe(homeId.toString());
	expect(result[0].description).toBe(ruleData.description);
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
