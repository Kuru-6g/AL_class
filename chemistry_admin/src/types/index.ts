// User Types
export interface User {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'teacher' | 'student';
  avatar?: string;
  createdAt: string;
  updatedAt: string;
}

// Class Types
export interface Class {
  id: string;
  title: string;
  description: string;
  subject: string;
  status: 'draft' | 'upcoming' | 'active' | 'completed' | 'cancelled';
  maxStudents: number;
  currentStudents: number;
  price: number;
  startDate: string;
  endDate: string;
  schedule: string[];
  teacherId: string;
  thumbnail?: string;
  createdAt: string;
  updatedAt: string;
}

// Student Types
export interface Student extends User {
  phone: string;
  address?: string;
  dateOfBirth?: string;
  parentName?: string;
  parentPhone?: string;
  school?: string;
  grade?: string;
  status: 'active' | 'inactive' | 'pending';
  joinDate: string;
}

// Payment Types
export interface Payment {
  id: string;
  studentId: string;
  studentName: string;
  classId?: string;
  className?: string;
  amount: number;
  status: 'pending' | 'approved' | 'rejected' | 'refunded';
  paymentDate: string;
  paymentMethod: string;
  receiptNumber?: string;
  receiptImage?: string;
  verifiedBy?: string;
  verifiedAt?: string;
  verificationNote?: string;
  createdAt: string;
  updatedAt: string;
}

// Enrollment Types
export interface Enrollment {
  id: string;
  studentId: string;
  classId: string;
  paymentId?: string;
  status: 'pending' | 'active' | 'completed' | 'cancelled';
  enrolledAt: string;
  completedAt?: string;
  attendance?: number; // Percentage
  grade?: string;
  notes?: string;
}

// API Response Types
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
  statusCode?: number;
}

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

// Form Data Types
export interface ClassFormData {
  title: string;
  description: string;
  subject: string;
  status: 'draft' | 'upcoming' | 'active' | 'completed' | 'cancelled';
  maxStudents: number;
  price: number;
  startDate: string;
  endDate: string;
  schedule: string[];
  teacherId: string;
  thumbnail?: File | string;
}

export interface StudentFormData {
  name: string;
  email: string;
  phone: string;
  password?: string;
  address?: string;
  dateOfBirth?: string;
  parentName?: string;
  parentPhone?: string;
  school?: string;
  grade?: string;
  status: 'active' | 'inactive' | 'pending';
  avatar?: File | string;
}

export interface PaymentVerificationData {
  status: 'approved' | 'rejected';
  note?: string;
}
