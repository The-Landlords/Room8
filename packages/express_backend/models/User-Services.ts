// user-services.ts
import { User } from "./User";
import mongoose from "mongoose";

// CREATE
function createUser(data: any) {
	return User.create(data);
}

// READ
function getUserById(userId: string) {
	return User.findById(userId);
}

function getUserByUsername(username: string) {
	return User.findOne({ username });
}

function getUsersByApartment(apartmentId: string) {
	// users who have this apartmentId inside apartmentIds array
	return User.find({ apartmentIds: apartmentId });
}

// UPDATE
function updateUser(userId: string, data: any) {
	// { new: true } returns the updated doc
	return User.findByIdAndUpdate(userId, data, {
		new: true,
		runValidators: true,
	});
}

// DELETE
function removeUserById(userId: string) {
	return User.findByIdAndDelete(userId);
}

// helpers for nested fields / arrays
function addApartmentToUser(userId: string, apartmentId: string) {
	return User.findByIdAndUpdate(
		userId,
		{ $addToSet: { apartmentIds: apartmentId } }, // prevents duplicates
		{ new: true }
	);
}

function removeApartmentFromUser(userId: string, apartmentId: string) {
	return User.findByIdAndUpdate(
		userId,
		{ $pull: { apartmentIds: apartmentId } },
		{ new: true }
	);
}

export default {
	createUser,
	getUserById,
	getUserByUsername,
	getUsersByApartment,
	updateUser,
	removeUserById,
	addApartmentToUser,
	removeApartmentFromUser,
};
