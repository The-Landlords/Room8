process.env.FIELD_ENCRYPTION_KEY =
	"0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef";

import mockingoose from "mockingoose";
import bcrypt from "bcrypt";
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
	getUserHomeRelation,
	getUserSettingsById,
} from "./User-Services";

const homeId = new mongoose.Types.ObjectId();

const dummyUser = {
	username: "barrybbenson",
	password: "yumyumhoney",
	fullName: "Barry B. Benson",
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
	expect(created.password).not.toBe(dummyUser.password);

	const passwordMatches = await bcrypt.compare(
		dummyUser.password,
		created.password
	);

	expect(passwordMatches).toBe(true);
	expect(created.fullName).toBe(dummyUser.fullName);
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

test("Updating a user by ID without password does not hash password", async () => {
	const user = new User(dummyUser);
	const updatedDoc = new User({
		...dummyUser,
		fullName: "Barry B. Benson Jr.",
	});
	updatedDoc._id = user._id;
	mockingoose(User).toReturn(updatedDoc, "findOneAndUpdate");

	const updated = await updateUserById(user._id, {
		fullName: "Barry B. Benson Jr.",
	});

	expect(updated).toBeDefined();
	expect(updated?.fullName).toBe("Barry B. Benson Jr.");
});

test("Updating a user by ID hashes password when password is updated", async () => {
	const user = new User(dummyUser);
	const updatedPassword = "newhoneypassword";
	const hashUpdatedPassword = await bcrypt.hash(updatedPassword, 12);
	const updatedDoc = new User({
		...dummyUser,
		password: hashUpdatedPassword,
		fullName: "Barry B. Benson Jr.",
	});
	updatedDoc._id = user._id;
	mockingoose(User).toReturn(updatedDoc, "findOneAndUpdate");

	const updated = await updateUserById(user._id, {
		...dummyUser,
		password: updatedPassword,
		fullName: "Barry B. Benson Jr.",
	});

	expect(updated).toBeDefined();
	expect(updated?.fullName).toBe("Barry B. Benson Jr.");
	expect(updated?.password).not.toBe(updatedPassword);

	const passwordMatches = await bcrypt.compare(
		updatedPassword,
		updated?.password ?? ""
	);

	expect(passwordMatches).toBe(true);
});

test("Removing a user by ID", async () => {
	const user = new User(dummyUser);
	mockingoose(User).toReturn(user, "findOneAndDelete");

	const deleted = await removeUserById(user._id);

	expect(deleted).toBeDefined();
	expect(deleted?._id.toString()).toBe(user._id.toString());
});

test("Updating a user by username without password does not hash password", async () => {
	const user = new User(dummyUser);
	const updatedDoc = new User({
		...dummyUser,
		fullName: "Barry B. Benson Sr.",
	});
	updatedDoc._id = user._id;
	mockingoose(User).toReturn(updatedDoc, "findOneAndUpdate");

	const updated = await updateUserByUsername(user.username, {
		fullName: "Barry B. Benson Sr.",
	});

	expect(updated).toBeDefined();
	expect(updated?.fullName).toBe("Barry B. Benson Sr.");
});

test("Updating a user by username hashes password when password is updated", async () => {
	const user = new User(dummyUser);
	const updatedPassword = "newhoneypassword";
	const hashedUpdatedPassword = await bcrypt.hash(updatedPassword, 12);
	const updatedDoc = new User({
		...dummyUser,
		password: hashedUpdatedPassword,
		fullName: "Barry B. Benson Sr.",
	});
	updatedDoc._id = user._id;
	mockingoose(User).toReturn(updatedDoc, "findOneAndUpdate");

	const updated = await updateUserByUsername(user.username, {
		...dummyUser,
		password: updatedPassword,
		fullName: "Barry B. Benson Sr.",
	});

	expect(updated).toBeDefined();
	expect(updated?.fullName).toBe("Barry B. Benson Sr.");
	expect(updated?.password).not.toBe(updatedPassword);

	const passwordMatches = await bcrypt.compare(
		updatedPassword,
		updated?.password ?? ""
	);
	expect(passwordMatches).toBe(true);
});

test("Updating a user by username returns decrypted phone, DOB, and emergency contact phone", async () => {
	const { encryptField } = await import("../utils/encryption");
	const user = new User(dummyUser);
	const updatedDoc = new User({
		...dummyUser,
		phone: encryptField("+15551234567"),
		DOB: encryptField(new Date("2000-01-01").toISOString()),
		emergencyContact: {
			name: "Test Contact",
			phone: encryptField("+15559876543"),
			relationship: "Parent",
		},
	});
	updatedDoc._id = user._id;
	mockingoose(User).toReturn(updatedDoc, "findOneAndUpdate");

	const updated = await updateUserByUsername(user.username, {
		phone: "+15551234567",
		DOB: "2000-01-01",
		emergencyContact: {
			name: "Test Contact",
			phone: "+15559876543",
			relationship: "Parent",
		},
	});

	expect(updated).toBeDefined();
	expect(updated?.phone).toBe("+15551234567");
	expect(updated?.DOB).toBe(new Date("2000-01-01").toISOString());
	expect(updated?.emergencyContact.phone).toBe("+15559876543");
});

test("updateUserByUsername rejects: invalid phone number", async () => {
	await expect(
		updateUserByUsername(dummyUser.username, {
			phone: "+1875-999-4343",
		})
	).rejects.toThrow("Invalid phone number");
});

test("updateUserByUsername rejects: invalid emergency contact phone number", async () => {
	await expect(
		updateUserByUsername(dummyUser.username, {
			emergencyContact: {
				name: "Test Contact",
				phone: "+1(874)8439942",
				relationship: "Parent",
			},
		})
	).rejects.toThrow("Invalid emergency contact phone number");
});

test("updateUserByUsername rejects: invalid DOB", async () => {
	await expect(
		updateUserByUsername(dummyUser.username, {
			DOB: "not-a-real-date",
		})
	).rejects.toThrow("Invalid date of birth");
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

test("Getting user relation to home", async () => {
	const user = new User(dummyUser);
	mockingoose(User).toReturn(user, "findOne");
	const relation = await getUserHomeRelation(
		user._id,
		user.homeIds[0].homeId
	);

	expect(relation).toBeDefined();
	expect(relation?.homeIds[0].relationship).toBe("RESIDENT");
});

test("getUserSettingsById decrypts encrypted profile fields", async () => {
	const { encryptField } = await import("../utils/encryption");
	const encryptedPhone = encryptField("+15551234567");
	const encryptedDOB = encryptField(new Date("2000-01-01").toISOString());
	const encryptedEmergencyPhone = encryptField("+15559876543");
	const user = new User({
		...dummyUser,
		phone: encryptedPhone,
		DOB: encryptedDOB,
		emergencyContact: {
			name: "Test Contact",
			phone: encryptedEmergencyPhone,
			relationship: "Parent",
		},
	});
	mockingoose(User).toReturn(user, "findOne");

	const settings = await getUserSettingsById(user._id);

	expect(settings).toBeDefined();
	expect(settings?.phone).toBe("+15551234567");
	expect(settings?.DOB).toBe(new Date("2000-01-01").toISOString());
	expect(settings?.emergencyContact.phone).toBe("+15559876543");
});
