import { defineStore } from 'pinia';
import { User } from '@/stores/userStore';

export const useAuthStore = defineStore('auth', {
  state: () => ({
    user: null as User | null,
    accessToken: '' as string,
    isAuthenticated: false,
  }),

  actions: {
    successLogin({ userData, token }: { userData?: User; token?: string }) {
      if (token) {
        console.log(token);
        this.accessToken = token;
        this.isAuthenticated = true;
        localStorage.setItem('access_token', token);
      }

      if (userData) {
        this.user = userData;
        localStorage.setItem('user', JSON.stringify(userData));
      }
    },

    loadFromLocalStorage() {
      const token = localStorage.getItem('access_token');
      const user = localStorage.getItem('user');

      if (token && user) {
        this.accessToken = token;
        this.user = JSON.parse(user);
        this.isAuthenticated = true;
      }
    },

    // Đăng xuất
    logout() {
      this.user = null;
      this.accessToken = '';
      this.isAuthenticated = false;
      localStorage.removeItem('access_token');
      localStorage.removeItem('user');
    },
  },
});
