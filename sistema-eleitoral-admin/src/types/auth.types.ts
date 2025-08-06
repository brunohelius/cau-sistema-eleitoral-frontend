export interface User {
  id: number;
  nome: string;
  email: string;
  cpf: string;
  telefone?: string;
  tipo: 'admin' | 'comissao' | 'profissional';
  permissoes: string[];
  uf?: string;
  cau?: string;
  ativo: boolean;
  ultimoLogin?: string;
  criadoEm: string;
  atualizadoEm: string;
}

export interface LoginCredentials {
  email: string;
  password: string;
  rememberMe?: boolean;
}

export interface LoginResponse {
  user: User;
  token: string;
  expiresIn: number;
}

export interface ChangePasswordData {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

export interface ResetPasswordData {
  email: string;
}

export interface Permission {
  id: string;
  nome: string;
  descricao: string;
  modulo: string;
}