process.env.FIELD_ENCRYPTION_KEY =
	"0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef";

import mongoose from "mongoose";
import bcrypt from "bcrypt";

import {
	expect,
	test,
	beforeAll,
	afterAll,
	beforeEach,
	afterEach,
} from "@jest/globals";
import {
	createUser,
	getUserById,
	getUserByUsername,
	getUsersByHomeId,
	updateUserById,
	removeUserById,
	getUsersByHomeAndRelation,
	updateUserByUsername,
	getUserSettingsById,
} from "./User-Services";

import { User } from "./User";
import { config } from "dotenv";
config();
let u: any;
const dummyUser = {
	username: "barrybbenson",
	password: "yumyumhoney",
	fullName: "Barry B. Benson",
	pronouns: "he/him",
	homeIds: [
		{
			homeId: new mongoose.Types.ObjectId(),
			relationship: "RESIDENT",
		},
	],
};

beforeAll(async () => {
	// FOR WHEN WE SWITCH TO CLOUD MONGO DB
	// const uri = process.env.MONGODB_URI;
	// if (!uri) throw new Error("Set MONGODB_URI for tests");
	// await mongoose.connect(uri);
	const uri = process.env.MONGO_URI_TEST;
	if (!uri) throw new Error("MONGO_URI_TEST not defined");

	await mongoose.connect(uri);
});

afterAll(async () => {
	await mongoose.connection.dropDatabase();
	await mongoose.connection.close();
});

// a dummy user instance is created before all
beforeEach(async () => {
	u = await createUser(dummyUser);
	expect(u).toBeDefined();
	if (!u) return;
	// console.log(typeof u);
});

afterEach(async () => {
	await User.deleteMany();
});

test("createUser: success", async () => {
	expect(u._id).toBeDefined();
	expect(u.username).toBe(dummyUser.username);
	expect(u.password).not.toBe(dummyUser.password);

	const passwordMatches = await bcrypt.compare(
		dummyUser.password,
		u.password
	);
	expect(passwordMatches).toBe(true);
	expect(u.fullName).toBe(dummyUser.fullName);
	expect(u.pronouns).toBe(dummyUser.pronouns);
	expect(u.homeIds).toHaveLength(1);
	expect(u.homeIds[0].relationship).toBe(dummyUser.homeIds[0].relationship);
	expect(u.homeIds[0].homeId.toString()).toBe(
		dummyUser.homeIds[0].homeId.toString()
	);
});

test("updateUserByUsername rejects: phone starts with invalid character", async () => {
	await expect(
		updateUserByUsername(u.username, {
			phone: "-123456789",
		})
	).rejects.toThrow("Invalid phone number");
});

test("updateUserByUsername rejects: phone too long", async () => {
	await expect(
		updateUserByUsername(u.username, {
			phone: "12345678987654321",
		})
	).rejects.toThrow("Invalid phone number");
});

test("updateUserByUsername rejects: phone contains dashes", async () => {
	await expect(
		updateUserByUsername(u.username, {
			phone: "+1875-999-4343",
		})
	).rejects.toThrow("Invalid phone number");
});

test("updateUserByUsername rejects: emergencyContact phone starts with invalid character", async () => {
	await expect(
		updateUserByUsername(u.username, {
			emergencyContact: {
				name: "Test Contact",
				phone: "-5559998888",
				relationship: "Parent",
			},
		})
	).rejects.toThrow("Invalid emergency contact phone number");
});

test("updateUserByUsername rejects: emergencyContact phone too long", async () => {
	await expect(
		updateUserByUsername(u.username, {
			emergencyContact: {
				name: "Test Contact",
				phone: "555999888855599988885559998888",
				relationship: "Parent",
			},
		})
	).rejects.toThrow("Invalid emergency contact phone number");
});

