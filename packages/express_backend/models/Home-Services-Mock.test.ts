process.env.FIELD_ENCRYPTION_KEY =
	"0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef";

import mockingoose from "mockingoose";
import mongoose from "mongoose";
import { expect, test, beforeEach, jest } from "@jest/globals";

jest.mock("../utils/encryption.js", () => ({
	encryptField: jest.fn((value: string) => ({
		encryptedData: `encrypted-${value}`,
		iv: "mock-iv",
		authTag: "mock-auth-tag",
	})),
	decryptField: jest.fn((data: any) =>
		String(data.encryptedData).replace("encrypted-", "")
	),
}));

import {
	createHome,
	getHomeById,
	updateHome,
	deleteHome,
	getHomeByCode,
	getHomesByUserAndRelation,
	getHomesByUser,
	getHomeByName,
	addResidentToHome,
	countUsersByCode,
} from "./Home-Services";

import { Home } from "./Home";
import { encryptField, decryptField } from "../utils/encryption.js";

const homeId = new mongoose.Types.ObjectId();

const homeData = {
	homeName: "Test Home Service",
	homeCode: "abc123joinme!",
	address: "123 Your Moms House, San Luis Obispo, CA 93401",
	userIds: [
		{
			userId: new mongoose.Types.ObjectId(),
			relationship: "RESIDENT",
		},
	],
};

const encryptedHomeData: any = {
	...homeData,
	address: encryptField(homeData.address),
};

const home = new Home(encryptedHomeData);
home._id = homeId;

beforeEach(() => {
	mockingoose.resetAll();
	jest.clearAllMocks();
});

test("Creating a home", async () => {
	const home = new Home(encryptedHomeData);
	mockingoose(Home).toReturn(home, "save");

	const created = await createHome(homeData);

	expect(created).toBeDefined();
	expect(created.homeName).toBe(homeData.homeName);
	expect(created.homeCode).toBe(homeData.homeCode);
	expect(created.address).toBe(homeData.address);
	expect(created.userIds.length).toBe(homeData.userIds.length);
	expect(created.userIds[0].userId.toString()).toBe(
		homeData.userIds[0].userId.toString()
	);
	expect(created.userIds[0].relationship).toBe(
		homeData.userIds[0].relationship
	);
	expect(encryptField).toHaveBeenCalledWith(homeData.address);
});

test("Getting a home by ID", async () => {
	const home = new Home(encryptedHomeData);
	mockingoose(Home).toReturn(home, "findOne");

	const fetched = await getHomeById(home._id);

	expect(fetched).toBeDefined();
	expect(fetched?._id.toString()).toBe(home._id.toString());
});

test("Getting a home handles a plain object without toObject", async () => {
	const plainHome = {
		...encryptedHomeData,
		_id: homeId,
	};

	const findByIdSpy = jest
		.spyOn(Home, "findById")
		.mockReturnValueOnce(Promise.resolve(plainHome) as any);

	const fetched = await getHomeById(homeId);

	expect(findByIdSpy).toHaveBeenCalledWith(homeId);
	expect(fetched).toBeDefined();
	expect(fetched?._id.toString()).toBe(homeId.toString());
	expect(fetched?.address).toBe(homeData.address);
	expect(decryptField).toHaveBeenCalledWith(encryptedHomeData.address);

	findByIdSpy.mockRestore();
});

test("Getting a home by ID returns null when no home exists", async () => {
	const findByIdSpy = jest
		.spyOn(Home, "findById")
		.mockReturnValueOnce(Promise.resolve(null) as any);

	const fetched = await getHomeById(homeId);

	expect(findByIdSpy).toHaveBeenCalledWith(homeId);
	expect(fetched).toBeNull();
	expect(decryptField).not.toHaveBeenCalled();

	findByIdSpy.mockRestore();
});

test("Getting a home decrypts an encrypted address", async () => {
	const home = new Home(encryptedHomeData);
	mockingoose(Home).toReturn(home, "findOne");

	const fetched = await getHomeById(home._id);

	expect(fetched).toBeDefined();
	expect(fetched?.address).toBe(homeData.address);
	expect(decryptField).toHaveBeenCalledWith(encryptedHomeData.address);
});

