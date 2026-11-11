const express = require('express');
const router = express.Router();
const {
  registerUser,
  loginUser,
  getMe,
  updateProfile,
  changePassword,
  createAdmin,
  forgotPassword,
  adminLogin,
} = require('../controllers/authController');
const { protect, adminOnly } = require('../middleware/authMiddleware');
const upload = require('../middleware/upload');

// Public routes
router.post('/register', upload.single('profilePic'), registerUser);
router.post('/login', loginUser);
router.post('/admin/login', adminLogin);
router.post('/forgot-password', forgotPassword);

// Private routes
router.get('/me', protect, getMe);
router.put('/profile', protect, updateProfile);
router.put('/change-password', protect, changePassword);

// Admin-only routes
router.post('/create-admin', protect, adminOnly, createAdmin);

module.exports = router;
