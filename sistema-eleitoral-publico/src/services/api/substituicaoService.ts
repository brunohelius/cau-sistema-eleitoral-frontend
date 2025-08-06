import { apiClient } from './client';

// Tipos de substituição
export interface TipoSubstituicao {
  id: number;
  descricao: string;
  ativo: boolean;
}

export interface StatusSubstituicao {
  id: number;
  descricao: string;
  cor: string;
}

// Membro da chapa
export interface MembroChapa {
  id: number;
  profissional: {
    id: number;
    nome: string;
    registroNacional: string;
    cpf: string;
    email?: string;
    telefone?: string;
  };
  chapaEleicao: {
    id: number;
    nome: string;
    numeroChapa?: string;
    eleicao: {
      id: number;
      titulo: string;
      ano: number;
    };
    tipoCandidatura: {
      id: number;
      descricao: string;
    };
    cauUf?: {
      id: number;
      prefixo: string;
      nome: string;
    };
  };
  tipoParticipacaoChapa: {
    id: number;
    descricao: string;
  };
  tipoMembroChapa: {
    id: number;
    descricao: string;
  };
  statusValidacaoMembroChapa: {
    id: number;
    descricao: string;
  };
  statusParticipacaoChapa: {
    id: number;
    descricao: string;
  };
  numeroOrdem: number;
  situacaoResponsavel: boolean;
  pendencias?: {
    id: number;
    tipoPendencia: {
      id: number;
      descricao: string;
    };
  }[];
}

// Pedido de substituição
export interface PedidoSubstituicao {
  id?: number;
  chapaEleicao: {
    id: number;
    nome: string;
  };
  justificativa: string;
  membroSubstitutoTitular?: MembroChapa;
  membroSubstitutoSuplente?: MembroChapa;
  membroSubstituidoTitular?: MembroChapa;
  membroSubstituidoSuplente?: MembroChapa;
  statusSubstituicao: StatusSubstituicao;
  dataInclusao: string;
  dataAlteracao?: string;
  numeroProtocolo: string;
  arquivoJustificativa?: {
    id: number;
    nomeArquivo: string;
    tamanhoArquivo: number;
    tipoArquivo: string;
  };
  solicitante: {
    id: number;
    nome: string;
    registroNacional: string;
  };
}

// Julgamento de substituição
export interface JulgamentoSubstituicao {
  id?: number;
  pedidoSubstituicao: PedidoSubstituicao;
  instancia: 1 | 2;
  membrosJulgadores: {
    id: number;
    nome: string;
    voto: 'PROCEDENTE' | 'IMPROCEDENTE' | 'ABSTENCAO';
  }[];
  relator: {
    id: number;
    nome: string;
  };
  parecer: string;
  resultado: 'PROCEDENTE' | 'IMPROCEDENTE';
  dataJulgamento: string;
  arquivosJulgamento: {
    id: number;
    nomeArquivo: string;
    tamanhoArquivo: number;
  }[];
}

// Recurso de substituição
export interface RecursoSubstituicao {
  id?: number;
  julgamentoSubstituicao: JulgamentoSubstituicao;
  recorrente: {
    id: number;
    nome: string;
    tipo: 'SOLICITANTE' | 'COMISSAO';
  };
  descricaoRecurso: string;
  arquivosRecurso: {
    id: number;
    nomeArquivo: string;
    tamanhoArquivo: number;
  }[];
  dataInclusao: string;
}

// Request para criar substituição
export interface CriarSubstituicaoRequest {
  idChapaEleicao: number;
  justificativa: string;
  nomeArquivo: string;
  arquivo: File;
  tamanho: number;
  membroSubstitutoTitular?: {
    id?: number;
    idProfissional: number;
    idTipoMembro: number;
    idTipoParticipacaoChapa: number;
    numeroOrdem: number;
    situacaoResponsavel: boolean;
  };
  membroSubstitutoSuplente?: {
    id?: number;
    idProfissional: number;
    idTipoMembro: number;
    idTipoParticipacaoChapa: number;
    numeroOrdem: number;
    situacaoResponsavel: boolean;
  };
}

