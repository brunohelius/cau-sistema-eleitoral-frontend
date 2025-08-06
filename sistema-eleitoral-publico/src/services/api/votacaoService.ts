import { apiClient } from './client';

// Interfaces
export interface Candidato {
  id: number;
  nome: string;
  foto?: string;
  numero: number;
  chapaId: number;
  chapa: {
    id: number;
    nome: string;
    descricao: string;
    numero: number;
  };
  cargo: string;
  biografia?: string;
  formacao?: string;
  experiencia?: string;
}

export interface EleicaoVotacao {
  id: number;
  titulo: string;
  descricao: string;
  dataInicio: string;
  dataFim: string;
  situacao: 'EmAndamento' | 'Finalizada' | 'EmElaboracao';
  tipoEleicao: 'Nacional' | 'Regional';
  ufId?: number;
  uf?: {
    id: number;
    nome: string;
    sigla: string;
  };
  candidatos: Candidato[];
  podeVotar: boolean;
  jaVotou: boolean;
}

export interface VotoRequest {
  eleicaoId: number;
  candidatoId: number;
  justificativa?: string;
}

export interface ConfirmacaoVoto {
  eleicaoId: number;
  candidatoSelecionado: Candidato;
  dataVoto: string;
  numeroProtocolo: string;
}

export interface StatusVotacao {
  eleicaoId: number;
  jaVotou: boolean;
  dataVoto?: string;
  numeroProtocolo?: string;
  podeVotar: boolean;
  motivoNaoPodeVotar?: string;
}

export interface ResultadoVotacao {
  eleicaoId: number;
  totalVotos: number;
  totalEleitores: number;
  percentualParticipacao: number;
  resultados: {
    candidatoId: number;
    candidato: Candidato;
    totalVotos: number;
    percentualVotos: number;
  }[];
  situacao: 'Parcial' | 'Final';
}

// Service
export const votacaoService = {
  // Buscar eleições disponíveis para votação
  async getEleicoesDisponiveis(): Promise<EleicaoVotacao[]> {
    const { data } = await apiClient.get('/votacao/eleicoes-disponiveis');
    return data;
  },

  // Buscar eleição específica para votação
  async getEleicaoVotacao(eleicaoId: number): Promise<EleicaoVotacao> {
    const { data } = await apiClient.get(`/votacao/eleicoes/${eleicaoId}`);
    return data;
  },

  // Verificar status da votação do usuário
  async getStatusVotacao(eleicaoId: number): Promise<StatusVotacao> {
    const { data } = await apiClient.get(`/votacao/status/${eleicaoId}`);
    return data;
  },

  // Realizar voto
  async votar(votoData: VotoRequest): Promise<ConfirmacaoVoto> {
    const { data } = await apiClient.post('/votacao/votar', votoData);
    return data;
  },

  // Confirmar voto (dupla verificação)
  async confirmarVoto(eleicaoId: number, confirmacao: boolean): Promise<ConfirmacaoVoto> {
    const { data } = await apiClient.post(`/votacao/confirmar/${eleicaoId}`, { confirmacao });
    return data;
  },

  // Buscar comprovante de votação
  async getComprovanteVotacao(eleicaoId: number): Promise<Blob> {
    const { data } = await apiClient.get(`/votacao/comprovante/${eleicaoId}`, {
      responseType: 'blob'
    });
    return data;
  },

  // Buscar resultados da votação (se disponível)
  async getResultados(eleicaoId: number): Promise<ResultadoVotacao> {
    const { data } = await apiClient.get(`/votacao/resultados/${eleicaoId}`);
    return data;
  },

  // Justificar ausência na votação
  async justificarAusencia(eleicaoId: number, justificativa: string): Promise<void> {
    await apiClient.post(`/votacao/justificar-ausencia/${eleicaoId}`, { justificativa });
  },

  // Verificar se pode votar
  async verificarElegibilidade(eleicaoId: number): Promise<{
    podeVotar: boolean;
    motivo?: string;
    requisitos: {
      situacaoRegular: boolean;
      anuidadeEmDia: boolean;
      habilitacaoAtiva: boolean;
    };
  }> {
    const { data } = await apiClient.get(`/votacao/elegibilidade/${eleicaoId}`);
    return data;
  }
};
