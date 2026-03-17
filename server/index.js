import express from "express";
import cors from "cors";
import dotenv from "dotenv";

import connectDB from "./config/db.js";
import locationsRouter from "./routes/locations.js";
import pathsRouter from "./routes/paths.js";
import navigationRouter from "./routes/navigation.js";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
  res.send({ message: "Smart Campus Navigation API is running." });
});

app.use("/api/locations", locationsRouter);
app.use("/api/paths", pathsRouter);
app.use("/api/route", navigationRouter);

const start = async () => {
  await connectDB();
  app.listen(PORT, () => {
    console.log(`🚀 Server running on http://localhost:${PORT}`);
  });
};

start();
