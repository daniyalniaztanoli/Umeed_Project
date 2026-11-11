const User = require('../models/User');
const Department = require('../models/Department');
const bcrypt = require('bcryptjs');
const generateToken = require('../utils/generateToken');

// ==========================================
// @desc    Register new user
// @route   POST /api/auth/register
// @access  Public
// ==========================================
const registerUser = async (req, res) => {
  const { name, email, password, phone, city, role, department } = req.body;

  try {
    // Validation
    if (!name || !email || !password) {
      return res
        .status(400)
        .json({ message: 'Name, email and password are required' });
    }

    if (password.length < 6) {
      return res
        .status(400)
        .json({ message: 'Password must be at least 6 characters' });
    }

    if (!phone || !phone.trim()) {
      return res.status(400).json({ message: 'Phone number is required' });
    }

    if (!city || !city.trim()) {
      return res.status(400).json({ message: 'City is required' });
    }

    // Check existing user
    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ message: 'User already exists' });
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create user (role default 'user', sirf admin hi 'admin' bana sakta hai)
    let profilePic;
    if (req.file) {
      profilePic = `${req.protocol}://${req.get('host')}/uploads/${req.file.filename}`;
    } else if (typeof req.body.profilePic === 'string' && req.body.profilePic) {
      profilePic = req.body.profilePic;
    }

    const user = await User.create({
      name,
      email,
      password: hashedPassword,
      phone: phone.trim(),
      city: city.trim(),
      role: role || 'user',
      department: department || null,
      profilePic,
    });

    if (user) {
      res.status(201).json({
        _id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        city: user.city,
        role: user.role,
        department: user.department,
        profilePic: user.profilePic,
        token: generateToken(user._id),
      });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ==========================================
// @desc    Login user
// @route   POST /api/auth/login
// @access  Public
// ==========================================
const loginUser = async (req, res) => {
  const { email, password } = req.body;

  try {
    if (!email || !password) {
      return res
        .status(400)
        .json({ message: 'Email and password are required' });
    }

    const user = await User.findOne({
      email: String(email).trim().toLowerCase(),
    }).populate('department');

    if (!user) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    if (user.status === 'inactive') {
      return res.status(403).json({ message: 'Account is deactivated' });
    }

    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    res.json({
      _id: user._id,
      name: user.name,
      email: user.email,
      phone: user.phone,
      city: user.city,
      role: user.role,
      department: user.department,
      profilePic: user.profilePic,
      token: generateToken(user._id),
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ==========================================
// @desc    Get current user profile
// @route   GET /api/auth/me
// @access  Private
// ==========================================
const getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user._id)
      .select('-password')
      .populate('department');
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ==========================================
// @desc    Update profile
// @route   PUT /api/auth/profile
// @access  Private
// ==========================================
const updateProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    user.name = req.body.name || user.name;
    user.phone = req.body.phone || user.phone;
    user.city = req.body.city || user.city;
    user.language = req.body.language || user.language;
    user.profilePic = req.body.profilePic || user.profilePic;

    const updatedUser = await user.save();

    res.json({
      _id: updatedUser._id,
      name: updatedUser.name,
      email: updatedUser.email,
      phone: updatedUser.phone,
      city: updatedUser.city,
      role: updatedUser.role,
      profilePic: updatedUser.profilePic,
      language: updatedUser.language,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ==========================================
// @desc    Change password
// @route   PUT /api/auth/change-password
// @access  Private
// ==========================================
const changePassword = async (req, res) => {
  const { currentPassword, newPassword } = req.body;

  try {
    if (!currentPassword || !newPassword) {
      return res
        .status(400)
        .json({ message: 'Current and new password are required' });
    }

    if (newPassword.length < 6) {
      return res
        .status(400)
        .json({ message: 'New password must be at least 6 characters' });
    }

    const user = await User.findById(req.user._id);

    const isMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Current password is incorrect' });
    }

    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(newPassword, salt);
    await user.save();

    res.json({ message: 'Password updated successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ==========================================
// @desc    Create admin user (sirf existing admin)
// @route   POST /api/auth/create-admin
// @access  Private/Admin
// ==========================================
const createAdmin = async (req, res) => {
  const { name, email, password, phone } = req.body;

  try {
    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ message: 'User already exists' });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const user = await User.create({
      name,
      email,
      password: hashedPassword,
      phone,
      role: 'admin',
    });

    res.status(201).json({
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ==========================================
// @desc    Forgot password (verify email + phone, then reset)
// @route   POST /api/auth/forgot-password
// @access  Public
// ==========================================
const forgotPassword = async (req, res) => {
  const { email, phone, newPassword } = req.body;

  try {
    if (!email || !phone || !newPassword) {
      return res
        .status(400)
        .json({ message: 'Email, phone and new password are required' });
    }

    if (String(newPassword).length < 6) {
      return res
        .status(400)
        .json({ message: 'Password must be at least 6 characters' });
    }

    const user = await User.findOne({ email: String(email).trim().toLowerCase() });
    if (!user) {
      return res.status(404).json({ message: 'No account found with this email' });
    }

    // Phone must exactly match the registered phone (trimmed)
    if (!user.phone || user.phone.trim() !== String(phone).trim()) {
      return res.status(400).json({ message: 'Phone number does not match our records' });
    }

    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(newPassword, salt);
    await user.save();

    res.json({ message: 'Password updated successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  registerUser,
  loginUser,
  getMe,
  updateProfile,
  changePassword,
  createAdmin,
  forgotPassword,
};