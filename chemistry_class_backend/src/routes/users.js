const express = require('express');
const { protect } = require('../middleware/auth');
const {
  getUserProfile,
  updateProfile,
  updatePassword,
  deleteAccount,
  createOrFindGoogleUser,
} = require('../controllers/userController');

const router = express.Router();

// ✅ Public route for Google SSO user registration
router.post('/create', createOrFindGoogleUser);

// ✅ Now protect the rest
router.use(protect);

router.route('/me').get(getUserProfile);
router.route('/update-profile').put(updateProfile);
router.route('/update-password').put(updatePassword);
router.route('/delete-account').delete(deleteAccount);

// ✅ Correct placement of export
module.exports = router;