test("updateUserByUsername rejects: emergencyContact phone contains parentheses", async () => {
	await expect(
		updateUserByUsername(u.username, {
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
		updateUserByUsername(u.username, {
			DOB: "not-a-real-date",
		})
	).rejects.toThrow("Invalid date of birth");
});

test("Getting a user by id", async () => {
	const fetched = await getUserById(u._id);
	if (!fetched) return;
	expect(fetched).toBeDefined();
	expect(fetched._id.toString()).toBe(u._id.toString());
});

test("getUserByUsername: success", async () => {
	const fetched = await getUserByUsername(u.username);
	if (!fetched) return;
	expect(fetched).toBeDefined();
	expect(fetched._id.toString()).toBe(u._id.toString());
	expect(fetched.username).toBe(u.username);
});

test("Getting user by homeId and relation", async () => {
	const fetched = await getUsersByHomeAndRelation(
		u.homeIds[0].homeId,
		u.homeIds[0].relationship
	);
	if (!fetched) return;
	expect(fetched).toBeDefined();
	expect(fetched.length).toBeGreaterThan(0);
	expect(fetched[0]._id.toString()).toBe(u._id.toString());
	expect(fetched[0].username).toBe(u.username);
});

test("Getting users by homeId", async () => {
	const fetched = await getUsersByHomeId(u.homeIds[0].homeId);
	if (!fetched) return;
	expect(fetched).toBeDefined();
	expect(fetched.length).toBeGreaterThan(0);
	expect(fetched[0]._id.toString()).toBe(u._id.toString());
	expect(fetched[0].username).toBe(u.username);
});

test("Updating a user", async () => {
	const updatedData = {
		username: "barrybbenson",
		password: "yumyumhoneyyestasty",
		homeIds: [
			{ homeId: new mongoose.Types.ObjectId(), relationship: "GUEST" },
		],
	};
	const updatedUser = await updateUserById(u._id, updatedData);
	if (!updatedUser) return;
	expect(updatedUser).toBeDefined();
	expect(updatedUser.password).not.toBe(updatedData.password);
	expect(updatedUser.pronouns).toBe(dummyUser.pronouns);
});

test("Updating a user by username", async () => {
	const updatedData = {
		username: "barrybbenson",
		password: "yumyumhoneyyestasty",
	};
	const updatedUser = await updateUserByUsername(u.username, updatedData);
	if (!updatedUser) return;
	expect(updatedUser).toBeDefined();
	expect(updatedUser._id).toBeDefined();
	expect(updatedUser.password).not.toBe(updatedData.password);
	expect(updatedUser.pronouns).toBe(dummyUser.pronouns);
});

test("Updating a user by username encrypts stored fields and returns decrypted fields", async () => {
	const updatedUser = await updateUserByUsername(u.username, {
		phone: "+15551234567",
		DOB: "2000-01-01",
		emergencyContact: {
			name: "Test Contact",
			phone: "+15559876543",
			relationship: "Parent",
		},
	});
	if (!updatedUser) return;

	expect(updatedUser.phone).toBe("+15551234567");
	expect(updatedUser.DOB).toBe(new Date("2000-01-01").toISOString());
	expect(updatedUser.emergencyContact.phone).toBe("+15559876543");

	const storedUser: any = await getUserByUsername(u.username);
	if (!storedUser) return;

	expect(storedUser.phone.encryptedData).toBeDefined();
	expect(storedUser.phone.encryptedData).not.toBe("+15551234567");
	expect(storedUser.phone.iv).toBeDefined();
	expect(storedUser.phone.authTag).toBeDefined();

	expect(storedUser.DOB.encryptedData).toBeDefined();
	expect(storedUser.DOB.encryptedData).not.toBe("2000-01-01");
	expect(storedUser.DOB.iv).toBeDefined();
	expect(storedUser.DOB.authTag).toBeDefined();

	expect(storedUser.emergencyContact.phone.encryptedData).toBeDefined();
	expect(storedUser.emergencyContact.phone.encryptedData).not.toBe(
		"+15559876543"
	);
	expect(storedUser.emergencyContact.phone.iv).toBeDefined();
	expect(storedUser.emergencyContact.phone.authTag).toBeDefined();
});

test("getUserSettingsById decrypts encrypted profile fields", async () => {
	await updateUserByUsername(u.username, {
		phone: "+15551234567",
		DOB: "2000-01-01",
		emergencyContact: {
			name: "Test Contact",
			phone: "+15559876543",
			relationship: "Parent",
		},
	});

	const settings = await getUserSettingsById(u._id);
	if (!settings) return;

	expect(settings.phone).toBe("+15551234567");
	expect(settings.DOB).toBe(new Date("2000-01-01").toISOString());
	expect(settings.emergencyContact.phone).toBe("+15559876543");
});

test("Deleting a user", async () => {
	const deletedUser = await removeUserById(u._id);
	expect(deletedUser).toBeDefined();
	expect(deletedUser?._id.toString()).toBe(u._id.toString());
	const shouldBeNull = await getUserById(u._id);
	expect(shouldBeNull).toBeNull();
});

test("Creating a user with an existing username should fail", async () => {
	try {
		await createUser(dummyUser);
	} catch (err: any) {
		expect(err.code).toBe(11000);
		expect(err.keyValue).toHaveProperty("username");
	}
});

test("createUser: same plain password creates different hashes", async () => {
	const user2 = await createUser({
		...dummyUser,
		username: "barrybbenson2",
	});

	expect(user2.password).not.toBe(dummyUser.password);
	expect(user2.password).not.toBe(u.password);

	const firstPasswordMatches = await bcrypt.compare(
		dummyUser.password,
		u.password
	);

	const secondPasswordMatches = await bcrypt.compare(
		dummyUser.password,
		user2.password
	);

	expect(firstPasswordMatches).toBe(true);
	expect(secondPasswordMatches).toBe(true);
});
