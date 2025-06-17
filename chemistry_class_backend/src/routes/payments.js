const express = require('express');
const { protect } = require('../middleware/auth');
const {
  submitPayment,
  getPayments,
  getPayment,
  updatePaymentStatus
} = require('../controllers/paymentController');

const router = express.Router();

// Public routes
router.post('/', submitPayment);

// Protected routes
router.use(protect);
router.get('/', getPayments);
router.get('/:id', getPayment);
router.put('/:id', updatePaymentStatus);

module.exports = router;