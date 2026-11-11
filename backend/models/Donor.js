const mongoose = require('mongoose');

const donorSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  name: { type: String, required: true },
  contact: { type: String, required: true },
  isAnonymous: { type: Boolean, default: false },
  totalDonated: { type: Number, default: 0 },
}, { timestamps: true });

module.exports = mongoose.model('Donor', donorSchema);