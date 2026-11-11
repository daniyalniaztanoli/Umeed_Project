const express = require('express');
const router = express.Router();
const { getBloodDonors } = require('../controllers/bloodDonorController');
const { protect } = require('../middleware/authMiddleware');

router.get('/', protect, getBloodDonors);

module.exports = router;