const express = require('express');
const { 
  register, 
  login, 
  getMe,
  verifyToken
} = require('../controllers/auth');

const { protect } = require('../middleware/auth');

const router = express.Router();

router.post('/register', register);
router.post('/login', login);
router.get('/me', protect, getMe);
router.get('/verify-token', protect, verifyToken);

module.exports = router;
