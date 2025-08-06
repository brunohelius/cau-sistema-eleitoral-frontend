import { apiClient } from './client';
import { User, AuthResponse } from '@types/index';

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  nome: string;
  email: string;
  cpf: string;
  password: string;
  confirmPassword: string;
  telefone?: string;
}

export const authService = {
  async login(credentials: LoginRequest): Promise<AuthResponse> {
    const { data } = await apiClient.post('/auth/login', credentials);
    
    // Salvar tokens no localStorage
    if (data.token) {
      localStorage.setItem('token', data.token);
      localStorage.setItem('refreshToken', data.refreshToken);
      localStorage.setItem('user', JSON.stringify(data.user));
    }
    
    return data;
  },

  async register(userData: RegisterRequest): Promise<AuthResponse> {
    const { data } = await apiClient.post('/auth/register', userData);
    return data;
  },

  async logout(): Promise<void> {
    try {
      await apiClient.post('/auth/logout');
    } catch (error) {
      // Ignorar erros de logout no servidor
    } finally {
      // Sempre limpar dados locais
      localStorage.removeItem('token');
      localStorage.removeItem('refreshToken');
      localStorage.removeItem('user');
    }
  },

  async refreshToken(): Promise<AuthResponse> {
    const refreshToken = localStorage.getItem('refreshToken');
    if (!refreshToken) {
      throw new Error('No refresh token available');
    }

    const { data } = await apiClient.post('/auth/refresh', { refreshToken });
    
    // Atualizar tokens
    localStorage.setItem('token', data.token);
    localStorage.setItem('refreshToken', data.refreshToken);
    localStorage.setItem('user', JSON.stringify(data.user));
    
    return data;
  },

  async forgotPassword(email: string): Promise<{ message: string }> {
    const { data } = await apiClient.post('/auth/forgot-password', { email });
    return data;
  },

  async resetPassword(token: string, password: string): Promise<{ message: string }> {
    const { data } = await apiClient.post('/auth/reset-password', { 
      token, 
      password 
    });
    return data;
  },

  async verifyEmail(token: string): Promise<{ message: string }> {
    const { data } = await apiClient.post('/auth/verify-email', { token });
    return data;
  },

  async resendVerification(email: string): Promise<{ message: string }> {
    const { data } = await apiClient.post('/auth/resend-verification', { email });
    return data;
  },

  async changePassword(currentPassword: string, newPassword: string): Promise<{ message: string }> {
    const { data } = await apiClient.post('/auth/change-password', {
      currentPassword,
      newPassword
    });
    return data;
  },

  async getProfile(): Promise<User> {
    const { data } = await apiClient.get('/auth/profile');
    return data;
  },

  async updateProfile(userData: Partial<User>): Promise<User> {
    const { data } = await apiClient.put('/auth/profile', userData);
    
    // Atualizar dados do usuário no localStorage
    const currentUser = localStorage.getItem('user');
    if (currentUser) {
      const updatedUser = { ...JSON.parse(currentUser), ...data };
      localStorage.setItem('user', JSON.stringify(updatedUser));
    }
    
    return data;
  },

  // Utilitários para verificar estado de autenticação
  isAuthenticated(): boolean {
    const token = localStorage.getItem('token');
    const user = localStorage.getItem('user');
    return !!(token && user);
  },

  getCurrentUser(): User | null {
    const user = localStorage.getItem('user');
    return user ? JSON.parse(user) : null;
  },

  getToken(): string | null {
    return localStorage.getItem('token');
  }
};