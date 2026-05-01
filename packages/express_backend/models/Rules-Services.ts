import { Rule } from "./Rule.js";
import { Home } from "./Home.js";
import mongoose from "mongoose";

// create rule
export async function createRule(data: any) {
	const { homeCode, ...ruleData } = data;

	if (homeCode) {
		const home = await Home.findOne({ homeCode: homeCode });

		if (!home) {
			throw new Error(`Home not found for code: ${homeCode}`);
		}

		return Rule.create({ ...ruleData, homeId: home._id });
	}

	return Rule.create(ruleData);
}

// get rule by id
export function getRuleById(ruleId: mongoose.Types.ObjectId) {
	return Rule.findById(ruleId);
}

// get all rules from a household
export async function getRulesByHome(
	homeIdOrCode: mongoose.Types.ObjectId | string
) {
	if (typeof homeIdOrCode === "string") {
		const home = await Home.findOne({ homeCode: homeIdOrCode });

		if (!home) {
			return [];
		}

		return Rule.find({ homeId: home._id });
	}

	return Rule.find({ homeId: homeIdOrCode });
}

// Update rule
export function updateRule(ruleId: mongoose.Types.ObjectId, data: any) {
	return Rule.findByIdAndUpdate(ruleId, data, {
		returnDocument: "after",
		runValidators: true,
	});
}

// delete rule
export function removeRuleById(ruleId: mongoose.Types.ObjectId) {
	return Rule.findByIdAndDelete({ _id: ruleId });
}
