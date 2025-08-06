import { apiClient } from './client';

// Tipos para denúncias
export interface TipoDenuncia {
  id: number;
  codigo: string;
  descricao: string;
  ativo: boolean;
}

export interface StatusDenuncia {
  id: number;
  descricao: string;
  cor: string;
}

export interface AnexoDenuncia {
  id?: number;
  nomeArquivo: string;
  tamanhoArquivo: number;
  tipoArquivo: string;
  conteudo?: Blob;
  url?: string;
}

export interface Denuncia {
  id?: number;
  numeroProtocolo?: string;
  
  // Dados do denunciante
  denuncianteNome?: string;
  denuncianteEmail?: string;
  denuncianteCpf?: string;
  denuncianteTelefone?: string;
  anonima: boolean;
  
  // Dados da denúncia
  tipoDenuncia: TipoDenuncia;
  eleicao?: {
    id: number;
    titulo: string;
    ano: number;
  };
  chapaEnvolvida?: string;
  assunto: string;
  descricao: string;
  
  // Status e workflow
  statusDenuncia: StatusDenuncia;
  dataInclusao: string;
  dataAlteracao?: string;
  
  // Anexos
  anexos: AnexoDenuncia[];
  
  // Análise
  responsavelAnalise?: {
    id: number;
    nome: string;
  };
  dataAnalise?: string;
  parecerAnalise?: string;
  
  // Decisão
  decisao?: 'PROCEDENTE' | 'IMPROCEDENTE' | 'ARQUIVADA';
  justificativaDecisao?: string;
  dataDecisao?: string;
  
  // Medidas adotadas
  medidasAdotadas?: string;
  dataImplementacao?: string;
}

// Request para criar denúncia
export interface CriarDenunciaRequest {
  // Identificação do denunciante
  denuncianteNome?: string;
  denuncianteEmail?: string;
  denuncianteCpf?: string;
  denuncianteTelefone?: string;
  anonima: boolean;
  
  // Dados da denúncia
  tipoId: number;
  eleicaoId?: number;
  chapaEnvolvida?: string;
  assunto: string;
  descricao: string;
  
  // Anexos
  anexos: File[];
  
  // Confirmações
  declaracaoVerdade: boolean;
  aceiteTermos: boolean;
}

// Request para análise da denúncia
export interface AnalisarDenunciaRequest {
  denunciaId: number;
  parecerAnalise: string;
  anexosAnalise?: File[];
}

// Request para decisão da denúncia
export interface DecidirDenunciaRequest {
  denunciaId: number;
  decisao: 'PROCEDENTE' | 'IMPROCEDENTE' | 'ARQUIVADA';
  justificativaDecisao: string;
  medidasAdotadas?: string;
  anexosDecisao?: File[];
}

// Filtros para busca
export interface FiltrosDenuncia {
  numeroProtocolo?: string;
  tipoDenunciaId?: number;
  eleicaoId?: number;
  statusDenunciaId?: number;
  denuncianteEmail?: string;
  anonima?: boolean;
  dataInicio?: string;
  dataFim?: string;
  responsavelAnaliseId?: number;
  decisao?: 'PROCEDENTE' | 'IMPROCEDENTE' | 'ARQUIVADA';
  page?: number;
  size?: number;
}

// Estatísticas
export interface EstatisticasDenuncia {
  totalDenuncias: number;
  denunciasAbertas: number;
  denunciasProcedentes: number;
  denunciasImprocedentes: number;
  denunciasArquivadas: number;
  tempoMedioAnalise: number;
  denunciasPorTipo: {
    tipo: string;
    quantidade: number;
  }[];
  denunciasPorMes: {
    mes: string;
    quantidade: number;
  }[];
}

// Constants
export const STATUS_DENUNCIA_RECEBIDA = 1;
export const STATUS_DENUNCIA_EM_ANALISE = 2;
export const STATUS_DENUNCIA_ANALISADA = 3;
export const STATUS_DENUNCIA_DECIDIDA = 4;
export const STATUS_DENUNCIA_IMPLEMENTADA = 5;
export const STATUS_DENUNCIA_ARQUIVADA = 6;

export const TIPOS_DENUNCIA = {
  IRREGULARIDADE_CHAPA: 'irregularidade_chapa',
  IRREGULARIDADE_PROCESSO: 'irregularidade_processo',
  CONDUTA_ANTIETICA: 'conduta_antiética',
  USO_INDEVIDO_RECURSOS: 'uso_indevido_recursos',
  PROPAGANDA_IRREGULAR: 'propaganda_irregular',
  OUTROS: 'outros'
};

