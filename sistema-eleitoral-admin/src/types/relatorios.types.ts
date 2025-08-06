export interface Relatorio {
  id: number;
  nome: string;
  tipo: RelatorioTipo;
  descricao: string;
  eleicaoId?: number;
  parametros: RelatorioParametros;
  formato: 'pdf' | 'excel' | 'csv';
  status: 'gerando' | 'concluido' | 'erro';
  arquivo?: string;
  tamanho?: number;
  geradoPor: string;
  geradoEm: string;
  expiresEm?: string;
}

export type RelatorioTipo = 
  | 'chapas'
  | 'comissoes'
  | 'denuncias'
  | 'impugnacoes'
  | 'diversidade'
  | 'calendario'
  | 'estatisticas'
  | 'customizado';

export interface RelatorioParametros {
  eleicaoId?: number;
  uf?: string;
  status?: string[];
  dataInicio?: string;
  dataFim?: string;
  incluirDetalhes?: boolean;
  agruparPor?: string;
  ordenarPor?: string;
  campos?: string[];
  filtros?: Record<string, any>;
}

export interface RelatorioConfig {
  tipo: RelatorioTipo;
  nome: string;
  descricao: string;
  parametros: RelatorioParametros;
  formato: 'pdf' | 'excel' | 'csv';
  template?: string;
  campos: CampoRelatorio[];
}

export interface CampoRelatorio {
  nome: string;
  label: string;
  tipo: 'texto' | 'numero' | 'data' | 'booleano' | 'lista';
  obrigatorio: boolean;
  visivel: boolean;
  ordem: number;
  formatacao?: string;
  agrupavel?: boolean;
  somavel?: boolean;
}

export interface RelatorioFiltros {
  tipo?: RelatorioTipo;
  eleicaoId?: number;
  status?: string;
  geradoPor?: string;
  dataInicio?: string;
  dataFim?: string;
}

export interface EstatisticasEleicao {
  totalChapas: number;
  chapasPorStatus: Record<string, number>;
  chapasPorUF: Record<string, number>;
  totalMembros: number;
  membrosPorGenero: Record<string, number>;
  membrosPorEtnia: Record<string, number>;
  diversidadeMedia: number;
  totalDenuncias: number;
  denunciasPorTipo: Record<string, number>;
  totalImpugnacoes: number;
  impugnacoesPorTipo: Record<string, number>;
  comissoesPorUF: Record<string, number>;
  participacaoGeral: number;
}