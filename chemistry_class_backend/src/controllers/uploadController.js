const path = require('path');
const multer = require('multer');
const ErrorResponse = require('../utils/errorResponse');
const asyncHandler = require('../middleware/async');
const fs = require('fs');

// Set up multer storage
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const uploadDir = path.join(process.cwd(), 'uploads');
    // Create uploads directory if it doesn't exist
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    // Create unique filename
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, `${file.fieldname}-${uniqueSuffix}${path.extname(file.originalname)}`);
  },
});

// File filter
const fileFilter = (req, file, cb) => {
  // Accept images only
  if (!file.originalname.match(/\.(jpg|jpeg|png|gif)$/i)) {
    return cb(new Error('Only image files are allowed!'), false);
  }
  cb(null, true);
};

// Initialize upload
const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
});

// Middleware to handle single file upload
const uploadFile = upload.single('image');

// @desc    Upload a file
// @route   POST /upload
// @access  Private
exports.uploadFile = [
  (req, res, next) => {
    uploadFile(req, res, function (err) {
      if (err instanceof multer.MulterError) {
        // A Multer error occurred when uploading
        return next(new ErrorResponse(`File upload error: ${err.message}`, 400));
      } else if (err) {
        // An unknown error occurred
        return next(new ErrorResponse(err.message, 500));
      }
      next();
    });
  },
  asyncHandler(async (req, res, next) => {
    if (!req.file) {
      return next(new ErrorResponse('No file uploaded', 400));
    }

    // In a production environment, you might want to upload to a cloud storage service
    // like AWS S3, Google Cloud Storage, etc., and return the public URL
    
    // For local development, return the relative path
    const fileUrl = `/uploads/${req.file.filename}`;

    res.status(200).json({
      success: true,
      url: fileUrl,
    });
  }),
];

// @desc    Delete a file
// @route   DELETE /upload/:filename
// @access  Private
exports.deleteFile = asyncHandler(async (req, res, next) => {
  const filePath = path.join(process.cwd(), 'uploads', req.params.filename);
  
  // Check if file exists
  if (fs.existsSync(filePath)) {
    // Delete file
    fs.unlink(filePath, (err) => {
      if (err) {
        console.error('Error deleting file:', err);
        return next(new ErrorResponse('Error deleting file', 500));
      }
      
      res.status(200).json({
        success: true,
        message: 'File deleted successfully',
      });
    });
  } else {
    return next(new ErrorResponse('File not found', 404));
  }
});
