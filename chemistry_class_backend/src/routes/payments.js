const express = require('express');
const {
  getPayments,
  getPayment,
  createPayment,
  updatePaymentStatus,
  getMyPayments
} = require('../controllers/payments');

const { protect, authorize } = require('../middleware/auth');
const advancedResults = require('../middleware/advancedResults');
const Payment = require('../models/Payment');
const { uploadFile } = require('../utils/fileUpload');

const router = express.Router();

// Protected routes
router.use(protect);

router.get('/my-payments', getMyPayments);

router.post(
  '/',
  uploadFile,
  createPayment
);

// Admin routes
router.use(authorize('admin'));

router
  .route('/')
  .get(
    advancedResults(Payment, [
      { path: 'user', select: 'fullName email' },
      { path: 'verifiedBy', select: 'fullName email' }
    ]),
    getPayments
  );

router
  .route('/:id')
  .get(getPayment);

router
  .route('/:id/status')
  .put(updatePaymentStatus);

module.exports = router;
