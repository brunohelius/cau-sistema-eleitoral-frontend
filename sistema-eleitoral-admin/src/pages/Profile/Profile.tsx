import React, { useState } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Grid,
  Button,
  TextField,
  Avatar,
  Divider,
  Alert,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Tab,
  Tabs,
  Paper,
  Switch,
  FormControlLabel,
  Chip,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from '@mui/material';
import {
  Save,
  Edit,
  Person,
  Security,
  Notifications,
  History,
  Camera,
  Phone,
  Email,
  LocationOn,
  Work,
  CalendarToday,
  Shield,
  Visibility,
  VisibilityOff,
  Key,
  Smartphone,
} from '@mui/icons-material';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface UserProfile {
  id: string;
  nome: string;
  email: string;
  telefone: string;
  cargo: string;
  setor: string;
  uf: string;
  regional: string;
  dataAdmissao: Date;
  avatar?: string;
  bio?: string;
}

interface SecuritySettings {
  twoFactorEnabled: boolean;
  emailNotifications: boolean;
  smsNotifications: boolean;
  pushNotifications: boolean;
  loginAlerts: boolean;
}

interface AccessLog {
  id: string;
  data: Date;
  ip: string;
  dispositivo: string;
  localizacao: string;
  sucesso: boolean;
}

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