test("Getting a home with no address returns an empty string", async () => {
	const homeWithoutAddress = new Home({
		...encryptedHomeData,
		address: undefined,
	});

	mockingoose(Home).toReturn(homeWithoutAddress, "findOne");

	const fetched = await getHomeById(homeWithoutAddress._id);

	expect(fetched).toBeDefined();
	expect(fetched?.address).toBe("");
	expect(decryptField).not.toHaveBeenCalled();
});

test("Getting a home with a non-encrypted address object returns it without decrypting", async () => {
	const nonEncryptedAddress = {
		encryptedData: "missing-iv-and-auth-tag",
	};

	const homeWithNonEncryptedAddress = {
		...encryptedHomeData,
		_id: homeId,
		address: nonEncryptedAddress,
	};

	mockingoose(Home).toReturn(homeWithNonEncryptedAddress, "findOne");

	const fetched = await getHomeById(homeId);

	expect(fetched).toBeDefined();
	expect(fetched?.address).toEqual(nonEncryptedAddress);
	expect(decryptField).not.toHaveBeenCalled();
});

test("Getting a home returns an empty string when decryptField returns undefined", async () => {
	(decryptField as jest.Mock).mockReturnValueOnce(undefined);

	const home = new Home(encryptedHomeData);
	mockingoose(Home).toReturn(home, "findOne");

	const fetched = await getHomeById(home._id);

	expect(fetched).toBeDefined();
	expect(fetched?.address).toBe("");
	expect(decryptField).toHaveBeenCalledWith(encryptedHomeData.address);
});

test("Getting a home by code", async () => {
	const home = new Home(encryptedHomeData);
	mockingoose(Home).toReturn(home, "findOne");

	const fetched = await getHomeByCode(home.homeCode);

	expect(fetched).toBeDefined();
	expect(fetched?._id.toString()).toBe(home._id.toString());
});

test("Getting a home by name", async () => {
	const home = new Home(encryptedHomeData);
	mockingoose(Home).toReturn(home, "findOne");

	const fetched = await getHomeByName(home.homeName);

	expect(fetched).toBeDefined();
	expect(fetched?._id.toString()).toBe(home._id.toString());
});

test("Updating a home", async () => {
	const home = new Home(encryptedHomeData);
	const updatedHomeData = {
		homeName: "Test Home Service (UPDATED)",
		homeCode: "abc123joinme!",
		address: "456 Another House, San Luis Obispo, CA 93401",
		userIds: [
			{
				userId: new mongoose.Types.ObjectId(),
				relationship: "RESIDENT",
			},
		],
	};
	const updatedDoc = new Home({
		...updatedHomeData,
		address: encryptField(updatedHomeData.address),
	});
	updatedDoc._id = home._id;

	mockingoose(Home).toReturn(updatedDoc, "findOneAndUpdate");
	const updated = await updateHome(home._id, updatedHomeData);

	expect(updated).toBeDefined();
	expect(updated?.homeName).toBe(updatedHomeData.homeName);
	expect(updated?.address).toBe(updatedHomeData.address);
});

test("Updating a home with an empty address throws an error", async () => {
	await expect(updateHome(homeId, { address: "" })).rejects.toThrow(
		"Address is required"
	);
});

test("Updating a home encrypts a plain text address", async () => {
	const home = new Home(encryptedHomeData);
	const updatedAddress = "789 New Address, San Luis Obispo, CA 93401";
	const encryptedAddress = encryptField(updatedAddress);
	const updatedDoc = new Home({
		...encryptedHomeData,
		address: encryptedAddress,
	});
	updatedDoc._id = home._id;

	mockingoose(Home).toReturn((query: any) => {
		const update = query.getUpdate() as any;

		expect(update.address).toEqual(encryptedAddress);
		expect(update.address).not.toBe(updatedAddress);

		return updatedDoc;
	}, "findOneAndUpdate");

	const updated = await updateHome(home._id, { address: updatedAddress });

	expect(updated).toBeDefined();
	expect(updated?.address).toBe(updatedAddress);
	expect(encryptField).toHaveBeenCalledWith(updatedAddress);
});

