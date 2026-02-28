import express from "express";
import cors from "cors";
import mongoose from "mongoose";
import type { Request, Response } from "express";

import { choreRouter } from "./routes/chore-routes";
import { homeRouter } from "./routes/home-routes";
import { eventRouter } from "./routes/event-routes";

export const app = express();
export const port = 8000;

//default port to listen
app.use(cors());
app.use(express.json());

//TODO FIX clarify this practice with prof & team
app.use("/", choreRouter);
app.use("/", homeRouter);
app.use("/", eventRouter);

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
