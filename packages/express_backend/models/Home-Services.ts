import { Home } from "./Home.js";
import mongoose from "mongoose";
import { encryptField, decryptField } from "../utils/encryption.js";

function isEncryptedField(value: any) {
	return (
		value &&
		typeof value === "object" &&
		typeof value.encryptedData === "string" &&
		typeof value.iv === "string" &&
		typeof value.authTag === "string"
	);
}

function decryptHomeField(value: any) {
	if (!value) {
		return "";
	}

	if (isEncryptedField(value)) {
		return decryptField(value) ?? "";
	}

	return value;
}

function encryptHomeFields(data: any) {
	const updateData = { ...data };

	if (updateData.address === "") {
		throw new Error("Address is required");
	}

	if (updateData.address && !isEncryptedField(updateData.address)) {
		updateData.address = encryptField(updateData.address);
	}

	return updateData;
}

function decryptHomeFields(home: any) {
	if (!home) {
		return null;
	}

	const plainHome = home.toObject ? home.toObject() : home;

	return {
		...plainHome,
		address: decryptHomeField(plainHome.address),
	};
}

export async function createHome(data: any) {
	// create home
	//relate the userId
	const encryptedData = encryptHomeFields(data);
	const home = await Home.create(encryptedData);

	return decryptHomeFields(home);
}

export async function getHomeById(homeId: mongoose.Types.ObjectId) {
	const home = await Home.findById(homeId);

	return decryptHomeFields(home);
}

export async function getHomeByCode(homeCode: string) {
	const home = await Home.findOne({ homeCode });

	return decryptHomeFields(home);
}

export async function getHomeByName(homeName: string) {
	const home = await Home.findOne({ homeName });

	return decryptHomeFields(home);
}

export async function getHomesByUser(userId: mongoose.Types.ObjectId) {
	const homes = await Home.find({ userIds: { $elemMatch: { userId } } });

	return homes.map(decryptHomeFields);
}

export async function getHomesByUserAndRelation(
	userId: mongoose.Types.ObjectId,
	relationship: string
) {
	const homes = await Home.find({
		userIds: { $elemMatch: { userId, relationship } },
	});

	return homes.map(decryptHomeFields);
}

export async function updateHome(homeId: mongoose.Types.ObjectId, data: any) {
	const updateData = encryptHomeFields(data);

	const updatedHome = await Home.findByIdAndUpdate(homeId, updateData, {
		returnDocument: "after",
		runValidators: true,
	});

	return decryptHomeFields(updatedHome);
}
export function deleteHome(homeId: mongoose.Types.ObjectId) {
	return Home.findByIdAndDelete(homeId);
}

export async function addResidentToHome(
	homeId: mongoose.Types.ObjectId,
	userId: mongoose.Types.ObjectId
) {
	const updatedHome = await Home.findByIdAndUpdate(
		homeId,
		{
			$addToSet: {
				userIds: {
					userId,
					relationship: "RESIDENT",
				},
			},
		},
		{
			returnDocument: "after",
			runValidators: true,
		}
	);

	return decryptHomeFields(updatedHome);
}

//used to check if homes are empty
export async function countUsersByCode(homeCode: string) {
	const home = await getHomeByCode(homeCode);
	return home?.userIds.length ?? null;
}

// commenting for coverage
// export function addMember(user: string) {
// 	//FIXME this will be changed to user Schema, users should store Home id's
// }
// export function removeMember(user: string) {
// 	//FIXME this will be changed to user Schema, users should store Home id's
// }
