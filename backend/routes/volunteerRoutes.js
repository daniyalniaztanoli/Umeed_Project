const express = require('express');
const router = express.Router();
const { createVolunteer, getVolunteers } = require('../controllers/volunteerController');
const { protect, adminOnly } = require('../middleware/authMiddleware');

router
  .route('/')
  .get(protect, adminOnly, getVolunteers)
  .post(protect, createVolunteer);

module.exports = router;