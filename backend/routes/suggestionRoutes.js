const express = require('express');
const router = express.Router();
const { createSuggestion } = require('../controllers/suggestionController');
const { protect } = require('../middleware/authMiddleware');

router.post('/', protect, createSuggestion);

module.exports = router;