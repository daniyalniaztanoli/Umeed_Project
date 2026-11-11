const express = require('express');
const router = express.Router();
const upload = require('../middleware/upload');
const { protect, adminOnly } = require('../middleware/authMiddleware');
const { createDonation, getMyDonations, getDonationById, getTransparency, getImpactStories, getAllDonations, updateDonationStatus } = require('../controllers/donationController');

router.get('/', getAllDonations);
router.put('/:id/status', protect, adminOnly, updateDonationStatus);
router.post('/', protect, upload.single('proof'), createDonation);
router.get('/mine', protect, getMyDonations);
router.get('/transparency', getTransparency);
router.get('/impact-stories', getImpactStories);
router.get('/:id', protect, getDonationById);

module.exports = router;