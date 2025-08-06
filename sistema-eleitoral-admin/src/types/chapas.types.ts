export interface Chapa {
  id: number;
  eleicaoId: number;
  numero: number;
  nome: string;
  slogan?: string;
  tipo: 'nacional' | 'estadual' | 'ies';
  uf?: string;
  ies?: string;
  status: 'rascunho' | 'inscrita' | 'confirmada' | 'impugnada' | 'cancelada';
  coordenador: MembroChapa;
  vice?: MembroChapa;
  membros: MembroChapa[];
  documentos: DocumentoChapa[];
  diversidade: DiversidadeChapa;
  observacoes?: string;
  dataInscricao?: string;
  dataConfirmacao?: string;
  criadoEm: string;
  atualizadoEm: string;
}

export interface MembroChapa {
  id: number;
  chapaId?: number;
  profissionalId: number;
  nome: string;
  email: string;
  cpf: string;
  cau: string;
  uf: string;
  telefone?: string;
  cargo: 'coordenador' | 'vice' | 'membro' | 'suplente';
  titular: boolean;
  genero: 'masculino' | 'feminino' | 'outro' | 'nao_informado';
  etnia: 'branco' | 'preto' | 'pardo' | 'amarelo' | 'indigena' | 'nao_informado';
  lgbtqi: boolean;
  pcd: boolean;
  validacoes: ValidacaoMembro;
  criadoEm: string;
  atualizadoEm: string;
}

export interface ValidacaoMembro {
  situacaoCAU: 'ativo' | 'inativo' | 'suspenso';
  situacaoFinanceira: 'regular' | 'irregular';
  situacaoEtica: 'regular' | 'irregular';
  validado: boolean;
  observacoes?: string;
}

export interface DocumentoChapa {
  id: number;
  chapaId: number;
  tipo: 'programa' | 'declaracao' | 'autorizacao' | 'outros';
  nome: string;
  arquivo: string;
  tamanho: number;
  mimeType: string;
  obrigatorio: boolean;
  validado: boolean;
  criadoEm: string;
}

export interface DiversidadeChapa {
  totalMembros: number;
  percentualFeminino: number;
  percentualEtnico: number;
  percentualLGBTQI: number;
  percentualPCD: number;
  atendeCriterios: boolean;
}

export interface ChapaFormData {
  nome: string;
  slogan?: string;
  tipo: 'nacional' | 'estadual' | 'ies';
  uf?: string;
  ies?: string;
  coordenadorId: number;
  viceId?: number;
  membrosIds: number[];
  observacoes?: string;
}