const Staff = require('../models/Staff');
const User = require('../models/User');
const bcrypt = require('bcryptjs');

// @desc    Get all staff
// @route   GET /api/staff
// @access  Admin
const getStaff = async (req, res) => {
  try {
    const staff = await Staff.find()
      .populate('user', 'name email phone status')
      .populate('department', 'name');
    res.json(staff);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get single staff
// @route   GET /api/staff/:id
// @access  Admin
const getStaffById = async (req, res) => {
  try {
    const staff = await Staff.findById(req.params.id)
      .populate('user', 'name email phone status')
      .populate('department', 'name');
    if (!staff) {
      return res.status(404).json({ message: 'Staff not found' });
    }
    res.json(staff);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Create staff (creates user + staff record)
// @route   POST /api/staff
// @access  Admin
const createStaff = async (req, res) => {
  const { name, email, password, phone, department } = req.body;

  try {
    if (!name || !email || !password || !department) {
      return res
        .status(400)
        .json({ message: 'Name, email, password and department are required' });
    }

    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ message: 'User already exists' });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create user with staff role
    const user = await User.create({
      name,
      email,
      password: hashedPassword,
      phone,
      role: 'staff',
      department,
    });

    // Create staff record
    const staff = await Staff.create({
      user: user._id,
      department,
      availability: 'available',
      workload: 0,
    });

    const populated = await Staff.findById(staff._id)
      .populate('user', 'name email phone status')
      .populate('department', 'name');

    res.status(201).json(populated);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update staff (availability, department)
// @route   PUT /api/staff/:id
// @access  Admin
const updateStaff = async (req, res) => {
  try {
    const staff = await Staff.findById(req.params.id);
    if (!staff) {
      return res.status(404).json({ message: 'Staff not found' });
    }

    staff.availability = req.body.availability || staff.availability;
    staff.department = req.body.department || staff.department;

    const updated = await staff.save();

    const populated = await Staff.findById(updated._id)
      .populate('user', 'name email phone status')
      .populate('department', 'name');

    res.json(populated);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Delete staff
// @route   DELETE /api/staff/:id
// @access  Admin
const deleteStaff = async (req, res) => {
  try {
    const staff = await Staff.findById(req.params.id);
    if (!staff) {
      return res.status(404).json({ message: 'Staff not found' });
    }

    // User ko bhi delete karein
    await User.findByIdAndDelete(staff.user);
    await staff.deleteOne();

    res.json({ message: 'Staff removed' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get staff assigned complaints
// @route   GET /api/staff/:id/complaints
// @access  Admin/Staff
const getStaffComplaints = async (req, res) => {
  try {
    const Complaint = require('../models/Complaint');
    const complaints = await Complaint.find({ assignedTo: req.params.id })
      .populate('user', 'name email')
      .sort({ createdAt: -1 });
    res.json(complaints);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  getStaff,
  getStaffById,
  createStaff,
  updateStaff,
  deleteStaff,
  getStaffComplaints,
};