const express = require('express');
const router = express.Router();
const {
  createWelfareRequest,
  getMyWelfareRequests,
  getWelfareRequests,
  getWelfareRequestById,
  reviewWelfareRequest,
  approveWelfareRequest,
  rejectWelfareRequest,
  disburseWelfareRequest,
  getWelfareStats,
} = require('../controllers/welfareController');
const {
  protect,
  adminOnly,
  allowRoles,
} = require('../middleware/authMiddleware');
const upload = require('../middleware/upload');

// Stats (admin only) - MUST be before /:id
router.get('/stats', protect, adminOnly, getWelfareStats);
// Current user's own requests - MUST be before /:id
router.get('/mine', protect, getMyWelfareRequests);

// Create + List
router
  .route('/')
  .get(protect, getWelfareRequests)
  .post(protect, upload.array('documents', 5), createWelfareRequest);

// Single request
router.get('/:id', protect, getWelfareRequestById);

// Admin/Finance actions
router.put(
  '/:id/review',
  protect,
  allowRoles('admin', 'finance_officer'),
  reviewWelfareRequest
);
router.put(
  '/:id/approve',
  protect,
  allowRoles('admin', 'finance_officer'),
  approveWelfareRequest
);
router.put(
  '/:id/reject',
  protect,
  allowRoles('admin', 'finance_officer'),
  rejectWelfareRequest
);
router.put(
  '/:id/disburse',
  protect,
  allowRoles('admin', 'finance_officer'),
  upload.single('proof'),
  disburseWelfareRequest
);

module.exports = router;