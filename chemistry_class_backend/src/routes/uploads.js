const express = require('express');
const { protect } = require('../middleware/auth');
const { uploadFile, deleteFile } = require('../controllers/uploadController');

const router = express.Router();

// Protected routes (require authentication)
router.use(protect);

router.route('/')
  .post(uploadFile);

router.route('/:filename')
  .delete(deleteFile);

module.exports = router;
