const express = require('express');
const { protect } = require('../middleware/auth');
const adminProtect = require('../middleware/admin');
const { 
  getUsers,
  getUser,
  updateUser,
  deleteUser 
} = require('../controllers/userController');

const router = express.Router();

// Protect all routes with both authentication and admin check
router.use(protect);
router.use(adminProtect);

// Admin routes
router.get('/users', getUsers);
router.get('/users/:id', getUser);
router.put('/users/:id', updateUser);
router.delete('/users/:id', deleteUser);

module.exports = router;
