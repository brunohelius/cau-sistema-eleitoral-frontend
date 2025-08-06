import { apiClient } from './client';

// Tipos de impugnação
export interface TipoImpugnacao {
  id: number;
  descricao: string;
  ativo: boolean;
}

export interface StatusImpugnacao {
  id: number;
  descricao: string;
  cor: string;
}

// Membro da chapa (para impugnação)
export interface MembroChapaImpugnacao {
  id: number;
  profissional: {
    id: number;
    nome: string;
    registroNacional: string;
    cpf: string;
  };
  chapaEleicao: {
    id: number;
    nome: string;
    numeroChapa?: string;
    eleicao: {
      id: number;
      titulo: string;
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
  posicao: number;
}

// Declaração de atividade
export interface DeclaracaoAtividade {
  id: number;
  titulo: string;
  descricao: string;
  tipoResposta: number;
  obrigatoria: boolean;
  itensDeclaracao: ItemDeclaracao[];
}

export interface ItemDeclaracao {
  id: number;
  descricao: string;
  ordem: number;
}

export interface RespostaDeclaracao {
  idDeclaracao: number;
  itensRespostaDeclaracao: ItemRespostaDeclaracao[];
}

export interface ItemRespostaDeclaracao {
  idItemDeclaracao: number;
  situacaoResposta: boolean;
}

// Arquivo de impugnação
export interface ArquivoImpugnacao {
  id?: number;
  nomeArquivo: string;
  tamanhoArquivo: number;
  tipoArquivo: string;
  conteudo?: Blob;
  url?: string;
}

// Pedido de impugnação
export interface PedidoImpugnacao {
  id?: number;
  descricao: string;
  membroChapa: MembroChapaImpugnacao;
  impugnante: {
    id: number;
    nome: string;
    registroNacional: string;
  };
  statusImpugnacao: StatusImpugnacao;
  tipoImpugnacao: TipoImpugnacao;
  arquivosPedidoImpugnacao: ArquivoImpugnacao[];
  respostasDeclaracao: RespostaDeclaracao[];
  dataInclusao: string;
  dataAlteracao?: string;
  numeroProtocolo: string;
}

// Defesa de impugnação
export interface DefesaImpugnacao {
  id?: number;
  pedidoImpugnacao: PedidoImpugnacao;
  descricaoDefesa: string;
  arquivosDefesa: ArquivoImpugnacao[];
  dataInclusao: string;
  responsavel: {
    id: number;
    nome: string;
  };
}

// Julgamento de impugnação
export interface JulgamentoImpugnacao {
  id?: number;
  pedidoImpugnacao: PedidoImpugnacao;
  instancia: 1 | 2; // 1ª ou 2ª instância
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
  arquivosJulgamento: ArquivoImpugnacao[];
}

// Recurso de impugnação
export interface RecursoImpugnacao {
  id?: number;
  julgamentoImpugnacao: JulgamentoImpugnacao;
  recorrente: {
    id: number;
    nome: string;
    tipo: 'IMPUGNANTE' | 'IMPUGNADO';
  };
  descricaoRecurso: string;
  arquivosRecurso: ArquivoImpugnacao[];
  dataInclusao: string;
}

// Contrarrazão de recurso
export interface ContrarrazaoRecurso {
  id?: number;
  recursoImpugnacao: RecursoImpugnacao;
  descricaoContrarrazao: string;
  arquivosContrarrazao: ArquivoImpugnacao[];
  dataInclusao: string;
  responsavel: {
    id: number;
    nome: string;
  };
}

// Request para criar impugnação
export interface CriarImpugnacaoRequest {
  descricao: string;
  membroChapa: {
    id: number;
  };
  tipoImpugnacao: {
    id: number;
  };
  arquivosPedidoImpugnacao: File[];
  respostasDeclaracao: RespostaDeclaracao[];
}

// Filtros para busca
export interface FiltrosImpugnacao {
  impugnanteId?: number;
  chapaEleicaoId?: number;
  eleicaoId?: number;
  ufId?: number;
  statusImpugnacaoId?: number;
  tipoImpugnacaoId?: number;
  dataInicio?: string;
  dataFim?: string;
  numeroProtocolo?: string;
  page?: number;
  size?: number;
}

export const impugnacaoService = {
  // Buscar profissional para impugnar
  async buscarProfissionalParaImpugnar(termo: string): Promise<MembroChapaImpugnacao[]> {
    const { data } = await apiClient.get(`/impugnacoes/buscar-profissionais`, {
      params: { termo, limit: 10 }
    });
    return data;
  },

  // Obter dados completos do profissional impugnado
  async getProfissionalImpugnado(profissionalId: number): Promise<MembroChapaImpugnacao> {
    const { data } = await apiClient.get(`/impugnacoes/profissional-impugnado/${profissionalId}`);
    return data;
  },

  // Obter declarações por atividade
  async getDeclaracoesAtividade(atividadeId: number): Promise<DeclaracaoAtividade[]> {
    const { data } = await apiClient.get(`/impugnacoes/declaracoes-atividade/${atividadeId}`);
    return data;
  },

  // Criar pedido de impugnação
  async criarImpugnacao(dados: CriarImpugnacaoRequest): Promise<PedidoImpugnacao> {
    const formData = new FormData();
    
    // Adicionar dados básicos
    formData.append('descricao', dados.descricao);
    formData.append('membroChapa.id', dados.membroChapa.id.toString());
    formData.append('tipoImpugnacao.id', dados.tipoImpugnacao.id.toString());
    
    // Adicionar arquivos
    dados.arquivosPedidoImpugnacao.forEach((arquivo, index) => {
      formData.append(`arquivos[${index}]`, arquivo);
    });
    
    // Adicionar respostas da declaração
    formData.append('respostasDeclaracao', JSON.stringify(dados.respostasDeclaracao));

    const { data } = await apiClient.post('/impugnacoes', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
    return data;
  },

  // Listar impugnações com filtros
  async listarImpugnacoes(filtros: FiltrosImpugnacao = {}): Promise<{
    content: PedidoImpugnacao[];
    totalElements: number;
    totalPages: number;
    size: number;
    number: number;
  }> {
    const { data } = await apiClient.get('/impugnacoes', { params: filtros });
    return data;
  },

  // Obter impugnação por ID
  async getImpugnacaoById(id: number): Promise<PedidoImpugnacao> {
    const { data } = await apiClient.get(`/impugnacoes/${id}`);
    return data;
  },

  // Acompanhar impugnações do usuário
  async acompanharImpugnacoesUsuario(): Promise<PedidoImpugnacao[]> {
    const { data } = await apiClient.get('/impugnacoes/minhas-impugnacoes');
    return data;
  },

  // Acompanhar impugnações por UF (para comissão)
  async acompanharImpugnacoesPorUf(ufId: number): Promise<PedidoImpugnacao[]> {
    const { data } = await apiClient.get(`/impugnacoes/por-uf/${ufId}`);
    return data;
  },

  // === DEFESA ===

  // Criar defesa
  async criarDefesa(impugnacaoId: number, defesa: {
    descricaoDefesa: string;
    arquivos: File[];
  }): Promise<DefesaImpugnacao> {
    const formData = new FormData();
    formData.append('descricaoDefesa', defesa.descricaoDefesa);
    
    defesa.arquivos.forEach((arquivo, index) => {
      formData.append(`arquivos[${index}]`, arquivo);
    });

    const { data } = await apiClient.post(`/impugnacoes/${impugnacaoId}/defesa`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
    return data;
  },

  // Obter defesa da impugnação
  async getDefesa(impugnacaoId: number): Promise<DefesaImpugnacao | null> {
    try {
      const { data } = await apiClient.get(`/impugnacoes/${impugnacaoId}/defesa`);
      return data;
    } catch (error: any) {
      if (error.response?.status === 404) {
        return null;
      }
      throw error;
    }
  },

  // === JULGAMENTO ===

  // Criar julgamento (1ª instância)
  async criarJulgamentoPrimeiraInstancia(impugnacaoId: number, julgamento: {
    relatorId: number;
    parecer: string;
    resultado: 'PROCEDENTE' | 'IMPROCEDENTE';
    votosJulgadores: { membroId: number; voto: 'PROCEDENTE' | 'IMPROCEDENTE' | 'ABSTENCAO' }[];
    arquivos: File[];
  }): Promise<JulgamentoImpugnacao> {
    const formData = new FormData();
    formData.append('relatorId', julgamento.relatorId.toString());
    formData.append('parecer', julgamento.parecer);
    formData.append('resultado', julgamento.resultado);
    formData.append('votosJulgadores', JSON.stringify(julgamento.votosJulgadores));
    
    julgamento.arquivos.forEach((arquivo, index) => {
      formData.append(`arquivos[${index}]`, arquivo);
    });

    const { data } = await apiClient.post(`/impugnacoes/${impugnacaoId}/julgamento-primeira-instancia`, formData, {
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
  }): Promise<JulgamentoImpugnacao> {
    const formData = new FormData();
    formData.append('relatorId', julgamento.relatorId.toString());
    formData.append('parecer', julgamento.parecer);  
    formData.append('resultado', julgamento.resultado);
    formData.append('votosJulgadores', JSON.stringify(julgamento.votosJulgadores));
    
    julgamento.arquivos.forEach((arquivo, index) => {
      formData.append(`arquivos[${index}]`, arquivo);
    });

    const { data } = await apiClient.post(`/recursos/${recursoId}/julgamento-segunda-instancia`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
    return data;
  },

  // Obter julgamentos da impugnação
  async getJulgamentos(impugnacaoId: number): Promise<JulgamentoImpugnacao[]> {
    const { data } = await apiClient.get(`/impugnacoes/${impugnacaoId}/julgamentos`);
    return data;
  },

  // === RECURSOS ===

  // Criar recurso
  async criarRecurso(julgamentoId: number, recurso: {
    tipoRecorrente: 'IMPUGNANTE' | 'IMPUGNADO';
    descricaoRecurso: string;
    arquivos: File[];
  }): Promise<RecursoImpugnacao> {
    const formData = new FormData();
    formData.append('tipoRecorrente', recurso.tipoRecorrente);
    formData.append('descricaoRecurso', recurso.descricaoRecurso);
    
    recurso.arquivos.forEach((arquivo, index) => {
      formData.append(`arquivos[${index}]`, arquivo);
    });

    const { data } = await apiClient.post(`/julgamentos/${julgamentoId}/recurso`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
    return data;
  },

  // Criar contrarrazão
  async criarContrarrazao(recursoId: number, contrarrazao: {
    descricaoContrarrazao: string;
    arquivos: File[];
  }): Promise<ContrarrazaoRecurso> {
    const formData = new FormData();
    formData.append('descricaoContrarrazao', contrarrazao.descricaoContrarrazao);
    
    contrarrazao.arquivos.forEach((arquivo, index) => {
      formData.append(`arquivos[${index}]`, arquivo);
    });

    const { data } = await apiClient.post(`/recursos/${recursoId}/contrarrazao`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
    return data;
  },

  // Obter recursos da impugnação
  async getRecursos(impugnacaoId: number): Promise<RecursoImpugnacao[]> {
    const { data } = await apiClient.get(`/impugnacoes/${impugnacaoId}/recursos`);
    return data;
  },

  // === DOWNLOADS ===

  // Download de arquivo de impugnação
  async downloadArquivoImpugnacao(arquivoId: number): Promise<Blob> {
    const { data } = await apiClient.get(`/impugnacoes/arquivos/${arquivoId}/download`, {
      responseType: 'blob'
    });
    return data;
  },

  // === TIPOS E STATUS ===

  // Obter tipos de impugnação
  async getTiposImpugnacao(): Promise<TipoImpugnacao[]> {
    const { data } = await apiClient.get('/impugnacoes/tipos');
    return data;
  },

  // Obter status de impugnação
  async getStatusImpugnacao(): Promise<StatusImpugnacao[]> {
    const { data } = await apiClient.get('/impugnacoes/status');
    return data;
  },

  // === ESTATÍSTICAS ===

  // Obter estatísticas de impugnações
  async getEstatisticas(filtros: { eleicaoId?: number; ufId?: number } = {}): Promise<{
    totalImpugnacoes: number;
    impugnacoesPendentes: number;
    impugnacoesProcedentes: number;
    impugnacoesImprocedentes: number;
    tempoMedioJulgamento: number;
  }> {
    const { data } = await apiClient.get('/impugnacoes/estatisticas', { params: filtros });
    return data;
  }
};