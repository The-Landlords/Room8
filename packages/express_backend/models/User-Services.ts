// user-services.ts
import { User } from "./User.js";
import mongoose from "mongoose";
import bcrypt from "bcrypt";
import { encryptField, decryptField } from "../utils/encryption.js";

const SALT_ROUNDS = 12;

const phoneRegex = /^\+?[1-9]\d{1,14}$/;

function isEncryptedField(value: any) {
	return (
		value &&
		typeof value === "object" &&
		typeof value.encryptedData === "string" &&
		typeof value.iv === "string" &&
		typeof value.authTag === "string"
	);
}

function decryptProfileField(value: any) {
	if (!value) {
		return "";
	}

	if (isEncryptedField(value)) {
		return decryptField(value);
	}

	return value;
}

function encryptProfileFields(data: any) {
	const updateData = { ...data };
	const unsetData: Record<string, ""> = {};

	if (updateData.phone === "") {
		unsetData.phone = "";
		delete updateData.phone;
	} else if (updateData.phone) {
		if (!phoneRegex.test(updateData.phone)) {
			throw new Error("Invalid phone number");
		}

		updateData.phone = encryptField(updateData.phone);
	}

	if (updateData.emergencyContact?.phone === "") {
		const emergencyContact = updateData.emergencyContact;

		unsetData["emergencyContact.phone"] = "";
		delete updateData.emergencyContact;

		if (emergencyContact.name !== undefined) {
			updateData["emergencyContact.name"] = emergencyContact.name;
		}

		if (emergencyContact.relationship !== undefined) {
			updateData["emergencyContact.relationship"] =
				emergencyContact.relationship;
		}
	} else if (updateData.emergencyContact?.phone) {
		if (!phoneRegex.test(updateData.emergencyContact.phone)) {
			throw new Error("Invalid emergency contact phone number");
		}

		updateData.emergencyContact = {
			...updateData.emergencyContact,
			phone: encryptField(updateData.emergencyContact.phone),
		};
	}

	if (updateData.DOB === "") {
		unsetData.DOB = "";
		delete updateData.DOB;
	} else if (updateData.DOB) {
		const parsedDOB = new Date(updateData.DOB);

		if (Number.isNaN(parsedDOB.getTime())) {
			throw new Error("Invalid date of birth");
		}

		updateData.DOB = encryptField(parsedDOB.toISOString());
	}

	if (Object.keys(unsetData).length > 0) {
		return {
			$set: updateData,
			$unset: unsetData,
		};
	}

	return updateData;
}

// helper function to decrypt profile fields
function decryptProfileFields(user: any) {
	const plainUser = user.toObject ? user.toObject() : user;

	return {
		...plainUser,
		phone: decryptProfileField(plainUser.phone),
		DOB: decryptProfileField(plainUser.DOB),
		emergencyContact: {
			...plainUser.emergencyContact,
			phone: decryptProfileField(plainUser.emergencyContact?.phone),
		},
	};
}
// CREATE
export async function createUser(userData: any) {
	// Signup only creates username/password.
	// Profile fields like phone, DOB, and emergencyContact.phone
	// are encrypted later through updateUserByUsername/updateUserById.
	const hashPassword = await bcrypt.hash(userData.password, SALT_ROUNDS);

	// Store the hashed password instead of the plain password.
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

	// hash new updated password
	const password = updateData.$set?.password ?? updateData.password;

	if (password) {
		const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);

		if (updateData.$set) {
			updateData.$set.password = hashedPassword;
		} else {
			updateData.password = hashedPassword;
		}
	}

	const updatedUser = await User.findByIdAndUpdate(userId, updateData, {
		returnDocument: "after",
		runValidators: true,
	});

	return updatedUser ? decryptProfileFields(updatedUser) : null;
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

	// hash new updated password
	const password = updateData.$set?.password ?? updateData.password;

	if (password) {
		const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);

		if (updateData.$set) {
			updateData.$set.password = hashedPassword;
		} else {
			updateData.password = hashedPassword;
		}
	}

	const updatedUser = await User.findOneAndUpdate({ username }, updateData, {
		returnDocument: "after",
		runValidators: true,
	});

	return updatedUser ? decryptProfileFields(updatedUser) : null;
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
