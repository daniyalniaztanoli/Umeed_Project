const mongoose = require('mongoose');

const donationSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  donor: { type: mongoose.Schema.Types.ObjectId, ref: 'Donor' },
  donorName: { type: String, trim: true },
  donorContact: { type: String, trim: true },
  isAnonymous: { type: Boolean, default: false },
  category: { type: String, enum: ['zakat', 'sadqa', 'sadaqah', 'fitra', 'general', 'campaign'], required: true },
  fundType: { type: String, enum: ['zakat', 'sadaqah', 'sadqa', 'fitra', 'general', 'campaign'] },
  campaign: { type: mongoose.Schema.Types.ObjectId, ref: 'Campaign' },
  amount: { type: Number, required: true, min: 1 },
  method: { type: String, enum: ['jazzcash', 'easypaisa', 'bank_transfer', 'card', 'cash', 'manual'], required: true },
  reference: { type: String, trim: true },
  proofUrl: { type: String },
  notes: { type: String, trim: true },
  status: { type: String, enum: ['pending', 'confirmed', 'failed', 'rejected'], default: 'pending' },
  verifiedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  receiptUrl: { type: String },
  receiptNumber: { type: String, trim: true },
}, { timestamps: true });

module.exports = mongoose.model('Donation', donationSchema);