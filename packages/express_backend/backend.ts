import express from "express";
import cors from "cors";
import type { Request, Response } from "express";

const app = express();
const port = 8000;

app.use(cors());
app.use(express.json());

app.get("/", (req: Request, res: Response) => {
  res.send("Hello World!");
});

app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`);
});
