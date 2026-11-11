const mongoose = require('mongoose');

const complaintUpdateSchema = new mongoose.Schema({
  complaint: { type: mongoose.Schema.Types.ObjectId, ref: 'Complaint', required: true },
  status: { type: String, required: true },
  remark: { type: String },
  photoUrl: { type: String },
  type: { type: String, enum: ['status', 'comment'], default: 'status' },
  updatedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
}, { timestamps: true });

module.exports = mongoose.model('ComplaintUpdate', complaintUpdateSchema);