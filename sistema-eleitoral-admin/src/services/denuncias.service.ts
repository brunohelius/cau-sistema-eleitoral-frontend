import axios from 'axios';
import { Denuncia, DenunciaFormData } from '../types/denuncias.types';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000/api';

const denunciasAPI = axios.create({
  baseURL: `${API_URL}/denuncias`,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor para adicionar o token
denunciasAPI.interceptors.request.use(
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

export const denunciasService = {
  async getDenuncias(filters?: any): Promise<Denuncia[]> {
    const response = await denunciasAPI.get<Denuncia[]>('/', { params: filters });
    return response.data;
  },

  async getDenunciaById(id: number): Promise<Denuncia> {
    const response = await denunciasAPI.get<Denuncia>(`/${id}`);
    return response.data;
  },

  async createDenuncia(data: DenunciaFormData): Promise<Denuncia> {
    const response = await denunciasAPI.post<Denuncia>('/', data);
    return response.data;
  },

  async updateDenuncia(id: number, data: Partial<DenunciaFormData>): Promise<Denuncia> {
    const response = await denunciasAPI.put<Denuncia>(`/${id}`, data);
    return response.data;
  },

  async deleteDenuncia(id: number): Promise<void> {
    await denunciasAPI.delete(`/${id}`);
  },

  // Workflow methods
  async analisarAdmissibilidade(id: number, decisao: boolean, justificativa: string): Promise<Denuncia> {
    const response = await denunciasAPI.post<Denuncia>(`/${id}/admissibilidade`, {
      decisao,
      justificativa,
    });
    return response.data;
  },

  async apresentarDefesa(id: number, defesa: string): Promise<Denuncia> {
    const response = await denunciasAPI.post<Denuncia>(`/${id}/defesa`, { defesa });
    return response.data;
  },

  async produzirProvas(id: number, provas: string): Promise<Denuncia> {
    const response = await denunciasAPI.post<Denuncia>(`/${id}/provas`, { provas });
    return response.data;
  },

  async realizarAudiencia(id: number, ata: string): Promise<Denuncia> {
    const response = await denunciasAPI.post<Denuncia>(`/${id}/audiencia`, { ata });
    return response.data;
  },

  async apresentarAlegacoes(id: number, alegacoes: string): Promise<Denuncia> {
    const response = await denunciasAPI.post<Denuncia>(`/${id}/alegacoes`, { alegacoes });
    return response.data;
  },

  async julgarPrimeiraInstancia(id: number, decisao: string, fundamentacao: string): Promise<Denuncia> {
    const response = await denunciasAPI.post<Denuncia>(`/${id}/julgamento-primeira`, {
      decisao,
      fundamentacao,
    });
    return response.data;
  },

  async julgarSegundaInstancia(id: number, decisao: string, fundamentacao: string): Promise<Denuncia> {
    const response = await denunciasAPI.post<Denuncia>(`/${id}/julgamento-segunda`, {
      decisao,
      fundamentacao,
    });
    return response.data;
  },

  async interporRecurso(id: number, fundamentacao: string): Promise<Denuncia> {
    const response = await denunciasAPI.post<Denuncia>(`/${id}/recurso`, { fundamentacao });
    return response.data;
  },

  async uploadDocumento(id: number, tipo: string, arquivo: File): Promise<any> {
    const formData = new FormData();
    formData.append('arquivo', arquivo);
    formData.append('tipo', tipo);

    const response = await denunciasAPI.post(`/${id}/documentos`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  async removeDocumento(id: number, documentoId: number): Promise<void> {
    await denunciasAPI.delete(`/${id}/documentos/${documentoId}`);
  },

  async agendarAudiencia(id: number, data: any): Promise<any> {
    const response = await denunciasAPI.post(`/${id}/agendar-audiencia`, data);
    return response.data;
  },

  async getPrazos(id: number): Promise<any[]> {
    const response = await denunciasAPI.get(`/${id}/prazos`);
    return response.data;
  },

  async prorrogarPrazo(id: number, prazoId: number, dias: number, justificativa: string): Promise<any> {
    const response = await denunciasAPI.post(`/${id}/prazos/${prazoId}/prorrogar`, {
      dias,
      justificativa,
    });
    return response.data;
  },
};