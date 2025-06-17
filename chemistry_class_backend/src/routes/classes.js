const express = require('express');
const { protect } = require('../middleware/auth');
const {
  getClasses,
  getClass,
  createClass,
  updateClass,
  deleteClass
} = require('../controllers/classController');

const router = express.Router();

// Public routes
router.get('/', getClasses);
router.get('/:id', getClass);

// Protected routes
router.use(protect);
router.post('/', createClass);
router.put('/:id', updateClass);
router.delete('/:id', deleteClass);

module.exports = router;