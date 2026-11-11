const express = require('express');
const router = express.Router();
const {
  getDepartments,
  getDepartmentById,
  createDepartment,
  updateDepartment,
  deleteDepartment,
} = require('../controllers/departmentController');
const { protect, adminOnly } = require('../middleware/authMiddleware');

router
  .route('/')
  .get(getDepartments)
  .post(protect, adminOnly, createDepartment);

router
  .route('/:id')
  .get(getDepartmentById)
  .put(protect, adminOnly, updateDepartment)
  .delete(protect, adminOnly, deleteDepartment);

module.exports = router;