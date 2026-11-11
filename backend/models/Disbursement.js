const mongoose = require('mongoose');

const disbursementSchema = new mongoose.Schema({
  welfareRequest: { type: mongoose.Schema.Types.ObjectId, ref: 'WelfareRequest', required: true },
  fundType: { type: String, enum: ['zakat', 'sadaqah', 'general'], required: true },
  amount: { type: Number, required: true },
  method: { type: String, required: true },
  proofUrl: { type: String },
  approvedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
}, { timestamps: true });

module.exports = mongoose.model('Disbursement', disbursementSchema);