const express = require('express');
const {
  getClasses,
  getClass,
  createClass,
  updateClass,
  deleteClass,
  enrollInClass,
  getMyClasses
} = require('../controllers/classes');

const { protect, authorize } = require('../middleware/auth');
const advancedResults = require('../middleware/advancedResults');
const Class = require('../models/Class');

const router = express.Router();

// Public routes
router
  .route('/')
  .get(
    advancedResults(Class, {
      path: 'teacher',
      select: 'fullName email'
    }),
    getClasses
  );

router.route('/:id').get(getClass);

// Protected routes
router.use(protect);

router.get('/my-classes', getMyClasses);
router.post('/:id/enroll', enrollInClass);

// Admin/Teacher routes
router.use(authorize('admin', 'teacher'));

router.route('/').post(createClass);

router
  .route('/:id')
  .put(updateClass)
  .delete(deleteClass);

module.exports = router;
