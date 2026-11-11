const Event = require('../models/Event');

const getEvents = async (req, res) => {
  try {
    const filter = { isPublished: true };
    if (req.query.type) filter.type = req.query.type;
    if (req.query.upcoming === 'true') filter.date = { $gte: new Date() };
    const events = await Event.find(filter).sort({ date: 1, createdAt: -1 });
    res.json(events);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const createEvent = async (req, res) => {
  try {
    const { title, description, type, date, endDate, location, imageUrl, organizer, contact } = req.body;
    if (!title || !description) return res.status(400).json({ message: 'Title and description are required' });
    const event = await Event.create({ title, description, type, date, endDate, location, imageUrl, organizer, contact, createdBy: req.user?._id, isPublished: true });
    res.status(201).json(event);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { getEvents, createEvent };