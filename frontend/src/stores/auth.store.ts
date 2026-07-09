import { defineStore } from 'pinia';
import { authService, type User, type RegisterData, type LoginData } from '../services/auth.service';

interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  loading: boolean;
}

export const useAuthStore = defineStore('auth', {
  state: (): AuthState => ({
    user: JSON.parse(localStorage.getItem('user') || 'null'),
    token: localStorage.getItem('token'),
    isAuthenticated: !!localStorage.getItem('token'),
    loading: false,
  }),

  getters: {
    isAdmin: (state) => state.user?.role === 'admin' || state.user?.role === 'sub_admin',
    isRegisteredUser: (state) => state.isAuthenticated && state.user?.role !== 'public',
  },

  actions: {
    async register(data: RegisterData) {
      this.loading = true;
      try {
        const response = await authService.register(data);
        this.user = response.user;
        this.token = response.token;
        this.isAuthenticated = true;
        
        localStorage.setItem('user', JSON.stringify(response.user));
        localStorage.setItem('token', response.token);
        
        return response;
      } catch (error: any) {
        throw new Error(error.response?.data?.error || 'Registration failed');
      } finally {
        this.loading = false;
      }
    },

    async login(data: LoginData) {
      this.loading = true;
      try {
        const response = await authService.login(data);
        this.user = response.user;
        this.token = response.token;
        this.isAuthenticated = true;
        
        localStorage.setItem('user', JSON.stringify(response.user));
        localStorage.setItem('token', response.token);
        
        return response;
      } catch (error: any) {
        throw new Error(error.response?.data?.error || 'Login failed');
      } finally {
        this.loading = false;
      }
    },

    async fetchProfile() {
      if (!this.isAuthenticated) return;
      
      this.loading = true;
      try {
        const user = await authService.getProfile();
        this.user = user;
        localStorage.setItem('user', JSON.stringify(user));
      } catch (error) {
        this.logout();
      } finally {
        this.loading = false;
      }
    },

    logout() {
      this.user = null;
      this.token = null;
      this.isAuthenticated = false;
      
      localStorage.removeItem('user');
      localStorage.removeItem('token');
    },
  },
});
