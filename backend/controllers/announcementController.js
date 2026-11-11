const Announcement = require('../models/Announcement');
const Notification = require('../models/Notification');
const User = require('../models/User');

// ==========================================
// @desc    Get all announcements
// @route   GET /api/announcements
// @access  Public
// ==========================================
const getAnnouncements = async (req, res) => {
  try {
    let filter = { isPublished: true };

    // Admin sab dekh sakta hai
    if (req.user && req.user.role === 'admin') {
      filter = {};
    }

    // Audience filter
    if (req.query.audience) {
      filter.audience = req.query.audience;
    }

    const announcements = await Announcement.find(filter)
      .populate('publishedBy', 'name role')
      .sort({ publishDate: -1 });

    res.json(announcements);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ==========================================
// @desc    Get single announcement
// @route   GET /api/announcements/:id
// @access  Public
// ==========================================
const getAnnouncementById = async (req, res) => {
  try {
    const announcement = await Announcement.findById(req.params.id).populate(
      'publishedBy',
      'name role'
    );
    if (!announcement) {
      return res.status(404).json({ message: 'Announcement not found' });
    }
    res.json(announcement);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ==========================================
// @desc    Create announcement
// @route   POST /api/announcements
// @access  Admin
// ==========================================
const createAnnouncement = async (req, res) => {
  const { title, body, audience, publishDate } = req.body;

  try {
    if (!title || !body) {
      return res.status(400).json({ message: 'Title and body are required' });
    }

    const announcement = await Announcement.create({
      title,
      body,
      audience: audience || 'all',
      publishedBy: req.user._id,
      publishDate: publishDate || Date.now(),
      isPublished: true,
    });

    // Notify target users
    let userFilter = { status: 'active' };
    if (audience === 'students') userFilter.role = 'user';
    if (audience === 'staff') userFilter.role = 'staff';
    if (audience === 'donors') userFilter.role = 'user'; // placeholder

    const users = await User.find(userFilter).select('_id');

    // Bulk create notifications
    const notifications = users.map((u) => ({
      user: u._id,
      type: 'announcement',
      message: `New announcement: ${title}`,
      link: `/announcements/${announcement._id}`,
    }));

    if (notifications.length > 0) {
      await Notification.insertMany(notifications);
    }

    res.status(201).json(announcement);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ==========================================
// @desc    Update announcement
// @route   PUT /api/announcements/:id
// @access  Admin
// ==========================================
const updateAnnouncement = async (req, res) => {
  try {
    const announcement = await Announcement.findById(req.params.id);
    if (!announcement) {
      return res.status(404).json({ message: 'Announcement not found' });
    }

    announcement.title = req.body.title || announcement.title;
    announcement.body = req.body.body || announcement.body;
    announcement.audience = req.body.audience || announcement.audience;
    announcement.publishDate = req.body.publishDate || announcement.publishDate;
    if (req.body.isPublished !== undefined) {
      announcement.isPublished = req.body.isPublished;
    }

    const updated = await announcement.save();
    res.json(updated);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ==========================================
// @desc    Delete announcement
// @route   DELETE /api/announcements/:id
// @access  Admin
// ==========================================
const deleteAnnouncement = async (req, res) => {
  try {
    const announcement = await Announcement.findById(req.params.id);
    if (!announcement) {
      return res.status(404).json({ message: 'Announcement not found' });
    }

    await announcement.deleteOne();
    res.json({ message: 'Announcement removed' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  getAnnouncements,
  getAnnouncementById,
  createAnnouncement,
  updateAnnouncement,
  deleteAnnouncement,
};