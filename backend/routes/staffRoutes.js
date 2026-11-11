const express = require('express');
const router = express.Router();
const {
  getStaff,
  getStaffById,
  createStaff,
  updateStaff,
  deleteStaff,
  getStaffComplaints,
} = require('../controllers/staffController');
const { protect, adminOnly } = require('../middleware/authMiddleware');

router
  .route('/')
  .get(protect, adminOnly, getStaff)
  .post(protect, adminOnly, createStaff);

router
  .route('/:id')
  .get(protect, adminOnly, getStaffById)
  .put(protect, adminOnly, updateStaff)
  .delete(protect, adminOnly, deleteStaff);

router.get('/:id/complaints', protect, getStaffComplaints);

module.exports = router;