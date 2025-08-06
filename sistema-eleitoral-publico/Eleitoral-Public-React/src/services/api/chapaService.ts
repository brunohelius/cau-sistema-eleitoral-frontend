import { apiClient } from './client';
import { ChapaPublica, FilterOptions } from '@types/index';

export const chapaService = {
  async getPublicas(filters?: FilterOptions): Promise<ChapaPublica[]> {
    const params = new URLSearchParams();
    if (filters?.search) params.append('search', filters.search);
    if (filters?.eleicaoId) params.append('eleicaoId', filters.eleicaoId);
    if (filters?.ufId) params.append('ufId', filters.ufId);
    if (filters?.status) params.append('status', filters.status);

    const { data } = await apiClient.get(`/chapas?${params.toString()}`);
    return data || [];
  },

  async getById(id: number): Promise<ChapaPublica> {
    const { data } = await apiClient.get(`/chapas/${id}`);
    return data;
  }
};