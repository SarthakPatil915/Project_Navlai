import axios from 'axios'
import { useAuthStore } from '@/app/store'

const API_BASE_URL = import.meta.env.VITE_API_URL || '/api'

export const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
})

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = useAuthStore.getState().token
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => Promise.reject(error)
)

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      useAuthStore.getState().logout()
      window.location.href = '/login'
    }
    return Promise.reject(error)
  }
)

// Auth API
export const authAPI = {
  login: (data) => api.post('/auth/login', data),
  register: (data) => api.post('/auth/register', data),
  getCurrentUser: () => api.get('/auth/me'),
  sendEmailOTP: (email) => api.post('/auth/send-email-otp', { email }),
  verifyOTP: (data) => api.post('/auth/verify-otp', data),
  forgotPassword: (email) => api.post('/auth/forgot-password', { email }),
  resetPassword: (data) => api.post('/auth/reset-password', data),
  updateProfile: (formData) => api.put('/auth/profile', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  }),
}

// Events API
export const eventsAPI = {
  getAll: (params) => api.get('/events/all', { params }),
  getFeatured: () => api.get('/events/featured'),
  getNearby: () => api.get('/events/nearby'),
  getById: (id) => api.get(`/events/${id}`),
  getUserEvents: () => api.get('/events/my-events'),
  create: (data) => api.post('/events', data),
  update: (id, data) => api.patch(`/events/${id}`, data),
  delete: (id) => api.delete(`/events/${id}`),
}

// Enrollments API
export const enrollmentsAPI = {
  create: (formData) => api.post('/enrollments', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  }),
  getUserEnrollments: () => api.get('/enrollments/my-enrollments'),
  getEventEnrollments: (eventId) => api.get(`/enrollments/event/${eventId}`),
  getQRCode: (enrollmentId) => api.get(`/enrollments/${enrollmentId}/qr-code`),
  markAttendanceByOrganizer: (enrollmentId) => api.post(`/enrollments/${enrollmentId}/organizer-attendance`),
}

// Admin API
export const adminAPI = {
  getDashboardStats: () => api.get('/admin/dashboard-stats'),
  getPendingEvents: () => api.get('/admin/events/pending'),
  getApprovedEvents: () => api.get('/admin/events/approved'),
  getAllEvents: () => api.get('/admin/events'),
  updateEventStatus: (id, status) => api.patch(`/admin/events/${id}/${status}`),
  approveEvent: (id, comment) => api.patch(`/admin/events/${id}/approve`, { comment }),
  rejectEvent: (id, comment) => api.patch(`/admin/events/${id}/reject`, { comment }),
  deleteEvent: (id) => api.delete(`/admin/events/${id}`),
  toggleEnrollment: (id) => api.patch(`/admin/events/${id}/toggle-enrollment`),
  getUsers: () => api.get('/admin/users'),
  getUserEnrollments: (userId) => api.get(`/admin/users/${userId}/enrollments`),
  getAllEnrollments: () => api.get('/admin/enrollments'),
  approveEnrollment: (id) => api.patch(`/admin/enrollments/${id}/approve`),
  markAttendance: (enrollmentId) => api.post(`/admin/enrollments/${enrollmentId}/attendance`),
}

// Feedback API
export const feedbackAPI = {
  submit: (data) => api.post('/feedback', data),
}
