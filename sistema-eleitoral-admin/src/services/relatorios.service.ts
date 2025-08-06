import axios from 'axios';
import { Relatorio, RelatorioConfig, RelatorioFiltros } from '../types/relatorios.types';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000/api';

const relatoriosAPI = axios.create({
  baseURL: `${API_URL}/relatorios`,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor para adicionar o token
relatoriosAPI.interceptors.request.use(
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

export const relatoriosService = {
  async getRelatorios(filters?: RelatorioFiltros): Promise<Relatorio[]> {
    const response = await relatoriosAPI.get<Relatorio[]>('/', { params: filters });
    return response.data;
  },

  async getRelatorioById(id: number): Promise<Relatorio> {
    const response = await relatoriosAPI.get<Relatorio>(`/${id}`);
    return response.data;
  },

  async gerarRelatorioChapas(eleicaoId: number): Promise<Relatorio> {
    const response = await relatoriosAPI.post<Relatorio>('/chapas', { eleicaoId });
    return response.data;
  },

  async gerarRelatorioComissoes(eleicaoId: number): Promise<Relatorio> {
    const response = await relatoriosAPI.post<Relatorio>('/comissoes', { eleicaoId });
    return response.data;
  },

  async gerarRelatorioDenuncias(eleicaoId: number): Promise<Relatorio> {
    const response = await relatoriosAPI.post<Relatorio>('/denuncias', { eleicaoId });
    return response.data;
  },

  async gerarRelatorioImpugnacoes(eleicaoId: number): Promise<Relatorio> {
    const response = await relatoriosAPI.post<Relatorio>('/impugnacoes', { eleicaoId });
    return response.data;
  },

  async gerarRelatorioDiversidade(eleicaoId: number): Promise<Relatorio> {
    const response = await relatoriosAPI.post<Relatorio>('/diversidade', { eleicaoId });
    return response.data;
  },

  async gerarRelatorioCustomizado(config: RelatorioConfig): Promise<Relatorio> {
    const response = await relatoriosAPI.post<Relatorio>('/customizado', config);
    return response.data;
  },

  async downloadRelatorio(id: number, formato: 'pdf' | 'excel' | 'csv'): Promise<Blob> {
    const response = await relatoriosAPI.get(`/${id}/download`, {
      params: { formato },
      responseType: 'blob',
    });
    return response.data;
  },

  async deleteRelatorio(id: number): Promise<void> {
    await relatoriosAPI.delete(`/${id}`);
  },

  async getConfiguracoes(): Promise<RelatorioConfig[]> {
    const response = await relatoriosAPI.get<RelatorioConfig[]>('/configuracoes');
    return response.data;
  },

  async salvarConfiguracao(config: RelatorioConfig): Promise<RelatorioConfig> {
    const response = await relatoriosAPI.post<RelatorioConfig>('/configuracoes', config);
    return response.data;
  },

  async atualizarConfiguracao(id: number, config: Partial<RelatorioConfig>): Promise<RelatorioConfig> {
    const response = await relatoriosAPI.put<RelatorioConfig>(`/configuracoes/${id}`, config);
    return response.data;
  },

  async removerConfiguracao(id: number): Promise<void> {
    await relatoriosAPI.delete(`/configuracoes/${id}`);
  },

  async getEstatisticasGerais(eleicaoId: number): Promise<any> {
    const response = await relatoriosAPI.get(`/estatisticas/${eleicaoId}`);
    return response.data;
  },

  async exportarEstatisticas(eleicaoId: number, formato: 'pdf' | 'excel'): Promise<Blob> {
    const response = await relatoriosAPI.get(`/estatisticas/${eleicaoId}/exportar`, {
      params: { formato },
      responseType: 'blob',
    });
    return response.data;
  },
};