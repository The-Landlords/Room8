import mongoose from "mongoose";
import { Grocery } from "./Grocery";

/**
 * create a grocery item with POST
 * @param groceryData the body of the grocery item to be created
 * @returns the created grocery item as a jsonified body
 */
export const createGroceryItem = async (groceryData: any) => {
	return await Grocery.create(groceryData);
};

/**
 * get all grocery items for a given home
 * @param homeId the id of the home to be searched for grocery items
 * @returns an array of all grocery items for the given home
 */
export const getGroceryItemsByHome = async (
	homeId: mongoose.Types.ObjectId
) => {
	return await Grocery.find({ homeId: homeId });
};

/**
 * retrieve a grocery item by its id
 * @param id the id of the item to be retrieved
 * @returns the grocery item as a jsonified body
 */
export const getGroceryItemById = async (id: mongoose.Types.ObjectId) => {
	return await Grocery.findById(id);
};

/**
 * update a grocery item
 * @param id the id of the item to be updated
 * @param updated the body of the new grocery item
 * @returns the updated grocery item as a jsonified body
 */
export const updateGroceryItem = async (
	id: mongoose.Types.ObjectId,
	updated: any
) => {
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
export const deleteGroceryItem = async (id: mongoose.Types.ObjectId) => {
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

// THESE ARE NOT ROUTES, BUT HELPER FUNCTIONS
/**
 * calculate total cost of all grocery items for a home
 * @param homeId the home id to be searched
 * @returns total cost of all grocery items for the home
 */
export const calculateTotalCostForHome = async (
	homeId: mongoose.Types.ObjectId
) => {
	const items = await Grocery.find({ homeId: homeId });
	if (!items || items.length === 0) return 0;

	return items.reduce((total, item) => {
		return total + item.price * item.quantity;
	}, 0);
};

/**
 * calculate total cost of a grocery item (price * quantity)
 * @param id the item to be searched
 * @returns total cost of that item including quantity
 */
export const calculateTotalCostForItem = async (
	id: mongoose.Types.ObjectId
) => {
	const item = await Grocery.findById(id);
	if (!item) throw new Error("Item not found");
	return item.price * item.quantity;
};
