import { Rule } from "./Rule";
import mongoose from "mongoose";

// create
export function createRule(data: any) {
  return Rule.create(data);
}

// Get rule by ID
export function getRuleById(ruleId: string) {
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

// Delete rule
export function removeRuleById(ruleId: string) {
  return Rule.findByIdAndDelete(ruleId);
}