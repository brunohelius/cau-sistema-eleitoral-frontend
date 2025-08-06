import axios from 'axios';
import { ComissaoEleitoral, MembroComissao, CreateComissaoData } from '../types/comissao.types';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000/api';

const comissaoAPI = axios.create({
  baseURL: `${API_URL}/comissoes`,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor para adicionar o token
comissaoAPI.interceptors.request.use(
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

export const comissaoService = {
  async getComissoes(filters?: any): Promise<ComissaoEleitoral[]> {
    const response = await comissaoAPI.get<ComissaoEleitoral[]>('/', { params: filters });
    return response.data;
  },

  async getComissaoById(id: number): Promise<ComissaoEleitoral> {
    const response = await comissaoAPI.get<ComissaoEleitoral>(`/${id}`);
    return response.data;
  },

  async createComissao(data: CreateComissaoData): Promise<ComissaoEleitoral> {
    const response = await comissaoAPI.post<ComissaoEleitoral>('/', data);
    return response.data;
  },

  async updateComissao(id: number, data: Partial<CreateComissaoData>): Promise<ComissaoEleitoral> {
    const response = await comissaoAPI.put<ComissaoEleitoral>(`/${id}`, data);
    return response.data;
  },

  async deleteComissao(id: number): Promise<void> {
    await comissaoAPI.delete(`/${id}`);
  },

  async getMembrosByComissao(comissaoId: number): Promise<MembroComissao[]> {
    const response = await comissaoAPI.get<MembroComissao[]>(`/${comissaoId}/membros`);
    return response.data;
  },

  async addMembroComissao(comissaoId: number, membro: Omit<MembroComissao, 'id'>): Promise<MembroComissao> {
    const response = await comissaoAPI.post<MembroComissao>(`/${comissaoId}/membros`, membro);
    return response.data;
  },

  async updateMembroComissao(comissaoId: number, membroId: number, data: Partial<MembroComissao>): Promise<MembroComissao> {
    const response = await comissaoAPI.put<MembroComissao>(`/${comissaoId}/membros/${membroId}`, data);
    return response.data;
  },

  async removeMembroComissao(comissaoId: number, membroId: number): Promise<void> {
    await comissaoAPI.delete(`/${comissaoId}/membros/${membroId}`);
  },

  async gerarComissoesAutomaticamente(eleicaoId: number): Promise<ComissaoEleitoral[]> {
    const response = await comissaoAPI.post<ComissaoEleitoral[]>('/gerar-automaticamente', { eleicaoId });
    return response.data;
  },

  async calcularProporcionalidade(eleicaoId: number): Promise<any> {
    const response = await comissaoAPI.get(`/proporcionalidade/${eleicaoId}`);
    return response.data;
  },

  async ativarComissao(id: number): Promise<ComissaoEleitoral> {
    const response = await comissaoAPI.post<ComissaoEleitoral>(`/${id}/ativar`);
    return response.data;
  },

  async finalizarComissao(id: number): Promise<ComissaoEleitoral> {
    const response = await comissaoAPI.post<ComissaoEleitoral>(`/${id}/finalizar`);
    return response.data;
  },

  async substituirMembro(comissaoId: number, membroId: number, substitutoId: number, motivo: string): Promise<any> {
    const response = await comissaoAPI.post(`/${comissaoId}/membros/${membroId}/substituir`, {
      substitutoId,
      motivo,
    });
    return response.data;
  },

  async validarMembros(comissaoId: number): Promise<any> {
    const response = await comissaoAPI.post(`/${comissaoId}/validar-membros`);
    return response.data;
  },

  async getHistoricoSubstituicoes(comissaoId: number): Promise<any[]> {
    const response = await comissaoAPI.get(`/${comissaoId}/substituicoes`);
    return response.data;
  },
};