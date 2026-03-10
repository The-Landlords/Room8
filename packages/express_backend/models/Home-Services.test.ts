import mongoose from "mongoose";

import {
	createHome,
	getHomeById,
	updateHome,
	deleteHome,
	getHomeByCode,
} from "./Home-Services";

const basicHomeData = {
	homeName: "Test Home Service",
	homeCode: "abc123joinme!",
	address: "123 Your Moms House, San Luis Obispo, CA 93401",
	memberIds: [],
};
let homeId: mongoose.Types.ObjectId | string;
let homeCode: string;
beforeAll(async () => {
	// FOR WHEN WE SWITCH TO CLOUD MONGO DB
	// const uri = process.env.MONGODB_URI;
	// if (!uri) throw new Error("Set MONGODB_URI for tests");
	// await mongoose.connect(uri);
	await mongoose.connect("mongodb://localhost:27017/room8");
});

afterAll(async () => {
	await mongoose.connection.close();
});

beforeEach(async () => {
	const home = await createHome(basicHomeData);
	homeId = home._id;
	homeCode = home.homeCode;
});

test("Creating a home", async () => {
	const home = await getHomeById(homeId);
	expect(home).toBeDefined();
	if (!home) return;

	expect(home.homeName).toBe(basicHomeData.homeName);
	expect(home.homeCode).toBe(basicHomeData.homeCode);
	expect(home.address).toBe(basicHomeData.address);
	homeId = home._id;
	expect(homeId).toBeDefined();
});

test("Fetching (getting) a home", async () => {
	const home = await getHomeById(homeId);
	expect(home).toBeDefined();
});

test("Fetching (getting) a home by Code", async () => {
	const home = await getHomeByCode(homeCode);
	expect(home).toBeDefined();
});

test("Updating a home", async () => {
	const updatedHomeData = {
		homeName: "Test Home Service (UPDATED)",
		homeCode: "abc123joinme!",
		address: "456 Another House, San Luis Obispo, CA 93401",
		memberIds: [],
	};
	const updatedHome = await updateHome(homeId, updatedHomeData);
	expect(updatedHome).toBeDefined();
	expect(updatedHome?.homeName).toBe(updatedHomeData.homeName); // question mark is for optional chaining, in case updatedHome is null or undefined
	expect(updatedHome?.address).toBe(updatedHomeData.address);
});

test("Deleting a home", async () => {
	const deletedHome = await deleteHome(homeId);
	expect(deletedHome).toBeDefined();
	expect(deletedHome?._id.toString()).toBe(homeId.toString());
	const shouldBeNull = await getHomeById(homeId);
	expect(shouldBeNull).toBeNull();
});
