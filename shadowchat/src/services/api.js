import axios from 'axios';

const API_BASE = import.meta.env.VITE_API_URL || '/api';

const api = axios.create({
  baseURL: API_BASE,
  headers: { 'Content-Type': 'application/json' },
});

// Attach JWT token to every request
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('shadowchat_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Handle 401 globally
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('shadowchat_token');
      localStorage.removeItem('shadowchat_user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Auth API
export const authAPI = {
  register: (data) => api.post('/auth/register', data),
  login: (data) => api.post('/auth/login', data),
  getMe: () => api.get('/auth/me'),
  logout: () => api.post('/auth/logout'),
  suggestUsername: () => api.get('/auth/suggest-username'),
  deleteAccount: () => api.delete('/auth/delete'),
  updateSettings: (data) => api.put('/auth/settings', data),
};

// Chat API
export const chatAPI = {
  getOrCreateRoom: (receiverId) => api.post('/chat/room', { receiverId }),
  getRooms: () => api.get('/chat/rooms'),
  getMessages: (roomId, page = 1) => api.get(`/chat/messages/${roomId}?page=${page}`),
  sendMessage: (data) => api.post('/chat/message', data),
  deleteMessage: (messageId) => api.delete(`/chat/message/${messageId}`),
  getUsers: () => api.get('/chat/users'),
  searchUsers: (q) => api.get(`/chat/search?q=${q}`),
};

export default api;
