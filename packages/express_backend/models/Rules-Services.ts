import { Rule } from "./Rule";
import mongoose from "mongoose";

// create
export function createRule(data: any) {
  return Rule.create(data);
}

// get rule by id
export function getRuleById(ruleId: mongoose.Types.ObjectId) {
	return Rule.findById(ruleId);
}

// Get rules
export function getRulesByHome(homeId: mongoose.Types.ObjectId) {
  return Rule.find({ homeId });
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
