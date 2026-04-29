import express from "express";
import {
	createGroceryItem,
	getGroceryItemsByHome,
	getGroceryItemById,
	updateGroceryItem,
	deleteGroceryItem,
	updateGroceryItemQuantity,
} from "../models/Grocery-Services";
import type { Request, Response } from "express";

export const groceryRouter = express.Router();

groceryRouter.get("/:home/grocery", async (req: Request, res: Response) => {
	try {
		const homeId = req.params.home;
		const groceries = await getGroceryItemsByHome(homeId);
		if (!groceries) {
			return res.status(404).json({ error: "Grocery items not found" });
		}
		res.status(200).json(groceries);
	} catch (error) {
		console.error(error);
		res.status(400).json({ error: "Invalid ID" });
	}
});

groceryRouter.get("/:home/grocery/:id", async (req: Request, res: Response) => {
	try {
		const groceries = await getGroceryItemById(req.params.id);
		if (!groceries) {
			return res.status(404).json({ error: "Grocery item not found" });
		}
		res.status(200).json(groceries);
	} catch (error) {
		console.error(error);
		res.status(400).json({ error: "Invalid ID" });
	}
});
groceryRouter.post("/:home/grocery", async (req: Request, res: Response) => {
	try {
		const grocery = await createGroceryItem(req.body);
		res.status(201).json(grocery);
	} catch (error) {
		console.error(error);
		res.status(400).json({ error: "Failed to create grocery item" });
	}
});

groceryRouter.delete(
	"/:home/grocery/:id",
	async (req: Request, res: Response) => {
		try {
			const grocery = await deleteGroceryItem(req.params.id);
			if (!grocery) {
				return res
					.status(404)
					.json({ error: "Grocery item not found" });
			}
			res.status(204).json(grocery);
		} catch (error) {
			console.error(error);
			res.status(400).json({ error: "Invalid ID" });
		}
	}
);

groceryRouter.patch(
	"/:home/grocery/:id",
	async (req: Request, res: Response) => {
		try {
			const updated = await updateGroceryItem(req.params.id, req.body);

			if (!updated) {
				return res
					.status(404)
					.json({ error: "Grocery item not found" });
			}

			res.status(200).json(updated);
		} catch (error) {
			console.error(error);

			res.status(400).json({ error: "Invalid ID" });
		}
	}
);

groceryRouter.patch(
	"/:home/grocery/:id/:newQuantity",
	async (req: Request, res: Response) => {
		try {
			const updated = await updateGroceryItemQuantity(
				req.params.id,
				req.params.newQuantity
			);

			if (!updated) {
				return res
					.status(404)
					.json({ error: "Grocery item not found" });
			}

			res.status(200).json(updated);
		} catch (error) {
			console.error(error);

			res.status(400).json({ error: "Invalid ID" });
		}
	}
);
