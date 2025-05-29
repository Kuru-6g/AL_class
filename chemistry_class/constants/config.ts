import { Platform } from 'react-native';

// Development environment configuration
const DEVELOPMENT_CONFIG = {
  ANDROID_EMULATOR: 'http://10.0.2.2:5001/api',
  ANDROID_DEVICE: 'http://10.10.45.141:5001/api', // Using your computer's local IP
  IOS_SIMULATOR: 'http://localhost:5001/api',
  IOS_DEVICE: 'http://10.10.45.141:5001/api', // Using your computer's local IP
};

// Production configuration
const PRODUCTION_CONFIG = {
  API_URL: 'https://your-production-api.com/api',
};

// Helper to get the base URL based on environment and platform
const getBaseUrl = () => {
  if (__DEV__) {
    // Development environment
    console.log('Running in development mode');
    
    // For Android
    if (Platform.OS === 'android') {
      console.log('Android platform detected');
      // Using device configuration for physical Android device
      return DEVELOPMENT_CONFIG.ANDROID_DEVICE;
    }
    
    // For iOS
    console.log('iOS platform detected');
    return DEVELOPMENT_CONFIG.IOS_SIMULATOR; // For iOS simulator/device
  }
  
  // Production environment
  console.log('Running in production mode');
  return PRODUCTION_CONFIG.API_URL;
};

export const API_BASE_URL = getBaseUrl();

// Log the API URL being used (remove in production)
console.log('API Base URL:', API_BASE_URL);

// Other API endpoints
export const API_ENDPOINTS = {
  AUTH: {
    LOGIN: '/auth/login',
    REGISTER: '/auth/register',
    LOGOUT: '/auth/logout',
    VERIFY_TOKEN: '/auth/verify-token',
    // Add other auth endpoints as needed
  },
  // Add other API endpoints here
};

// JWT Configuration
export const JWT_CONFIG = {
  TOKEN_KEY: 'userToken',
  // Add other JWT config as needed
};
