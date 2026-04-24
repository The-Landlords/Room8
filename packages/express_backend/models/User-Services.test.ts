import mongoose from "mongoose";

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

import { User } from "./User";
import { config } from "dotenv";
config();
let u: any;
const dummyUser = {
	username: "barrybbenson",
	password: "yumyumhoney",
	fullName: "Barry B. Benson",
	phone: "123456789",
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
	expect(u.password).toBe(dummyUser.password);
	expect(u.fullName).toBe(dummyUser.fullName);
	expect(u.phone).toBe(dummyUser.phone);
	expect(u.pronouns).toBe(dummyUser.pronouns);
	expect(u.homeIds).toHaveLength(1);
	expect(u.homeIds[0].relationship).toBe(dummyUser.homeIds[0].relationship);
	expect(u.homeIds[0].homeId.toString()).toBe(
		dummyUser.homeIds[0].homeId.toString()
	);
});
test("createUser rejects: phone starts with invalid character", async () => {
	await expect(
		createUser({
			username: "barrybbenson1",
			password: "yumyumhoney",
			fullName: "Barry B. Benson",
			phone: "-123456789",
			pronouns: "he/him",
			homeIds: [new mongoose.Types.ObjectId()],
		})
	).rejects.toThrow();
});

test("createUser rejects: phone too long", async () => {
	await expect(
		createUser({
			username: "barrybbenson2",
			password: "yumyumhoney",
			fullName: "Barry B. Benson",
			phone: "-12345678987654321",
			pronouns: "he/him",
			homeIds: [new mongoose.Types.ObjectId()],
		})
	).rejects.toThrow();
});

test("createUser rejects: phone contains dashes", async () => {
	await expect(
		createUser({
			username: "barrybbenson3",
			password: "yumyumhoney",
			fullName: "Barry B. Benson",
			phone: "+1875-999-4343",
			pronouns: "he/him",
			homeIds: [new mongoose.Types.ObjectId()],
		})
	).rejects.toThrow();
});

test("createUser rejects: emergencyContact phone starts with invalid character", async () => {
	await expect(
		createUser({
			username: "barrybbenson4",
			password: "yumyumhoney",
			fullName: "Barry B. Benson",
			phone: "1234567891",
			pronouns: "he/him",
			homeIds: [new mongoose.Types.ObjectId()],
			emergencyContact: {
				name: "Test Contact",
				phone: "-5559998888",
				relationship: "Parent",
			},
		})
	).rejects.toThrow();
});

test("createUser rejects: emergencyContact phone too long", async () => {
	await expect(
		createUser({
			username: "barrybbenson5",
			password: "yumyumhoney",
			fullName: "Barry B. Benson",
			phone: "1234567891",
			pronouns: "he/him",
			homeIds: [new mongoose.Types.ObjectId()],
			emergencyContact: {
				name: "Test Contact",
				phone: "555999888855599988885559998888",
				relationship: "Parent",
			},
		})
	).rejects.toThrow();
});

test("createUser rejects: emergencyContact phone contains parentheses", async () => {
	await expect(
		createUser({
			username: "barrybbenson6",
			password: "yumyumhoney",
			fullName: "Barry B. Benson",
			phone: "1234567891",
			pronouns: "he/him",
			homeIds: [new mongoose.Types.ObjectId()],
			emergencyContact: {
				name: "Test Contact",
				phone: "+1(874)8439942",
				relationship: "Parent",
			},
		})
	).rejects.toThrow();
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

// test("Getting all users from a given home", async () => {
// 	const homeId = dummyUser.homeIds[0];
// 	const dummyUser2 = {
// 		username: "aflay06",
// 		password: "honey4life",
// 		fullName: "Adam Flayman",
// 		phone: "9876543212",
// 		pronouns: "he/him",
// 	};

// 	const u2 = await createUser({
// 		...dummyUser2,
// 		homeIds: [homeId],
// 	});

// 	if (!u2) return;
// 	expect(u2).toBeDefined();
// 	const users = await getUsersByHomeId(homeId);
// 	expect(users).toBeDefined();
// 	if (!users) return;
// 	expect(users).toHaveLength(2);
// 	// sort by ids and ensure each user has an id
// 	const ids = users.map((x) => x._id.toString()).sort();
// 	expect(ids).toEqual([u._id.toString(), u2._id.toString()].sort());
// });

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
	expect(updatedUser.password).toBe(updatedData.password);
	expect(updatedUser.pronouns).toBe(dummyUser.pronouns);
	expect(updatedUser.phone).toBe(dummyUser.phone);
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
	expect(updatedUser.password).toBe(updatedData.password);
	expect(updatedUser.pronouns).toBe(dummyUser.pronouns);
	expect(updatedUser.phone).toBe(dummyUser.phone);
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
