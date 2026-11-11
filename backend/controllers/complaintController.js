const Complaint = require('../models/Complaint');
const ComplaintUpdate = require('../models/ComplaintUpdate');
const Feedback = require('../models/Feedback');
const Staff = require('../models/Staff');
const Notification = require('../models/Notification');

// ==========================================
// @desc    Create complaint
// @route   POST /api/complaints
// @access  Private (User)
// ==========================================
const createComplaint = async (req, res) => {
  const { title, category, description, priority, images, location } = req.body;

  try {
    if (!title || !category || !description) {
      return res.status(400).json({ message: 'Title, category and description are required' });
    }

    const complaint = await Complaint.create({
      user: req.user._id,
      title,
      category,
      description,
      priority: priority || 'Medium',
      images: images || [],
      location: location || {},
      status: 'Pending',
    });

    await ComplaintUpdate.create({
      complaint: complaint._id,
      status: 'Pending',
      remark: 'Complaint submitted',
      updatedBy: req.user._id,
    });

    res.status(201).json(complaint);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ==========================================
// @desc    Get user's own complaints
// @route   GET /api/complaints/mine
// @access  Private (User)
// ==========================================
const getMyComplaints = async (req, res) => {
  try {
    const filter = { user: req.user._id };
    if (req.query.status) filter.status = req.query.status;

    const complaints = await Complaint.find(filter).sort({ createdAt: -1 });
    res.json(complaints);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ==========================================
// @desc    Get complaints (admin: all, staff: assigned)
// @route   GET /api/complaints
// @access  Private
// ==========================================
const getComplaints = async (req, res) => {
  try {
    let filter = {};

    if (req.user.role === 'user') {
      filter.user = req.user._id;
    }

    if (req.user.role === 'staff') {
      const staff = await Staff.findOne({ user: req.user._id });
      if (staff) filter.assignedTo = staff._id;
    }

    if (req.query.status) filter.status = req.query.status;
    if (req.query.category) filter.category = req.query.category;
    if (req.query.priority) filter.priority = req.query.priority;

    const complaints = await Complaint.find(filter)
      .populate('user', 'name email phone')
      .populate({ path: 'assignedTo', populate: { path: 'user', select: 'name email' } })
      .sort({ createdAt: -1 });

    res.json(complaints);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ==========================================
// @desc    Get single complaint with timeline
// @route   GET /api/complaints/:id
// @access  Private
// ==========================================
const getComplaintById = async (req, res) => {
  try {
    const complaint = await Complaint.findById(req.params.id)
      .populate('user', 'name email phone')
      .populate({ path: 'assignedTo', populate: { path: 'user', select: 'name email' } });

    if (!complaint) return res.status(404).json({ message: 'Complaint not found' });

    if (req.user.role === 'user' && complaint.user._id.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Access denied' });
    }

    const updates = await ComplaintUpdate.find({ complaint: complaint._id })
      .populate('updatedBy', 'name role')
      .sort({ createdAt: 1 });

    const feedbackDoc = await Feedback.findOne({ complaint: complaint._id });

    // Build timeline from updates (includes fields used by admin-web and mobile)
    const timeline = updates.map(u => ({
      _id: u._id,
      status: u.status,
      remark: u.remark,
      note: u.remark,
      type: u.type || 'status',
      photoUrl: u.photoUrl,
      updatedBy: u.updatedBy,
      createdAt: u.createdAt,
      at: u.createdAt,
    }));

    const result = complaint.toObject();
    result.timeline = timeline;
    result.updates = timeline;
    if (feedbackDoc) {
      result.feedback = { rating: feedbackDoc.rating, feedback: feedbackDoc.comment, comment: feedbackDoc.comment };
    }

    res.json(result);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ==========================================
// @desc    Assign complaint to staff
// @route   PUT /api/complaints/:id/assign
// @access  Admin
// ==========================================
const assignComplaint = async (req, res) => {
  const { staffId, priority } = req.body;

  try {
    const complaint = await Complaint.findById(req.params.id);
    if (!complaint) return res.status(404).json({ message: 'Complaint not found' });

    const staff = await Staff.findById(staffId).populate('user', 'name');
    if (!staff) return res.status(404).json({ message: 'Staff not found' });

    complaint.assignedTo = staffId;
    complaint.status = 'Assigned';
    if (priority) complaint.priority = priority;
    await complaint.save();

    staff.workload += 1;
    await staff.save();

    await ComplaintUpdate.create({
      complaint: complaint._id,
      status: 'Assigned',
      remark: `Assigned to ${staff.user.name}`,
      updatedBy: req.user._id,
    });

    await Notification.create({
      user: complaint.user,
      type: 'complaint_assigned',
      message: `Your complaint has been assigned to ${staff.user.name}`,
      link: `/complaints/${complaint._id}`,
    });

    res.json(complaint);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ==========================================
// @desc    Update complaint status
// @route   PUT /api/complaints/:id/status
// @access  Admin/Staff
// ==========================================
const updateComplaintStatus = async (req, res) => {
  const { status, remark } = req.body;

  try {
    const complaint = await Complaint.findById(req.params.id);
    if (!complaint) return res.status(404).json({ message: 'Complaint not found' });
    if (!status) return res.status(400).json({ message: 'Status is required' });

    complaint.status = status;
    if (status === 'Resolved') {
      complaint.resolvedAt = new Date();
      if (req.file) complaint.resolutionPhoto = `/uploads/${req.file.filename}`;
    }
    await complaint.save();

    await ComplaintUpdate.create({
      complaint: complaint._id,
      status,
      remark: remark || `Status changed to ${status}`,
      photoUrl: req.file ? `/uploads/${req.file.filename}` : null,
      updatedBy: req.user._id,
    });

    await Notification.create({
      user: complaint.user,
      type: 'complaint_status',
      message: `Your complaint status: ${status}`,
      link: `/complaints/${complaint._id}`,
    });

    res.json(complaint);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ==========================================
// @desc    Update priority
// @route   PUT /api/complaints/:id/priority
// @access  Admin
// ==========================================
const updatePriority = async (req, res) => {
  const { priority } = req.body;
  try {
    const complaint = await Complaint.findById(req.params.id);
    if (!complaint) return res.status(404).json({ message: 'Complaint not found' });
    complaint.priority = priority || complaint.priority;
    await complaint.save();
    res.json(complaint);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ==========================================
// @desc    Submit feedback
// @route   POST /api/complaints/:id/feedback
// @access  User
// ==========================================
const submitFeedback = async (req, res) => {
  const { rating, feedback, comment } = req.body;

  try {
    const complaint = await Complaint.findById(req.params.id);
    if (!complaint) return res.status(404).json({ message: 'Complaint not found' });

    if (complaint.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Access denied' });
    }

    if (complaint.status !== 'Resolved') {
      return res.status(400).json({ message: 'Can only rate resolved complaints' });
    }

    const ratingNum = Number(rating);
    if (!Number.isFinite(ratingNum) || ratingNum < 1 || ratingNum > 5) {
      return res.status(400).json({ message: 'Rating must be between 1 and 5' });
    }

    const existing = await Feedback.findOne({ complaint: complaint._id });
    if (existing) return res.status(400).json({ message: 'Feedback already submitted' });

    const feedbackDoc = await Feedback.create({
      complaint: complaint._id,
      rating: ratingNum,
      comment: (comment != null ? comment : feedback) || '',
    });

    res.status(201).json(feedbackDoc);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ==========================================
// @desc    Reopen complaint
// @route   PUT /api/complaints/:id/reopen
// @access  User
// ==========================================
const reopenComplaint = async (req, res) => {
  try {
    const complaint = await Complaint.findById(req.params.id);
    if (!complaint) return res.status(404).json({ message: 'Complaint not found' });

    if (complaint.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Access denied' });
    }

    if (complaint.status !== 'Resolved') {
      return res.status(400).json({ message: 'Only resolved complaints can be reopened' });
    }

    const reason = (req.body.reason || '').trim();
    if (!reason) {
      return res.status(400).json({ message: 'Reason is required to reopen a complaint' });
    }

    complaint.status = 'Reopened';
    await complaint.save();

    await ComplaintUpdate.create({
      complaint: complaint._id,
      status: 'Reopened',
      remark: reason,
      type: 'status',
      updatedBy: req.user._id,
    });

    res.json(complaint);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ==========================================
// @desc    Add comment to complaint thread
// @route   POST /api/complaints/:id/comments
// @access  Private (owner/admin/staff)
// ==========================================
const addComplaintComment = async (req, res) => {
  try {
    const complaint = await Complaint.findById(req.params.id);
    if (!complaint) return res.status(404).json({ message: 'Complaint not found' });

    const isOwner = complaint.user.toString() === req.user._id.toString();
    const isPrivileged = req.user.role === 'admin' || req.user.role === 'staff';
    if (!isOwner && !isPrivileged) {
      return res.status(403).json({ message: 'Access denied' });
    }

    const message = (req.body.message || req.body.comment || req.body.remark || '').trim();
    if (!message) return res.status(400).json({ message: 'Comment message is required' });

    const comment = await ComplaintUpdate.create({
      complaint: complaint._id,
      status: complaint.status,
      remark: message,
      type: 'comment',
      updatedBy: req.user._id,
    });

    await comment.populate('updatedBy', 'name role');

    if (isPrivileged && !isOwner) {
      await Notification.create({
        user: complaint.user,
        type: 'complaint_comment',
        message: 'New comment on your complaint',
        link: `/complaints/${complaint._id}`,
      });
    }

    res.status(201).json({
      _id: comment._id,
      status: comment.status,
      remark: comment.remark,
      note: comment.remark,
      type: comment.type,
      updatedBy: comment.updatedBy,
      createdAt: comment.createdAt,
      at: comment.createdAt,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ==========================================
// @desc    Get complaint stats (for dashboard)
// @route   GET /api/complaints/stats
// @access  Admin
// ==========================================
const getComplaintStats = async (req, res) => {
  try {
    const total = await Complaint.countDocuments();
    const pending = await Complaint.countDocuments({ status: 'Pending' });
    const assigned = await Complaint.countDocuments({ status: 'Assigned' });
    const inProgress = await Complaint.countDocuments({ status: 'In Progress' });
    const resolved = await Complaint.countDocuments({ status: 'Resolved' });
    const reopened = await Complaint.countDocuments({ status: 'Reopened' });

    const byCategory = await Complaint.aggregate([
      { $group: { _id: '$category', count: { $sum: 1 } } },
    ]);

    const resolvedComplaints = await Complaint.find({
      status: 'Resolved',
      resolvedAt: { $exists: true },
    });

    let avgResolutionTime = 0;
    if (resolvedComplaints.length > 0) {
      const totalTime = resolvedComplaints.reduce((sum, c) => {
        return sum + (new Date(c.resolvedAt) - new Date(c.createdAt));
      }, 0);
      avgResolutionTime = totalTime / resolvedComplaints.length / (1000 * 60 * 60);
    }

    res.json({
      total, pending, assigned, inProgress, resolved, reopened,
      byCategory,
      avgResolutionTimeHours: avgResolutionTime.toFixed(1),
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  createComplaint,
  getMyComplaints,
  getComplaints,
  getComplaintById,
  assignComplaint,
  updateComplaintStatus,
  updatePriority,
  submitFeedback,
  reopenComplaint,
  addComplaintComment,
  getComplaintStats,
};
