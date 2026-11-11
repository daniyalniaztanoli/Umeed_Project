const mongoose = require('mongoose');

const eventSchema = new mongoose.Schema({
  title: { type: String, required: true, trim: true },
  description: { type: String, required: true },
  type: { type: String, enum: ['blood_camp', 'ration_drive', 'book_drive', 'medical_camp', 'other'], default: 'other' },
  date: { type: Date },
  endDate: { type: Date },
  location: { type: String },
  imageUrl: { type: String },
  organizer: { type: String, default: 'Umeed Foundation' },
  contact: { type: String },
  isPublished: { type: Boolean, default: true },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
}, { timestamps: true });

module.exports = mongoose.model('Event', eventSchema);