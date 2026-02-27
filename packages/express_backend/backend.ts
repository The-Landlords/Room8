import express from "express";
import cors from "cors";
import mongoose from "mongoose";
import type { Request, Response } from "express";
// import { start } from "./server";
import EventServices from "./models/Event-Services";
import HomeServices from "./models/Home-Services";
import e from "express";
export const app = express();
export const port = 8000;

import { choreRouter } from "./routes/chores-route";

//default port to listen
app.use(cors());
app.use(express.json());
app.use("/", choreRouter);

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

app.get("/:home/events", async (req: Request, res: Response) => {
	// /:id
	try {
		const homeId = req.params.home;
		const event = await EventServices.getEventsByHome(homeId);
		if (!event) {
			return res.status(404).json({ error: "Event not found" });
		}
		res.json(event);
	} catch (error) {
		res.status(400).json({ error: "Invalid ID" });
	}
});
app.get("/:home/events/:id", async (req: Request, res: Response) => {
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

app.post("/:home/events", async (req: Request, res: Response) => {
	try {
		const event = await EventServices.createEvent(req.body);
		res.status(201).json(event);
	} catch (error) {
		console.error(error);
		res.status(400).json({ error: "Failed to create event" });
	}
});

app.delete("/:home/events/:id", async (req: Request, res: Response) => {
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

// ==================== HomeS ROUTES===========

app.post("/homes", async (req, res) => {
	try {
		const home = await HomeServices.createHome(req.body);
		res.status(201).json(home);
	} catch (error) {
		console.error(error);
		res.status(400).json({ error: "Failed to create Home" });
	}
});

app.put("/homes/:id", async (req, res) => {
	try {
		const updated = await HomeServices.updateHome(req.params.id, req.body);

		if (!updated) {
			return res.status(404).json({ error: "Home not found" });
		}

		res.json(updated);
	} catch {
		res.status(400).json({ error: "Invalid ID" });
	}
});

app.get("/homes/:id", async (req: Request, res: Response) => {
	try {
		const event = await HomeServices.getHomeById(req.params.id);
		if (!event) {
			return res.status(404).json({ error: "Home not found" });
		}
		res.json(event);
	} catch (error) {
		res.status(400).json({ error: "Invalid ID" });
	}
});

app.delete("/homes/:id", async (req: Request, res: Response) => {
	try {
		const event = await HomeServices.deleteHome(req.params.id);
		if (!event) {
			return res.status(404).json({ error: "Home not found" });
		}
		res.json(event);
	} catch (error) {
		res.status(400).json({ error: "Invalid ID" });
	}
});
