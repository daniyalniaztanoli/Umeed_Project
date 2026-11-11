const mongoose = require('mongoose');

const announcementSchema = new mongoose.Schema({
  title: { type: String, required: true },
  body: { type: String, required: true },
  audience: { type: String, enum: ['all', 'students', 'staff', 'donors'], default: 'all' },
  publishedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  publishDate: { type: Date, default: Date.now },
  isPublished: { type: Boolean, default: true },
}, { timestamps: true });

module.exports = mongoose.model('Announcement', announcementSchema);