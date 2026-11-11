const mongoose = require('mongoose');

const complaintSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  title: { type: String, required: true },
  category: { 
    type: String, 
    enum: ['Facilities', 'Cleanliness', 'Hostel', 'Safety', 'Academic', 'Other'],
    required: true 
  },
  description: { type: String, required: true },
  images: [{ type: String }],
  location: {
    building: { type: String },
    room: { type: String },
  },
  priority: { type: String, enum: ['Low', 'Medium', 'High'], default: 'Medium' },
  status: { 
    type: String, 
    enum: ['Pending', 'Assigned', 'In Progress', 'Resolved', 'Rejected', 'Reopened'], 
    default: 'Pending' 
  },
  assignedTo: { type: mongoose.Schema.Types.ObjectId, ref: 'Staff' },
  resolvedAt: { type: Date },
  resolutionPhoto: { type: String },
}, { timestamps: true });

module.exports = mongoose.model('Complaint', complaintSchema);