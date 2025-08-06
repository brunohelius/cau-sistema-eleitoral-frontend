import React, { FC, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  TextField,
  Button,
  Alert,
  Link,
  Container,
  CircularProgress,
  FormControlLabel,
  Checkbox,
} from '@mui/material';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useNavigate, Navigate } from 'react-router-dom';
import { useAppSelector, useAppDispatch } from '../../store/hooks';
import { login, clearError } from '../../store/slices/authSlice';
import { LoginCredentials } from '../types/auth.types';

const loginSchema = z.object({
  email: z.string().email('Email inválido'),
  password: z.string().min(6, 'Senha deve ter pelo menos 6 caracteres'),
  rememberMe: z.boolean().optional(),
});

type LoginFormData = z.infer<typeof loginSchema>;

export const LoginPage: FC = () => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { isLoading, error, isAuthenticated } = useAppSelector((state) => state.auth);

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      password: '',
      rememberMe: false,
    },
  });

  useEffect(() => {
    // Limpar erro quando componente montar
    dispatch(clearError());
  }, [dispatch]);

  // Se já está autenticado, redirecionar para dashboard
  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }

  const onSubmit = async (data: LoginFormData) => {
    try {
      await dispatch(login(data as LoginCredentials)).unwrap();
      navigate('/dashboard');
    } catch (error) {
      // Erro já é tratado no slice
    }
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #0066CC 0%, #004A99 100%)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        p: 2,
      }}
    >
      <Container maxWidth="sm">
        <Card
          sx={{
            boxShadow: '0 20px 40px rgba(0, 0, 0, 0.1)',
            borderRadius: 3,
          }}
        >
          <CardContent sx={{ p: 4 }}>
            {/* Header */}
            <Box textAlign="center" mb={4}>
              <Typography variant="h4" component="h1" gutterBottom fontWeight={600}>
                CAU Electoral
              </Typography>
              <Typography variant="body1" color="text.secondary">
                Sistema de Gestão Eleitoral
              </Typography>
            </Box>

            {/* Error Alert */}
            {error && (
              <Alert severity="error" sx={{ mb: 3 }}>
                {error}
              </Alert>
            )}

            {/* Login Form */}
            <form onSubmit={handleSubmit(onSubmit)}>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                <Controller
                  name="email"
                  control={control}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      label="Email"
                      type="email"
                      fullWidth
                      variant="outlined"
                      error={!!errors.email}
                      helperText={errors.email?.message}
                      disabled={isLoading}
                    />
                  )}
                />

                <Controller
                  name="password"
                  control={control}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      label="Senha"
                      type="password"
                      fullWidth
                      variant="outlined"
                      error={!!errors.password}
                      helperText={errors.password?.message}
                      disabled={isLoading}
                    />
                  )}
                />

                <Controller
                  name="rememberMe"
                  control={control}
                  render={({ field }) => (
                    <FormControlLabel
                      control={
                        <Checkbox
                          {...field}
                          checked={field.value}
                          disabled={isLoading}
                        />
                      }
                      label="Lembrar de mim"
                    />
                  )}
                />

                <Button
                  type="submit"
                  variant="contained"
                  size="large"
                  fullWidth
                  disabled={isLoading}
                  sx={{ py: 1.5, fontSize: '1.1rem' }}
                >
                  {isLoading ? (
                    <CircularProgress size={24} color="inherit" />
                  ) : (
                    'Entrar'
                  )}
                </Button>
              </Box>
            </form>

            {/* Footer Links */}
            <Box textAlign="center" mt={3}>
              <Link
                href="#"
                variant="body2"
                color="primary"
                underline="hover"
                sx={{ mr: 2 }}
              >
                Esqueceu a senha?
              </Link>
              <Link
                href="#"
                variant="body2"
                color="primary"
                underline="hover"
              >
                Primeiro acesso?
              </Link>
            </Box>

            {/* CAU Info */}
            <Box textAlign="center" mt={4} pt={3} borderTop={1} borderColor="divider">
              <Typography variant="caption" color="text.secondary">
                Conselho de Arquitetura e Urbanismo do Brasil
              </Typography>
              <br />
              <Typography variant="caption" color="text.secondary">
                Sistema Eleitoral - Versão 2.0
              </Typography>
            </Box>
          </CardContent>
        </Card>
      </Container>
    </Box>
  );
};