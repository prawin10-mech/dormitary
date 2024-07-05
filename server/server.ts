import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import mongoose from "mongoose";

import { UserRouter } from "./routes";

const app = express();
app.use(cors());
dotenv.config();
app.use(express.json());

//  --------------DB connection ----------------

const mongoUri: string = process.env.MONGODB_URI as string;
const apiPort: number = process.env.PORT
  ? parseInt(process.env.PORT, 10)
  : 3001;

mongoose
  .connect(mongoUri)
  .then(() => console.log("mongodb connected"))
  .catch((err: Error) => console.log("mongo connection", err));

app.get("/", (req, res) => {
  return res.json({ message: "Welcome" });
});

app.use("/user", UserRouter);

app.listen(apiPort, () => console.log("Server Started"));
