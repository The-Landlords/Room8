// user-services.ts
import { User } from "./User";
import mongoose from "mongoose";

// CREATE
export function createUser(data: any) {
	return User.create(data);
}

// READ
export function getUserById(userId: string) {
	return User.findById(userId);
}

export function getUserByUsername(username: string) {
	return User.findOne({ username });
}

//ASK is this the correct way to find a user by their relationship to a home?
export function getUsersByHomeId(homeId: string) {
	return User.findOne({ "relationship.homeId": homeId });
}

//ASK is this the correct way to list users by their relationship to a home?
export function getUsersByHomeAndRelationship(
	homeId: string,
	relationship: string
) {
	return User.find({
		"relationship.homeId": homeId,
		"relationship.relationship": relationship,
	});
}

//ASK : how to add a relationship to the user schema?
export function updateUserRelationship(userId: string, relationship: string) {
	return User.findByIdAndUpdate(
		userId,
		{ relationship: relationship },
		{
			returnDocument: "after",
			runValidators: true,
		}
	);
}

// UPDATE
export function updateUser(userId: string, data: any) {
	// { new: true } returns the updated doc
	return User.findByIdAndUpdate(userId, data, {
		new: true,
		runValidators: true,
	});
}

// DELETE
export function removeUserById(userId: string) {
	return User.findByIdAndDelete(userId);
}
