import axios from 'axios';
import { Impugnacao, ImpugnacaoFormData } from '../types/impugnacoes.types';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000/api';

const impugnacoesAPI = axios.create({
  baseURL: `${API_URL}/impugnacoes`,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor para adicionar o token
impugnacoesAPI.interceptors.request.use(
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

export const impugnacoesService = {
  async getImpugnacoes(filters?: any): Promise<Impugnacao[]> {
    const response = await impugnacoesAPI.get<Impugnacao[]>('/', { params: filters });
    return response.data;
  },

  async getImpugnacaoById(id: number): Promise<Impugnacao> {
    const response = await impugnacoesAPI.get<Impugnacao>(`/${id}`);
    return response.data;
  },

  async createImpugnacao(data: ImpugnacaoFormData): Promise<Impugnacao> {
    const response = await impugnacoesAPI.post<Impugnacao>('/', data);
    return response.data;
  },

  async updateImpugnacao(id: number, data: Partial<ImpugnacaoFormData>): Promise<Impugnacao> {
    const response = await impugnacoesAPI.put<Impugnacao>(`/${id}`, data);
    return response.data;
  },

  async deleteImpugnacao(id: number): Promise<void> {
    await impugnacoesAPI.delete(`/${id}`);
  },

  async apresentarDefesa(id: number, defesa: string): Promise<Impugnacao> {
    const response = await impugnacoesAPI.post<Impugnacao>(`/${id}/defesa`, { defesa });
    return response.data;
  },

  async julgarImpugnacao(id: number, decisao: string, fundamentacao: string): Promise<Impugnacao> {
    const response = await impugnacoesAPI.post<Impugnacao>(`/${id}/julgamento`, {
      decisao,
      fundamentacao,
    });
    return response.data;
  },

  async interporRecurso(id: number, fundamentacao: string): Promise<Impugnacao> {
    const response = await impugnacoesAPI.post<Impugnacao>(`/${id}/recurso`, { fundamentacao });
    return response.data;
  },

  async uploadDocumento(id: number, tipo: string, arquivo: File): Promise<any> {
    const formData = new FormData();
    formData.append('arquivo', arquivo);
    formData.append('tipo', tipo);

    const response = await impugnacoesAPI.post(`/${id}/documentos`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  async removeDocumento(id: number, documentoId: number): Promise<void> {
    await impugnacoesAPI.delete(`/${id}/documentos/${documentoId}`);
  },

  async getPrazos(id: number): Promise<any[]> {
    const response = await impugnacoesAPI.get(`/${id}/prazos`);
    return response.data;
  },

  async verificarPrazos(): Promise<any[]> {
    const response = await impugnacoesAPI.get('/verificar-prazos');
    return response.data;
  },

  async getEstatisticas(): Promise<any> {
    const response = await impugnacoesAPI.get('/estatisticas');
    return response.data;
  },
};