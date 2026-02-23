import express from "express";
import cors from "cors";
import mongoose from "mongoose";
import type { Request, Response } from "express";
// import { start } from "./server";
import EventServices from "./models/Event-Services";
import ApartmentServices from "./models/Apartment-Services";
import e from "express";
export const app = express();
export const port = 8000;

//default port to listen
app.use(cors());
app.use(express.json());

const start = async () => {
	try {
		await mongoose.connect("mongodb://localhost:27017/room8");
		console.log("Mongo connected");

		app.listen(port, () => {
			console.log(`Server running on port ${port}`);
		});
	} catch (err) {
		console.error("Failed to connect to MongoDB", err);
	}
};

start().catch((e) => {
	console.error("Startup failed:", e);
	process.exit(1);
});

app.get("/", (req: Request, res: Response) => {
	res.send("Hello World aksdhasbd!");
});

app.get("/:apt/events", async (req: Request, res: Response) => {
	// /:id
	try {
		const apt_id = req.params.apt;
		const event = await EventServices.getEventsByApartment(apt_id);
		if (!event) {
			return res.status(404).json({ error: "Event not found" });
		}
		res.json(event);
	} catch (error) {
		res.status(400).json({ error: "Invalid ID" });
	}
});
app.get("/:apt/events/:id", async (req: Request, res: Response) => {
	try {
		const event = await EventServices.getEventById(req.params.id);
		if (!event) {
			return res.status(404).json({ error: "Event not found" });
		}
		res.json(event);
	} catch (error) {
		res.status(400).json({ error: "Invalid ID" });
	}
});

app.post("/:apt/events", async (req: Request, res: Response) => {
	try {
		const event = await EventServices.createEvent(req.body);
		res.status(201).json(event);
	} catch (error) {
		console.error(error);
		res.status(400).json({ error: "Failed to create event" });
	}
});

app.delete("/:apt/events/:id", async (req: Request, res: Response) => {
	try {
		const event = await EventServices.removeEventById(req.params.id);
		if (!event) {
			return res.status(404).json({ error: "Event not found" });
		}
		res.json(event);
	} catch (error) {
		res.status(400).json({ error: "Invalid ID" });
	}
});

// ==================== APARTMENTS ROUTES===========

app.post("/apartments", async (req, res) => {
	try {
		const apt = await ApartmentServices.createApartment(req.body);
		res.status(201).json(apt);
	} catch {
		res.status(400).json({ error: "Failed to create apartment" });
	}
});

app.put("/apartments/:id", async (req, res) => {
	try {
		const updated = await ApartmentServices.updateApartment(
			req.params.id,
			req.body
		);

		if (!updated) {
			return res.status(404).json({ error: "Apartment not found" });
		}

		res.json(updated);
	} catch {
		res.status(400).json({ error: "Invalid ID" });
	}
});

app.get("/apartments/:id", async (req: Request, res: Response) => {
	try {
		const event = await ApartmentServices.getApartmentById(req.params.id);
		if (!event) {
			return res.status(404).json({ error: "Apartment not found" });
		}
		res.json(event);
	} catch (error) {
		res.status(400).json({ error: "Invalid ID" });
	}
});

app.delete("/apartments/:id", async (req: Request, res: Response) => {
	try {
		const event = await ApartmentServices.deleteApartment(req.params.id);
		if (!event) {
			return res.status(404).json({ error: "Apartment not found" });
		}
		res.json(event);
	} catch (error) {
		res.status(400).json({ error: "Invalid ID" });
	}
});
