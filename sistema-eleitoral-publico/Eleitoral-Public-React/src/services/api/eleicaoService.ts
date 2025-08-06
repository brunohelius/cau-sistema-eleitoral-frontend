import { apiClient } from './client';
import { Eleicao } from '@types/index';

export const eleicaoService = {
  async getAtivas(): Promise<Eleicao[]> {
    const { data } = await apiClient.get('/eleicoes?situacao=EmAndamento');
    return data || [];
  },

  async getPublicas(): Promise<Eleicao[]> {
    const { data } = await apiClient.get('/eleicoes');
    return data || [];
  },

  async getAll(): Promise<Eleicao[]> {
    const { data } = await apiClient.get('/eleicoes');
    return data || [];
  },

  async getById(id: number): Promise<Eleicao> {
    const { data } = await apiClient.get(`/eleicoes/${id}`);
    return data;
  }
};