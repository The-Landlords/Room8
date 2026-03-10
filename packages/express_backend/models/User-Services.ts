// user-services.ts
import { User } from "./User";
import mongoose from "mongoose";

// CREATE
export function createUser(data: any) {
	return User.create(data);
}

// READ
export function getUserById(userId: mongoose.Schema.Types.ObjectId | string) {
	return User.findById(userId);
}

export function getUserByUsername(username: string) {
	return User.findOne({ username });
}

//ASK is this the correct way to find a user by their relationship to a home?
export function getUsersByHomeId(
	homeId: mongoose.Schema.Types.ObjectId | string
) {
	return User.findOne({ "relationship.homeId": homeId });
}

//ASK is this the correct way to list users by their relationship to a home?
export function getUsersByHomeAndRelationship(
	homeId: string,
	relationship: string
) {
	return User.find({
		"homeIds.homeId": homeId,
		"homeIds.relationship": relationship,
	});
}

// UPDATE
export function updateUser(
	userId: mongoose.Types.ObjectId | string,
	data: any
) {
	return User.findByIdAndUpdate(userId, data, {
		new: true,
		runValidators: true,
	});
}

// DELETE
export function removeUserById(userId: mongoose.Types.ObjectId | string) {
	return User.findByIdAndDelete(userId);
}
