import express from "express";
import type { Request, Response } from "express";

export const loginRouter = express.Router();

loginRouter.post("/login", async (req: Request, res: Response) => {
  try {
    const { username, password } = req.body;

    //test if have both user and password
    if (!username || !password) {
      return res.status(400).json({ error: "Username and password required" });
    }
    
    //hardcoded for testing for now
    const TEST_USER = {
      username: "barrybbenson",
      password: "test123",
      fullName: "Barry Benson",
      _id: "dummyid123",
    };

    //test if user and pass match
    if (username !== TEST_USER.username || password !== TEST_USER.password) {
      return res.status(401).json({ error: "Invalid Username or Password" });
    }

    res.status(200).json({
      message: "Login successful",
      userId: TEST_USER._id,
      username: TEST_USER.username,
      token: "fake-token-12345",
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Login failed" });
  }
});