test("Updating a home does not re-encrypt an already encrypted address", async () => {
	const home = new Home(encryptedHomeData);
	const alreadyEncryptedAddress = encryptField(homeData.address);
	jest.clearAllMocks();

	mockingoose(Home).toReturn((query: any) => {
		const update = query.getUpdate() as any;

		expect(update.address).toEqual(alreadyEncryptedAddress);

		return new Home({
			...encryptedHomeData,
			address: alreadyEncryptedAddress,
		});
	}, "findOneAndUpdate");

	const updated = await updateHome(home._id, {
		address: alreadyEncryptedAddress,
	});

	expect(updated).toBeDefined();
	expect(updated?.address).toBe(homeData.address);
	expect(encryptField).not.toHaveBeenCalled();
});

test("Deleting a home", async () => {
	const home = new Home(encryptedHomeData);
	mockingoose(Home).toReturn(home, "findOneAndDelete");

	const deleted = await deleteHome(home._id);

	expect(deleted).toBeDefined();
	expect(deleted?._id.toString()).toBe(home._id.toString());
});

test("Getting homes by user and relationship", async () => {
	const home1 = new Home(encryptedHomeData);
	const home2 = new Home({
		...encryptedHomeData,
		homeName: "Another Home",
		userIds: [
			{
				userId: homeData.userIds[0].userId,
				relationship: "GUEST",
			},
		],
	});
	mockingoose(Home).toReturn([home1, home2], "find");

	const fetched = await getHomesByUserAndRelation(
		homeData.userIds[0].userId,
		"RESIDENT"
	);

	expect(fetched).toBeDefined();
	expect(fetched.length).toBe(2);
	expect(fetched[0].userIds[0].relationship).toBe("RESIDENT");
	expect(fetched[0].userIds[0].userId.toString()).toBe(
		homeData.userIds[0].userId.toString()
	);
	expect(fetched[1].userIds[0].relationship).toBe("GUEST");
	expect(fetched[1].userIds[0].userId.toString()).toBe(
		homeData.userIds[0].userId.toString()
	);
});

test("Getting homes by user", async () => {
	const home1 = new Home(encryptedHomeData);
	const home2 = new Home({
		...encryptedHomeData,
		homeName: "Another Home",
		userIds: [
			{
				userId: homeData.userIds[0].userId,
				relationship: "GUEST",
			},
		],
	});
	mockingoose(Home).toReturn([home1, home2], "find");

	const fetched = await getHomesByUser(homeData.userIds[0].userId);

	expect(fetched).toBeDefined();
	expect(fetched.length).toBe(2);
	expect(fetched[0].userIds[0].userId.toString()).toBe(
		homeData.userIds[0].userId.toString()
	);
	expect(fetched[1].userIds[0].userId.toString()).toBe(
		homeData.userIds[0].userId.toString()
	);
});

test("Adding a resident to a home", async () => {
	const newUserId = new mongoose.Types.ObjectId();
	const updatedDoc = new Home({
		...encryptedHomeData,
		userIds: [
			...homeData.userIds,
			{
				userId: newUserId,
				relationship: "RESIDENT",
			},
		],
	});
	updatedDoc._id = homeId;
	mockingoose(Home).toReturn(updatedDoc, "findOneAndUpdate");

	const updated = await addResidentToHome(homeId, newUserId);

	expect(updated).toBeDefined();
	expect(updated?.userIds).toHaveLength(2);
	expect(updated?.userIds[1].userId.toString()).toBe(newUserId.toString());
	expect(updated?.userIds[1].relationship).toBe("RESIDENT");
});

test("countUsersByCode returns the number of users in a home", async () => {
	const home = new Home(encryptedHomeData);
	mockingoose(Home).toReturn(home, "findOne");

	const count = await countUsersByCode(home.homeCode);

	expect(count).toBe(homeData.userIds.length);
});

test("countUsersByCode returns null when home does not exist", async () => {
	mockingoose(Home).toReturn(null, "findOne");

	const count = await countUsersByCode("missing-home-code");

	expect(count).toBeNull();
});
