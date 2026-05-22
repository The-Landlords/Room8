import express from "express";
import cors from "cors";
import mongoose from "mongoose";
import type { Request, Response } from "express";
import { config } from "dotenv";
config({ path: "../../.env" });
import { choreRouter } from "./routes/chore-routes.js";
import { homeRouter } from "./routes/home-routes.js";
import { eventRouter } from "./routes/event-routes.js";
import { userRouter } from "./routes/user-routes.js";
import { loginRouter } from "./routes/login-routes.js";
import { ruleRouter } from "./routes/rule-routes.js";
import { groceryRouter } from "./routes/grocery-routes.js";
import { relationRouter } from "./routes/relation-routes.js";
import { authRouter } from "./routes/authentication-router.js";
import swaggerUi from "swagger-ui-express";
import swaggerDocument from "./swagger-output.json" with { type: "json" };
import session from "express-session";
import MongoStore from "connect-mongo";

declare module "express-session" {
	interface SessionData {
		// page_views: number;
		userId?: string;
		username?: string;
	}
}

// future needed:
// import {} from "cookie-parser";
// app.use(cookieParser());

export const app = express();
export const port = 8000;

const sessionSecret =
	process.env.EXPRESS_SESSION_SECRET || process.env.SESSION_SECRET;

if (!sessionSecret) {
	throw new Error(
		"Missing session secret. Set EXPRESS_SESSION_SECRET or SESSION_SECRET in your .env file."
	);
}

app.use(
	session({
		secret: sessionSecret,
		resave: false,
		saveUninitialized: false,
		store: MongoStore.create({
			mongoUrl: process.env.MONGO_URI,
		}),
		cookie: {
			httpOnly: true,
			sameSite: "lax",
			secure: process.env.NODE_ENV === "production",
			maxAge: 1000 * 60 * 30, // resets session every 30 minutes
		},
	})
);

//default port to listen
const corsOptions = {
	origin: [
		"http://localhost:4173",
		"http://localhost:5173",
		"https://white-pond-00a466e1e.7.azurestaticapps.net",
		"https://white-pond-00a466e1e.7.azurestaticapps.net",
	],
	methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"],
	allowedHeaders: ["Content-Type", "Authorization"],
	credentials: true,
	optionsSuccessStatus: 200,
};

app.use(cors(corsOptions));
app.use(express.json());

app.use("/", choreRouter);
app.use("/", homeRouter);
app.use("/", eventRouter);
app.use("/", loginRouter);
app.use("/", ruleRouter);
app.use("/", userRouter);
app.use("/", groceryRouter);
app.use("/", relationRouter);
app.use("/", authRouter);

app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerDocument));

app.get("/", (req: Request, res: Response) => {
	const username = req.session.username || "User not logged in";
	res.send(`${username}, Welcome to this page!`);

	// if (req.session.page_views) {
	// 	req.session.page_views++;
	// 	res.send(
	// 		`${username} visited this page ${req.session.page_views} times`
	// 	);
	// } else {
	// 	req.session.page_views = 1;
	// 	res.send(`${username}, Welcome to this page for the first time!`);
	// }
});

const url = process.env.MONGO_URI;
let connection: typeof mongoose | null = null;

//singleton of connection (implemented so if fails it connects to localhost)
const connectDB = async () => {
	if (!connection) {
		console.log(
			"MongoDB Connected" +
				(url ? ` successfully` : " at default localhost")
		);
		connection = await mongoose.connect(
			url || "mongodb://localhost:27017/room8"
		);
		return connection;
	}
};

const start = async () => {
	try {
		await connectDB();

		app.listen(process.env.PORT || port, () => {
			console.log(`Server running on port ${process.env.PORT || port}`);
		});
	} catch (err) {
		console.error("Failed to connect to MongoDB", err);
	}
};

start().catch((e) => {
	console.error("Startup failed:", e);
	process.exit(1);
});

export default connectDB;
