import { apiClient } from './client';

// Tipos para a comissão eleitoral
export interface TipoParticipacao {
  id: number;
  descricao: string;
}

export interface SituacaoMembro {
  id: number;
  descricao: string;
  cor?: string;
}

export interface ProfissionalEntity {
  id: number;
  nome: string;
  cpf: string;
  email: string;
  registroNacional: string;
  avatar?: string;
}

export interface MembroComissao {
  id: number;
  profissionalEntity: ProfissionalEntity;
  tipoParticipacao: TipoParticipacao;
  situacaoVigente: SituacaoMembro;
  pendencias: string[];
  membroSubstituto?: MembroComissao;
  dataInclusao: string;
  dataAlteracao?: string;
  cauUf: {
    id: number;
    prefixo: string;
    nome: string;
  };
}

export interface ComissaoEleitoral {
  id: number;
  cauUf: {
    id: number;
    prefixo: string;
    nome: string;
  };
  eleicao: {
    id: number;
    titulo: string;
    ano: number;
  };
  coordenadores: MembroComissao[];
  membros: MembroComissao[];
  substitutos?: MembroComissao[];
  numeroMembros: number;
  dataInclusao: string;
  dataAlteracao?: string;
}

// Request para adicionar membro
export interface AdicionarMembroRequest {
  profissionalId: number;
  tipoParticipacaoId: number;
  eleicaoId: number;
  cauUfId: number;
}

// Request para substituir membro
export interface SubstituirMembroRequest {
  membroAntigoId: number;
  profissionalNovoId: number;
  justificativa: string;
}

// Filtros para busca
export interface FiltrosComissao {
  eleicaoId?: number;
  anoEleicao?: number;
  cauUfId?: number;
  tipoParticipacaoId?: number;
  situacaoId?: number;
  page?: number;
  size?: number;
}

// Estatísticas da comissão
export interface EstatisticasComissao {
  totalMembros: number;
  membrosPendentes: number;
  membrosConfirmados: number;
  membrosRejeitados: number;
  comissoesPorUf: {
    uf: string;
    total: number;
    confirmados: number;
    pendentes: number;
  }[];
}

// Constants (baseados no Angular)
export const SITUACAO_MEMBRO_PENDENTE = 1;
export const SITUACAO_MEMBRO_CONFIRMADO = 2;
export const SITUACAO_MEMBRO_REJEITADO = 3;

export const TIPO_PARTICIPACAO_COORDENADOR = 1;
export const TIPO_PARTICIPACAO_MEMBRO = 2;
export const TIPO_PARTICIPACAO_SUBSTITUTO = 3;

export const comissaoEleitoralService = {
  // Listar comissões eleitorais
  async listarComissoes(filtros: FiltrosComissao = {}): Promise<{
    content: ComissaoEleitoral[];
    totalElements: number;
    totalPages: number;
    size: number;
    number: number;
  }> {
    const { data } = await apiClient.get('/comissoes-eleitorais', { params: filtros });
    return data;
  },

  // Obter comissão por ID
  async getComissaoById(id: number): Promise<ComissaoEleitoral> {
    const { data } = await apiClient.get(`/comissoes-eleitorais/${id}`);
    return data;
  },

  // Obter comissão por UF e eleição
  async getComissaoByUfEleicao(ufId: number, eleicaoId: number): Promise<ComissaoEleitoral> {
    const { data } = await apiClient.get(`/comissoes-eleitorais/uf/${ufId}/eleicao/${eleicaoId}`);
    return data;
  },

  // Obter membros da comissão
  async getMembrosComissao(filtros: FiltrosComissao): Promise<MembroComissao[]> {
    const { data } = await apiClient.get('/comissoes-eleitorais/membros', { params: filtros });
    return data;
  },

  // Buscar profissional para adicionar à comissão
  async buscarProfissionalParaComissao(termo: string, ufId?: number): Promise<ProfissionalEntity[]> {
    const { data } = await apiClient.get('/comissoes-eleitorais/buscar-profissionais', {
      params: { termo, ufId, limit: 10 }
    });
    return data;
  },

  // Adicionar membro à comissão
  async adicionarMembro(dados: AdicionarMembroRequest): Promise<MembroComissao> {
    const { data } = await apiClient.post('/comissoes-eleitorais/membros', dados);
    return data;
  },

  // Remover membro da comissão
  async removerMembro(membroId: number, justificativa: string): Promise<void> {
    await apiClient.delete(`/comissoes-eleitorais/membros/${membroId}`, {
      data: { justificativa }
    });
  },

  // Substituir membro da comissão
  async substituirMembro(dados: SubstituirMembroRequest): Promise<MembroComissao> {
    const { data } = await apiClient.post('/comissoes-eleitorais/substituir-membro', dados);
    return data;
  },

  // Confirmar participação do membro
  async confirmarParticipacao(membroId: number): Promise<MembroComissao> {
    const { data } = await apiClient.put(`/comissoes-eleitorais/membros/${membroId}/confirmar`);
    return data;
  },

  // Rejeitar participação do membro
  async rejeitarParticipacao(membroId: number, motivo: string): Promise<MembroComissao> {
    const { data } = await apiClient.put(`/comissoes-eleitorais/membros/${membroId}/rejeitar`, { motivo });
    return data;
  },

  // Obter detalhes do membro
  async getDetalhesMembro(membroId: number): Promise<MembroComissao> {
    const { data } = await apiClient.get(`/comissoes-eleitorais/membros/${membroId}`);
    return data;
  },

  // Obter pendências do membro
  async getPendenciasMembro(membroId: number): Promise<string[]> {
    const { data } = await apiClient.get(`/comissoes-eleitorais/membros/${membroId}/pendencias`);
    return data;
  },

  // Obter tipos de participação
  async getTiposParticipacao(): Promise<TipoParticipacao[]> {
    const { data } = await apiClient.get('/comissoes-eleitorais/tipos-participacao');
    return data;
  },

  // Obter situações de membro
  async getSituacoesMembro(): Promise<SituacaoMembro[]> {
    const { data } = await apiClient.get('/comissoes-eleitorais/situacoes');
    return data;
  },

  // Obter estatísticas
  async getEstatisticas(eleicaoId?: number): Promise<EstatisticasComissao> {
    const { data } = await apiClient.get('/comissoes-eleitorais/estatisticas', {
      params: { eleicaoId }
    });
    return data;
  },

  // Exportar lista de membros
  async exportarMembros(filtros: FiltrosComissao, formato: 'pdf' | 'excel' = 'pdf'): Promise<Blob> {
    const { data } = await apiClient.get('/comissoes-eleitorais/exportar', {
      params: { ...filtros, formato },
      responseType: 'blob'
    });
    return data;
  },

  // Verificar se profissional pode participar
  async verificarElegibilidade(profissionalId: number, eleicaoId: number): Promise<{
    elegivel: boolean;
    motivos?: string[];
  }> {
    const { data } = await apiClient.get(`/comissoes-eleitorais/verificar-elegibilidade`, {
      params: { profissionalId, eleicaoId }
    });
    return data;
  },

  // Enviar convite para membro
  async enviarConvite(membroId: number): Promise<void> {
    await apiClient.post(`/comissoes-eleitorais/membros/${membroId}/enviar-convite`);
  },

  // Obter histórico de alterações da comissão
  async getHistoricoComissao(comissaoId: number): Promise<{
    id: number;
    tipo: string;
    descricao: string;
    usuario: string;
    data: string;
  }[]> {
    const { data } = await apiClient.get(`/comissoes-eleitorais/${comissaoId}/historico`);
    return data;
  }
};