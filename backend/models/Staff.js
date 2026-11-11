const mongoose = require('mongoose');

const staffSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  department: { type: mongoose.Schema.Types.ObjectId, ref: 'Department', required: true },
  availability: { type: String, enum: ['available', 'busy', 'on_leave'], default: 'available' },
  workload: { type: Number, default: 0 },
}, { timestamps: true });

module.exports = mongoose.model('Staff', staffSchema);