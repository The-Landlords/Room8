// user-services.ts
import { User } from "./User";
import mongoose from "mongoose";

// CREATE
export function createUser(data: any) {
	return User.create(data);
}

// READ
export function getUserById(userId: mongoose.Types.ObjectId) {
	return User.findById(userId);
}

export function getUserByUsername(username: string) {
	return User.findOne({ username });
}

//ASK is this the correct way to find a user by their relationship to a home?
export function getUsersByHomeId(homeId: mongoose.Types.ObjectId) {
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
export function updateUserById(userId: mongoose.Types.ObjectId, data: any) {
	// { new: true } returns the updated doc
	return User.findByIdAndUpdate(userId, data, {
		returnDocument: "after",
		runValidators: true,
	});
}

// DELETE
export function removeUserById(userId: mongoose.Types.ObjectId) {
	return User.findByIdAndDelete(userId);
}
