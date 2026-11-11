const mongoose = require('mongoose');

const volunteerSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  name: { type: String, required: true, trim: true },
  email: { type: String, trim: true },
  phone: { type: String, required: true, trim: true },
  city: { type: String, trim: true },
  interests: [{ type: String }],
  availability: { type: String },
  skills: { type: String },
  message: { type: String },
  status: { type: String, enum: ['submitted', 'contacted', 'active', 'closed'], default: 'submitted' },
}, { timestamps: true });

module.exports = mongoose.model('Volunteer', volunteerSchema);