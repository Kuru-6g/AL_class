const path = require('path');
const multer = require('multer');
const cloudinary = require('cloudinary').v2;
const { promisify } = require('util');
const fs = require('fs');

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

const upload = promisify(cloudinary.uploader.upload);

// Set storage engine
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const dir = './uploads';
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    cb(null, dir);
  },
  filename: function (req, file, cb) {
    cb(
      null,
      `payment-${Date.now()}${path.extname(file.originalname)}`
    );
  },
});

// Check file type
function checkFileType(file, cb) {
  // Allowed extensions
  const filetypes = /jpeg|jpg|png|pdf/;
  // Check extension
  const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
  // Check mime type
  const mimetype = filetypes.test(file.mimetype);

  if (extname && mimetype) {
    return cb(null, true);
  } else {
    cb(new Error('Images and PDFs only!'));
  }
}

// Initialize upload
const uploadFile = multer({
  storage: storage,
  limits: { fileSize: process.env.MAX_FILE_UPLOAD * 1024 * 1024 }, // 10MB max
  fileFilter: function (req, file, cb) {
    checkFileType(file, cb);
  },
}).single('slipImage');

// Upload to Cloudinary
const uploadToCloudinary = async (filePath) => {
  try {
    const result = await upload(filePath, {
      folder: 'chemistry-class/payments',
      use_filename: true,
      unique_filename: false,
      overwrite: true,
    });
    
    // Delete file from server after upload
    fs.unlinkSync(filePath);
    
    return result.secure_url;
  } catch (error) {
    console.error('Error uploading to Cloudinary:', error);
    throw new Error('Error uploading file');
  }
};

module.exports = {
  uploadFile,
  uploadToCloudinary,
};
