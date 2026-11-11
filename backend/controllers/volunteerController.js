const Volunteer = require('../models/Volunteer');
const Notification = require('../models/Notification');
const User = require('../models/User');

const createVolunteer = async (req, res) => {
  try {
    const { name, email, phone, city, interests, availability, skills, message } = req.body;
    const finalName = (name || req.user?.name || '').trim();
    const finalPhone = (phone || req.user?.phone || '').trim();
    if (!finalName || !finalPhone) return res.status(400).json({ message: 'Name and phone are required' });
    const volunteer = await Volunteer.create({
      user: req.user?._id,
      name: finalName,
      email: email || req.user?.email,
      phone: finalPhone,
      city,
      interests: Array.isArray(interests) ? interests : (interests ? [interests] : []),
      availability,
      skills,
      message,
    });

    const admins = await User.find({ role: 'admin', status: 'active' }).select('_id');
    if (admins.length) {
      await Notification.insertMany(admins.map((a) => ({
        user: a._id,
        type: 'volunteer_signup',
        message: `New volunteer signup: ${finalName}`,
        link: `/volunteers/${volunteer._id}`,
      })));
    }

    res.status(201).json({ message: 'Volunteer signup submitted', volunteer });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getVolunteers = async (req, res) => {
  try {
    const volunteers = await Volunteer.find().sort({ createdAt: -1 });
    res.json(volunteers);
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
};

module.exports = { createVolunteer, getVolunteers };