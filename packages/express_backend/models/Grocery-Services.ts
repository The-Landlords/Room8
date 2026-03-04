import mongoose from "mongoose";
import { Grocery } from "./Grocery";

// create a grocery item
export const createGroceryItem = async (groceryData: any) => {
	return await Grocery.create(groceryData);
};

// get all grocery items for a home
export const getGroceryItemsByHome = async (homeId: string) => {
	return await Grocery.find({ homeId: homeId });
};

// get a grocery item by id
export const getGroceryItemById = async (id: string) => {
	return await Grocery.findById(id);
};

/**
 * update a grocery item
 * @param id the id of the item to be updated
 * @param updated the body of the new grocery item
 * @returns the updated grocery item as a jsonified body
 */
export const updateGroceryItem = async (id: string, updated: any) => {
	return await Grocery.findByIdAndUpdate(id, updated, {
		returnDocument: "after",
		runValidators: true,
	});
};

/**
 * delete a given grocery item by id
 * @param id the id of the grocery item to be deleted
 * @returns successful deletion of the grocery item
 */
export const deleteGroceryItem = async (id: string) => {
	return await Grocery.findByIdAndDelete(id);
};

/**
 * update a grocery item by its quantity (only)
 * @param id the id of the item to be updated
 * @param newQuantity the new quantity for the item
 * @returns the updated grocery item as a jsonified body
 */
export const updateGroceryItemQuantity = async (
	id: string,
	newQuantity: number
) => {
	return await Grocery.findByIdAndUpdate(
		id,
		{ quantity: newQuantity },
		{
			returnDocument: "after",
			runValidators: true,
		}
	);
};

/**
 * calculate total cost of all grocery items for a home
 * @param homeId the home id to be searched
 * @returns total cost of all grocery items for the home
 */
export const calculateTotalCostForHome = async (homeId: string) => {
	const items = await Grocery.find({ homeId: homeId });
	return items.reduce((total, item) => total + item.price * item.quantity, 0);
};

/**
 * calculate total cost of a grocery item (price * quantity)
 * @param id the item to be searched
 * @returns total cost of that item including quantity
 */ export const calculateTotalCostForItem = async (id: string) => {
	const item = await Grocery.findById(id);
	if (!item) return 0;
	return item.price * item.quantity;
};
