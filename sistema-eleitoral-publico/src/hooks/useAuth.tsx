import { useState, useEffect, createContext, useContext, ReactNode } from 'react';
import { authService, User, LoginRequest, RegisterRequest } from '../services/api/authService';
import { useNavigate } from 'react-router-dom';
import { useSnackbar } from 'notistack';

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (credentials: LoginRequest) => Promise<void>;
  register: (userData: RegisterRequest) => Promise<void>;
  logout: () => Promise<void>;
  forgotPassword: (email: string) => Promise<void>;
  updateProfile: (userData: Partial<User>) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider = ({ children }: AuthProviderProps) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();
  const { enqueueSnackbar } = useSnackbar();

  // Verificar se o usuário está logado ao inicializar
  useEffect(() => {
    const initAuth = async () => {
      try {
        if (authService.isAuthenticated()) {
          const currentUser = authService.getCurrentUser();
          if (currentUser) {
            // Tentar buscar dados atualizados do perfil
            try {
              const updatedUser = await authService.getProfile();
              setUser(updatedUser);
            } catch (error) {
              // Se falhar, usar dados do localStorage
              setUser(currentUser);
            }
          }
        }
      } catch (error) {
        console.error('Erro ao inicializar autenticação:', error);
        // Limpar dados inválidos
        await authService.logout();
      } finally {
        setIsLoading(false);
      }
    };

    initAuth();
  }, []);

  const login = async (credentials: LoginRequest) => {
    try {
      setIsLoading(true);
      const response = await authService.login(credentials);
      setUser(response.user);
      
      enqueueSnackbar('Login realizado com sucesso!', { variant: 'success' });
      
      // Redirecionar para dashboard ou página anterior
      const redirectTo = sessionStorage.getItem('redirectAfterLogin') || '/dashboard';
      sessionStorage.removeItem('redirectAfterLogin');
      navigate(redirectTo);
    } catch (error: any) {
      const message = error.response?.data?.message || 'Erro ao fazer login';
      enqueueSnackbar(message, { variant: 'error' });
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (userData: RegisterRequest) => {
    try {
      setIsLoading(true);
      await authService.register(userData);
      
      enqueueSnackbar(
        'Cadastro realizado! Verifique seu email para ativar a conta.', 
        { variant: 'success' }
      );
      
      navigate('/login');
    } catch (error: any) {
      const message = error.response?.data?.message || 'Erro ao realizar cadastro';
      enqueueSnackbar(message, { variant: 'error' });
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    try {
      setIsLoading(true);
      await authService.logout();
      setUser(null);
      
      enqueueSnackbar('Logout realizado com sucesso!', { variant: 'info' });
      navigate('/');
    } catch (error) {
      console.error('Erro ao fazer logout:', error);
      // Mesmo com erro, limpar estado local
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  };

  const forgotPassword = async (email: string) => {
    try {
      setIsLoading(true);
      await authService.forgotPassword(email);
      
      enqueueSnackbar(
        'Email de recuperação enviado! Verifique sua caixa de entrada.', 
        { variant: 'success' }
      );
    } catch (error: any) {
      const message = error.response?.data?.message || 'Erro ao enviar email de recuperação';
      enqueueSnackbar(message, { variant: 'error' });
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const updateProfile = async (userData: Partial<User>) => {
    try {
      setIsLoading(true);
      const updatedUser = await authService.updateProfile(userData);
      setUser(updatedUser);
      
      enqueueSnackbar('Perfil atualizado com sucesso!', { variant: 'success' });
    } catch (error: any) {
      const message = error.response?.data?.message || 'Erro ao atualizar perfil';
      enqueueSnackbar(message, { variant: 'error' });
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const value: AuthContextType = {
    user,
    isAuthenticated: !!user,
    isLoading,
    login,
    register,
    logout,
    forgotPassword,
    updateProfile
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};