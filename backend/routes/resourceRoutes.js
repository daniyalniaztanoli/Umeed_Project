const express = require("express");
const router = express.Router();
const { protect, adminOnly } = require("../middleware/authMiddleware");
const Resource = require("../models/Resource");

// All resources (public - shown in mobile app)
router.get("/", async (req, res) => {
  try {
    const resources = await Resource.find().sort({ createdAt: -1 });
    res.json(resources);
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
});

// Create resource (admin)
router.post("/", protect, adminOnly, async (req, res) => {
  try {
    const { title, description, type, link, contact, isPublished } = req.body;
    if (!title) return res.status(400).json({ message: "Title is required" });
    const resource = await Resource.create({
      title,
      description,
      type,
      link,
      contact,
      isPublished,
    });
    res.status(201).json(resource);
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
});

// Update resource (admin)
router.put("/:id", protect, adminOnly, async (req, res) => {
  try {
    const resource = await Resource.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
    });
    if (!resource)
      return res.status(404).json({ message: "Resource not found" });
    res.json(resource);
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
});

// Delete resource (admin)
router.delete("/:id", protect, adminOnly, async (req, res) => {
  try {
    const resource = await Resource.findByIdAndDelete(req.params.id);
    if (!resource)
      return res.status(404).json({ message: "Resource not found" });
    res.json({ message: "Deleted" });
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
});

module.exports = router;
