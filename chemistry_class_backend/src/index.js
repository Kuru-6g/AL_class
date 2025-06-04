require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const morgan = require('morgan');
const path = require('path');
const fs = require('fs');


const userRoutes = require('./routes/users');

const app = express();

// CORS Configuration
const corsOptions = {
  origin: [
    'http://localhost:19006',
    'http://localhost:19007',
    'http://localhost:3000',
    'http://localhost:8082',
    'http://10.10.45.141:19006',  // Add your local IP with Expo port
    'http://10.10.45.141:19002',  // Add your local IP with Expo port
    'exp://*',
    'http://*',
    'https://*'
  ],
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'Accept'],
  credentials: true,
  optionsSuccessStatus: 200
};

// Middleware
app.use(cors(corsOptions));
app.use(express.json());
app.use(morgan('dev'));

// Handle preflight requests
app.options('*', cors(corsOptions));
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// Database connection
mongoose.connect(process.env.MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => console.log('Connected to MongoDB'))
.catch(err => console.error('MongoDB connection error:', err));

// Routes

app.use('/api/users', userRoutes);


// Serve static files from uploads directory
const uploadsDir = path.join(__dirname, '../uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}
app.use('/uploads', express.static(uploadsDir));

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok', message: 'Server is running' });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Error:', err);
  
  // Default error status and message
  let statusCode = err.statusCode || 500;
  let errorMessage = err.message || 'Something went wrong!';
  
  // Handle specific error types
  if (err.name === 'ValidationError') {
    statusCode = 400;
    errorMessage = Object.values(err.errors).map(val => val.message).join(', ');
  } else if (err.code === 11000) {
    statusCode = 400;
    errorMessage = 'Duplicate field value entered';
  } else if (err.name === 'JsonWebTokenError') {
    statusCode = 401;
    errorMessage = 'Not authorized, token failed';
  } else if (err.name === 'TokenExpiredError') {
    statusCode = 401;
    errorMessage = 'Session expired, please log in again';
  }
  
  // Log the error for debugging
  if (statusCode >= 500) {
    console.error('Server Error:', err);
  }
  
  // Send the error response
  res.status(statusCode).json({
    success: false,
    message: errorMessage,
    error: process.env.NODE_ENV === 'development' ? err.stack : undefined
  });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
