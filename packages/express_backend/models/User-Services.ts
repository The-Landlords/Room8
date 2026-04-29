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

export function getUsersByHomeId(homeId: mongoose.Types.ObjectId) {
	return User.find({ homeIds: { $elemMatch: { homeId: homeId } } });
}
// UPDATE
// commented out because redundant as we want all methods to use username
export function updateUserById(
	userId: mongoose.Types.ObjectId | string,
	data: any
) {
	// { new: true } returns the updated doc
	return User.findByIdAndUpdate(userId, data, {
		returnDocument: "after",
		runValidators: true,
	});
}

export function getUsersByHomeAndRelation(
	homeId: mongoose.Types.ObjectId,
	relationship: string
) {
	return User.find({
		homeIds: { $elemMatch: { homeId: homeId, relationship: relationship } },
	});
}

// UPDATE
export function updateUserByUsername(username: string, data: any) {
	// { new: true } returns the updated doc
	return User.findOneAndUpdate({ username }, data, {
		returnDocument: "after",
		runValidators: true,
	});
}

// DELETE
export function removeUserById(userId: mongoose.Types.ObjectId) {
	return User.findByIdAndDelete(userId);
}

//get relation status of a user to a home given a userId and homeId
export function getUserHomeRelation(
	userId: mongoose.Types.ObjectId,
	homeId: mongoose.Types.ObjectId
) {
	return User.findOne(
		{ _id: userId, homeIds: { $elemMatch: { homeId: homeId } } },
		{ "homeIds.$": 1 }
	);
}

//
