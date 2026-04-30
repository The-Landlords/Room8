import { Rule } from "./Rule";
import mongoose from "mongoose";
//create rule
export function createRule(data: any) {
	return Rule.create(data);
}

// get rule by id
export function getRuleById(ruleId: mongoose.Types.ObjectId) {
	return Rule.findById(ruleId);
}

// get all rules from a household
export function getRulesByHome(homeId: mongoose.Types.ObjectId) {
	return Rule.find({ homeId: homeId });
}

// update rule
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
