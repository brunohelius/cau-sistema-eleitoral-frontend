import React, { useState, useEffect } from 'react';
import {
  Container,
  Typography,
  Box,
  Card,
  CardContent,
  Grid,
  Button,
  TextField,
  Avatar,
  Divider,
  Alert,
  Paper,
  IconButton,
  InputAdornment,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Switch,
  FormControlLabel,
  Tabs,
  Tab,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  CircularProgress
} from '@mui/material';
import {
  Edit as EditIcon,
  Save as SaveIcon,
  Cancel as CancelIcon,
  Visibility as VisibilityIcon,
  VisibilityOff as VisibilityOffIcon,
  Email as EmailIcon,
  Phone as PhoneIcon,
  Badge as BadgeIcon,
  Person as PersonIcon,
  Security as SecurityIcon,
  Notifications as NotificationsIcon,
  History as HistoryIcon,
  CheckCircle as CheckCircleIcon,
  Warning as WarningIcon,
  CameraAlt as CameraIcon,
  Delete as DeleteIcon
} from '@mui/icons-material';
import { useAuth } from '../hooks/useAuth';
import { useNavigate } from 'react-router-dom';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`profile-tabpanel-${index}`}
      aria-labelledby={`profile-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box sx={{ p: 3 }}>
          {children}
        </Box>
      )}
    </div>
  );
}

const profileValidationSchema = Yup.object({
  nome: Yup.string()
    .min(2, 'Nome deve ter pelo menos 2 caracteres')
    .required('Nome é obrigatório'),
  email: Yup.string()
    .email('Email inválido')
    .required('Email é obrigatório'),
  telefone: Yup.string()
    .matches(/^\([0-9]{2}\) [0-9]{4,5}-[0-9]{4}$/, 'Formato inválido: (xx) xxxxx-xxxx'),
  endereco: Yup.string(),
  cidade: Yup.string(),
  estado: Yup.string(),
  cep: Yup.string()
    .matches(/^[0-9]{5}-[0-9]{3}$/, 'Formato inválido: xxxxx-xxx')
});

const passwordValidationSchema = Yup.object({
  currentPassword: Yup.string()
    .required('Senha atual é obrigatória'),
  newPassword: Yup.string()
    .min(8, 'Nova senha deve ter pelo menos 8 caracteres')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, 'Nova senha deve conter pelo menos uma letra minúscula, uma maiúscula e um número')
    .required('Nova senha é obrigatória'),
  confirmPassword: Yup.string()
    .oneOf([Yup.ref('newPassword')], 'Senhas não coincidem')
    .required('Confirmação de senha é obrigatória')
});

// Mock data for user activity log
const mockActivityLog = [
  {
    id: 1,
    action: 'Login realizado',
    details: 'Acesso via navegador Chrome',
    ip: '192.168.1.100',
    timestamp: new Date('2024-02-15T10:30:00'),
    type: 'login'
  },
  {
    id: 2,
    action: 'Chapa criada',
    details: 'Chapa "Renovação CAU" foi criada',
    timestamp: new Date('2024-02-14T15:20:00'),
    type: 'action'
  },
  {
    id: 3,
    action: 'Perfil atualizado',
    details: 'Informações de contato alteradas',
    timestamp: new Date('2024-02-10T09:15:00'),
    type: 'update'
  },
  {
    id: 4,
    action: 'Documento enviado',
    details: 'Declaração de elegibilidade enviada',
    timestamp: new Date('2024-02-08T14:45:00'),
    type: 'document'
  },
  {
    id: 5,
    action: 'Login realizado',
    details: 'Acesso via navegador Firefox',
    ip: '192.168.1.101',
    timestamp: new Date('2024-02-05T08:30:00'),
    type: 'login'
  }
];

export const ProfilePage: React.FC = () => {
  const { user, isAuthenticated, updateProfile } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState(0);
  const [isEditing, setIsEditing] = useState(false);
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [changePasswordDialog, setChangePasswordDialog] = useState(false);
  const [deleteAccountDialog, setDeleteAccountDialog] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [preferences, setPreferences] = useState({
    emailNotifications: true,
    smsNotifications: false,
    marketingEmails: false,
    twoFactorAuth: false
  });

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
    }
  }, [isAuthenticated, navigate]);

  const profileFormik = useFormik({
    initialValues: {
      nome: user?.nome || '',
      email: user?.email || '',
      telefone: user?.telefone || '',
      endereco: user?.endereco || '',
      cidade: user?.cidade || '',
      estado: user?.estado || '',
      cep: user?.cep || ''
    },
    validationSchema: profileValidationSchema,
    onSubmit: async (values) => {
      try {
        setIsLoading(true);
        await updateProfile(values);
        setIsEditing(false);
      } catch (error) {
        console.error('Erro ao atualizar perfil:', error);
      } finally {
        setIsLoading(false);
      }
    }
  });

  const passwordFormik = useFormik({
    initialValues: {
      currentPassword: '',
      newPassword: '',
      confirmPassword: ''
    },
    validationSchema: passwordValidationSchema,
    onSubmit: async (values, { resetForm }) => {
      try {
        setIsLoading(true);
        // Simulate password change API call
        await new Promise(resolve => setTimeout(resolve, 1000));
        setChangePasswordDialog(false);
        resetForm();
        // Show success message
      } catch (error) {
        console.error('Erro ao alterar senha:', error);
      } finally {
        setIsLoading(false);
      }
    }
  });

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setActiveTab(newValue);
  };

  const handleCancelEdit = () => {
    profileFormik.resetForm();
    setIsEditing(false);
  };

  const handlePreferenceChange = (key: string) => (event: React.ChangeEvent<HTMLInputElement>) => {
    setPreferences(prev => ({
      ...prev,
      [key]: event.target.checked
    }));
  };

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'login':
        return <SecurityIcon color="primary" />;
      case 'action':
        return <CheckCircleIcon color="success" />;
      case 'update':
        return <EditIcon color="info" />;
      case 'document':
        return <BadgeIcon color="warning" />;
      default:
        return <HistoryIcon color="action" />;
    }
  };

  if (!user) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Alert severity="error">
          Usuário não encontrado. Faça login novamente.
        </Alert>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      {/* Header */}
      <Box mb={4}>
        <Typography variant="h3" component="h1" gutterBottom fontWeight="bold">
          Meu Perfil
        </Typography>
        <Typography variant="h6" color="textSecondary">
          Gerencie suas informações pessoais e preferências da conta
        </Typography>
      </Box>

      {/* Profile Summary Card */}
      <Card sx={{ mb: 4 }}>
        <CardContent>
          <Grid container spacing={3} alignItems="center">
            <Grid item>
              <Box position="relative">
                <Avatar
                  sx={{
                    width: 120,
                    height: 120,
                    bgcolor: 'primary.main',
                    fontSize: '3rem'
                  }}
                >
                  {user.nome.charAt(0).toUpperCase()}
                </Avatar>
                <IconButton
                  sx={{
                    position: 'absolute',
                    bottom: 0,
                    right: 0,
                    bgcolor: 'background.paper',
                    '&:hover': { bgcolor: 'grey.100' }
                  }}
                  size="small"
                >
                  <CameraIcon />
                </IconButton>
              </Box>
            </Grid>
            <Grid item xs>
              <Typography variant="h4" gutterBottom fontWeight="bold">
                {user.nome}
              </Typography>
              <Typography variant="body1" color="textSecondary" gutterBottom>
                {user.email}
              </Typography>
              <Box display="flex" gap={1} mt={2}>
                <Chip
                  label={user.ativo ? 'Conta Ativa' : 'Conta Inativa'}
                  color={user.ativo ? 'success' : 'error'}
                  icon={user.ativo ? <CheckCircleIcon /> : <WarningIcon />}
                />
                <Chip
                  label={user.emailVerificado ? 'Email Verificado' : 'Email Não Verificado'}
                  color={user.emailVerificado ? 'success' : 'warning'}
                  variant={user.emailVerificado ? 'filled' : 'outlined'}
                />
              </Box>
              <Typography variant="caption" color="textSecondary" display="block" mt={1}>
                Membro desde {format(new Date(user.dataCadastro), 'MMMM yyyy', { locale: ptBR })}
              </Typography>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* Tabs */}
      <Paper sx={{ mb: 2 }}>
        <Tabs value={activeTab} onChange={handleTabChange} aria-label="profile tabs">
          <Tab icon={<PersonIcon />} label="Dados Pessoais" />
          <Tab icon={<SecurityIcon />} label="Segurança" />
          <Tab icon={<NotificationsIcon />} label="Notificações" />
          <Tab icon={<HistoryIcon />} label="Atividades" />
        </Tabs>
      </Paper>

      {/* Tab Panels */}
      <Paper>
        {/* Personal Data Tab */}
        <TabPanel value={activeTab} index={0}>
          <Box component="form" onSubmit={profileFormik.handleSubmit}>
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
              <Typography variant="h6" fontWeight="bold">
                Informações Pessoais
              </Typography>
              {!isEditing ? (
                <Button
                  variant="outlined"
                  startIcon={<EditIcon />}
                  onClick={() => setIsEditing(true)}
                >
                  Editar
                </Button>
              ) : (
                <Box display="flex" gap={1}>
                  <Button
                    variant="outlined"
                    startIcon={<CancelIcon />}
                    onClick={handleCancelEdit}
                    disabled={isLoading}
                  >
                    Cancelar
                  </Button>
                  <Button
                    type="submit"
                    variant="contained"
                    startIcon={isLoading ? <CircularProgress size={20} /> : <SaveIcon />}
                    disabled={isLoading}
                  >
                    Salvar
                  </Button>
                </Box>
              )}
            </Box>

            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  name="nome"
                  label="Nome Completo"
                  value={profileFormik.values.nome}
                  onChange={profileFormik.handleChange}
                  onBlur={profileFormik.handleBlur}
                  error={profileFormik.touched.nome && Boolean(profileFormik.errors.nome)}
                  helperText={profileFormik.touched.nome && profileFormik.errors.nome}
                  disabled={!isEditing}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <PersonIcon />
                      </InputAdornment>
                    )
                  }}
                />
              </Grid>
              
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  name="email"
                  label="Email"
                  type="email"
                  value={profileFormik.values.email}
                  onChange={profileFormik.handleChange}
                  onBlur={profileFormik.handleBlur}
                  error={profileFormik.touched.email && Boolean(profileFormik.errors.email)}
                  helperText={profileFormik.touched.email && profileFormik.errors.email}
                  disabled={!isEditing}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <EmailIcon />
                      </InputAdornment>
                    )
                  }}
                />
              </Grid>

              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  name="telefone"
                  label="Telefone"
                  value={profileFormik.values.telefone}
                  onChange={profileFormik.handleChange}
                  onBlur={profileFormik.handleBlur}
                  error={profileFormik.touched.telefone && Boolean(profileFormik.errors.telefone)}
                  helperText={profileFormik.touched.telefone && profileFormik.errors.telefone}
                  disabled={!isEditing}
                  placeholder="(xx) xxxxx-xxxx"
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <PhoneIcon />
                      </InputAdornment>
                    )
                  }}
                />
              </Grid>

              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  name="cep"
                  label="CEP"
                  value={profileFormik.values.cep}
                  onChange={profileFormik.handleChange}
                  onBlur={profileFormik.handleBlur}
                  error={profileFormik.touched.cep && Boolean(profileFormik.errors.cep)}
                  helperText={profileFormik.touched.cep && profileFormik.errors.cep}
                  disabled={!isEditing}
                  placeholder="xxxxx-xxx"
                />
              </Grid>

              <Grid item xs={12}>
                <TextField
                  fullWidth
                  name="endereco"
                  label="Endereço"
                  value={profileFormik.values.endereco}
                  onChange={profileFormik.handleChange}
                  onBlur={profileFormik.handleBlur}
                  error={profileFormik.touched.endereco && Boolean(profileFormik.errors.endereco)}
                  helperText={profileFormik.touched.endereco && profileFormik.errors.endereco}
                  disabled={!isEditing}
                />
              </Grid>

              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  name="cidade"
                  label="Cidade"
                  value={profileFormik.values.cidade}
                  onChange={profileFormik.handleChange}
                  onBlur={profileFormik.handleBlur}
                  error={profileFormik.touched.cidade && Boolean(profileFormik.errors.cidade)}
                  helperText={profileFormik.touched.cidade && profileFormik.errors.cidade}
                  disabled={!isEditing}
                />
              </Grid>

              <Grid item xs={12} md={6}>
                <FormControl fullWidth disabled={!isEditing}>
                  <InputLabel>Estado</InputLabel>
                  <Select
                    name="estado"
                    value={profileFormik.values.estado}
                    onChange={profileFormik.handleChange}
                    label="Estado"
                  >
                    <MenuItem value="SP">São Paulo</MenuItem>
                    <MenuItem value="RJ">Rio de Janeiro</MenuItem>
                    <MenuItem value="MG">Minas Gerais</MenuItem>
                    <MenuItem value="RS">Rio Grande do Sul</MenuItem>
                    <MenuItem value="PR">Paraná</MenuItem>
                    {/* Add more states as needed */}
                  </Select>
                </FormControl>
              </Grid>
            </Grid>

            {/* Additional Info */}
            <Divider sx={{ my: 3 }} />
            <Typography variant="h6" gutterBottom fontWeight="bold">
              Informações Profissionais
            </Typography>
            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="CPF"
                  value={user.cpf}
                  disabled
                  helperText="CPF não pode ser alterado"
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <BadgeIcon />
                      </InputAdornment>
                    )
                  }}
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Data de Cadastro"
                  value={format(new Date(user.dataCadastro), 'dd/MM/yyyy', { locale: ptBR })}
                  disabled
                  helperText="Data de criação da conta"
                />
              </Grid>
            </Grid>
          </Box>
        </TabPanel>

        {/* Security Tab */}
        <TabPanel value={activeTab} index={1}>
          <Typography variant="h6" gutterBottom fontWeight="bold">
            Configurações de Segurança
          </Typography>
          
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <Card variant="outlined">
                <CardContent>
                  <Box display="flex" justifyContent="space-between" alignItems="center">
                    <Box>
                      <Typography variant="subtitle1" fontWeight="bold">
                        Alterar Senha
                      </Typography>
                      <Typography variant="body2" color="textSecondary">
                        Última alteração: há 3 meses
                      </Typography>
                    </Box>
                    <Button
                      variant="outlined"
                      onClick={() => setChangePasswordDialog(true)}
                    >
                      Alterar Senha
                    </Button>
                  </Box>
                </CardContent>
              </Card>
            </Grid>

            <Grid item xs={12}>
              <Card variant="outlined">
                <CardContent>
                  <FormControlLabel
                    control={
                      <Switch
                        checked={preferences.twoFactorAuth}
                        onChange={handlePreferenceChange('twoFactorAuth')}
                      />
                    }
                    label={
                      <Box>
                        <Typography variant="subtitle1" fontWeight="bold">
                          Autenticação de Dois Fatores
                        </Typography>
                        <Typography variant="body2" color="textSecondary">
                          Adicione uma camada extra de segurança à sua conta
                        </Typography>
                      </Box>
                    }
                  />
                </CardContent>
              </Card>
            </Grid>

            <Grid item xs={12}>
              <Card variant="outlined" sx={{ borderColor: 'error.main' }}>
                <CardContent>
                  <Box display="flex" justifyContent="space-between" alignItems="center">
                    <Box>
                      <Typography variant="subtitle1" fontWeight="bold" color="error">
                        Excluir Conta
                      </Typography>
                      <Typography variant="body2" color="textSecondary">
                        Esta ação não pode ser desfeita
                      </Typography>
                    </Box>
                    <Button
                      variant="outlined"
                      color="error"
                      startIcon={<DeleteIcon />}
                      onClick={() => setDeleteAccountDialog(true)}
                    >
                      Excluir Conta
                    </Button>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </TabPanel>

        {/* Notifications Tab */}
        <TabPanel value={activeTab} index={2}>
          <Typography variant="h6" gutterBottom fontWeight="bold">
            Preferências de Notificação
          </Typography>
          
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <Card variant="outlined">
                <CardContent>
                  <FormControlLabel
                    control={
                      <Switch
                        checked={preferences.emailNotifications}
                        onChange={handlePreferenceChange('emailNotifications')}
                      />
                    }
                    label={
                      <Box>
                        <Typography variant="subtitle1" fontWeight="bold">
                          Notificações por Email
                        </Typography>
                        <Typography variant="body2" color="textSecondary">
                          Receba atualizações sobre eleições e processos por email
                        </Typography>
                      </Box>
                    }
                  />
                </CardContent>
              </Card>
            </Grid>

            <Grid item xs={12}>
              <Card variant="outlined">
                <CardContent>
                  <FormControlLabel
                    control={
                      <Switch
                        checked={preferences.smsNotifications}
                        onChange={handlePreferenceChange('smsNotifications')}
                      />
                    }
                    label={
                      <Box>
                        <Typography variant="subtitle1" fontWeight="bold">
                          Notificações por SMS
                        </Typography>
                        <Typography variant="body2" color="textSecondary">
                          Receba alertas importantes por mensagem de texto
                        </Typography>
                      </Box>
                    }
                  />
                </CardContent>
              </Card>
            </Grid>

            <Grid item xs={12}>
              <Card variant="outlined">
                <CardContent>
                  <FormControlLabel
                    control={
                      <Switch
                        checked={preferences.marketingEmails}
                        onChange={handlePreferenceChange('marketingEmails')}
                      />
                    }
                    label={
                      <Box>
                        <Typography variant="subtitle1" fontWeight="bold">
                          Emails de Marketing
                        </Typography>
                        <Typography variant="body2" color="textSecondary">
                          Receba informações sobre novidades e eventos do CAU
                        </Typography>
                      </Box>
                    }
                  />
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </TabPanel>

        {/* Activity Log Tab */}
        <TabPanel value={activeTab} index={3}>
          <Typography variant="h6" gutterBottom fontWeight="bold">
            Histórico de Atividades
          </Typography>
          
          <List>
            {mockActivityLog.map((activity) => (
              <React.Fragment key={activity.id}>
                <ListItem alignItems="flex-start">
                  <ListItemIcon>
                    {getActivityIcon(activity.type)}
                  </ListItemIcon>
                  <ListItemText
                    primary={
                      <Box display="flex" justifyContent="space-between" alignItems="center">
                        <Typography variant="subtitle2" fontWeight="bold">
                          {activity.action}
                        </Typography>
                        <Typography variant="caption" color="textSecondary">
                          {format(activity.timestamp, 'dd/MM/yyyy HH:mm', { locale: ptBR })}
                        </Typography>
                      </Box>
                    }
                    secondary={
                      <Box>
                        <Typography variant="body2" color="textSecondary">
                          {activity.details}
                        </Typography>
                        {activity.ip && (
                          <Typography variant="caption" color="textSecondary">
                            IP: {activity.ip}
                          </Typography>
                        )}
                      </Box>
                    }
                  />
                </ListItem>
                <Divider variant="inset" component="li" />
              </React.Fragment>
            ))}
          </List>
        </TabPanel>
      </Paper>

      {/* Change Password Dialog */}
      <Dialog open={changePasswordDialog} onClose={() => setChangePasswordDialog(false)} maxWidth="sm" fullWidth>
        <form onSubmit={passwordFormik.handleSubmit}>
          <DialogTitle>Alterar Senha</DialogTitle>
          <DialogContent>
            <Grid container spacing={2} sx={{ mt: 1 }}>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  name="currentPassword"
                  label="Senha Atual"
                  type={showCurrentPassword ? 'text' : 'password'}
                  value={passwordFormik.values.currentPassword}
                  onChange={passwordFormik.handleChange}
                  onBlur={passwordFormik.handleBlur}
                  error={passwordFormik.touched.currentPassword && Boolean(passwordFormik.errors.currentPassword)}
                  helperText={passwordFormik.touched.currentPassword && passwordFormik.errors.currentPassword}
                  InputProps={{
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton
                          onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                          edge="end"
                        >
                          {showCurrentPassword ? <VisibilityOffIcon /> : <VisibilityIcon />}
                        </IconButton>
                      </InputAdornment>
                    )
                  }}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  name="newPassword"
                  label="Nova Senha"
                  type={showNewPassword ? 'text' : 'password'}
                  value={passwordFormik.values.newPassword}
                  onChange={passwordFormik.handleChange}
                  onBlur={passwordFormik.handleBlur}
                  error={passwordFormik.touched.newPassword && Boolean(passwordFormik.errors.newPassword)}
                  helperText={passwordFormik.touched.newPassword && passwordFormik.errors.newPassword}
                  InputProps={{
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton
                          onClick={() => setShowNewPassword(!showNewPassword)}
                          edge="end"
                        >
                          {showNewPassword ? <VisibilityOffIcon /> : <VisibilityIcon />}
                        </IconButton>
                      </InputAdornment>
                    )
                  }}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  name="confirmPassword"
                  label="Confirmar Nova Senha"
                  type={showConfirmPassword ? 'text' : 'password'}
                  value={passwordFormik.values.confirmPassword}
                  onChange={passwordFormik.handleChange}
                  onBlur={passwordFormik.handleBlur}
                  error={passwordFormik.touched.confirmPassword && Boolean(passwordFormik.errors.confirmPassword)}
                  helperText={passwordFormik.touched.confirmPassword && passwordFormik.errors.confirmPassword}
                  InputProps={{
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton
                          onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                          edge="end"
                        >
                          {showConfirmPassword ? <VisibilityOffIcon /> : <VisibilityIcon />}
                        </IconButton>
                      </InputAdornment>
                    )
                  }}
                />
              </Grid>
            </Grid>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setChangePasswordDialog(false)} disabled={isLoading}>
              Cancelar
            </Button>
            <Button 
              type="submit" 
              variant="contained" 
              disabled={isLoading}
              startIcon={isLoading ? <CircularProgress size={20} /> : undefined}
            >
              Alterar Senha
            </Button>
          </DialogActions>
        </form>
      </Dialog>

      {/* Delete Account Dialog */}
      <Dialog open={deleteAccountDialog} onClose={() => setDeleteAccountDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle color="error">Excluir Conta</DialogTitle>
        <DialogContent>
          <Alert severity="error" sx={{ mb: 2 }}>
            <Typography variant="body2">
              <strong>Esta ação é irreversível!</strong> Todos os seus dados, chapas e histórico serão permanentemente removidos.
            </Typography>
          </Alert>
          <Typography variant="body2">
            Tem certeza que deseja excluir sua conta? Digite "EXCLUIR" para confirmar:
          </Typography>
          <TextField
            fullWidth
            margin="normal"
            placeholder="Digite EXCLUIR"
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteAccountDialog(false)}>
            Cancelar
          </Button>
          <Button variant="contained" color="error">
            Excluir Conta
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};