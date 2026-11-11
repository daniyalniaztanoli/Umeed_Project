const express = require('express');
const router = express.Router();
const { getEvents, createEvent } = require('../controllers/eventController');
const { protect, adminOnly } = require('../middleware/authMiddleware');

router.get('/', protect, getEvents);
router.post('/', protect, adminOnly, createEvent);

module.exports = router;