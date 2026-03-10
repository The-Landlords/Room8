import express from "express";
import cors from "cors";
import mongoose from "mongoose";
import type { Request, Response } from "express";
import { config } from "dotenv";
import { choreRouter } from "./routes/chore-routes";
import { homeRouter } from "./routes/home-routes";
import { eventRouter } from "./routes/event-routes";
import { userRouter } from "./routes/user-routes";
import { loginRouter } from "./routes/login-routes";
import { ruleRouter } from "./routes/rule-routes";
import { groceryRouter } from "./routes/grocery-routes";

export const app = express();
export const port = 8000;

//default port to listen
app.use(cors());
app.use(express.json());

//TODO FIX clarify this practice with prof & team
app.use("/", choreRouter);
app.use("/", homeRouter);
app.use("/", eventRouter);
app.use("/", loginRouter);
app.use("/", ruleRouter);
app.use("/", userRouter);
app.use("/", groceryRouter);

config({ path: "../../.env" });

const url = process.env.MONGO_URI;
let connection: any = null;

//singleton of connection
const connectDB = async () => {
	if (!connection) {
		console.log(
			"MongoDB Connected to cloud" +
				(url ? ` at ${url}` : " at default localhost")
		);
		connection = await mongoose.connect(
			url || "mongodb://localhost:27017/room8"
		);
		return connection;
	}
};

const start = async () => {
	try {
		const uri = process.env.MONGO_URI;
		if (!uri) throw new Error("MONGO_URI not defined");
		await mongoose.connect(uri);
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

export default connectDB;
