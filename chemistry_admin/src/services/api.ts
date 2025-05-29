import axios from 'axios';

// Define types
export interface ClassData {
  _id?: string;
  title: string;
  description: string;
  status: 'active' | 'inactive' | 'upcoming';
  startDate: string;
  endDate: string;
  maxStudents: number;
  price: number;
  createdAt?: string;
  updatedAt?: string;
}

// Create axios instance with base URL and headers
const api = axios.create({
  baseURL: 'http://10.10.45.141:5001/api', // Your backend API URL
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

// API endpoints
export const authApi = {
  login: (credentials: { email: string; password: string }) =>
    api.post('/auth/login', credentials),
  // Add other auth endpoints as needed
};

export const classApi = {
  getAll: () => api.get<ClassData[]>('/classes'),
  getById: (id: string) => api.get<ClassData>(`/classes/${id}`),
  create: (data: Omit<ClassData, '_id' | 'createdAt' | 'updatedAt'>) => api.post<ClassData>('/classes', data),
  update: (id: string, data: Partial<Omit<ClassData, '_id' | 'createdAt' | 'updatedAt'>>) => 
    api.put<ClassData>(`/classes/${id}`, data),
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
