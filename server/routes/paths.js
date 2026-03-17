import express from "express";
import Path from "../models/Path.js";

const router = express.Router();

// Get all paths (edges)
router.get("/", async (req, res) => {
  try {
    const paths = await Path.find().populate("from to").lean();
    res.json(paths);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch paths" });
  }
});

// Get a single path
router.get("/:id", async (req, res) => {
  try {
    const path = await Path.findById(req.params.id).populate("from to").lean();
    if (!path) return res.status(404).json({ error: "Path not found" });
    res.json(path);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch path" });
  }
});

// Create a new path (edge)
router.post("/", async (req, res) => {
  try {
    const path = new Path(req.body);
    const saved = await path.save();
    res.status(201).json(saved);
  } catch (err) {
    console.error(err);
    res.status(400).json({ error: "Failed to create path", details: err.message });
  }
});

// Update a path
router.put("/:id", async (req, res) => {
  try {
    const updated = await Path.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    }).populate("from to").lean();
    if (!updated) return res.status(404).json({ error: "Path not found" });
    res.json(updated);
  } catch (err) {
    console.error(err);
    res.status(400).json({ error: "Failed to update path", details: err.message });
  }
});

// Delete a path
router.delete("/:id", async (req, res) => {
  try {
    const deleted = await Path.findByIdAndDelete(req.params.id).lean();
    if (!deleted) return res.status(404).json({ error: "Path not found" });
    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to delete path" });
  }
});

export default router;