// Dados para busca de membro substituto
export interface BuscarMembroSubstitutoRequest {
  idProfissional: number;
  idTipoMembro: number;
  idTipoParticipacaoChapa: number;
  numeroOrdem: number;
}

// Resposta da busca de membro para substituição
export interface MembroSubstituicaoResponse {
  titular?: MembroChapa;
  suplente?: MembroChapa;
}

// Filtros para busca
export interface FiltrosSubstituicao {
  solicitanteId?: number;
  chapaEleicaoId?: number;
  eleicaoId?: number;
  ufId?: number;
  statusSubstituicaoId?: number;
  dataInicio?: string;
  dataFim?: string;
  numeroProtocolo?: string;
  page?: number;
  size?: number;
}

export const substituicaoService = {
  // Buscar profissional para substituição
  async buscarProfissionalParaSubstituir(termo: string): Promise<MembroChapa[]> {
    const { data } = await apiClient.get(`/substituicoes/buscar-profissionais`, {
      params: { termo, limit: 10 }
    });
    return data;
  },

  // Obter membro para substituição
  async getMembroSubstituicao(profissionalId: number): Promise<MembroSubstituicaoResponse> {
    const { data } = await apiClient.get(`/substituicoes/membro-substituicao/${profissionalId}`);
    return data;
  },

  // Buscar membro substituto
  async buscarMembroSubstituto(chapaId: number, substituto: BuscarMembroSubstitutoRequest): Promise<MembroChapa> {
    const { data } = await apiClient.post(`/substituicoes/chapa/${chapaId}/buscar-substituto`, substituto);
    return data;
  },

  // Validar arquivo de justificativa
  async validarArquivoJustificativa(arquivo: { nome: string; tamanho: number; tipoValidacao: number }): Promise<boolean> {
    const { data } = await apiClient.post('/substituicoes/validar-arquivo', arquivo);
    return data;
  },

  // Criar pedido de substituição
  async criarSubstituicao(dados: CriarSubstituicaoRequest): Promise<PedidoSubstituicao> {
    const formData = new FormData();
    
    // Adicionar dados básicos
    formData.append('idChapaEleicao', dados.idChapaEleicao.toString());
    formData.append('justificativa', dados.justificativa);
    formData.append('arquivo', dados.arquivo, dados.nomeArquivo);
    
    // Adicionar substitutos se existirem
    if (dados.membroSubstitutoTitular) {
      formData.append('membroSubstitutoTitular', JSON.stringify(dados.membroSubstitutoTitular));
    }
    
    if (dados.membroSubstitutoSuplente) {
      formData.append('membroSubstitutoSuplente', JSON.stringify(dados.membroSubstitutoSuplente));
    }

    const { data } = await apiClient.post('/substituicoes', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
    return data;
  },

  // Listar substituições com filtros
  async listarSubstituicoes(filtros: FiltrosSubstituicao = {}): Promise<{
    content: PedidoSubstituicao[];
    totalElements: number;
    totalPages: number;
    size: number;
    number: number;
  }> {
    const { data } = await apiClient.get('/substituicoes', { params: filtros });
    return data;
  },

  // Obter substituição por ID
  async getSubstituicaoById(id: number): Promise<PedidoSubstituicao> {
    const { data } = await apiClient.get(`/substituicoes/${id}`);
    return data;
  },

  // Acompanhar substituições do usuário
  async acompanharSubstituicoesUsuario(): Promise<PedidoSubstituicao[]> {
    const { data } = await apiClient.get('/substituicoes/minhas-substituicoes');
    return data;
  },

  // Acompanhar substituições por UF (para comissão)
  async acompanharSubstituicoesPorUf(ufId: number): Promise<PedidoSubstituicao[]> {
    const { data } = await apiClient.get(`/substituicoes/por-uf/${ufId}`);
    return data;
  },

  // === JULGAMENTO ===

  // Criar julgamento (1ª instância)
  async criarJulgamentoPrimeiraInstancia(substituicaoId: number, julgamento: {
    relatorId: number;
    parecer: string;
    resultado: 'PROCEDENTE' | 'IMPROCEDENTE';
    votosJulgadores: { membroId: number; voto: 'PROCEDENTE' | 'IMPROCEDENTE' | 'ABSTENCAO' }[];
    arquivos: File[];
  }): Promise<JulgamentoSubstituicao> {
    const formData = new FormData();
    formData.append('relatorId', julgamento.relatorId.toString());
    formData.append('parecer', julgamento.parecer);
    formData.append('resultado', julgamento.resultado);
    formData.append('votosJulgadores', JSON.stringify(julgamento.votosJulgadores));
    
    julgamento.arquivos.forEach((arquivo, index) => {
      formData.append(`arquivos[${index}]`, arquivo);
    });

    const { data } = await apiClient.post(`/substituicoes/${substituicaoId}/julgamento-primeira-instancia`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
    return data;
  },

  // Criar julgamento (2ª instância) 
  async criarJulgamentoSegundaInstancia(recursoId: number, julgamento: {
    relatorId: number;
    parecer: string;
    resultado: 'PROCEDENTE' | 'IMPROCEDENTE';
    votosJulgadores: { membroId: number; voto: 'PROCEDENTE' | 'IMPROCEDENTE' | 'ABSTENCAO' }[];
    arquivos: File[];
  }): Promise<JulgamentoSubstituicao> {
    const formData = new FormData();
    formData.append('relatorId', julgamento.relatorId.toString());
    formData.append('parecer', julgamento.parecer);  
    formData.append('resultado', julgamento.resultado);
    formData.append('votosJulgadores', JSON.stringify(julgamento.votosJulgadores));
    
    julgamento.arquivos.forEach((arquivo, index) => {
      formData.append(`arquivos[${index}]`, arquivo);
    });

    const { data } = await apiClient.post(`/recursos-substituicao/${recursoId}/julgamento-segunda-instancia`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
    return data;
  },

  // Obter julgamentos da substituição
  async getJulgamentos(substituicaoId: number): Promise<JulgamentoSubstituicao[]> {
    const { data } = await apiClient.get(`/substituicoes/${substituicaoId}/julgamentos`);
    return data;
  },

  // === RECURSOS ===

  // Criar recurso
  async criarRecurso(julgamentoId: number, recurso: {
    tipoRecorrente: 'SOLICITANTE' | 'COMISSAO';
    descricaoRecurso: string;
    arquivos: File[];
  }): Promise<RecursoSubstituicao> {
    const formData = new FormData();
    formData.append('tipoRecorrente', recurso.tipoRecorrente);
    formData.append('descricaoRecurso', recurso.descricaoRecurso);
    
    recurso.arquivos.forEach((arquivo, index) => {
      formData.append(`arquivos[${index}]`, arquivo);
    });

    const { data } = await apiClient.post(`/julgamentos-substituicao/${julgamentoId}/recurso`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
    return data;
  },

  // Obter recursos da substituição
  async getRecursos(substituicaoId: number): Promise<RecursoSubstituicao[]> {
    const { data } = await apiClient.get(`/substituicoes/${substituicaoId}/recursos`);
    return data;
  },

  // === DOWNLOADS ===

  // Download de arquivo de substituição
  async downloadArquivoSubstituicao(arquivoId: number): Promise<Blob> {
    const { data } = await apiClient.get(`/substituicoes/arquivos/${arquivoId}/download`, {
      responseType: 'blob'
    });
    return data;
  },

  // === TIPOS E STATUS ===

  // Obter tipos de substituição
  async getTiposSubstituicao(): Promise<TipoSubstituicao[]> {
    const { data } = await apiClient.get('/substituicoes/tipos');
    return data;
  },

  // Obter status de substituição
  async getStatusSubstituicao(): Promise<StatusSubstituicao[]> {
    const { data } = await apiClient.get('/substituicoes/status');
    return data;
  },

  // === ESTATÍSTICAS ===

  // Obter estatísticas de substituições
  async getEstatisticas(filtros: { eleicaoId?: number; ufId?: number } = {}): Promise<{
    totalSubstituicoes: number;
    substituicoesPendentes: number;
    substituicoesProcedentes: number;
    substituicoesImprocedentes: number;
    tempoMedioJulgamento: number;
  }> {
    const { data } = await apiClient.get('/substituicoes/estatisticas', { params: filtros });
    return data;
  }
};