export const denunciaService = {
  // Criar denúncia
  async criarDenuncia(dados: CriarDenunciaRequest): Promise<Denuncia> {
    const formData = new FormData();
    
    // Dados básicos
    formData.append('tipoId', dados.tipoId.toString());
    formData.append('assunto', dados.assunto);
    formData.append('descricao', dados.descricao);
    formData.append('anonima', dados.anonima.toString());
    formData.append('declaracaoVerdade', dados.declaracaoVerdade.toString());
    formData.append('aceiteTermos', dados.aceiteTermos.toString());
    
    // Dados do denunciante (se não for anônima)
    if (!dados.anonima) {
      if (dados.denuncianteNome) formData.append('denuncianteNome', dados.denuncianteNome);
      if (dados.denuncianteEmail) formData.append('denuncianteEmail', dados.denuncianteEmail);
      if (dados.denuncianteCpf) formData.append('denuncianteCpf', dados.denuncianteCpf);
      if (dados.denuncianteTelefone) formData.append('denuncianteTelefone', dados.denuncianteTelefone);
    }
    
    // Dados opcionais
    if (dados.eleicaoId) formData.append('eleicaoId', dados.eleicaoId.toString());
    if (dados.chapaEnvolvida) formData.append('chapaEnvolvida', dados.chapaEnvolvida);
    
    // Anexos
    dados.anexos.forEach((arquivo, index) => {
      formData.append(`anexos[${index}]`, arquivo);
    });

    const { data } = await apiClient.post('/denuncias', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
    return data;
  },

  // Listar denúncias
  async listarDenuncias(filtros: FiltrosDenuncia = {}): Promise<{
    content: Denuncia[];
    totalElements: number;
    totalPages: number;
    size: number;
    number: number;
  }> {
    const { data } = await apiClient.get('/denuncias', { params: filtros });
    return data;
  },

  // Obter denúncia por ID
  async getDenunciaById(id: number): Promise<Denuncia> {
    const { data } = await apiClient.get(`/denuncias/${id}`);
    return data;
  },

  // Buscar denúncia por protocolo
  async buscarPorProtocolo(protocolo: string): Promise<Denuncia> {
    const { data } = await apiClient.get(`/denuncias/protocolo/${protocolo}`);
    return data;
  },

  // Acompanhar denúncia (por protocolo ou email)
  async acompanharDenuncia(protocolo?: string, email?: string): Promise<Denuncia[]> {
    const params: any = {};
    if (protocolo) params.protocolo = protocolo;
    if (email) params.email = email;
    
    const { data } = await apiClient.get('/denuncias/acompanhar', { params });
    return data;
  },

  // Iniciar análise da denúncia
  async iniciarAnalise(denunciaId: number): Promise<Denuncia> {
    const { data } = await apiClient.put(`/denuncias/${denunciaId}/iniciar-analise`);
    return data;
  },

  // Analisar denúncia
  async analisarDenuncia(dados: AnalisarDenunciaRequest): Promise<Denuncia> {
    const formData = new FormData();
    formData.append('parecerAnalise', dados.parecerAnalise);
    
    if (dados.anexosAnalise) {
      dados.anexosAnalise.forEach((arquivo, index) => {
        formData.append(`anexosAnalise[${index}]`, arquivo);
      });
    }

    const { data } = await apiClient.put(`/denuncias/${dados.denunciaId}/analisar`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
    return data;
  },

  // Tomar decisão sobre a denúncia
  async decidirDenuncia(dados: DecidirDenunciaRequest): Promise<Denuncia> {
    const formData = new FormData();
    formData.append('decisao', dados.decisao);
    formData.append('justificativaDecisao', dados.justificativaDecisao);
    
    if (dados.medidasAdotadas) {
      formData.append('medidasAdotadas', dados.medidasAdotadas);
    }
    
    if (dados.anexosDecisao) {
      dados.anexosDecisao.forEach((arquivo, index) => {
        formData.append(`anexosDecisao[${index}]`, arquivo);
      });
    }

    const { data } = await apiClient.put(`/denuncias/${dados.denunciaId}/decidir`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
    return data;
  },

  // Marcar como implementada
  async marcarComoImplementada(denunciaId: number, relatorio: string): Promise<Denuncia> {
    const { data } = await apiClient.put(`/denuncias/${denunciaId}/implementar`, {
      relatorio
    });
    return data;
  },

  // Arquivar denúncia
  async arquivarDenuncia(denunciaId: number, motivo: string): Promise<Denuncia> {
    const { data } = await apiClient.put(`/denuncias/${denunciaId}/arquivar`, {
      motivo
    });
    return data;
  },

  // Download de anexo
  async downloadAnexo(anexoId: number): Promise<Blob> {
    const { data } = await apiClient.get(`/denuncias/anexos/${anexoId}/download`, {
      responseType: 'blob'
    });
    return data;
  },

  // Obter tipos de denúncia
  async getTiposDenuncia(): Promise<TipoDenuncia[]> {
    const { data } = await apiClient.get('/denuncias/tipos');
    return data;
  },

  // Obter status de denúncia
  async getStatusDenuncia(): Promise<StatusDenuncia[]> {
    const { data } = await apiClient.get('/denuncias/status');
    return data;
  },

  // Obter estatísticas
  async getEstatisticas(filtros: { dataInicio?: string; dataFim?: string } = {}): Promise<EstatisticasDenuncia> {
    const { data } = await apiClient.get('/denuncias/estatisticas', { params: filtros });
    return data;
  },

  // Exportar relatório
  async exportarRelatorio(filtros: FiltrosDenuncia, formato: 'pdf' | 'excel' = 'pdf'): Promise<Blob> {
    const { data } = await apiClient.get('/denuncias/exportar', {
      params: { ...filtros, formato },
      responseType: 'blob'
    });
    return data;
  },

  // Obter histórico da denúncia
  async getHistorico(denunciaId: number): Promise<{
    id: number;
    tipo: string;
    descricao: string;
    usuario: string;
    data: string;
  }[]> {
    const { data } = await apiClient.get(`/denuncias/${denunciaId}/historico`);
    return data;
  },

  // Enviar notificação ao denunciante
  async notificarDenunciante(denunciaId: number, mensagem: string): Promise<void> {
    await apiClient.post(`/denuncias/${denunciaId}/notificar`, {
      mensagem
    });
  },

  // Validar protocolo
  async validarProtocolo(protocolo: string): Promise<boolean> {
    try {
      const { data } = await apiClient.get(`/denuncias/validar-protocolo/${protocolo}`);
      return data.valido;
    } catch (error) {
      return false;
    }
  }
};