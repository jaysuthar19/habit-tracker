import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import dotenv from "dotenv";

import authRoutes from "./routes/auth.js";
import habitRoutes from "./routes/habits.js";

dotenv.config();

const app = express(); // ✅ FIRST create app

app.use(cors());
app.use(express.json());

// ✅ THEN use routes
app.use("/api/auth", authRoutes);
app.use("/api/habits", habitRoutes);

// ✅ THEN connect DB
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log("MongoDB Connected"))
  .catch(err => console.log(err));

// test route
app.get("/", (req, res) => {
  res.send("API running...");
});

// ✅ THEN start server
app.listen(5000, () => {
  console.log("Server running on port 5000");
});