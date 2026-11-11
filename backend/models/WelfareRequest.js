const mongoose = require('mongoose');

const bloodInfoSchema = new mongoose.Schema(
  {
    requestType: { type: String, enum: ['donate', 'need'], required: true },
    bloodGroup: {
      type: String,
      enum: ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'],
      required: true,
    },
    fullName: { type: String, required: true },
    phone: { type: String, required: true },
    cnic: { type: String, required: true },
    age: { type: Number, required: true, min: 1 },
    gender: { type: String, enum: ['male', 'female', 'other'], required: true },
    city: { type: String, required: true },
    hospital: { type: String, required: true },
    urgency: { type: String, enum: ['normal', 'urgent', 'emergency'], required: true },
    units: { type: Number, required: true, min: 1 },
    neededBy: { type: String, required: true },
    lastDonationDate: { type: String },
    medicalConditions: { type: String },
    contactConsent: { type: Boolean, required: true },
  },
  { _id: false },
);

const welfareRequestSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  type: { type: String, enum: ['fee', 'medical', 'books', 'ration', 'blood', 'other'], required: true },
  reason: { type: String, required: true },
  amountRequested: { type: Number, default: 0 },
  documents: [{ type: String }],
  bloodInfo: { type: bloodInfoSchema },
  details: { type: mongoose.Schema.Types.Mixed },
  status: { 
    type: String, 
    enum: ['submitted', 'under_review', 'approved', 'rejected', 'disbursed'], 
    default: 'submitted' 
  },
  reviewedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  remarks: { type: String },
  fundType: { type: String, enum: ['zakat', 'sadaqah', 'general'], default: 'general' },
}, { timestamps: true });

module.exports = mongoose.model('WelfareRequest', welfareRequestSchema);