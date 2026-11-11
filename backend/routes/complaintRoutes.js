const express = require('express');
const router = express.Router();
const path = require('path');
const fs = require('fs');
const {
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
} = require('../controllers/complaintController');
const { protect, adminOnly, allowRoles } = require('../middleware/authMiddleware');
const upload = require('../middleware/upload');

// Stats (admin only) - MUST be before /:id
router.get('/stats', protect, adminOnly, getComplaintStats);

// User's own complaints
router.get('/mine', protect, getMyComplaints);

// Create + List
router
  .route('/')
  .get(protect, getComplaints)
  .post(protect, createComplaint);

// Single complaint
router.get('/:id', protect, getComplaintById);

// Admin actions
router.put('/:id/assign', protect, adminOnly, assignComplaint);
router.put('/:id/priority', protect, adminOnly, updatePriority);

// Status update (admin or staff)
router.put(
  '/:id/status',
  protect,
  allowRoles('admin', 'staff'),
  upload.single('photo'),
  updateComplaintStatus
);

// User actions
router.post('/:id/feedback', protect, submitFeedback);
router.put('/:id/reopen', protect, reopenComplaint);
router.post('/:id/comments', protect, addComplaintComment);

module.exports = router;
