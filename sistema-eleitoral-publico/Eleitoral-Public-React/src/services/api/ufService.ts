import { apiClient } from './client';
import { UF } from '@types/index';

export const ufService = {
  async getAll(): Promise<UF[]> {
    const { data } = await apiClient.get('/ufs');
    return data || [];
  },

  async getById(id: number): Promise<UF> {
    const { data } = await apiClient.get(`/ufs/${id}`);
    return data;
  }
};