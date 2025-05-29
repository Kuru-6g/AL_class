const express = require('express');
const { protect } = require('../middleware/auth');
const {
  getUserProfile,
  updateProfile,
  updatePassword,
  deleteAccount
} = require('../controllers/userController');

const router = express.Router();

// Protected routes (require authentication)
router.use(protect);

router.route('/me')
  .get(getUserProfile);

router.route('/update-profile')
  .put(updateProfile);

router.route('/update-password')
  .put(updatePassword);

router.route('/delete-account')
  .delete(deleteAccount);

module.exports = router;
