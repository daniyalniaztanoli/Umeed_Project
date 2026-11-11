const Suggestion = require('../models/Suggestion');
const Notification = require('../models/Notification');
const User = require('../models/User');

const createSuggestion = async (req, res) => {
  try {
    const { name, email, category, subject, message, rating } = req.body;
    if (!message || !String(message).trim()) return res.status(400).json({ message: 'Message is required' });
    const suggestion = await Suggestion.create({
      user: req.user?._id,
      name: name || req.user?.name,
      email: email || req.user?.email,
      category: category || 'feedback',
      subject,
      message: String(message).trim(),
      rating: rating != null ? Number(rating) : undefined,
    });

    const admins = await User.find({ role: 'admin', status: 'active' }).select('_id');
    if (admins.length) {
      await Notification.insertMany(admins.map((a) => ({
        user: a._id,
        type: 'suggestion',
        message: `New ${suggestion.category}: ${subject || 'Feedback received'}`,
        link: `/suggestions/${suggestion._id}`,
      })));
    }

    res.status(201).json({ message: 'Feedback submitted. Thank you!', suggestion });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { createSuggestion };