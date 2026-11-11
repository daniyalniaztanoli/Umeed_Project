const express = require("express");
const router = express.Router();
const { protect, adminOnly } = require("../middleware/authMiddleware");
const Feedback = require("../models/Feedback");
const Suggestion = require("../models/Suggestion");

// All feedback for admin: merges complaint-ratings (Feedback)
// and app feedback form submissions (Suggestion, category=feedback/help/other)
router.get("/", protect, adminOnly, async (req, res) => {
  try {
    const [complaintFeedback, suggestions] = await Promise.all([
      Feedback.find()
        .populate("complaint", "title complaintId user")
        .populate({
          path: "complaint",
          populate: { path: "user", select: "name email" },
        })
        .sort({ createdAt: -1 })
        .lean(),
      Suggestion.find({ category: { $in: ["feedback", "help", "other", "suggestion"] } })
        .populate("user", "name email")
        .sort({ createdAt: -1 })
        .lean(),
    ]);

    // Complaint ratings -> unified shape
    const fromComplaints = complaintFeedback.map((f) => ({
      _id: f._id,
      source: "complaint",
      user: f.complaint?.user || null,
      title: f.complaint?.title || f.complaint?.complaintId || "Complaint feedback",
      rating: f.rating,
      message: f.comment || "",
      linkId: f.complaint?._id,
      createdAt: f.createdAt,
    }));

    // App feedback form -> unified shape
    const fromApp = suggestions.map((s) => ({
      _id: s._id,
      source: "app",
      user: s.user || null,
      title: s.subject || s.category,
      category: s.category,
      rating: s.rating || null,
      message: s.message || "",
      linkId: s._id,
      createdAt: s.createdAt,
    }));

    const all = [...fromComplaints, ...fromApp].sort(
      (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
    );
    res.json(all);
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
});

module.exports = router;
