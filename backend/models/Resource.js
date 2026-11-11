const mongoose = require("mongoose");

const resourceSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    description: { type: String, trim: true },
    type: {
      type: String,
      enum: ["book_bank", "scholarship", "other"],
      default: "book_bank",
    },
    link: { type: String, trim: true },
    contact: { type: String, trim: true },
    isPublished: { type: Boolean, default: true },
  },
  { timestamps: true },
);

module.exports = mongoose.model("Resource", resourceSchema);
