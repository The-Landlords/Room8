import mongoose from "mongoose";

import {
	createUser,
	getUserById,
	getUserByUsername,
	getUsersByHomeId,
	updateUserById,
	removeUserById,
	getUsersByHomeAndRelation,
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

beforeEach(async () => {
	u = await createUser(dummyUser);
	expect(u).toBeDefined();
	if (!u) return;
	// console.log(typeof u);
});

afterEach(async () => {
	await User.deleteMany();
});

test("Creating an user", async () => {
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

test("Getting a user by id", async () => {
	const fetched = await getUserById(u._id);
	if (!fetched) return;
	expect(fetched).toBeDefined();
	expect(fetched._id.toString()).toBe(u._id.toString());
});

test("Getting a user by username", async () => {
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
		fullName: "Barry B. Benson",
		phone: "12345678900",
		pronouns: "she/her",
		homeIds: [
			{ homeId: new mongoose.Types.ObjectId(), relationship: "GUEST" },
		],
	};
	const updatedUser = await updateUserById(u._id, updatedData);
	if (!updatedUser) return;
	expect(updatedUser).toBeDefined();
	expect(updatedUser.password).toBe(updatedData.password);
	expect(updatedUser.pronouns).toBe(updatedData.pronouns);
	expect(updatedUser.phone).toBe(updatedData.phone);
});

test("Deleting a home", async () => {
	const deletedHome = await removeUserById(u._id);
	expect(deletedHome).toBeDefined();
	expect(deletedHome?._id.toString()).toBe(u._id.toString());
	const shouldBeNull = await getUserById(u._id);
	expect(shouldBeNull).toBeNull();
});
