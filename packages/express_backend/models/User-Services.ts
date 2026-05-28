// user-services.ts
import { User } from "./User.js";
import mongoose from "mongoose";
import bcrypt from "bcrypt";
import { encryptField, decryptField } from "../utils/encryption.js";

const SALT_ROUNDS = 12;

const phoneRegex = /^\+?[1-9]\d{1,14}$/;

// helper function to encrypt profileFields
function encryptProfileFields(data: any) {
	const updateData = { ...data };

	if (updateData.phone) {
		if (!phoneRegex.test(updateData.phone)) {
			throw new Error("Invalid phone number");
		}

		updateData.phone = encryptField(updateData.phone);
	}

	if (updateData.emergencyContact?.phone) {
		if (!phoneRegex.test(updateData.emergencyContact.phone)) {
			throw new Error("Invalid emergency contact phone number");
		}

		updateData.emergencyContact = {
			...updateData.emergencyContact,
			phone: encryptField(updateData.emergencyContact.phone),
		};
	}

	if (updateData.DOB) {
		updateData.DOB = encryptField(new Date(updateData.DOB).toISOString());
	}

	return updateData;
}

//helper function to decrypt profiles fields
function decryptProfileFields(user: any) {
	const plainUser = user.toObject ? user.toObject() : user;

	return {
		...plainUser,
		phone: plainUser.phone ? decryptField(plainUser.phone) : "",
		DOB: plainUser.DOB ? decryptField(plainUser.DOB) : "",
		emergencyContact: {
			...plainUser.emergencyContact,
			phone: plainUser.emergencyContact?.phone
				? decryptField(plainUser.emergencyContact.phone)
				: "",
		},
	};
}
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
	const updateData = encryptProfileFields(data);

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

export async function getUserSettingsById(userId: mongoose.Types.ObjectId) {
	const user = await User.findById(userId);

	if (!user) {
		return null;
	}

	return decryptProfileFields(user);
}

// UPDATE
export async function updateUserByUsername(username: string, data: any) {
	const updateData = encryptProfileFields(data);

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
