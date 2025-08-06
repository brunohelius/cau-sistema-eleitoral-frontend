import axios from 'axios';
import { Eleicao, CreateEleicaoData, CalendarioEleitoral } from '../types/eleicoes.types';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000/api';

const eleicoesAPI = axios.create({
  baseURL: `${API_URL}/eleicoes`,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor para adicionar o token
eleicoesAPI.interceptors.request.use(
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

export const eleicoesService = {
  async getEleicoes(filters?: any): Promise<Eleicao[]> {
    const response = await eleicoesAPI.get<Eleicao[]>('/', { params: filters });
    return response.data;
  },

  async getEleicaoById(id: number): Promise<Eleicao> {
    const response = await eleicoesAPI.get<Eleicao>(`/${id}`);
    return response.data;
  },

  async createEleicao(data: CreateEleicaoData): Promise<Eleicao> {
    const response = await eleicoesAPI.post<Eleicao>('/', data);
    return response.data;
  },

  async updateEleicao(id: number, data: Partial<CreateEleicaoData>): Promise<Eleicao> {
    const response = await eleicoesAPI.put<Eleicao>(`/${id}`, data);
    return response.data;
  },

  async deleteEleicao(id: number): Promise<void> {
    await eleicoesAPI.delete(`/${id}`);
  },

  async getCalendarioEleitoral(eleicaoId: number): Promise<CalendarioEleitoral> {
    const response = await eleicoesAPI.get<CalendarioEleitoral>(`/${eleicaoId}/calendario`);
    return response.data;
  },

  async updateCalendarioEleitoral(eleicaoId: number, calendario: CalendarioEleitoral): Promise<CalendarioEleitoral> {
    const response = await eleicoesAPI.put<CalendarioEleitoral>(`/${eleicaoId}/calendario`, calendario);
    return response.data;
  },

  async ativarEleicao(id: number): Promise<Eleicao> {
    const response = await eleicoesAPI.post<Eleicao>(`/${id}/ativar`);
    return response.data;
  },

  async finalizarEleicao(id: number): Promise<Eleicao> {
    const response = await eleicoesAPI.post<Eleicao>(`/${id}/finalizar`);
    return response.data;
  },

  async cancelarEleicao(id: number, motivo: string): Promise<Eleicao> {
    const response = await eleicoesAPI.post<Eleicao>(`/${id}/cancelar`, { motivo });
    return response.data;
  },

  async getEstatisticas(eleicaoId: number): Promise<any> {
    const response = await eleicoesAPI.get(`/${eleicaoId}/estatisticas`);
    return response.data;
  },

  async exportarDados(eleicaoId: number, formato: 'excel' | 'csv'): Promise<Blob> {
    const response = await eleicoesAPI.get(`/${eleicaoId}/exportar`, {
      params: { formato },
      responseType: 'blob',
    });
    return response.data;
  },
};