// user-services.ts
import { User } from "./User.js";
import mongoose from "mongoose";
import bcrypt from "bcrypt";

const SALT_ROUNDS = 12;

// CREATE
export async function createUser(userData: any) {
	const hashPassword = await bcrypt.hash(userData.password, SALT_ROUNDS);

	//hash new updated password
	return User.create({
		...userData,
		password: hashPassword,
	});
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
export async function updateUserById(
	userId: mongoose.Types.ObjectId | string,
	data: any
) {
	const updateData = { ...data };

	//hash new updated password
	if (updateData.password) {
		updateData.password = await bcrypt.hash(
			updateData.password,
			SALT_ROUNDS
		);
	}

	return User.findByIdAndUpdate(userId, updateData, {
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
export async function updateUserByUsername(username: string, data: any) {
	const updateData = { ...data };

	//hash new updated password
	if (updateData.password) {
		updateData.password = await bcrypt.hash(
			updateData.password,
			SALT_ROUNDS
		);
	}

	return User.findOneAndUpdate({ username }, updateData, {
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
