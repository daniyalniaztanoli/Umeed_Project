const mongoose = require('mongoose');

const suggestionSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  name: { type: String, trim: true },
  email: { type: String, trim: true },
  category: { type: String, enum: ['feedback', 'suggestion', 'help', 'other'], default: 'feedback' },
  subject: { type: String, trim: true },
  message: { type: String, required: true, trim: true },
  rating: { type: Number, min: 1, max: 5 },
  status: { type: String, enum: ['new', 'reviewed', 'closed'], default: 'new' },
}, { timestamps: true });

module.exports = mongoose.model('Suggestion', suggestionSchema);