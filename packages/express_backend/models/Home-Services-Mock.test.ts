import mockingoose from "mockingoose";
import mongoose from "mongoose";
import { expect, test, beforeEach } from "@jest/globals";
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

const home = new Home(homeData);
home._id = homeId;

beforeEach(() => {
	mockingoose.resetAll();
});

test("Creating a home", async () => {
	const home = new Home(homeData);
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
});

test("Getting a home by ID", async () => {
	const home = new Home(homeData);
	mockingoose(Home).toReturn(home, "findOne");

	const fetched = await getHomeById(home._id);

	expect(fetched).toBeDefined();
	expect(fetched?._id.toString()).toBe(home._id.toString());
});

test("Getting a home by code", async () => {
	const home = new Home(homeData);
	mockingoose(Home).toReturn(home, "findOne");

	const fetched = await getHomeByCode(home.homeCode);

	expect(fetched).toBeDefined();
	expect(fetched?._id.toString()).toBe(home._id.toString());
});

test("Getting a home by name", async () => {
	const home = new Home(homeData);
	mockingoose(Home).toReturn(home, "findOne");

	const fetched = await getHomeByName(home.homeName);

	expect(fetched).toBeDefined();
	expect(fetched?._id.toString()).toBe(home._id.toString());
});

test("Updating a home", async () => {
	const home = new Home(homeData);
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
	const updatedDoc = new Home(updatedHomeData);
	updatedDoc._id = home._id;

	mockingoose(Home).toReturn(updatedDoc, "findOneAndUpdate");
	const updated = await updateHome(home._id, updatedHomeData);

	expect(updated).toBeDefined();
	expect(updated?.homeName).toBe(updatedHomeData.homeName);
	expect(updated?.address).toBe(updatedHomeData.address);
});

test("Deleting a home", async () => {
	const home = new Home(homeData);
	mockingoose(Home).toReturn(home, "findOneAndDelete");

	const deleted = await deleteHome(home._id);

	expect(deleted).toBeDefined();
	expect(deleted?._id.toString()).toBe(home._id.toString());
});

test("Getting homes by user and relationship", async () => {
	const home1 = new Home(homeData);
	const home2 = new Home({
		...homeData,
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
	const home1 = new Home(homeData);
	const home2 = new Home({
		...homeData,
		homeName: "Another Home",
		userIds: [
			{
				userId: homeData.userIds[0].userId,
				relationship: "OWNER",
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
		...homeData,
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
	const home = new Home(homeData);
	mockingoose(Home).toReturn(home, "findOne");

	const count = await countUsersByCode(home.homeCode);

	expect(count).toBe(homeData.userIds.length);
});

test("countUsersByCode returns null when home does not exist", async () => {
	mockingoose(Home).toReturn(null, "findOne");

	const count = await countUsersByCode("missing-home-code");

	expect(count).toBeNull();
});

test("Getting a home by name", async () => {
	const home = new Home(homeData);
	mockingoose(Home).toReturn(home, "findOne");

	const fetched = await getHomeByName(home.homeName);
	expect(fetched).toBeDefined();
	expect(fetched?._id.toString()).toBe(home._id.toString());
});

test("Getting a home by code", async () => {
	const home = new Home(homeData);
	mockingoose(Home).toReturn(home, "findOne");

	const fetched = await getHomeByCode(home.homeCode);
	expect(fetched).toBeDefined();
	expect(fetched?._id.toString()).toBe(home._id.toString());
});
