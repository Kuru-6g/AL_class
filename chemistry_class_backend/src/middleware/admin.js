const ErrorResponse = require('../utils/errorResponse');
const asyncHandler = require('./async');

// @desc    Protect routes - only admin can access
// @type    Middleware
// @access  Private
const adminProtect = asyncHandler(async (req, res, next) => {
  const adminEmail = 'guru21sm@gmail.com';
  
  // Check if user is logged in and is the admin
  if (!req.user || req.user.email !== adminEmail) {
    return next(
      new ErrorResponse(
        `User ${req.user ? req.user.email : 'not logged in'} is not authorized to access this route`,
        403
      )
    );
  }

  next();
});

module.exports = adminProtect;
