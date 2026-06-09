process.env.FIELD_ENCRYPTION_KEY =
	"0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef";

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
	addResidentToHome,
	countUsersByCode,
} from "./Home-Services";

import { Home } from "./Home";
import { config } from "dotenv";
import { encryptField } from "../utils/encryption";
import type { EncryptedField } from "../utils/encryption";
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
function isEncryptedField(value: any): value is EncryptedField {
	return (
		value &&
		typeof value === "object" &&
		typeof value.encryptedData === "string" &&
		typeof value.iv === "string" &&
		typeof value.authTag === "string"
	);
}
// let homeId: mongoose.Types.ObjectId;
// let homeCode: string;
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
	const rawHome = await Home.findById(homeId).lean();
	expect(rawHome).toBeDefined();
	expect(isEncryptedField(rawHome?.address)).toBe(true);
	expect(rawHome?.address).not.toBe(basicHomeData.address);
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

test("Fetching a home decrypts an encrypted address", async () => {
	const encryptedAddress = encryptField(basicHomeData.address);

	const rawHome = await Home.create({
		...basicHomeData,
		homeCode: "encrypted-address-test",
		address: encryptedAddress,
		userIds: [
			{
				userId: new mongoose.Types.ObjectId(),
				relationship: "RESIDENT",
			},
		],
	} as any);

	const fetched = await getHomeById(rawHome._id);

	expect(fetched).toBeDefined();
	expect(fetched?.address).toBe(basicHomeData.address);
});

test("Fetching (getting) a home by name", async () => {
	const fetched = await getHomeByName(h.homeName);
	if (!fetched) return;
	expect(fetched).toBeDefined();
	expect(fetched._id.toString()).toBe(h._id.toString());
});

test("Fetching (getting) a home by Code", async () => {
	// homeCode = h.homeCode;
	const home = await getHomeByCode(h.homeCode);
	expect(home).toBeDefined();
});

test("Updating a home", async () => {
	const updatedHomeData = {
		homeName: "Test Home Service (UPDATED)",
		address: "456 Another House, San Luis Obispo, CA 93401",
	};
	const updatedHome = await updateHome(h._id, updatedHomeData);
	expect(updatedHome).toBeDefined();
	expect(updatedHome?.homeName).toBe(updatedHomeData.homeName); // question mark is for optional chaining, in case updatedHome is null or undefined
	expect(updatedHome?.address).toBe(updatedHomeData.address);

	const rawHome = await Home.findById(h._id).lean();
	expect(rawHome).toBeDefined();
	expect(isEncryptedField(rawHome?.address)).toBe(true);
	expect(rawHome?.address).not.toBe(updatedHomeData.address);
});

test("Updating a home with an empty address throws an error", async () => {
	await expect(updateHome(h._id, { address: "" })).rejects.toThrow(
		"Address is required"
	);
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

test("Adding a resident to a home", async () => {
	const newUserId = new mongoose.Types.ObjectId();

	const updatedHome = await addResidentToHome(h._id, newUserId);

	expect(updatedHome).toBeDefined();
	expect(updatedHome?.userIds).toHaveLength(2);
	expect(
		updatedHome?.userIds.some(
			(userHome: any) =>
				userHome.userId.toString() === newUserId.toString() &&
				userHome.relationship === "RESIDENT"
		)
	).toBe(true);
});

test("countUsersByCode returns the number of users in a home", async () => {
	const count = await countUsersByCode(h.homeCode);

	expect(count).toBe(1);
});

test("countUsersByCode returns null when home does not exist", async () => {
	const count = await countUsersByCode("missing-home-code");

	expect(count).toBeNull();
});
