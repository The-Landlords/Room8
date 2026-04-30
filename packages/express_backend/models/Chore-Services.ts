import mongoose from "mongoose";
import { Chore } from "./Chore";

export function getChoresByHome(homeId: mongoose.Types.ObjectId) {
	return Chore.find({ homeId: homeId });
}

export function getChoreById(choreId: mongoose.Types.ObjectId) {
	return Chore.findById(choreId);
}

export function createChore(data: any) {
	return Chore.create(data);
}

export function removeChoreById(choreId: mongoose.Types.ObjectId) {
	return Chore.findByIdAndDelete({ _id: choreId });
}

export function updateChore(choreId: mongoose.Types.ObjectId, data: any) {
	return Chore.findByIdAndUpdate(choreId, data, {
		returnDocument: "after",
		runValidators: true,
	});
}
