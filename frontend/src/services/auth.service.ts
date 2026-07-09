import api from './api';

export interface User {
  id: number;
  email: string;
  username: string;
  role: string;
}

export interface AuthResponse {
  user: User;
  token: string;
}

export interface RegisterData {
  email: string;
  username: string;
  password: string;
}

export interface LoginData {
  email: string;
  password: string;
}

export const authService = {
  async register(data: RegisterData): Promise<AuthResponse> {
    const response = await api.post<AuthResponse>('/auth/register', data);
    return response.data;
  },

  async login(data: LoginData): Promise<AuthResponse> {
    const response = await api.post<AuthResponse>('/auth/login', data);
    return response.data;
  },

  async getProfile(): Promise<User> {
    const response = await api.get<User>('/auth/profile');
    return response.data;
  },

  async getAllUsers(limit = 50, offset = 0): Promise<{ users: User[]; limit: number; offset: number }> {
    const response = await api.get('/auth/users', {
      params: { limit, offset },
    });
    return response.data;
  },

  async updateUserRole(userId: number, role: string): Promise<User> {
    const response = await api.patch<User>(`/auth/users/${userId}/role`, { role });
    return response.data;
  },
};
