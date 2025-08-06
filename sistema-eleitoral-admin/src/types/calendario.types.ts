export interface Calendario {
  id: number;
  eleicaoId: number;
  nome: string;
  descricao: string;
  ativo: boolean;
  dataInicio: string;
  dataFim: string;
  periodos: PeriodoEleitoral[];
  criadoPor: number;
  criadoEm: string;
  atualizadoEm?: string;
}

export interface PeriodoEleitoral {
  id: number;
  calendarioId: number;
  tipo: TipoPeriodo;
  nome: string;
  descricao: string;
  dataInicio: string;
  dataFim: string;
  ativo: boolean;
  obrigatorio: boolean;
  ordem: number;
  configuracoes?: ConfiguracaoPeriodo;
}

export enum TipoPeriodo {
  INSCRICAO_CHAPAS = 'INSCRICAO_CHAPAS',
  PRAZO_IMPUGNACAO = 'PRAZO_IMPUGNACAO',
  JULGAMENTO_IMPUGNACOES = 'JULGAMENTO_IMPUGNACOES',
  CAMPANHA_ELEITORAL = 'CAMPANHA_ELEITORAL',
  VOTACAO = 'VOTACAO',
  APURACAO = 'APURACAO',
  DIPLOMACAO = 'DIPLOMACAO',
  RECURSO_PRIMEIRA_INSTANCIA = 'RECURSO_PRIMEIRA_INSTANCIA',
  RECURSO_SEGUNDA_INSTANCIA = 'RECURSO_SEGUNDA_INSTANCIA',
  POSSE = 'POSSE',
}

export interface ConfiguracaoPeriodo {
  permitirAlteracoes?: boolean;
  enviarNotificacoes?: boolean;
  diasAntecedenciaAlerta?: number;
  horaInicio?: string;
  horaFim?: string;
  diasUteis?: boolean;
  observacoes?: string;
}

export interface StatusPeriodo {
  periodo: TipoPeriodo;
  status: 'NAO_INICIADO' | 'ATIVO' | 'FINALIZADO' | 'CANCELADO';
  dataInicio: string;
  dataFim: string;
  diasRestantes?: number;
  percentualConcluido?: number;
  proximaAcao?: string;
  alertas?: string[];
}

export interface EventoCalendario {
  id: number;
  calendarioId: number;
  titulo: string;
  descricao: string;
  data: string;
  tipo: 'INICIO' | 'FIM' | 'MARCO' | 'ALERTA';
  cor: string;
  icone?: string;
}

export interface RelatorioCalendario {
  calendario: Calendario;
  estatisticas: {
    totalPeriodos: number;
    periodosAtivos: number;
    periodosConcluidos: number;
    proximosPrazos: Array<{
      periodo: string;
      data: string;
      diasRestantes: number;
    }>;
  };
  cronograma: Array<{
    periodo: string;
    dataInicio: string;
    dataFim: string;
    status: string;
    duracao: number;
  }>;
}

export interface ConfiguracaoCalendario {
  templates: Array<{
    nome: string;
    descricao: string;
    periodos: Omit<PeriodoEleitoral, 'id' | 'calendarioId'>[];
  }>;
  feriados: Array<{
    data: string;
    nome: string;
    nacional: boolean;
  }>;
  configuracoesPadrao: {
    fusoHorario: string;
    formatoData: string;
    notificacoesPadrao: boolean;
    diasAntecedenciaAlerta: number;
  };
}

// Constantes para labels e configurações
export const PERIODO_LABELS: Record<TipoPeriodo, string> = {
  [TipoPeriodo.INSCRICAO_CHAPAS]: 'Inscrição de Chapas',
  [TipoPeriodo.PRAZO_IMPUGNACAO]: 'Prazo para Impugnação',
  [TipoPeriodo.JULGAMENTO_IMPUGNACOES]: 'Julgamento de Impugnações',
  [TipoPeriodo.CAMPANHA_ELEITORAL]: 'Campanha Eleitoral',
  [TipoPeriodo.VOTACAO]: 'Votação',
  [TipoPeriodo.APURACAO]: 'Apuração',
  [TipoPeriodo.DIPLOMACAO]: 'Diplomação',
  [TipoPeriodo.RECURSO_PRIMEIRA_INSTANCIA]: 'Recurso - 1ª Instância',
  [TipoPeriodo.RECURSO_SEGUNDA_INSTANCIA]: 'Recurso - 2ª Instância',
  [TipoPeriodo.POSSE]: 'Posse',
};

export const CORES_PERIODO: Record<TipoPeriodo, string> = {
  [TipoPeriodo.INSCRICAO_CHAPAS]: '#1976d2',
  [TipoPeriodo.PRAZO_IMPUGNACAO]: '#f57c00',
  [TipoPeriodo.JULGAMENTO_IMPUGNACOES]: '#d32f2f',
  [TipoPeriodo.CAMPANHA_ELEITORAL]: '#388e3c',
  [TipoPeriodo.VOTACAO]: '#7b1fa2',
  [TipoPeriodo.APURACAO]: '#303f9f',
  [TipoPeriodo.DIPLOMACAO]: '#00796b',
  [TipoPeriodo.RECURSO_PRIMEIRA_INSTANCIA]: '#f57c00',
  [TipoPeriodo.RECURSO_SEGUNDA_INSTANCIA]: '#d32f2f',
  [TipoPeriodo.POSSE]: '#4caf50',
};