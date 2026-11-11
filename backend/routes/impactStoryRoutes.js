const express = require("express");
const router = express.Router();
const { protect, adminOnly } = require("../middleware/authMiddleware");
const ImpactStory = require("../models/ImpactStory");
const upload = require("../middleware/upload");

// All stories (admin) - published and unpublished
router.get("/", protect, adminOnly, async (req, res) => {
  try {
    const stories = await ImpactStory.find().sort({ createdAt: -1 });
    res.json(stories);
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
});

// Create story (admin)
router.post(
  "/",
  protect,
  adminOnly,
  upload.single("image"),
  async (req, res) => {
    try {
      const { title, summary, body, category, isPublished } = req.body;
      if (!title || !summary)
        return res
          .status(400)
          .json({ message: "Title and summary are required" });
      const story = await ImpactStory.create({
        title,
        summary,
        body: body || "",
        category: category || "general",
        imageUrl: req.file ? `/uploads/${req.file.filename}` : undefined,
        isPublished: isPublished !== "false" && isPublished !== false,
        createdBy: req.user._id,
      });
      res.status(201).json(story);
    } catch (e) {
      res.status(500).json({ message: e.message });
    }
  },
);

// Update story (admin)
router.put(
  "/:id",
  protect,
  adminOnly,
  upload.single("image"),
  async (req, res) => {
    try {
      const updates = { ...req.body };
      if (req.file) updates.imageUrl = `/uploads/${req.file.filename}`;
      if (updates.isPublished !== undefined)
        updates.isPublished = updates.isPublished !== "false";
      const story = await ImpactStory.findByIdAndUpdate(
        req.params.id,
        updates,
        { new: true },
      );
      if (!story) return res.status(404).json({ message: "Story not found" });
      res.json(story);
    } catch (e) {
      res.status(500).json({ message: e.message });
    }
  },
);

// Delete story (admin)
router.delete("/:id", protect, adminOnly, async (req, res) => {
  try {
    const story = await ImpactStory.findByIdAndDelete(req.params.id);
    if (!story) return res.status(404).json({ message: "Story not found" });
    res.json({ message: "Deleted" });
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
});

module.exports = router;
