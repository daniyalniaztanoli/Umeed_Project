const mongoose = require('mongoose');

const impactStorySchema = new mongoose.Schema({
  title: { type: String, required: true, trim: true },
  summary: { type: String, required: true, trim: true },
  body: { type: String, trim: true },
  imageUrl: { type: String },
  category: { type: String, enum: ['education', 'medical', 'food', 'blood', 'general', 'welfare'], default: 'general' },
  isPublished: { type: Boolean, default: true },
  publishedAt: { type: Date, default: Date.now },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
}, { timestamps: true });

module.exports = mongoose.model('ImpactStory', impactStorySchema);