export interface Eleicao {
  id: number;
  nome: string;
  ano: number;
  tipo: 'nacional' | 'estadual';
  status: 'configuracao' | 'ativa' | 'finalizada' | 'cancelada';
  dataInicio: string;
  dataFim: string;
  resolucao: string;
  descricao?: string;
  uf?: string;
  configuracoes: EleicaoConfiguracoes;
  calendario?: CalendarioEleitoral;
  criadoEm: string;
  atualizadoEm: string;
}

export interface EleicaoConfiguracoes {
  permiteChapaIES: boolean;
  numeroMinimoMembros: number;
  numeroMaximoMembros: number;
  percentualDiversidade: number;
  prazoImpugnacao: number;
  prazoDefesa: number;
  prazoRecurso: number;
}

export interface CreateEleicaoData {
  nome: string;
  ano: number;
  tipo: 'nacional' | 'estadual';
  dataInicio: string;
  dataFim: string;
  resolucao: string;
  descricao?: string;
  uf?: string;
  configuracoes: EleicaoConfiguracoes;
}

export interface CalendarioEleitoral {
  id: number;
  eleicaoId: number;
  fases: FaseEleitoral[];
  criadoEm: string;
  atualizadoEm: string;
}

export interface FaseEleitoral {
  id: number;
  nome: string;
  descricao: string;
  tipo: 'configuracao' | 'inscricao' | 'impugnacao' | 'julgamento' | 'campanha' | 'votacao' | 'resultado';
  dataInicio: string;
  dataFim: string;
  ativa: boolean;
  ordem: number;
  dependencias?: number[];
}