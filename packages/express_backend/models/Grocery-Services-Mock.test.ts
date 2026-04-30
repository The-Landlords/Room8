import mockingoose from "mockingoose";
import mongoose from "mongoose";
import { expect, test } from "@jest/globals";
import { Grocery } from "./Grocery";
import {
	createGroceryItem,
	getGroceryItemById,
	getGroceryItemsByHome,
	updateGroceryItem,
	deleteGroceryItem,
	// updateGroceryItemQuantity,
	calculateTotalCostForHome,
	calculateTotalCostForItem,
} from "./Grocery-Services";

const homeId = new mongoose.Types.ObjectId();

const groceryItem = {
	title: "Milk",
	quantity: 2,
	price: 4.99,
	homeId: homeId,
	isShared: false,
	status: "PENDING",
};

test("Creating a grocery item", async () => {
	const grocery = new Grocery(groceryItem);
	mockingoose(Grocery).toReturn(grocery, "save");

	const created = await createGroceryItem(groceryItem);

	expect(created).toBeDefined();
	expect(created.title).toBe(groceryItem.title);
	expect(created.quantity).toBe(groceryItem.quantity);
	expect(created.price).toBe(groceryItem.price);
	expect(created.homeId.toString()).toBe(groceryItem.homeId.toString());
});

test("Getting a grocery item by ID", async () => {
	const grocery = new Grocery(groceryItem);
	mockingoose(Grocery).toReturn(grocery, "findOne");

	const fetched = await getGroceryItemById(grocery._id);

	expect(fetched).toBeDefined();
	expect(fetched?._id.toString()).toBe(grocery._id.toString());
});

test("Getting grocery items by home ID", async () => {
	const grocery1 = new Grocery(groceryItem);
	const grocery2 = new Grocery({ ...groceryItem, title: "Bread" });
	mockingoose(Grocery).toReturn([grocery1, grocery2], "find");

	const groceries = await getGroceryItemsByHome(groceryItem.homeId);

	expect(groceries).toBeDefined();
	expect(groceries.length).toBe(2);
	const titles = groceries.map((x) => x.title).sort();
	expect(titles).toEqual([grocery1.title, grocery2.title].sort());
});

test("Updating a grocery item", async () => {
	const grocery = new Grocery(groceryItem);

	const updatedData = { ...groceryItem, quantity: 5 };
	const updatedDoc = new Grocery(updatedData);
	updatedDoc._id = grocery._id;
	mockingoose(Grocery).toReturn(updatedDoc, "findOneAndUpdate");
	const updated = await updateGroceryItem(grocery._id, updatedData);

	expect(updated).toBeDefined();
	expect(updated?.quantity).toBe(5);
});

test("Deleting a grocery item", async () => {
	const grocery = new Grocery(groceryItem);
	mockingoose(Grocery).toReturn(grocery, "findOneAndDelete");

	const deleted = await deleteGroceryItem(grocery._id);

	expect(deleted).toBeDefined();
	expect(deleted?._id.toString()).toBe(grocery._id.toString());
});

test("Calculating total cost for home", async () => {
	const grocery1 = new Grocery(groceryItem);
	const grocery2 = new Grocery({
		...groceryItem,
		title: "Bread",
		price: 2.99,
	});
	mockingoose(Grocery).toReturn([grocery1, grocery2], "find");

	const totalCost = await calculateTotalCostForHome(groceryItem.homeId);

	expect(totalCost).toBeDefined();
	expect(totalCost).toBeCloseTo(4.99 * 2 + 2.99 * 2);
});

test("Calculating total cost for item", async () => {
	const grocery = new Grocery(groceryItem);
	mockingoose(Grocery).toReturn(grocery, "findOne");

	const totalCost = await calculateTotalCostForItem(grocery._id);

	expect(totalCost).toBeDefined();
	expect(totalCost).toBeCloseTo(4.99 * 2);
});
