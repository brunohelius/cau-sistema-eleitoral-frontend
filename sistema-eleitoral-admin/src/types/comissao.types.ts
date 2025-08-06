export interface ComissaoEleitoral {
  id: number;
  eleicaoId: number;
  tipo: 'nacional' | 'estadual';
  uf?: string;
  nome: string;
  status: 'configuracao' | 'ativa' | 'finalizada';
  membros: MembroComissao[];
  configuracoesEspecificas?: ComissaoConfiguracoes;
  criadoEm: string;
  atualizadoEm: string;
}

export interface MembroComissao {
  id: number;
  comissaoId: number;
  profissionalId: number;
  nome: string;
  email: string;
  cpf: string;
  cau: string;
  uf: string;
  telefone?: string;
  cargo: 'coordenador' | 'coordenador_adjunto' | 'membro' | 'suplente';
  titular: boolean;
  especialidade?: string;
  representacao: 'proporcional' | 'nomeacao';
  situacao: 'ativo' | 'afastado' | 'substituido';
  dataPosse?: string;
  dataAfastamento?: string;
  motivoAfastamento?: string;
  criadoEm: string;
  atualizadoEm: string;
}

export interface ComissaoConfiguracoes {
  numeroMembros: number;
  numeroSuplentes: number;
  proporcionalidade: ProporcionalidadeConfig[];
  criteriosEspeciais?: string[];
}

export interface ProporcionalidadeConfig {
  regiao: string;
  percentual: number;
  minimoMembros: number;
  maximoMembros: number;
}

export interface CreateComissaoData {
  tipo: 'nacional' | 'estadual';
  uf?: string;
  nome: string;
  configuracoes?: ComissaoConfiguracoes;
}

export interface SubstituicaoMembro {
  id: number;
  membroOriginalId: number;
  membroSubstitutoId: number;
  motivo: string;
  justificativa: string;
  status: 'solicitada' | 'aprovada' | 'rejeitada';
  datasolicitacao: string;
  dataAprovacao?: string;
  aprovadoPor?: string;
}