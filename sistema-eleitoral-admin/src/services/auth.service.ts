import axios from 'axios';
import { LoginCredentials, LoginResponse, User, ChangePasswordData, ResetPasswordData } from '../types/auth.types';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000/api';

const authAPI = axios.create({
  baseURL: `${API_URL}/auth`,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor para adicionar o token
authAPI.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor para lidar com erros de autenticação
authAPI.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export const authService = {
  async login(credentials: LoginCredentials): Promise<LoginResponse> {
    const response = await authAPI.post<LoginResponse>('/login', credentials);
    return response.data;
  },

  async logout(): Promise<void> {
    try {
      await authAPI.post('/logout');
    } catch (error) {
      // Ignore errors on logout
    } finally {
      localStorage.removeItem('token');
    }
  },

  async getCurrentUser(): Promise<User> {
    const response = await authAPI.get<User>('/me');
    return response.data;
  },

  async changePassword(data: ChangePasswordData): Promise<void> {
    await authAPI.put('/change-password', data);
  },

  async resetPassword(data: ResetPasswordData): Promise<void> {
    await authAPI.post('/reset-password', data);
  },

  async verifyToken(): Promise<boolean> {
    try {
      await authAPI.get('/verify-token');
      return true;
    } catch {
      return false;
    }
  },

  async refreshToken(): Promise<string> {
    const response = await authAPI.post<{ token: string }>('/refresh-token');
    return response.data.token;
  },
};