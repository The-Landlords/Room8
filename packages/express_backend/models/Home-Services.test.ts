import mongoose from "mongoose";

import {
	createHome,
	getHomeById,
	updateHome,
	deleteHome,
	getHomeByCode,
	getHomesByUserAndRelation,
	getHomesByUser,
	getHomeByName,
} from "./Home-Services";

import { Home } from "./Home";
import { config } from "dotenv";
config();
const basicHomeData = {
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
let homeId: mongoose.Types.ObjectId;
let homeCode: string;
let h: any; // FIXME type this later
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
	h = await createHome(basicHomeData);
	expect(h).toBeDefined();
	if (!h) return;
});

afterEach(async () => {
	await Home.deleteMany();
});

test("Creating a home", async () => {
	const homeId = h._id;

	const home = await getHomeById(h._id);
	expect(home).toBeDefined();
	if (!home) return;

	expect(home.homeName).toBe(basicHomeData.homeName);
	expect(home.homeCode).toBe(basicHomeData.homeCode);
	expect(home.address).toBe(basicHomeData.address);
	expect(homeId).toBeDefined();
	expect(home.userIds).toBeDefined();
	expect(home.userIds).toHaveLength(1);
	expect(home.userIds[0].relationship).toBe(
		basicHomeData.userIds[0].relationship
	);
	expect(home.userIds[0].userId.toString()).toBe(
		basicHomeData.userIds[0].userId.toString()
	);
});

test("Fetching (getting) a home", async () => {
	const fetched = await getHomeById(h._id);
	if (!fetched) return;
	expect(fetched).toBeDefined();
	expect(fetched._id.toString()).toBe(h._id.toString());
});

test("Fetching (getting) a home by name", async () => {
	const fetched = await getHomeByName(h.homeName);
	if (!fetched) return;
	expect(fetched).toBeDefined();
	expect(fetched._id.toString()).toBe(h._id.toString());
});

test("Fetching (getting) a home by Code", async () => {
	homeCode = h.homeCode;
	const home = await getHomeByCode(homeCode);
	expect(home).toBeDefined();
});

test("Updating a home", async () => {
	const updatedHomeData = {
		homeName: "Test Home Service (UPDATED)",
	};
	const updatedHome = await updateHome(h._id, updatedHomeData);
	expect(updatedHome).toBeDefined();
	expect(updatedHome?.homeName).toBe(updatedHomeData.homeName); // question mark is for optional chaining, in case updatedHome is null or undefined
	expect(updatedHome?.address).toBe(basicHomeData.address);
});

test("Deleting a home", async () => {
	const deletedHome = await deleteHome(h._id);
	expect(deletedHome).toBeDefined();
	expect(deletedHome?._id.toString()).toBe(h._id.toString());
	const shouldBeNull = await getHomeById(h._id);
	expect(shouldBeNull).toBeNull();
});

test("Getting homes by user and relation", async () => {
	const fetched = await getHomesByUserAndRelation(
		h.userIds[0].userId,
		h.userIds[0].relationship
	);
	if (!fetched) return;
	expect(fetched).toBeDefined();
	expect(fetched.length).toBeGreaterThan(0);
	expect(fetched[0]._id.toString()).toBe(h._id.toString());
	expect(fetched[0].homeName).toBe(h.homeName);
});

test("Getting homes by user", async () => {
	const fetched = await getHomesByUser(h.userIds[0].userId);
	if (!fetched) return;
	expect(fetched).toBeDefined();
	expect(fetched.length).toBeGreaterThan(0);
	expect(fetched[0]._id.toString()).toBe(h._id.toString());
	expect(fetched[0].homeName).toBe(h.homeName);
});
