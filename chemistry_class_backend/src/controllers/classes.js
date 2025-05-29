const Class = require('../models/Class');
const ErrorResponse = require('../utils/errorResponse');
const asyncHandler = require('../middleware/async');

// @desc    Get all classes
// @route   GET /api/classes
// @access  Public
exports.getClasses = asyncHandler(async (req, res, next) => {
  res.status(200).json(res.advancedResults);
});

// @desc    Get single class
// @route   GET /api/classes/:id
// @access  Public
exports.getClass = asyncHandler(async (req, res, next) => {
  const classItem = await Class.findById(req.params.id)
    .populate('teacher', 'fullName email')
    .populate('enrolledStudents', 'fullName email');

  if (!classItem) {
    return next(
      new ErrorResponse(`Class not found with id of ${req.params.id}`, 404)
    );
  }

  res.status(200).json({
    success: true,
    data: classItem
  });
});

// @desc    Create new class
// @route   POST /api/classes
// @access  Private/Admin
exports.createClass = asyncHandler(async (req, res, next) => {
  // Add user to req.body
  req.body.teacher = req.user.id;

  const classItem = await Class.create(req.body);

  res.status(201).json({
    success: true,
    data: classItem
  });
});

// @desc    Update class
// @route   PUT /api/classes/:id
// @access  Private/Admin
exports.updateClass = asyncHandler(async (req, res, next) => {
  let classItem = await Class.findById(req.params.id);

  if (!classItem) {
    return next(
      new ErrorResponse(`Class not found with id of ${req.params.id}`, 404)
    );
  }

  // Make sure user is class owner or admin
  if (classItem.teacher.toString() !== req.user.id && req.user.role !== 'admin') {
    return next(
      new ErrorResponse(
        `User ${req.user.id} is not authorized to update this class`,
        401
      )
    );
  }

  classItem = await Class.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true
  });

  res.status(200).json({
    success: true,
    data: classItem
  });
});

// @desc    Delete class
// @route   DELETE /api/classes/:id
// @access  Private/Admin
exports.deleteClass = asyncHandler(async (req, res, next) => {
  const classItem = await Class.findById(req.params.id);

  if (!classItem) {
    return next(
      new ErrorResponse(`Class not found with id of ${req.params.id}`, 404)
    );
  }

  // Make sure user is class owner or admin
  if (classItem.teacher.toString() !== req.user.id && req.user.role !== 'admin') {
    return next(
      new ErrorResponse(
        `User ${req.user.id} is not authorized to delete this class`,
        401
      )
    );
  }

  await classItem.remove();

  res.status(200).json({
    success: true,
    data: {}
  });
});

// @desc    Enroll in a class
// @route   POST /api/classes/:id/enroll
// @access  Private
exports.enrollInClass = asyncHandler(async (req, res, next) => {
  const classItem = await Class.findById(req.params.id);

  if (!classItem) {
    return next(
      new ErrorResponse(`Class not found with id of ${req.params.id}`, 404)
    );
  }

  // Check if already enrolled
  if (
    classItem.enrolledStudents.some(
      student => student.toString() === req.user.id
    )
  ) {
    return next(
      new ErrorResponse('You are already enrolled in this class', 400)
    );
  }

  // Check if class is full
  if (classItem.enrolledStudents.length >= classItem.maxStudents) {
    return next(new ErrorResponse('This class is full', 400));
  }

  // Add student to class
  classItem.enrolledStudents.push(req.user.id);
  await classItem.save();

  res.status(200).json({
    success: true,
    data: classItem
  });
});

// @desc    Get classes by user
// @route   GET /api/classes/my-classes
// @access  Private
exports.getMyClasses = asyncHandler(async (req, res, next) => {
  const classes = await Class.find({ enrolledStudents: req.user.id })
    .populate('teacher', 'fullName email')
    .sort({ createdAt: -1 });

  res.status(200).json({
    success: true,
    count: classes.length,
    data: classes
  });
});
