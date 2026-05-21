import express from "express";
import type { Request, Response } from "express";
import { User } from "../models/User.js";

export const loginRouter = express.Router();

loginRouter.post("/login", async (req: Request, res: Response) => {
	try {
		const { username, password } = req.body;

		if (!username || !password) {
			return res
				.status(400)
				.json({ error: "Username and password required" });
		}

		const user = await User.findOne({ username });

		if (!user) {
			return res
				.status(401)
				.json({ error: "Invalid Username or Password" });
		}

		if (user.password !== password) {
			return res
				.status(401)
				.json({ error: "Invalid Username or Password" });
		}

		req.session.userId = user._id.toString();
		req.session.username = user.username;

		res.status(200).json({
			message: "Login successful",
			userId: user._id,
			username: user.username,
		});
	} catch (err) {
		console.error(err);
		res.status(500).json({ error: "Login failed" });
	}
});
loginRouter.post("/logout", (req: Request, res: Response) => {
	req.session.destroy((err) => {
		if (err) {
			return res.status(500).json({ error: "Logout failed" });
		}

		res.clearCookie("connect.sid");
		res.status(200).json({ message: "Logged out" });
	});
});
