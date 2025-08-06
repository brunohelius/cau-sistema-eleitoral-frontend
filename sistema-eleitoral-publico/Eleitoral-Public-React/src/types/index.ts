// Base interfaces
export interface BaseEntity {
  id: number;
  createdAt: string;
  updatedAt: string;
}

// UF (Unidade Federativa)
export interface UF extends BaseEntity {
  nome: string;
  sigla: string;
  regiao: string;
}

// Profissional
export interface Profissional extends BaseEntity {
  nome: string;
  email: string;
  cpf: string;
  registro?: string;
  uf?: UF;
  situacao?: string;
}

// Eleição
export interface Eleicao extends BaseEntity {
  titulo: string;
  descricao?: string;
  tipo: 'FEDERAL' | 'ESTADUAL';
  uf?: UF;
  dataInicio: string;
  dataFim: string;
  status: 'PLANEJADA' | 'ATIVA' | 'FINALIZADA';
  configuracoes?: {
    permiteImpugnacao: boolean;
    permiteDenuncia: boolean;
    permiteSubstituicao: boolean;
  };
}

// Membro de Chapa
export interface MembroChapa extends BaseEntity {
  profissional?: Profissional;
  tipoMembro: 'TITULAR' | 'SUPLENTE';
  cargo?: string;
  ordem?: number;
}

// Chapa
export interface Chapa extends BaseEntity {
  nome: string;
  numero?: string;
  descricao?: string;
  status: 'RASCUNHO' | 'ENVIADA' | 'EM_ANALISE' | 'APROVADA' | 'REJEITADA';
  eleicao?: Eleicao;
  responsavel?: Profissional;
  membros?: MembroChapa[];
  motivoRejeicao?: string;
  dataEnvio?: string;
  dataAprovacao?: string;
}

// Chapa Pública (versão simplificada para exibição pública)
export interface ChapaPublica {
  id: number;
  nome: string;
  numero?: string;
  descricao?: string;
  status: string;
  eleicao?: {
    id: number;
    titulo: string;
    tipo: string;
    uf?: {
      id: number;
      nome: string;
      sigla: string;
    };
  };
  responsavel?: {
    id: number;
    nome: string;
  };
  membros?: Array<{
    id: number;
    tipoMembro: string;
    cargo?: string;
    profissional?: {
      id: number;
      nome: string;
    };
  }>;
}

// Calendário Eleitoral
export interface CalendarioEleitoral extends BaseEntity {
  titulo: string;
  descricao?: string;
  tipo: 'PRAZO' | 'EVENTO' | 'PERIODO';
  dataInicio: string;
  dataFim?: string;
  eleicao?: Eleicao;
  ativo: boolean;
}

// Impugnação
export interface Impugnacao extends BaseEntity {
  numero: string;
  tipo: 'CHAPA' | 'MEMBRO';
  motivo: string;
  descricao: string;
  status: 'PENDENTE' | 'EM_ANALISE' | 'PROCEDENTE' | 'IMPROCEDENTE';
  eleicao?: Eleicao;
  chapa?: Chapa;
  membro?: MembroChapa;
  requerente?: Profissional;
  dataEnvio: string;
  prazoDefesa?: string;
  defesa?: string;
  dataDefesa?: string;
}

// Substituição
export interface Substituicao extends BaseEntity {
  numero: string;
  motivo: string;
  justificativa: string;
  status: 'PENDENTE' | 'APROVADA' | 'REJEITADA';
  chapa?: Chapa;
  membroSaida?: MembroChapa;
  membroEntrada?: {
    profissional?: Profissional;
    tipoMembro: string;
    cargo?: string;
  };
  solicitante?: Profissional;
  dataEnvio: string;
  dataAnalise?: string;
  parecer?: string;
}

// Denúncia
export interface Denuncia extends BaseEntity {
  numero: string;
  assunto: string;
  descricao: string;
  status: 'NOVA' | 'EM_ANALISE' | 'PROCEDENTE' | 'IMPROCEDENTE';
  eleicao?: Eleicao;
  denunciado?: Profissional;
  denunciante?: Profissional;
  dataEnvio: string;
  categoria: string;
  gravidade: 'BAIXA' | 'MEDIA' | 'ALTA';
}

// Julgamento
export interface Julgamento extends BaseEntity {
  processo: string;
  instancia: 'PRIMEIRA' | 'SEGUNDA';
  tipo: 'IMPUGNACAO' | 'DENUNCIA' | 'SUBSTITUICAO';
  status: 'PENDENTE' | 'EM_JULGAMENTO' | 'JULGADO';
  relatoria?: Profissional;
  votos?: Array<{
    membro: Profissional;
    voto: 'FAVORAVEL' | 'CONTRARIO' | 'ABSTENCAO';
    justificativa?: string;
  }>;
  resultado?: 'PROCEDENTE' | 'IMPROCEDENTE' | 'PARCIALMENTE_PROCEDENTE';
  acórdão?: string;
  dataJulgamento?: string;
}

// Comissão Eleitoral
export interface ComissaoEleitoral extends BaseEntity {
  tipo: 'FEDERAL' | 'ESTADUAL';
  uf?: UF;
  eleicao?: Eleicao;
  membros?: Array<{
    profissional: Profissional;
    funcao: 'COORDENADOR' | 'MEMBRO' | 'SUPLENTE';
    ativo: boolean;
  }>;
}

// Votação
export interface Votacao extends BaseEntity {
  eleicao?: Eleicao;
  profissional?: Profissional;
  chapa?: Chapa;
  dataVoto: string;
  uf?: UF;
}

// Resultado da Eleição
export interface ResultadoEleicao {
  eleicao: Eleicao;
  totalVotos: number;
  totalEleitores: number;
  percentualParticipacao: number;
  chapas: Array<{
    chapa: ChapaPublica;
    votos: number;
    percentual: number;
    posicao: number;
  }>;
  votosPorUf?: Array<{
    uf: UF;
    totalVotos: number;
    chapas: Array<{
      chapa: ChapaPublica;
      votos: number;
      percentual: number;
    }>;
  }>;
}

// Auth
export interface User {
  id: number;
  nome: string;
  email: string;
  cpf: string;
  roles: string[];
  profissional?: Profissional;
}

export interface AuthResponse {
  token: string;
  user: User;
}

// API Response
export interface ApiResponse<T> {
  data: T;
  message?: string;
  success: boolean;
}

// Pagination
export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

// Filters
export interface FilterOptions {
  search?: string;
  status?: string;
  eleicaoId?: string;
  ufId?: string;
  page?: number;
  limit?: number;
}