import axios from 'axios';
import { Chapa, ChapaFormData, MembroChapa } from '../types/chapas.types';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000/api';

const chapasAPI = axios.create({
  baseURL: `${API_URL}/chapas`,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor para adicionar o token
chapasAPI.interceptors.request.use(
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

export const chapasService = {
  async getChapas(filters?: any): Promise<Chapa[]> {
    const response = await chapasAPI.get<Chapa[]>('/', { params: filters });
    return response.data;
  },

  async getChapaById(id: number): Promise<Chapa> {
    const response = await chapasAPI.get<Chapa>(`/${id}`);
    return response.data;
  },

  async createChapa(data: ChapaFormData): Promise<Chapa> {
    const response = await chapasAPI.post<Chapa>('/', data);
    return response.data;
  },

  async updateChapa(id: number, data: Partial<ChapaFormData>): Promise<Chapa> {
    const response = await chapasAPI.put<Chapa>(`/${id}`, data);
    return response.data;
  },

  async deleteChapa(id: number): Promise<void> {
    await chapasAPI.delete(`/${id}`);
  },

  async getMembrosByChapa(chapaId: number): Promise<MembroChapa[]> {
    const response = await chapasAPI.get<MembroChapa[]>(`/${chapaId}/membros`);
    return response.data;
  },

  async addMembroChapa(chapaId: number, membro: Omit<MembroChapa, 'id'>): Promise<MembroChapa> {
    const response = await chapasAPI.post<MembroChapa>(`/${chapaId}/membros`, membro);
    return response.data;
  },

  async updateMembroChapa(chapaId: number, membroId: number, data: Partial<MembroChapa>): Promise<MembroChapa> {
    const response = await chapasAPI.put<MembroChapa>(`/${chapaId}/membros/${membroId}`, data);
    return response.data;
  },

  async removeMembroChapa(chapaId: number, membroId: number): Promise<void> {
    await chapasAPI.delete(`/${chapaId}/membros/${membroId}`);
  },

  async confirmChapa(chapaId: number): Promise<Chapa> {
    const response = await chapasAPI.post<Chapa>(`/${chapaId}/confirmar`);
    return response.data;
  },

  async cancelarChapa(chapaId: number, motivo: string): Promise<Chapa> {
    const response = await chapasAPI.post<Chapa>(`/${chapaId}/cancelar`, { motivo });
    return response.data;
  },

  async validarMembros(chapaId: number): Promise<any> {
    const response = await chapasAPI.post(`/${chapaId}/validar-membros`);
    return response.data;
  },

  async uploadDocumento(chapaId: number, tipo: string, arquivo: File): Promise<any> {
    const formData = new FormData();
    formData.append('arquivo', arquivo);
    formData.append('tipo', tipo);

    const response = await chapasAPI.post(`/${chapaId}/documentos`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  async removeDocumento(chapaId: number, documentoId: number): Promise<void> {
    await chapasAPI.delete(`/${chapaId}/documentos/${documentoId}`);
  },

  async verificarDiversidade(chapaId: number): Promise<any> {
    const response = await chapasAPI.get(`/${chapaId}/diversidade`);
    return response.data;
  },

  async gerarNumero(chapaId: number): Promise<{ numero: number }> {
    const response = await chapasAPI.post<{ numero: number }>(`/${chapaId}/gerar-numero`);
    return response.data;
  },
};