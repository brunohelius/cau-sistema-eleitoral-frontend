import React, { useState } from 'react';
import {
  Container,
  Paper,
  TextField,
  Button,
  Typography,
  Box,
  Link,
  Alert,
  InputAdornment,
  IconButton,
  CircularProgress,
  FormControlLabel,
  Checkbox,
  Stepper,
  Step,
  StepLabel,
  Grid
} from '@mui/material';
import {
  Email as EmailIcon,
  Lock as LockIcon,
  Visibility,
  VisibilityOff,
  Person as PersonIcon,
  Phone as PhoneIcon,
  Badge as BadgeIcon,
  PersonAdd as PersonAddIcon
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { useFormik } from 'formik';
import * as Yup from 'yup';

const steps = ['Dados Pessoais', 'Credenciais', 'Confirmação'];

const validationSchema = Yup.object({
  nome: Yup.string()
    .min(2, 'Nome deve ter pelo menos 2 caracteres')
    .required('Nome é obrigatório'),
  email: Yup.string()
    .email('Email inválido')
    .required('Email é obrigatório'),
  cpf: Yup.string()
    .matches(/^\d{11}$/, 'CPF deve conter 11 dígitos')
    .required('CPF é obrigatório'),
  telefone: Yup.string()
    .matches(/^\d{10,11}$/, 'Telefone deve conter 10 ou 11 dígitos'),
  password: Yup.string()
    .min(8, 'Senha deve ter pelo menos 8 caracteres')
    .matches(/[A-Z]/, 'Senha deve conter pelo menos uma letra maiúscula')
    .matches(/[a-z]/, 'Senha deve conter pelo menos uma letra minúscula')
    .matches(/\d/, 'Senha deve conter pelo menos um número')
    .required('Senha é obrigatória'),
  confirmPassword: Yup.string()
    .oneOf([Yup.ref('password')], 'Senhas não coincidem')
    .required('Confirmação de senha é obrigatória'),
  acceptTerms: Yup.boolean()
    .oneOf([true], 'Você deve aceitar os termos de uso')
});

export const RegisterPage: React.FC = () => {
  const navigate = useNavigate();
  const { register, isLoading } = useAuth();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [activeStep, setActiveStep] = useState(0);
  const [error, setError] = useState<string | null>(null);

  const formik = useFormik({
    initialValues: {
      nome: '',
      email: '',
      cpf: '',
      telefone: '',
      password: '',
      confirmPassword: '',
      acceptTerms: false
    },
    validationSchema,
    onSubmit: async (values) => {
      try {
        setError(null);
        await register(values);
      } catch (err: any) {
        setError(err.response?.data?.message || 'Erro ao realizar cadastro');
      }
    }
  });

  const handleNext = () => {
    if (activeStep === 0) {
      // Validar dados pessoais
      const personalErrors = ['nome', 'email', 'cpf'].filter(field => 
        formik.errors[field as keyof typeof formik.errors] && 
        formik.touched[field as keyof typeof formik.touched]
      );
      
      if (personalErrors.length === 0 && formik.values.nome && formik.values.email && formik.values.cpf) {
        setActiveStep(1);
      } else {
        // Marcar campos como tocados para mostrar erros
        formik.setTouched({
          ...formik.touched,
          nome: true,
          email: true,
          cpf: true
        });
      }
    } else if (activeStep === 1) {
      // Validar credenciais
      const credentialErrors = ['password', 'confirmPassword'].filter(field => 
        formik.errors[field as keyof typeof formik.errors] && 
        formik.touched[field as keyof typeof formik.touched]
      );
      
      if (credentialErrors.length === 0 && formik.values.password && formik.values.confirmPassword) {
        setActiveStep(2);
      } else {
        formik.setTouched({
          ...formik.touched,
          password: true,
          confirmPassword: true
        });
      }
    }
  };

  const handleBack = () => {
    setActiveStep(activeStep - 1);
  };

  const formatCPF = (value: string) => {
    return value.replace(/\D/g, '').slice(0, 11);
  };

  const formatPhone = (value: string) => {
    return value.replace(/\D/g, '').slice(0, 11);
  };

  const renderStepContent = (step: number) => {
    switch (step) {
      case 0:
        return (
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                id="nome"
                name="nome"
                label="Nome Completo"
                value={formik.values.nome}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                error={formik.touched.nome && Boolean(formik.errors.nome)}
                helperText={formik.touched.nome && formik.errors.nome}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <PersonIcon color="action" />
                    </InputAdornment>
                  ),
                }}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                id="email"
                name="email"
                label="Email"
                type="email"
                value={formik.values.email}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                error={formik.touched.email && Boolean(formik.errors.email)}
                helperText={formik.touched.email && formik.errors.email}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <EmailIcon color="action" />
                    </InputAdornment>
                  ),
                }}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                id="cpf"
                name="cpf"
                label="CPF"
                value={formik.values.cpf}
                onChange={(e) => {
                  const formatted = formatCPF(e.target.value);
                  formik.setFieldValue('cpf', formatted);
                }}
                onBlur={formik.handleBlur}
                error={formik.touched.cpf && Boolean(formik.errors.cpf)}
                helperText={formik.touched.cpf && formik.errors.cpf}
                placeholder="00000000000"
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <BadgeIcon color="action" />
                    </InputAdornment>
                  ),
                }}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                id="telefone"
                name="telefone"
                label="Telefone (Opcional)"
                value={formik.values.telefone}
                onChange={(e) => {
                  const formatted = formatPhone(e.target.value);
                  formik.setFieldValue('telefone', formatted);
                }}
                onBlur={formik.handleBlur}
                error={formik.touched.telefone && Boolean(formik.errors.telefone)}
                helperText={formik.touched.telefone && formik.errors.telefone}
                placeholder="11999999999"
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <PhoneIcon color="action" />
                    </InputAdornment>
                  ),
                }}
              />
            </Grid>
          </Grid>
        );

      case 1:
        return (
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                id="password"
                name="password"
                label="Senha"
                type={showPassword ? 'text' : 'password'}
                value={formik.values.password}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                error={formik.touched.password && Boolean(formik.errors.password)}
                helperText={formik.touched.password && formik.errors.password}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <LockIcon color="action" />
                    </InputAdornment>
                  ),
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton
                        onClick={() => setShowPassword(!showPassword)}
                        edge="end"
                      >
                        {showPassword ? <VisibilityOff /> : <Visibility />}
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                id="confirmPassword"
                name="confirmPassword"
                label="Confirmar Senha"
                type={showConfirmPassword ? 'text' : 'password'}
                value={formik.values.confirmPassword}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                error={formik.touched.confirmPassword && Boolean(formik.errors.confirmPassword)}
                helperText={formik.touched.confirmPassword && formik.errors.confirmPassword}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <LockIcon color="action" />
                    </InputAdornment>
                  ),
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        edge="end"
                      >
                        {showConfirmPassword ? <VisibilityOff /> : <Visibility />}
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
              />
            </Grid>
            <Grid item xs={12}>
              <Alert severity="info" sx={{ mt: 1 }}>
                <Typography variant="body2">
                  <strong>Requisitos da senha:</strong>
                  <br />• Mínimo 8 caracteres
                  <br />• Pelo menos uma letra maiúscula
                  <br />• Pelo menos uma letra minúscula
                  <br />• Pelo menos um número
                </Typography>
              </Alert>
            </Grid>
          </Grid>
        );

      case 2:
        return (
          <Box>
            <Typography variant="h6" gutterBottom>
              Confirme seus dados
            </Typography>
            <Box sx={{ bgcolor: 'grey.50', p: 2, borderRadius: 1, mb: 2 }}>
              <Typography variant="body1"><strong>Nome:</strong> {formik.values.nome}</Typography>
              <Typography variant="body1"><strong>Email:</strong> {formik.values.email}</Typography>
              <Typography variant="body1"><strong>CPF:</strong> {formik.values.cpf}</Typography>
              {formik.values.telefone && (
                <Typography variant="body1"><strong>Telefone:</strong> {formik.values.telefone}</Typography>
              )}
            </Box>
            
            <FormControlLabel
              control={
                <Checkbox
                  checked={formik.values.acceptTerms}
                  onChange={formik.handleChange}
                  name="acceptTerms"
                  color="primary"
                />
              }
              label={
                <Typography variant="body2">
                  Aceito os{' '}
                  <Link href="/termos" target="_blank">
                    termos de uso
                  </Link>{' '}
                  e{' '}
                  <Link href="/privacidade" target="_blank">
                    política de privacidade
                  </Link>
                </Typography>
              }
            />
            {formik.touched.acceptTerms && formik.errors.acceptTerms && (
              <Typography variant="caption" color="error" display="block" sx={{ mt: 1 }}>
                {formik.errors.acceptTerms}
              </Typography>
            )}
          </Box>
        );

      default:
        return 'Etapa desconhecida';
    }
  };

  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      <Paper elevation={3} sx={{ p: 4 }}>
        {/* Header */}
        <Box textAlign="center" sx={{ mb: 4 }}>
          <Box
            sx={{
              backgroundColor: 'primary.main',
              borderRadius: '50%',
              p: 2,
              mb: 2,
              display: 'inline-flex'
            }}
          >
            <PersonAddIcon sx={{ fontSize: 40, color: 'white' }} />
          </Box>
          <Typography component="h1" variant="h4" fontWeight="bold">
            Criar Conta
          </Typography>
          <Typography variant="body2" color="textSecondary">
            Cadastre-se para participar dos processos eleitorais do CAU
          </Typography>
        </Box>

        {/* Stepper */}
        <Stepper activeStep={activeStep} sx={{ mb: 4 }}>
          {steps.map((label) => (
            <Step key={label}>
              <StepLabel>{label}</StepLabel>
            </Step>
          ))}
        </Stepper>

        {/* Form */}
        <Box component="form" onSubmit={formik.handleSubmit}>
          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}

          {renderStepContent(activeStep)}

          {/* Navigation Buttons */}
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 3 }}>
            <Button
              disabled={activeStep === 0}
              onClick={handleBack}
            >
              Voltar
            </Button>
            
            {activeStep === steps.length - 1 ? (
              <Button
                type="submit"
                variant="contained"
                disabled={isLoading || !formik.values.acceptTerms}
              >
                {isLoading ? (
                  <CircularProgress size={24} color="inherit" />
                ) : (
                  'Criar Conta'
                )}
              </Button>
            ) : (
              <Button
                variant="contained"
                onClick={handleNext}
              >
                Próximo
              </Button>
            )}
          </Box>
        </Box>

        {/* Footer */}
        <Box sx={{ mt: 4, textAlign: 'center' }}>
          <Typography variant="body2" color="textSecondary">
            Já tem uma conta?{' '}
            <Link
              component="button"
              type="button"
              onClick={() => navigate('/login')}
              sx={{ textDecoration: 'none' }}
            >
              Faça login aqui
            </Link>
          </Typography>
        </Box>
      </Paper>
    </Container>
  );
};