import axios from "axios";

const API_BASE_URL = "https://finallogisticsvishnubackend.onrender.com/api";

// Create axios instance with default config
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// Add token to requests automatically
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Handle response errors globally
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      window.location.href = "/login";
    }
    return Promise.reject(error);
  }
);

// Auth APIs
export const authAPI = {
  register: (data) => api.post("/auth/register", data),
  login: (data) => api.post("/auth/login", data),
  getProfile: () => api.get("/auth/profile"),
  getDrivers: () => api.get("/auth/drivers"),
  getAllUsers: () => api.get("/auth/users"),
};

// Delivery APIs
export const deliveryAPI = {
  getAll: () => api.get("/deliveries"),
  getById: (id) => api.get(`/deliveries/${id}`),
  create: (data) => api.post("/deliveries", data),
  updateStatus: (id, status) => api.put(`/deliveries/${id}/status`, { status }),
  delete: (id) => api.delete(`/deliveries/${id}`),
  track: (id) => api.get(`/deliveries/${id}/track`),
  
  // Customer APIs
  createBooking: (data) => api.post("/deliveries/customer/book", data),
  getMyBookings: () => api.get("/deliveries/customer/my-bookings"),
  getBookingById: (id) => api.get(`/deliveries/customer/${id}`),
  cancelBooking: (id) => api.put(`/deliveries/customer/${id}/cancel`),
  
  // Admin APIs
  approve: (id) => api.put(`/deliveries/${id}/approve`),
  assign: (id, data) => api.put(`/deliveries/${id}/assign`, data),
  
  // Driver APIs
  getAssigned: () => api.get("/deliveries/driver/assigned"),
  accept: (id) => api.put(`/deliveries/${id}/accept`),
  reject: (id, reason) => api.put(`/deliveries/${id}/reject`, { reason }),
};

// Vehicle APIs
export const vehicleAPI = {
  getAll: () => api.get("/vehicles"),
  getById: (id) => api.get(`/vehicles/${id}`),
  create: (data) => api.post("/vehicles", data),
  update: (id, data) => api.put(`/vehicles/${id}`, data),
  delete: (id) => api.delete(`/vehicles/${id}`),
  updateStatus: (id, status) => api.put(`/vehicles/${id}/status`, { status }),
};

// Tracking APIs
export const trackingAPI = {
  getDeliveryTracking: (deliveryId) => api.get(`/tracking/${deliveryId}`),
  updateLocation: (data) => api.post("/tracking/location", data),
};

export default api;
