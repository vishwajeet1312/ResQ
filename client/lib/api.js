import axios from 'axios';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

// Create axios instance
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add auth token to requests
export const setAuthToken = (token) => {
  if (token) {
    apiClient.defaults.headers.common['Authorization'] = `Bearer ${token}`;
  } else {
    delete apiClient.defaults.headers.common['Authorization'];
  }
};

// SOS API
export const sosAPI = {
  broadcast: (data) => apiClient.post('/sos', data),
  getAll: (params) => apiClient.get('/sos', { params }),
  getById: (id) => apiClient.get(`/sos/${id}`),
  acknowledge: (id) => apiClient.patch(`/sos/${id}/acknowledge`),
  updateStatus: (id, status) => apiClient.patch(`/sos/${id}/status`, { status }),
  getNearby: (lng, lat, params) => apiClient.get(`/sos/nearby/${lng}/${lat}`, { params }),
};

// Incident API
export const incidentAPI = {
  create: (data) => apiClient.post('/incidents', data),
  getAll: (params) => apiClient.get('/incidents', { params }),
  getById: (id) => apiClient.get(`/incidents/${id}`),
  update: (id, data) => apiClient.patch(`/incidents/${id}`, data),
  assign: (id) => apiClient.post(`/incidents/${id}/assign`),
  getNearby: (lng, lat, params) => apiClient.get(`/incidents/nearby/${lng}/${lat}`, { params }),
};

// Resource API
export const resourceAPI = {
  create: (data) => apiClient.post('/resources', data),
  getAll: (params) => apiClient.get('/resources', { params }),
  getById: (id) => apiClient.get(`/resources/${id}`),
  update: (id, data) => apiClient.patch(`/resources/${id}`, data),
  request: (id, quantity) => apiClient.post(`/resources/${id}/request`, { quantity }),
  approveRequest: (id, requestIndex, status) => 
    apiClient.patch(`/resources/${id}/request/${requestIndex}`, { status }),
  restock: (id, quantity) => apiClient.post(`/resources/${id}/restock`, { quantity }),
  getNearby: (lng, lat, params) => apiClient.get(`/resources/nearby/${lng}/${lat}`, { params }),
  getByCategory: (category) => apiClient.get(`/resources/category/${category}`),
  delete: (id) => apiClient.delete(`/resources/${id}`),
};

// Triage API
export const triageAPI = {
  create: (data) => apiClient.post('/triage', data),
  getAll: (params) => apiClient.get('/triage', { params }),
  getById: (id) => apiClient.get(`/triage/${id}`),
  updateStatus: (id, status, notes) => 
    apiClient.patch(`/triage/${id}/status`, { status, notes }),
  assign: (id, role) => apiClient.post(`/triage/${id}/assign`, { role }),
  getHighPriority: () => apiClient.get('/triage/priority/high'),
  getUserTriage: (userId) => apiClient.get(`/triage/user/${userId}`),
  getAssigned: (userId) => apiClient.get(`/triage/assigned/${userId}`),
};

// Mission API
export const missionAPI = {
  create: (data) => apiClient.post('/missions', data),
  getAll: (params) => apiClient.get('/missions', { params }),
  getById: (id) => apiClient.get(`/missions/${id}`),
  update: (id, data) => apiClient.patch(`/missions/${id}`, data),
  assignTeam: (id, teamData) => apiClient.post(`/missions/${id}/teams`, teamData),
  getActive: () => apiClient.get('/missions/active/all'),
  cancel: (id) => apiClient.delete(`/missions/${id}`),
};

// Notification API
export const notificationAPI = {
  create: (data) => apiClient.post('/notifications', data),
  getAll: (params) => apiClient.get('/notifications', { params }),
  getUnreadCount: () => apiClient.get('/notifications/unread/count'),
  markAsRead: (id) => apiClient.patch(`/notifications/${id}/read`),
  markAllAsRead: () => apiClient.patch('/notifications/read/all'),
  delete: (id) => apiClient.delete(`/notifications/${id}`),
  deleteAll: () => apiClient.delete('/notifications/all/user'),
};

// Stats API
export const statsAPI = {
  getDashboard: () => apiClient.get('/stats/dashboard'),
  getSOS: (timeframe) => apiClient.get('/stats/sos', { params: { timeframe } }),
  getIncidents: (timeframe) => apiClient.get('/stats/incidents', { params: { timeframe } }),
  getResources: () => apiClient.get('/stats/resources'),
  getTriage: () => apiClient.get('/stats/triage'),
};

export default apiClient;
