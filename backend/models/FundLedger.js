const mongoose = require('mongoose');

const fundLedgerSchema = new mongoose.Schema({
  fundType: { type: String, enum: ['zakat', 'sadaqah', 'general', 'campaign'], required: true },
  entryType: { type: String, enum: ['credit', 'debit'], required: true },
  amount: { type: Number, required: true },
  linkedDonation: { type: mongoose.Schema.Types.ObjectId, ref: 'Donation' },
  linkedDisbursement: { type: mongoose.Schema.Types.ObjectId, ref: 'Disbursement' },
  description: { type: String },
  approvedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
}, { timestamps: true });

module.exports = mongoose.model('FundLedger', fundLedgerSchema);