export const Profile: React.FC = () => {
  const [currentTab, setCurrentTab] = useState(0);
  const [editingProfile, setEditingProfile] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'success' | 'error'>('idle');
  const [openPasswordDialog, setOpenPasswordDialog] = useState(false);
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  
  const [profile, setProfile] = useState<UserProfile>({
    id: '1',
    nome: 'Ana Costa Santos',
    email: 'ana.costa@cau.gov.br',
    telefone: '(61) 99999-8888',
    cargo: 'Secretária Eleitoral',
    setor: 'Comissão Eleitoral Central',
    uf: 'DF',
    regional: 'Nacional',
    dataAdmissao: new Date('2020-03-15'),
    avatar: undefined,
    bio: 'Responsável pela coordenação dos processos eleitorais do CAU/BR, com mais de 10 anos de experiência em gestão pública e processos democráticos.',
  });

  const [securitySettings, setSecuritySettings] = useState<SecuritySettings>({
    twoFactorEnabled: true,
    emailNotifications: true,
    smsNotifications: false,
    pushNotifications: true,
    loginAlerts: true,
  });

  const [accessLogs] = useState<AccessLog[]>([
    {
      id: '1',
      data: new Date('2024-03-10T14:30:00'),
      ip: '192.168.1.100',
      dispositivo: 'Chrome 121 - Windows 10',
      localizacao: 'Brasília, DF',
      sucesso: true,
    },
    {
      id: '2',
      data: new Date('2024-03-10T08:15:00'),
      ip: '192.168.1.100',
      dispositivo: 'Chrome 121 - Windows 10',
      localizacao: 'Brasília, DF',
      sucesso: true,
    },
    {
      id: '3',
      data: new Date('2024-03-09T16:45:00'),
      ip: '10.0.0.25',
      dispositivo: 'Firefox 123 - Windows 10',
      localizacao: 'Brasília, DF',
      sucesso: false,
    },
    {
      id: '4',
      data: new Date('2024-03-09T09:20:00'),
      ip: '192.168.1.100',
      dispositivo: 'Chrome 121 - Windows 10',
      localizacao: 'Brasília, DF',
      sucesso: true,
    },
    {
      id: '5',
      data: new Date('2024-03-08T13:10:00'),
      ip: '192.168.1.100',
      dispositivo: 'Edge 121 - Windows 10',
      localizacao: 'Brasília, DF',
      sucesso: true,
    },
  ]);

  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setCurrentTab(newValue);
  };

  const handleProfileChange = (field: keyof UserProfile, value: any) => {
    setProfile(prev => ({ ...prev, [field]: value }));
    setHasChanges(true);
  };

  const handleSecurityChange = (field: keyof SecuritySettings, value: boolean) => {
    setSecuritySettings(prev => ({ ...prev, [field]: value }));
    setHasChanges(true);
  };

  const handleSave = async () => {
    setSaveStatus('saving');
    setHasChanges(false);
    setEditingProfile(false);
    
    // Simulate API call
    setTimeout(() => {
      setSaveStatus('success');
      setTimeout(() => setSaveStatus('idle'), 3000);
    }, 1500);
  };

  const handleChangePassword = () => {
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      // Handle password mismatch
      return;
    }
    
    // Simulate password change
    console.log('Changing password...');
    setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
    setOpenPasswordDialog(false);
  };

  const getSaveButtonProps = () => {
    switch (saveStatus) {
      case 'saving':
        return { children: 'Salvando...', disabled: true };
      case 'success':
        return { children: 'Salvo!', color: 'success' as const, disabled: true };
      case 'error':
        return { children: 'Erro ao Salvar', color: 'error' as const };
      default:
        return { children: 'Salvar Alterações', disabled: !hasChanges };
    }
  };

  const handleAvatarChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        handleProfileChange('avatar', e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <Box sx={{ p: 3 }}>
      {/* Header */}
      <Box sx={{ mb: 3, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <Box>
          <Typography variant="h4" gutterBottom>
            Meu Perfil
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Gerencie suas informações pessoais e configurações de segurança
          </Typography>
        </Box>
        {editingProfile && (
          <Button
            variant="contained"
            startIcon={<Save />}
            onClick={handleSave}
            {...getSaveButtonProps()}
          />
        )}
      </Box>

      {/* Status Alert */}
      {hasChanges && (
        <Alert severity="warning" sx={{ mb: 3 }}>
          <Typography variant="body2">
            Você tem alterações não salvas. Clique em "Salvar Alterações" para aplicar as mudanças.
          </Typography>
        </Alert>
      )}

      {/* Profile Header Card */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Grid container spacing={3} alignItems="center">
            <Grid item>
              <Box sx={{ position: 'relative' }}>
                <Avatar
                  sx={{ width: 100, height: 100, bgcolor: 'primary.main' }}
                  src={profile.avatar}
                >
                  {profile.nome.charAt(0)}
                </Avatar>
                {editingProfile && (
                  <>
                    <input
                      accept="image/*"
                      style={{ display: 'none' }}
                      id="avatar-upload"
                      type="file"
                      onChange={handleAvatarChange}
                    />
                    <label htmlFor="avatar-upload">
                      <Button
                        component="span"
                        size="small"
                        startIcon={<Camera />}
                        sx={{
                          position: 'absolute',
                          bottom: -8,
                          left: '50%',
                          transform: 'translateX(-50%)',
                          minWidth: 'auto',
                          borderRadius: '50%',
                          width: 32,
                          height: 32,
                        }}
                      >
                        <Camera fontSize="small" />
                      </Button>
                    </label>
                  </>
                )}
              </Box>
            </Grid>
            <Grid item xs>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <Box>
                  <Typography variant="h5" gutterBottom>
                    {profile.nome}
                  </Typography>
                  <Typography variant="h6" color="primary" gutterBottom>
                    {profile.cargo}
                  </Typography>
                  <Typography variant="body1" color="text.secondary" gutterBottom>
                    {profile.setor} • {profile.regional} • {profile.uf}
                  </Typography>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mt: 1 }}>
                    <Chip
                      icon={<Email />}
                      label={profile.email}
                      variant="outlined"
                      size="small"
                    />
                    <Chip
                      icon={<Phone />}
                      label={profile.telefone}
                      variant="outlined"
                      size="small"
                    />
                    <Chip
                      icon={<CalendarToday />}
                      label={`Desde ${format(profile.dataAdmissao, 'MMM/yyyy', { locale: ptBR })}`}
                      variant="outlined"
                      size="small"
                    />
                  </Box>
                </Box>
                <Button
                  startIcon={<Edit />}
                  variant={editingProfile ? 'contained' : 'outlined'}
                  onClick={() => setEditingProfile(!editingProfile)}
                >
                  {editingProfile ? 'Cancelar' : 'Editar Perfil'}
                </Button>
              </Box>
            </Grid>
          </Grid>
          
          {profile.bio && (
            <Box sx={{ mt: 3 }}>
              <Typography variant="body1">
                {profile.bio}
              </Typography>
            </Box>
          )}
        </CardContent>
      </Card>

      {/* Tabs */}
      <Paper sx={{ width: '100%' }}>
        <Tabs
          value={currentTab}
          onChange={handleTabChange}
          aria-label="profile-tabs"
          variant="scrollable"
          scrollButtons="auto"
        >
          <Tab
            label="Informações Pessoais"
            icon={<Person />}
            iconPosition="start"
          />
          <Tab
            label="Segurança"
            icon={<Security />}
            iconPosition="start"
          />
          <Tab
            label="Notificações"
            icon={<Notifications />}
            iconPosition="start"
          />
          <Tab
            label="Histórico de Acesso"
            icon={<History />}
            iconPosition="start"
          />
        </Tabs>

        <TabPanel value={currentTab} index={0}>
          <Typography variant="h6" gutterBottom>
            Informações Pessoais
          </Typography>
          
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Nome Completo"
                value={profile.nome}
                onChange={(e) => handleProfileChange('nome', e.target.value)}
                disabled={!editingProfile}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Email"
                type="email"
                value={profile.email}
                onChange={(e) => handleProfileChange('email', e.target.value)}
                disabled={!editingProfile}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Telefone"
                value={profile.telefone}
                onChange={(e) => handleProfileChange('telefone', e.target.value)}
                disabled={!editingProfile}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Cargo"
                value={profile.cargo}
                disabled // Cargo não deve ser editável pelo usuário
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Setor"
                value={profile.setor}
                disabled // Setor não deve ser editável pelo usuário
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Regional"
                value={`${profile.regional} - ${profile.uf}`}
                disabled // Regional não deve ser editável pelo usuário
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                multiline
                rows={3}
                label="Biografia"
                value={profile.bio}
                onChange={(e) => handleProfileChange('bio', e.target.value)}
                disabled={!editingProfile}
                helperText="Conte um pouco sobre você e sua experiência profissional"
              />
            </Grid>
          </Grid>
          
          <Divider sx={{ my: 3 }} />
          
          <Typography variant="h6" gutterBottom>
            Informações do Sistema
          </Typography>
          
          <List>
            <ListItem>
              <ListItemIcon>
                <CalendarToday />
              </ListItemIcon>
              <ListItemText
                primary="Data de Admissão"
                secondary={format(profile.dataAdmissao, "dd 'de' MMMM 'de' yyyy", { locale: ptBR })}
              />
            </ListItem>
            <ListItem>
              <ListItemIcon>
                <Shield />
              </ListItemIcon>
              <ListItemText
                primary="Nível de Acesso"
                secondary="Administrador Eleitoral"
              />
            </ListItem>
            <ListItem>
              <ListItemIcon>
                <Work />
              </ListItemIcon>
              <ListItemText
                primary="Comissões"
                secondary="Comissão Eleitoral Central, Comissão de Recursos"
              />
            </ListItem>
          </List>
        </TabPanel>

        <TabPanel value={currentTab} index={1}>
          <Typography variant="h6" gutterBottom>
            Segurança da Conta
          </Typography>
          
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <Card variant="outlined">
                <CardContent>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                    <Typography variant="h6">
                      Senha
                    </Typography>
                    <Button
                      startIcon={<Key />}
                      variant="outlined"
                      onClick={() => setOpenPasswordDialog(true)}
                    >
                      Alterar Senha
                    </Button>
                  </Box>
                  <Typography variant="body2" color="text.secondary">
                    Última alteração: 15 de fevereiro de 2024
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            
            <Grid item xs={12}>
              <Card variant="outlined">
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    Autenticação de Dois Fatores (2FA)
                  </Typography>
                  
                  <FormControlLabel
                    control={
                      <Switch
                        checked={securitySettings.twoFactorEnabled}
                        onChange={(e) => handleSecurityChange('twoFactorEnabled', e.target.checked)}
                      />
                    }
                    label={
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Smartphone fontSize="small" />
                        <Typography variant="body1">
                          Ativar 2FA via SMS/App
                        </Typography>
                      </Box>
                    }
                  />
                  
                  {securitySettings.twoFactorEnabled ? (
                    <Alert severity="success" sx={{ mt: 2 }}>
                      Autenticação de dois fatores está <strong>ativada</strong>. Sua conta está mais segura.
                    </Alert>
                  ) : (
                    <Alert severity="warning" sx={{ mt: 2 }}>
                      Recomendamos ativar a autenticação de dois fatores para maior segurança.
                    </Alert>
                  )}
                </CardContent>
              </Card>
            </Grid>
            
            <Grid item xs={12}>
              <Card variant="outlined">
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    Alertas de Segurança
                  </Typography>
                  
                  <FormControlLabel
                    control={
                      <Switch
                        checked={securitySettings.loginAlerts}
                        onChange={(e) => handleSecurityChange('loginAlerts', e.target.checked)}
                      />
                    }
                    label="Alertas de Login Suspeito"
                  />
                  
                  <Typography variant="body2" color="text.secondary" sx={{ mt: 1, ml: 4 }}>
                    Receba notificações quando houver tentativas de login de localizações ou dispositivos não reconhecidos.
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </TabPanel>

        <TabPanel value={currentTab} index={2}>
          <Typography variant="h6" gutterBottom>
            Preferências de Notificação
          </Typography>
          
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <Card variant="outlined">
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    Canais de Notificação
                  </Typography>
                  
                  <List>
                    <ListItem>
                      <ListItemIcon>
                        <Email color={securitySettings.emailNotifications ? 'primary' : 'disabled'} />
                      </ListItemIcon>
                      <ListItemText
                        primary="Email"
                        secondary="Receber notificações por email"
                      />
                      <Switch
                        checked={securitySettings.emailNotifications}
                        onChange={(e) => handleSecurityChange('emailNotifications', e.target.checked)}
                      />
                    </ListItem>
                    
                    <ListItem>
                      <ListItemIcon>
                        <Phone color={securitySettings.smsNotifications ? 'primary' : 'disabled'} />
                      </ListItemIcon>
                      <ListItemText
                        primary="SMS"
                        secondary="Receber notificações por mensagem de texto"
                      />
                      <Switch
                        checked={securitySettings.smsNotifications}
                        onChange={(e) => handleSecurityChange('smsNotifications', e.target.checked)}
                      />
                    </ListItem>
                    
                    <ListItem>
                      <ListItemIcon>
                        <Notifications color={securitySettings.pushNotifications ? 'primary' : 'disabled'} />
                      </ListItemIcon>
                      <ListItemText
                        primary="Push Notifications"
                        secondary="Receber notificações no navegador"
                      />
                      <Switch
                        checked={securitySettings.pushNotifications}
                        onChange={(e) => handleSecurityChange('pushNotifications', e.target.checked)}
                      />
                    </ListItem>
                  </List>
                </CardContent>
              </Card>
            </Grid>
            
            <Grid item xs={12}>
              <Alert severity="info">
                <Typography variant="body2">
                  <strong>Nota:</strong> Notificações críticas relacionadas à segurança da conta e prazos legais 
                  serão sempre enviadas, independentemente dessas configurações.
                </Typography>
              </Alert>
            </Grid>
          </Grid>
        </TabPanel>

        <TabPanel value={currentTab} index={3}>
          <Typography variant="h6" gutterBottom>
            Histórico de Acessos (Recentes)
          </Typography>
          
          <TableContainer component={Paper} variant="outlined">
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Data/Hora</TableCell>
                  <TableCell>Dispositivo</TableCell>
                  <TableCell>IP</TableCell>
                  <TableCell>Localização</TableCell>
                  <TableCell>Status</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {accessLogs.map((log) => (
                  <TableRow key={log.id}>
                    <TableCell>
                      {format(log.data, "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}
                    </TableCell>
                    <TableCell>{log.dispositivo}</TableCell>
                    <TableCell>
                      <Typography variant="body2" fontFamily="monospace">
                        {log.ip}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                        <LocationOn fontSize="small" color="action" />
                        {log.localizacao}
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={log.sucesso ? 'Sucesso' : 'Falha'}
                        color={log.sucesso ? 'success' : 'error'}
                        size="small"
                        variant="outlined"
                      />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
          
          <Box sx={{ mt: 3, display: 'flex', justifyContent: 'center' }}>
            <Button variant="outlined">
              Ver Histórico Completo
            </Button>
          </Box>
        </TabPanel>
      </Paper>

      {/* Password Change Dialog */}
      <Dialog open={openPasswordDialog} onClose={() => setOpenPasswordDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>
          Alterar Senha
        </DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                type={showCurrentPassword ? 'text' : 'password'}
                label="Senha Atual"
                value={passwordForm.currentPassword}
                onChange={(e) => setPasswordForm({ ...passwordForm, currentPassword: e.target.value })}
                InputProps={{
                  endAdornment: (
                    <Button
                      onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                      size="small"
                    >
                      {showCurrentPassword ? <VisibilityOff /> : <Visibility />}
                    </Button>
                  ),
                }}
                required
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                type={showNewPassword ? 'text' : 'password'}
                label="Nova Senha"
                value={passwordForm.newPassword}
                onChange={(e) => setPasswordForm({ ...passwordForm, newPassword: e.target.value })}
                InputProps={{
                  endAdornment: (
                    <Button
                      onClick={() => setShowNewPassword(!showNewPassword)}
                      size="small"
                    >
                      {showNewPassword ? <VisibilityOff /> : <Visibility />}
                    </Button>
                  ),
                }}
                required
                helperText="Mínimo 8 caracteres, incluindo letras, números e símbolos"
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                type="password"
                label="Confirmar Nova Senha"
                value={passwordForm.confirmPassword}
                onChange={(e) => setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })}
                required
                error={passwordForm.newPassword !== passwordForm.confirmPassword && passwordForm.confirmPassword !== ''}
                helperText={passwordForm.newPassword !== passwordForm.confirmPassword && passwordForm.confirmPassword !== '' ? 'Senhas não coincidem' : ''}
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenPasswordDialog(false)}>Cancelar</Button>
          <Button 
            onClick={handleChangePassword} 
            variant="contained"
            disabled={
              !passwordForm.currentPassword || 
              !passwordForm.newPassword || 
              !passwordForm.confirmPassword ||
              passwordForm.newPassword !== passwordForm.confirmPassword
            }
          >
            Alterar Senha
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default Profile;