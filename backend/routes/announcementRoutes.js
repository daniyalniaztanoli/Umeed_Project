const express = require('express');
const router = express.Router();
const {
  getAnnouncements,
  getAnnouncementById,
  createAnnouncement,
  updateAnnouncement,
  deleteAnnouncement,
} = require('../controllers/announcementController');
const { protect, adminOnly } = require('../middleware/authMiddleware');

router
  .route('/')
  .get(getAnnouncements)
  .post(protect, adminOnly, createAnnouncement);

router
  .route('/:id')
  .get(getAnnouncementById)
  .put(protect, adminOnly, updateAnnouncement)
  .delete(protect, adminOnly, deleteAnnouncement);

module.exports = router;