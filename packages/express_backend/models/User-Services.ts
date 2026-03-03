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

// this should be rewritten to get all home residents given a homeId
function getUsersByHomeId(homeId: string) {
	return User.find({ "homeIds._id": homeId });
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

// helpers for nested fields / arrays
export function addApartmentToUser(userId: string, apartmentId: string) {
	return User.findByIdAndUpdate(
		userId,
		{ $addToSet: { apartmentIds: apartmentId } }, // prevents duplicates
		{ new: true }
	);
}

export function removeApartmentFromUser(userId: string, apartmentId: string) {
	return User.findByIdAndUpdate(
		userId,
		{ $pull: { apartmentIds: apartmentId } },
		{ new: true }
	);
}
