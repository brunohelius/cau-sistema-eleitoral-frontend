export interface Denuncia {
  id: number;
  eleicaoId: number;
  numero: string;
  tipo: 'irregularidade' | 'improbidade' | 'inelegibilidade' | 'outros';
  status: DenunciaStatus;
  denunciante: Pessoa;
  denunciado: Pessoa;
  objeto: string;
  descricao: string;
  fundamentacao: string;
  documentos: DocumentoDenuncia[];
  processoJudicial: ProcessoJudicial;
  decisaoFinal?: DecisaoJudicial;
  criadoEm: string;
  atualizadoEm: string;
}

export type DenunciaStatus = 
  | 'protocolada'
  | 'analise_admissibilidade'
  | 'admitida'
  | 'nao_admitida'
  | 'aguardando_defesa'
  | 'defesa_apresentada'
  | 'producao_provas'
  | 'audiencia_instrucao'
  | 'alegacoes_finais'
  | 'julgamento_primeira_instancia'
  | 'julgamento_segunda_instancia'
  | 'transitado_julgado'
  | 'arquivada';

export interface Pessoa {
  id: number;
  nome: string;
  email: string;
  cpf: string;
  cau?: string;
  uf?: string;
  telefone?: string;
  endereco?: string;
  tipo: 'profissional' | 'terceiro';
}

export interface DocumentoDenuncia {
  id: number;
  denunciaId: number;
  tipo: 'inicial' | 'defesa' | 'prova' | 'alegacao' | 'decisao' | 'outros';
  nome: string;
  arquivo: string;
  tamanho: number;
  mimeType: string;
  fase: string;
  criadoEm: string;
}

export interface ProcessoJudicial {
  id: number;
  denunciaId: number;
  fases: FaseProcessual[];
  prazos: PrazoProcessual[];
  audiencias: Audiencia[];
  decisoes: DecisaoJudicial[];
  criadoEm: string;
  atualizadoEm: string;
}

export interface FaseProcessual {
  id: number;
  nome: string;
  descricao: string;
  status: 'pendente' | 'em_andamento' | 'concluida' | 'cancelada';
  dataInicio?: string;
  dataFim?: string;
  prazoFinal?: string;
  responsavel: string;
  observacoes?: string;
}

export interface PrazoProcessual {
  id: number;
  fase: string;
  descricao: string;
  dataInicio: string;
  dataFim: string;
  prorrogavel: boolean;
  prorrogado: boolean;
  diasProrrogacao?: number;
  status: 'ativo' | 'cumprido' | 'expirado' | 'prorrogado';
}

export interface Audiencia {
  id: number;
  tipo: 'instrucao' | 'conciliacao' | 'outros';
  dataHora: string;
  local: string;
  presentes: string[];
  ata?: string;
  gravacao?: string;
  status: 'agendada' | 'realizada' | 'cancelada';
}

export interface DecisaoJudicial {
  id: number;
  instancia: 'primeira' | 'segunda';
  tipo: 'procedente' | 'improcedente' | 'parcialmente_procedente';
  fundamentacao: string;
  penalidade?: string;
  recurso: boolean;
  prazoRecurso?: string;
  julgador: string;
  dataJulgamento: string;
  transitoJulgado: boolean;
}

export interface DenunciaFormData {
  tipo: string;
  denuncianteId: number;
  denunciadoId: number;
  objeto: string;
  descricao: string;
  fundamentacao: string;
  documentos?: File[];
}