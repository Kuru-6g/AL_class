const express = require('express');
const { protect } = require('../middleware/auth');
const { createOrFindGoogleUser,
} = require('../controllers/userController');

const router = express.Router();

// ✅ Public route for Google SSO user registration
router.post('/create', createOrFindGoogleUser);

// ✅ Now protect the rest
router.use(protect);


// ✅ Correct placement of export
module.exports = router;
