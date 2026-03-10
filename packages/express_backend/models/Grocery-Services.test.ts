import mongoose from "mongoose";
import { Grocery } from "./Grocery";
import { config } from "dotenv";
config();

import {
	createGroceryItem,
	getGroceryItemById,
	getGroceryItemsByHome,
	updateGroceryItem,
	deleteGroceryItem,
	updateGroceryItemQuantity,
	calculateTotalCostForHome,
	calculateTotalCostForItem,
} from "./Grocery-Services";

let g: any; // FIXME type this later

const groceryItem = {
	title: "Milk",
	quantity: 2,
	price: 4.99,
	homeId: new mongoose.Types.ObjectId(),
	isShared: false,
	status: "PENDING",
};

beforeAll(async () => {
	// FOR WHEN WE SWITCH TO CLOUD MONGO DB
	// const uri = process.env.MONGODB_URI;
	// if (!uri) throw new Error("Set MONGODB_URI for tests");
	// await mongoose.connect(uri);

	// posts to / tests so that we arent messing anything up

	const uri = process.env.MONGO_URI_TEST;
	if (!uri) throw new Error("MONGO_URI_TEST not defined");
	await mongoose.connect(uri);
});

afterAll(async () => {
	await mongoose.connection.dropDatabase();
	await mongoose.connection.close();
});

beforeEach(async () => {
	g = await createGroceryItem(groceryItem);
	expect(g).toBeDefined();
	if (!g) return;
});

afterEach(async () => {
	await Grocery.deleteMany();
});
test("Creating a grocery item", async () => {
	expect(g._id).toBeDefined();
	expect(g.title).toBe(groceryItem.title);
	expect(g.quantity).toBe(groceryItem.quantity);
	expect(g.price).toBe(groceryItem.price);
	expect(g.homeId).toBe(groceryItem.homeId);
	expect(g.isShared).toBe(groceryItem.isShared);
	expect(g.status).toBe(groceryItem.status);
});
test("Creating  invalid grocery items", async () => {
	const invalid1 = {
		title: "eggs",
		quantity: -4,
		price: 6.49,
		isShared: false,
		status: "PENDING",
	};
	const invalid2 = {
		title: "eggs",
		quantity: 4,
		price: -4.99,
		isShared: false,
		status: "PENDING",
	};

	await expect(createGroceryItem(invalid1)).rejects.toThrow();
	await expect(createGroceryItem(invalid2)).rejects.toThrow();
});

test("Getting a grocery item by id", async () => {
	const fetched = await getGroceryItemById(g._id);
	if (!fetched) return;
	expect(fetched).toBeDefined();
	expect(fetched._id.toString()).toBe(g._id.toString());
});

test("Getting grocery items by home", async () => {
	const homeId = groceryItem.homeId;

	const newGroceryData = {
		title: "eggs",
		quantity: 12,
		price: 6.49,
		isShared: false,
		status: "PENDING",
	};

	const g2 = await createGroceryItem({
		...newGroceryData,
		homeId: homeId,
	});
	if (!g2) return;
	expect(g2).toBeDefined();

	const groceries = await getGroceryItemsByHome(homeId);
	if (!groceries) return;
	expect(groceries).toBeDefined();
	expect(groceries).toHaveLength(2);

	const ids = groceries.map((x) => x._id.toString()).sort();
	expect(ids).toEqual([g._id.toString(), g2._id.toString()].sort());
});

test("Updating a grocery item", async () => {
	const updatedData = {
		title: "Milk (Updated)",
		quantity: 2,
		isShared: true,
		price: 0.99,
		status: "CANCELLED",
	};
	const updated = await updateGroceryItem(g._id, updatedData);
	expect(updated).toBeDefined();
	if (!updated) return;
	expect(updated.title).toBe(updatedData.title);
	expect(updated?.quantity).toBe(updatedData.quantity);
	expect(updated?.isShared).toBe(updatedData.isShared);
	expect(updated?.status).toBe(updatedData.status);
	expect(updated?.price).toBe(updatedData.price);
});

test("Updating a grocery item, quantity only", async () => {
	const updatedQuantity = 2;
	const updated = await updateGroceryItemQuantity(g._id, updatedQuantity);
	expect(updated).toBeDefined();
	if (!updated) return;
	expect(updated?.quantity).toBe(updatedQuantity);
});

test("Deleting a grocery item", async () => {
	const deletedItem = await deleteGroceryItem(g._id);
	expect(deletedItem).toBeDefined();
	expect(deletedItem?._id.toString()).toBe(g._id.toString());
	const shouldBeNull = await getGroceryItemById(g._id);
	expect(shouldBeNull).toBeNull();
});

test("Test calculating total cost for home", async () => {
	const homeId = groceryItem.homeId;

	const newGroceryData = {
		title: "eggs",
		quantity: 12,
		price: 6.49,
		isShared: false,
		status: "PENDING",
	};

	const g2 = await createGroceryItem({
		...newGroceryData,
		homeId: homeId,
	});
	if (!g2) return;
	expect(g2).toBeDefined();
	const e1 = await calculateTotalCostForItem(g._id);
	const e2 = await calculateTotalCostForItem(g2._id);
	const actual = await calculateTotalCostForHome(homeId);
	expect(e1 + e2).toBeCloseTo(actual);
});

test("Test calculating total cost for home, FAILING", async () => {
	const actual = await calculateTotalCostForHome(
		new mongoose.Types.ObjectId()
	);
	expect(actual).toBe(0);
});
test("Test calculating total cost for home, FAILING with invalid items", async () => {
	const gdata2 = {
		title: "eggs",
		price: 4.99,
		isShared: false,
		status: "PENDING",
		homeId: g._id,
	};
	const gdata3 = {
		title: "eggs",
		quantity: 12,
		isShared: false,
		status: "PENDING",
		homeId: g._id,
	};
	await expect(createGroceryItem(gdata2)).rejects.toThrow();
	await expect(createGroceryItem(gdata3)).rejects.toThrow();
});

test("testing total cost for one item", async () => {
	const expected = await calculateTotalCostForItem(g._id);
	expect(expected).toBe(groceryItem.price * groceryItem.quantity);
});

test("throws 'Item not found' when id does not exist", async () => {
	const fakeId = new mongoose.Types.ObjectId();

	await expect(calculateTotalCostForItem(fakeId)).rejects.toThrow(
		"Item not found"
	);
});

test("throws for invalid ObjectId format", async () => {
	await expect(calculateTotalCostForItem("not-a-valid-id")).rejects.toThrow(); // CastError
});
