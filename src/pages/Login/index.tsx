import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { toast } from 'react-toastify';
import { FiMail, FiLock, FiEye, FiEyeOff } from 'react-icons/fi';
import { useAuth } from '../../contexts/AuthContext';
import { authService } from '../../services/authService';
import './styles.css';

interface LoginFormData {
  email: string;
  senha: string;
  manterConectado: boolean;
}

const Login: React.FC = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  
  const {
    register,
    handleSubmit,
    formState: { errors }
  } = useForm<LoginFormData>();

  const onSubmit = async (data: LoginFormData) => {
    setIsLoading(true);
    try {
      const response = await authService.login(data);
      login(response.token, response.usuario);
      
      toast.success('Login realizado com sucesso!');
      
      // Redirecionar baseado no tipo de usuário
      switch (response.usuario.tipoUsuario) {
        case 'Administrador':
          navigate('/admin/dashboard');
          break;
        case 'ComissaoEleitoral':
          navigate('/comissao/dashboard');
          break;
        case 'Profissional':
          navigate('/profissional/dashboard');
          break;
        case 'Conselheiro':
          navigate('/conselheiro/dashboard');
          break;
        default:
          navigate('/');
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Erro ao realizar login');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="login-container">
      <div className="login-card">
        <div className="login-header">
          <img src="/logo-cau.png" alt="CAU" className="login-logo" />
          <h1>Sistema Eleitoral</h1>
          <p>Faça login para continuar</p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="login-form">
          <div className="form-group">
            <label htmlFor="email">
              <FiMail /> Email
            </label>
            <input
              type="email"
              id="email"
              placeholder="seu@email.com"
              {...register('email', {
                required: 'Email é obrigatório',
                pattern: {
                  value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                  message: 'Email inválido'
                }
              })}
              className={errors.email ? 'error' : ''}
            />
            {errors.email && (
              <span className="error-message">{errors.email.message}</span>
            )}
          </div>

          <div className="form-group">
            <label htmlFor="senha">
              <FiLock /> Senha
            </label>
            <div className="password-input">
              <input
                type={showPassword ? 'text' : 'password'}
                id="senha"
                placeholder="••••••••"
                {...register('senha', {
                  required: 'Senha é obrigatória'
                })}
                className={errors.senha ? 'error' : ''}
              />
              <button
                type="button"
                className="toggle-password"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? <FiEyeOff /> : <FiEye />}
              </button>
            </div>
            {errors.senha && (
              <span className="error-message">{errors.senha.message}</span>
            )}
          </div>

          <div className="form-group checkbox-group">
            <label>
              <input
                type="checkbox"
                {...register('manterConectado')}
              />
              <span>Manter-me conectado</span>
            </label>
          </div>

          <button
            type="submit"
            className="btn-submit"
            disabled={isLoading}
          >
            {isLoading ? 'Entrando...' : 'Entrar'}
          </button>
        </form>

        <div className="login-footer">
          <Link to="/recuperar-senha" className="forgot-password">
            Esqueceu sua senha?
          </Link>
          <div className="divider">ou</div>
          <Link to="/registro" className="create-account">
            Criar nova conta
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Login;