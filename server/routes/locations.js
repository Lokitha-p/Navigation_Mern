import express from "express";
import Location from "../models/Location.js";

const router = express.Router();

// Get all locations
router.get("/", async (req, res) => {
  try {
    const locations = await Location.find().lean();
    res.json(locations);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch locations" });
  }
});

// Create a new location
router.post("/", async (req, res) => {
  try {
    const location = new Location(req.body);
    const saved = await location.save();
    res.status(201).json(saved);
  } catch (err) {
    console.error(err);
    res.status(400).json({ error: "Failed to create location", details: err.message });
  }
});

export default router;
