const Payment = require('../models/Payment');
const Enrollment = require('../models/Enrollment');
const ErrorResponse = require('../utils/errorResponse');
const asyncHandler = require('../middleware/async');
const { uploadToCloudinary } = require('../utils/fileUpload');
const path = require('path');

// @desc    Get all payments
// @route   GET /api/payments
// @access  Private/Admin
exports.getPayments = asyncHandler(async (req, res, next) => {
  res.status(200).json(res.advancedResults);
});

// @desc    Get single payment
// @route   GET /api/payments/:id
// @access  Private
exports.getPayment = asyncHandler(async (req, res, next) => {
  const payment = await Payment.findById(req.params.id)
    .populate('user', 'fullName email')
    .populate('verifiedBy', 'fullName email');

  if (!payment) {
    return next(
      new ErrorResponse(`Payment not found with id of ${req.params.id}`, 404)
    );
  }

  // Make sure user is payment owner or admin
  if (
    payment.user._id.toString() !== req.user.id &&
    req.user.role !== 'admin'
  ) {
    return next(
      new ErrorResponse(
        `User ${req.user.id} is not authorized to view this payment`,
        401
      )
    );
  }

  res.status(200).json({
    success: true,
    data: payment
  });
});

// @desc    Create new payment
// @route   POST /api/payments
// @access  Private
exports.createPayment = asyncHandler(async (req, res, next) => {
  // Add user to req.body
  req.body.user = req.user.id;

  // Upload slip image to Cloudinary if file exists
  if (req.file) {
    const filePath = path.join(__dirname, `../../${req.file.path}`);
    const result = await uploadToCloudinary(filePath);
    req.body.slipImage = result;
  }

  const payment = await Payment.create(req.body);

  res.status(201).json({
    success: true,
    data: payment
  });
});

// @desc    Update payment status
// @route   PUT /api/payments/:id/status
// @access  Private/Admin
exports.updatePaymentStatus = asyncHandler(async (req, res, next) => {
  const { status, remarks } = req.body;

  let payment = await Payment.findById(req.params.id);

  if (!payment) {
    return next(
      new ErrorResponse(`Payment not found with id of ${req.params.id}`, 404)
    );
  }

  // Update payment status
  payment.status = status;
  payment.remarks = remarks;
  payment.verifiedBy = req.user.id;
  payment.verifiedAt = Date.now();

  await payment.save();

  // If payment is verified, create enrollment
  if (status === 'verified') {
    // Check if enrollment already exists
    const existingEnrollment = await Enrollment.findOne({
      user: payment.user,
      payment: payment._id
    });

    if (!existingEnrollment) {
      // Create new enrollment
      await Enrollment.create({
        user: payment.user,
        class: payment.class,
        payment: payment._id,
        status: 'approved'
      });
    }
  }

  res.status(200).json({
    success: true,
    data: payment
  });
});

// @desc    Get payments by user
// @route   GET /api/payments/my-payments
// @access  Private
exports.getMyPayments = asyncHandler(async (req, res, next) => {
  const payments = await Payment.find({ user: req.user.id })
    .sort({ paidAt: -1 })
    .populate('verifiedBy', 'fullName');

  res.status(200).json({
    success: true,
    count: payments.length,
    data: payments
  });
});
