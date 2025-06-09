import axios from 'axios';

// Define types
export interface ClassData {
  _id?: string;
  className: string;
  description: string;
  subject: string;
  status: 'active' | 'inactive' | 'upcoming';
  schedule: {
    day: string;
    time: string;
    duration: number;
  };
  maxStudents: number;
  price: number;
  createdAt?: string;
  updatedAt?: string;
}

// Create axios instance with base URL and headers
const api = axios.create({
  baseURL: 'http://localhost:5001/api/v1', // Local development backend API URL with version
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add a request interceptor to include auth token if available
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('authToken');
    if (token) {
      // Ensure headers exist before setting Authorization
      config.headers = config.headers || {};
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Auth interfaces
export interface LoginCredentials {
  email: string;
  password: string;
}

export interface AuthResponse {
  token: string;
  user: {
    id: string;
    name: string;
    email: string;
    mobile?: string;
    role: string;
  };
}

// API endpoints
// User data returned by the getMe endpoint
export interface MeResponse {
  id: string;
  name: string;
  mobile: string;
  role: string;
  email?: string;
  createdAt?: string;
  updatedAt?: string;
}

export const authApi = {
  login: (email: string, password: string) => 
    api.post<AuthResponse>('/auth/login', { email, password }),
  getMe: () => api.get<MeResponse>('/auth/me'),
};

// Helper function to transform frontend class data to backend format
const transformClassData = (data: any) => ({
  className: data.className || data.title,
  description: data.description,
  subject: data.subject || 'Chemistry', // Default subject
  schedule: data.schedule || {
    day: 'Monday', // Default day, should be set from the form
    time: '10:00', // Default time, should be set from the form
    duration: 60, // Default duration in minutes
  },
  maxStudents: data.maxStudents,
  price: data.price || 0,
  status: data.status || 'upcoming',
});

export const classApi = {
  getAll: () => api.get<ClassData[]>('/classes'),
  getById: (id: string) => api.get<ClassData>(`/classes/${id}`),
  create: (data: any) => api.post<ClassData>('/classes', transformClassData(data)),
  update: (id: string, data: any) => 
    api.put<ClassData>(`/classes/${id}`, transformClassData(data)),
  delete: (id: string) => api.delete(`/classes/${id}`),
};

export const studentApi = {
  getAll: () => api.get('/students'),
  getById: (id: string) => api.get(`/students/${id}`),
  create: (data: any) => api.post('/students', data),
  update: (id: string, data: any) => api.put(`/students/${id}`, data),
  getEnrollments: (studentId: string) => api.get(`/students/${studentId}/enrollments`),
};

export const paymentApi = {
  getAll: () => api.get('/payments'),
  getById: (id: string) => api.get(`/payments/${id}`),
  verify: (id: string, data: { status: string; note?: string }) =>
    api.post(`/payments/${id}/verify`, data),
  getByStudent: (studentId: string) => api.get(`/students/${studentId}/payments`),
};

export const enrollmentApi = {
  create: (data: { studentId: string; classId: string; paymentId?: string }) =>
    api.post('/enrollments', data),
  updateStatus: (id: string, status: string) =>
    api.patch(`/enrollments/${id}/status`, { status }),
};

export default api;
