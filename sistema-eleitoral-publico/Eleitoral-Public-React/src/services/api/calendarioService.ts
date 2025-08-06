import { apiClient } from './client';
import { CalendarioEleitoral } from '@types/index';

export const calendarioService = {
  async getPublicos(filters?: {
    ufId?: number;
    ano?: number;
  }): Promise<CalendarioEleitoral[]> {
    const params = new URLSearchParams();
    if (filters?.ufId) params.append('ufId', filters.ufId.toString());
    if (filters?.ano) params.append('ano', filters.ano.toString());

    const { data } = await apiClient.get(`/calendarios/publicos?${params.toString()}`);
    return data || [];
  },

  async getById(id: number): Promise<CalendarioEleitoral> {
    const { data } = await apiClient.get(`/calendarios/${id}`);
    return data;
  }
};