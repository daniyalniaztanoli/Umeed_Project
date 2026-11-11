const mongoose = require('mongoose');

const inKindDonationSchema = new mongoose.Schema({
  donor: { type: mongoose.Schema.Types.ObjectId, ref: 'Donor', required: true },
  item: { type: String, required: true },
  quantity: { type: Number, required: true },
  condition: { type: String, enum: ['new', 'good', 'used'], default: 'good' },
  status: { type: String, enum: ['offered', 'received', 'distributed'], default: 'offered' },
  notes: { type: String },
}, { timestamps: true });

module.exports = mongoose.model('InKindDonation', inKindDonationSchema);