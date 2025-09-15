import axios from 'axios';
import { useAuthStore } from '@/stores/authStore';

const api = axios.create({
  baseURL: 'http://localhost:8000',
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true, //gửi cookie trong các req
});

// Thêm token vào mọi request
// api.interceptors.request.use((config) => {
//   const token = localStorage.getItem("access_token");
//   if (token) {
//     config.headers.Authorization = `Bearer ${token}`;
//   }
//   return config;
// });

// Bắt lỗi 401
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      // tránh retry endpoint refresh token
      if (originalRequest.url === '/auth/refresh') {
        window.location.href = '/login';
        return Promise.reject(error);
      }
      
      try {
        const authStore = useAuthStore();
        const res = await api.post(
          '/auth/refresh',
          {},
          { withCredentials: true }
        );

        const newToken: string = res.data.access_token;

        // gắn token mới vào header
        api.defaults.headers.common['Authorization'] = `Bearer ${newToken}`;

        // retry lại request cũ
        error.config.headers['Authorization'] = `Bearer ${newToken}`;
        authStore.successLogin({ token: newToken });

        // gửi lại request vừa bị fail
        return api(error.config);
      } catch (refreshError) {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

export default api;
