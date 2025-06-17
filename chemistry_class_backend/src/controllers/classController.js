const ChemistryClass = require('../models/ChemistryClass');
const asyncHandler = require('../middleware/async');
const ErrorResponse = require('../utils/errorResponse');

// @desc    Get all chemistry classes
// @route   GET /api/classes
// @access  Public
exports.getClasses = asyncHandler(async (req, res, next) => {
  const classes = await ChemistryClass.find({ isActive: true });
  
  res.status(200).json({
    success: true,
    count: classes.length,
    data: classes
  });
});

// @desc    Get single chemistry class
// @route   GET /api/classes/:id
// @access  Public
exports.getClass = asyncHandler(async (req, res, next) => {
  const chemistryClass = await ChemistryClass.findById(req.params.id);
  
  if (!chemistryClass) {
    return next(new ErrorResponse(`Class not found with id of ${req.params.id}`, 404));
  }
  
  res.status(200).json({
    success: true,
    data: chemistryClass
  });
});

// @desc    Create new chemistry class
// @route   POST /api/classes
// @access  Public (temporarily for testing)
exports.createClass = asyncHandler(async (req, res, next) => {
  // Use a default ID for testing
  req.body.createdBy = "6845aa922d4927392bcd3965"; // Use your admin ID
  
  const chemistryClass = await ChemistryClass.create(req.body);
  
  res.status(201).json({
    success: true,
    data: chemistryClass
  });
});

// @desc    Update chemistry class
// @route   PUT /api/classes/:id
// @access  Public (temporarily for testing)
exports.updateClass = asyncHandler(async (req, res, next) => {
  let chemistryClass = await ChemistryClass.findById(req.params.id);
  
  if (!chemistryClass) {
    return next(new ErrorResponse(`Class not found with id of ${req.params.id}`, 404));
  }
  
  // Skip authorization check for testing
  
  // Update the updatedAt field
  req.body.updatedAt = Date.now();
  
  chemistryClass = await ChemistryClass.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true
  });
  
  res.status(200).json({
    success: true,
    data: chemistryClass
  });
});

// @desc    Delete chemistry class
// @route   DELETE /api/classes/:id
// @access  Private
exports.deleteClass = asyncHandler(async (req, res, next) => {
  const chemistryClass = await ChemistryClass.findById(req.params.id);
  
  if (!chemistryClass) {
    return next(new ErrorResponse(`Class not found with id of ${req.params.id}`, 404));
  }
  
  // Make sure user is class owner or admin
  if (chemistryClass.createdBy.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
    return next(new ErrorResponse(`User ${req.user._id} is not authorized to delete this class`, 401));
  }
  
  await ChemistryClass.findByIdAndDelete(req.params.id);
  
  res.status(200).json({
    success: true,
    data: {}
  });
});