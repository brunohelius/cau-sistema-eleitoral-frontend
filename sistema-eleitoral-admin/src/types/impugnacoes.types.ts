export interface Impugnacao {
  id: number;
  eleicaoId: number;
  numero: string;
  tipo: 'chapa' | 'membro' | 'documento';
  status: ImpugnacaoStatus;
  impugnante: Pessoa;
  objetoImpugnacao: ObjetoImpugnacao;
  motivo: string;
  fundamentacao: string;
  defesa?: string;
  decisao?: DecisaoImpugnacao;
  documentos: DocumentoImpugnacao[];
  prazos: PrazoImpugnacao[];
  criadoEm: string;
  atualizadoEm: string;
}

export type ImpugnacaoStatus = 
  | 'protocolada'
  | 'aguardando_defesa'
  | 'defesa_apresentada'
  | 'em_julgamento'
  | 'deferida'
  | 'indeferida'
  | 'arquivada';

export interface Pessoa {
  id: number;
  nome: string;
  email: string;
  cpf: string;
  cau?: string;
  uf?: string;
  telefone?: string;
  tipo: 'profissional' | 'comissao' | 'terceiro';
}

export interface ObjetoImpugnacao {
  tipo: 'chapa' | 'membro' | 'documento';
  id: number;
  nome: string;
  descricao: string;
}

export interface DecisaoImpugnacao {
  id: number;
  tipo: 'deferida' | 'indeferida';
  fundamentacao: string;
  julgador: string;
  dataJulgamento: string;
  penalidade?: string;
  recurso: boolean;
}

export interface DocumentoImpugnacao {
  id: number;
  impugnacaoId: number;
  tipo: 'inicial' | 'defesa' | 'decisao' | 'outros';
  nome: string;
  arquivo: string;
  tamanho: number;
  mimeType: string;
  criadoEm: string;
}

export interface PrazoImpugnacao {
  id: number;
  fase: 'impugnacao' | 'defesa' | 'julgamento';
  dataInicio: string;
  dataFim: string;
  status: 'ativo' | 'cumprido' | 'expirado';
  prorrogavel: boolean;
  prorrogado: boolean;
}

export interface ImpugnacaoFormData {
  tipo: 'chapa' | 'membro' | 'documento';
  objetoId: number;
  motivo: string;
  fundamentacao: string;
  documentos?: File[];
}