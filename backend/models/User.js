const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  phone: { type: String, required: true },
  city: { type: String, trim: true },
  role: {  
    type: String, 
    enum: ['user', 'admin', 'staff', 'finance_officer'], 
    default: 'user' 
  },
  department: { type: mongoose.Schema.Types.ObjectId, ref: 'Department' },
  status: { type: String, enum: ['active', 'inactive'], default: 'active' },
  language: { type: String, default: 'en' },
  profilePic: { type: String },
}, { timestamps: true });

module.exports = mongoose.model('User', userSchema);