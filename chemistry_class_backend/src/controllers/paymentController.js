const Payment = require('../models/Payment');
const asyncHandler = require('../middleware/async');
const ErrorResponse = require('../utils/errorResponse');
const { uploadFile, uploadMultipleFiles, uploadToCloudinary } = require('../utils/fileUpload');

// @desc    Submit payment
// @route   POST /api/payments
// @access  Public
exports.submitPayment = asyncHandler(async (req, res, next) => {
  // Handle multiple file uploads
  uploadMultipleFiles(req, res, async (err) => {
    if (err) {
      console.error('File upload error:', err);
      return next(new ErrorResponse(`Error uploading file: ${err.message}`, 400));
    }

    try {
      console.log('Payment submission received:', req.body);
      console.log('Files received:', req.files);

      let paymentSlipUrl = "https://placeholder.com/payment-slip.jpg";
      let nicFrontUrl = "https://placeholder.com/nic-front.jpg";
      let nicBackUrl = "https://placeholder.com/nic-back.jpg";

      // Upload payment slip to Cloudinary if available
      if (req.files && req.files.slipImage && req.files.slipImage[0]) {
        try {
          paymentSlipUrl = await uploadToCloudinary(req.files.slipImage[0].path);
        } catch (uploadError) {
          console.error('Payment slip upload error:', uploadError);
          // Continue with placeholder URL
        }
      }

      // Upload NIC front image to Cloudinary if available
      if (req.files && req.files.nicFrontImage && req.files.nicFrontImage[0]) {
        try {
          nicFrontUrl = await uploadToCloudinary(req.files.nicFrontImage[0].path);
        } catch (uploadError) {
          console.error('NIC front upload error:', uploadError);
          // Continue with placeholder URL
        }
      }

      // Upload NIC back image to Cloudinary if available
      if (req.files && req.files.nicBackImage && req.files.nicBackImage[0]) {
        try {
          nicBackUrl = await uploadToCloudinary(req.files.nicBackImage[0].path);
        } catch (uploadError) {
          console.error('NIC back upload error:', uploadError);
          // Continue with placeholder URL
        }
      }

      // Parse class IDs
      const classIds = req.body.classIds ? req.body.classIds.split(',') : [];

      // Generate a reference number
      const referenceNumber = `PAY-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`.toUpperCase();

      // Create payment record
      const payment = await Payment.create({
        userId: req.body.userId || "6845aa922d4927392bcd3965", // Use default ID if not provided
        classIds,
        zoomGmail: req.body.zoomGmail,
        referenceNumber,
        paymentSlipUrl,
        receiptType: req.body.receiptType,
        userDetails: {
          fullName: req.body.fullName || "Test User",
          phoneNumber: req.body.phoneNumber || "1234567890",
          nic: req.body.nic || "123456789V",
          district: req.body.district || "Test District",
          nicFrontUrl,
          nicBackUrl
        },
        status: 'submitted'
      });

      res.status(201).json({
        success: true,
        data: payment
      });
    } catch (error) {
      console.error('Payment processing error:', error);
      return next(new ErrorResponse(`Error processing payment: ${error.message}`, 500));
    }
  });
});

// @desc    Get all payments
// @route   GET /api/payments
// @access  Private/Admin
exports.getPayments = asyncHandler(async (req, res, next) => {
  const payments = await Payment.find().sort('-createdAt');

  res.status(200).json({
    success: true,
    count: payments.length,
    data: payments
  });
});

// @desc    Get payment by ID
// @route   GET /api/payments/:id
// @access  Private
exports.getPayment = asyncHandler(async (req, res, next) => {
  const payment = await Payment.findById(req.params.id);

  if (!payment) {
    return next(new ErrorResponse(`Payment not found with id of ${req.params.id}`, 404));
  }

  res.status(200).json({
    success: true,
    data: payment
  });
});

// @desc    Update payment status
// @route   PUT /api/payments/:id
// @access  Private/Admin
exports.updatePaymentStatus = asyncHandler(async (req, res, next) => {
  const { status } = req.body;

  if (!['submitted', 'approved', 'rejected'].includes(status)) {
    return next(new ErrorResponse('Invalid status value', 400));
  }

  const payment = await Payment.findByIdAndUpdate(
    req.params.id,
    { status, updatedAt: Date.now() },
    { new: true, runValidators: true }
  );

  if (!payment) {
    return next(new ErrorResponse(`Payment not found with id of ${req.params.id}`, 404));
  }

  res.status(200).json({
    success: true,
    data: payment
  });
});