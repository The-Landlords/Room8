import mockingoose from "mockingoose";
import mongoose from "mongoose";
import { expect, test, beforeEach } from "@jest/globals";
import { User } from "./User";
import {
	createUser,
	getUserById,
	getUserByUsername,
	getUsersByHomeId,
	updateUserById,
	removeUserById,
	getUsersByHomeAndRelation,
	updateUserByUsername,
} from "./User-Services";

const homeId = new mongoose.Types.ObjectId();

const dummyUser = {
	username: "barrybbenson",
	password: "yumyumhoney",
	fullName: "Barry B. Benson",
	phone: "123456789",
	pronouns: "he/him",
	homeIds: [
		{
			homeId: homeId,
			relationship: "RESIDENT",
		},
	],
};

beforeEach(() => {
	mockingoose.resetAll();
});

test("Creating a user", async () => {
	const user = new User(dummyUser);
	mockingoose(User).toReturn(user, "save");

	const created = await createUser(dummyUser);

	expect(created).toBeDefined();
	expect(created.username).toBe(dummyUser.username);
	expect(created.password).toBe(dummyUser.password);
	expect(created.fullName).toBe(dummyUser.fullName);
	expect(created.phone).toBe(dummyUser.phone);
	expect(created.pronouns).toBe(dummyUser.pronouns);
	expect(created.homeIds.length).toBe(dummyUser.homeIds.length);
	expect(created.homeIds[0].homeId.toString()).toBe(
		dummyUser.homeIds[0].homeId.toString()
	);
	expect(created.homeIds[0].relationship).toBe(
		dummyUser.homeIds[0].relationship
	);
});

test("Getting a user by ID", async () => {
	const user = new User(dummyUser);
	mockingoose(User).toReturn(user, "findOne");

	const fetched = await getUserById(user._id);

	expect(fetched).toBeDefined();
	expect(fetched?._id.toString()).toBe(user._id.toString());
});

test("Getting a user by username", async () => {
	const user = new User(dummyUser);
	mockingoose(User).toReturn(user, "findOne");

	const fetched = await getUserByUsername(user.username);

	expect(fetched).toBeDefined();
	expect(fetched?._id.toString()).toBe(user._id.toString());
	expect(fetched?.username).toBe(user.username);
});

test("getUsersByHomeAndRelation: success", async () => {
	const user = new User(dummyUser);
	mockingoose(User).toReturn([user], "find");
	expect(user.homeIds[0].relationship).toBe("RESIDENT");
	if (!user.homeIds[0].relationship)
		throw new Error("User home relationship is undefined");

	const fetched = await getUsersByHomeAndRelation(
		user.homeIds[0].homeId,
		user.homeIds[0].relationship
	);

	expect(fetched).toBeDefined();
	expect(fetched.length).toBeGreaterThan(0);
	expect(fetched[0]._id.toString()).toBe(user._id.toString());
	expect(fetched[0].username).toBe(user.username);
});

test("Getting users by home ID", async () => {
	const user = new User(dummyUser);
	mockingoose(User).toReturn([user], "find");

	const fetched = await getUsersByHomeId(user.homeIds[0].homeId);

	expect(fetched).toBeDefined();
	expect(fetched.length).toBeGreaterThan(0);
	expect(fetched[0]._id.toString()).toBe(user._id.toString());
	expect(fetched[0].username).toBe(user.username);
});

test("Updating a user by ID", async () => {
	const user = new User(dummyUser);
	const updatedDoc = new User({
		...dummyUser,
		fullName: "Barry B. Benson Jr.",
	});
	updatedDoc._id = user._id;
	mockingoose(User).toReturn(updatedDoc, "findOneAndUpdate");

	const updated = await updateUserById(user._id, {
		...dummyUser,
		fullName: "Barry B. Benson Jr.",
	});

	expect(updated).toBeDefined();
	expect(updated?.fullName).toBe("Barry B. Benson Jr.");
});

test("Removing a user by ID", async () => {
	const user = new User(dummyUser);
	mockingoose(User).toReturn(user, "findOneAndDelete");

	const deleted = await removeUserById(user._id);

	expect(deleted).toBeDefined();
	expect(deleted?._id.toString()).toBe(user._id.toString());
});

test("Updating a user by username", async () => {
	const user = new User(dummyUser);
	const updatedDoc = new User({
		...dummyUser,
		fullName: "Barry B. Benson Sr.",
	});
	updatedDoc._id = user._id;
	mockingoose(User).toReturn(updatedDoc, "findOneAndUpdate");

	const updated = await updateUserByUsername(user.username, {
		...dummyUser,
		fullName: "Barry B. Benson Sr.",
	});

	expect(updated).toBeDefined();
	expect(updated?.fullName).toBe("Barry B. Benson Sr.");
});

test("Removing a user by username", async () => {
	const user = new User(dummyUser);
	mockingoose(User).toReturn(user, "findOneAndDelete");

	const deleted = await removeUserById(user._id);

	expect(deleted).toBeDefined();
	expect(deleted?._id.toString()).toBe(user._id.toString());
});

test("Creating a user with same username should fail", async () => {
	const user = new User(dummyUser);
	mockingoose(User).toReturn(user, "save");
	try {
		await createUser(dummyUser);
	} catch (error) {
		expect(error).toBeDefined();
	}
});
