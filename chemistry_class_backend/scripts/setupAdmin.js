const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const dotenv = require('dotenv');
const path = require('path');
const User = require('../src/models/User');

// Load environment variables from the parent directory
const envPath = path.join(__dirname, '..', '.env');
dotenv.config({ path: envPath });

const ADMIN_EMAIL = 'guru21sm@gmail.com';
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'admin@123';

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('MongoDB Connected...');
  } catch (err) {
    console.error('Database connection error:', err.message);
    process.exit(1);
  }
};

const setupAdmin = async () => {
  try {
    await connectDB();
    
    // Check if admin already exists
    let admin = await User.findOne({ email: ADMIN_EMAIL });
    
    if (admin) {
      console.log('Admin user already exists');
      process.exit(0);
    }
    
    // Create admin user
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(ADMIN_PASSWORD, salt);
    
    admin = await User.create({
      fullName: 'Admin User',
      email: ADMIN_EMAIL,
      password: hashedPassword,
      phoneNumber: '1234567890',
      nic: '123456789V',
      district: 'Colombo',
      role: 'admin'
    });
    
    console.log('Admin user created successfully');
    console.log(`Email: ${ADMIN_EMAIL}`);
    console.log(`Password: ${ADMIN_PASSWORD}`);
    console.log('Please change this password after first login!');
    
    process.exit(0);
  } catch (error) {
    console.error('Error setting up admin:', error.message);
    process.exit(1);
  }
};

setupAdmin();
