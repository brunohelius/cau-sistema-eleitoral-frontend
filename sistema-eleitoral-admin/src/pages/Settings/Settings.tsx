import React, { useState } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Grid,
  Button,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Switch,
  FormControlLabel,
  Divider,
  Alert,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  ListItemSecondaryAction,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Chip,
  Tab,
  Tabs,
  Paper,
} from '@mui/material';
import {
  Save,
  Settings as SettingsIcon,
  Email,
  Security,
  Notifications,
  Schedule,
  Storage,
  Backup,
  Edit,
  Delete,
  Add,
  Warning,
  CheckCircle,
} from '@mui/icons-material';

interface EmailConfig {
  id: string;
  nome: string;
  servidor: string;
  porta: number;
  usuario: string;
  senha: string;
  ssl: boolean;
  ativo: boolean;
}

interface SystemConfig {
  geral: {
    nomeOrganizacao: string;
    sigla: string;
    logoUrl: string;
    tema: 'light' | 'dark' | 'auto';
    idioma: string;
    timezone: string;
    manterLogsPor: number; // dias
  };
  email: {
    configuracoes: EmailConfig[];
    remetentePadrao: string;
    templatePath: string;
    filaAtiva: boolean;
    tentativasMax: number;
  };
  seguranca: {
    sessaoExpiraEm: number; // minutos
    senhaExpiraEm: number; // dias
    tentativasLogin: number;
    bloqueioTempo: number; // minutos
    exigir2FA: boolean;
    logAcessos: boolean;
  };
  notificacoes: {
    emailAtivo: boolean;
    smsAtivo: boolean;
    pushAtivo: boolean;
    notificarPrazos: boolean;
    diasAntecedencia: number;
  };
  backup: {
    automatico: boolean;
    frequencia: 'diario' | 'semanal' | 'mensal';
    manter: number; // quantidade
    incluirAnexos: boolean;
    localizacao: string;
  };
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
      id={`settings-tabpanel-${index}`}
      aria-labelledby={`settings-tab-${index}`}
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

export const Settings: React.FC = () => {
  const [currentTab, setCurrentTab] = useState(0);
  const [openEmailDialog, setOpenEmailDialog] = useState(false);
  const [editingEmail, setEditingEmail] = useState<EmailConfig | null>(null);
  const [emailForm, setEmailForm] = useState({
    nome: '',
    servidor: '',
    porta: 587,
    usuario: '',
    senha: '',
    ssl: true,
  });
  const [hasChanges, setHasChanges] = useState(false);
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'success' | 'error'>('idle');

  const [config, setConfig] = useState<SystemConfig>({
    geral: {
      nomeOrganizacao: 'Conselho de Arquitetura e Urbanismo do Brasil',
      sigla: 'CAU/BR',
      logoUrl: '/assets/logo-cau.png',
      tema: 'light',
      idioma: 'pt-BR',
      timezone: 'America/Sao_Paulo',
      manterLogsPor: 90,
    },
    email: {
      configuracoes: [
        {
          id: '1',
          nome: 'Servidor Principal',
          servidor: 'smtp.cau.gov.br',
          porta: 587,
          usuario: 'noreply@cau.gov.br',
          senha: '••••••••',
          ssl: true,
          ativo: true,
        },
        {
          id: '2',
          nome: 'Servidor Backup',
          servidor: 'smtp-backup.cau.gov.br',
          porta: 465,
          usuario: 'backup@cau.gov.br',
          senha: '••••••••',
          ssl: true,
          ativo: false,
        },
      ],
      remetentePadrao: 'CAU - Sistema Eleitoral <noreply@cau.gov.br>',
      templatePath: '/templates/emails/',
      filaAtiva: true,
      tentativasMax: 3,
    },
    seguranca: {
      sessaoExpiraEm: 120,
      senhaExpiraEm: 90,
      tentativasLogin: 5,
      bloqueioTempo: 15,
      exigir2FA: false,
      logAcessos: true,
    },
    notificacoes: {
      emailAtivo: true,
      smsAtivo: false,
      pushAtivo: true,
      notificarPrazos: true,
      diasAntecedencia: 5,
    },
    backup: {
      automatico: true,
      frequencia: 'diario',
      manter: 30,
      incluirAnexos: true,
      localizacao: '/backups/sistema-eleitoral/',
    },
  });

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setCurrentTab(newValue);
  };

  const handleConfigChange = (section: keyof SystemConfig, field: string, value: any) => {
    setConfig(prev => ({
      ...prev,
      [section]: {
        ...prev[section],
        [field]: value,
      }
    }));
    setHasChanges(true);
  };

  const handleSave = async () => {
    setSaveStatus('saving');
    setHasChanges(false);
    
    // Simulate API call
    setTimeout(() => {
      setSaveStatus('success');
      setTimeout(() => setSaveStatus('idle'), 3000);
    }, 1500);
  };

  const handleOpenEmailDialog = (email?: EmailConfig) => {
    if (email) {
      setEditingEmail(email);
      setEmailForm({
        nome: email.nome,
        servidor: email.servidor,
        porta: email.porta,
        usuario: email.usuario,
        senha: '',
        ssl: email.ssl,
      });
    } else {
      setEditingEmail(null);
      setEmailForm({
        nome: '',
        servidor: '',
        porta: 587,
        usuario: '',
        senha: '',
        ssl: true,
      });
    }
    setOpenEmailDialog(true);
  };

  const handleSaveEmail = () => {
    if (editingEmail) {
      // Update existing
      const updatedConfigs = config.email.configuracoes.map(c => 
        c.id === editingEmail.id 
          ? { ...c, ...emailForm, senha: emailForm.senha || c.senha }
          : c
      );
      setConfig({
        ...config,
        email: { ...config.email, configuracoes: updatedConfigs }
      });
    } else {
      // Add new
      const newConfig: EmailConfig = {
        id: Date.now().toString(),
        ...emailForm,
        ativo: false,
      };
      setConfig({
        ...config,
        email: {
          ...config.email,
          configuracoes: [...config.email.configuracoes, newConfig]
        }
      });
    }
    setHasChanges(true);
    setOpenEmailDialog(false);
  };

  const handleDeleteEmail = (id: string) => {
    const updatedConfigs = config.email.configuracoes.filter(c => c.id !== id);
    setConfig({
      ...config,
      email: { ...config.email, configuracoes: updatedConfigs }
    });
    setHasChanges(true);
  };

  const handleToggleEmailActive = (id: string) => {
    const updatedConfigs = config.email.configuracoes.map(c => 
      c.id === id ? { ...c, ativo: !c.ativo } : c
    );
    setConfig({
      ...config,
      email: { ...config.email, configuracoes: updatedConfigs }
    });
    setHasChanges(true);
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
        return { children: 'Salvar Configurações', disabled: !hasChanges };
    }
  };

  return (
    <Box sx={{ p: 3 }}>
      {/* Header */}
      <Box sx={{ mb: 3, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <Box>
          <Typography variant="h4" gutterBottom>
            Configurações do Sistema
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Gerencie as configurações gerais do sistema eleitoral
          </Typography>
        </Box>
        <Button
          variant="contained"
          startIcon={<Save />}
          onClick={handleSave}
          {...getSaveButtonProps()}
        />
      </Box>

      {/* Status Alert */}
      {hasChanges && (
        <Alert severity="warning" sx={{ mb: 3 }}>
          <Typography variant="body2">
            Você tem alterações não salvas. Clique em "Salvar Configurações" para aplicar as mudanças.
          </Typography>
        </Alert>
      )}

      {/* Tabs */}
      <Paper sx={{ width: '100%' }}>
        <Tabs
          value={currentTab}
          onChange={handleTabChange}
          aria-label="settings-tabs"
          variant="scrollable"
          scrollButtons="auto"
        >
          <Tab
            label="Geral"
            icon={<SettingsIcon />}
            iconPosition="start"
          />
          <Tab
            label="Email"
            icon={<Email />}
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
            label="Backup"
            icon={<Backup />}
            iconPosition="start"
          />
        </Tabs>

        <TabPanel value={currentTab} index={0}>
          <Typography variant="h6" gutterBottom>
            Configurações Gerais
          </Typography>
          
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Nome da Organização"
                value={config.geral.nomeOrganizacao}
                onChange={(e) => handleConfigChange('geral', 'nomeOrganizacao', e.target.value)}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Sigla"
                value={config.geral.sigla}
                onChange={(e) => handleConfigChange('geral', 'sigla', e.target.value)}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="URL do Logo"
                value={config.geral.logoUrl}
                onChange={(e) => handleConfigChange('geral', 'logoUrl', e.target.value)}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <FormControl fullWidth>
                <InputLabel>Tema</InputLabel>
                <Select
                  value={config.geral.tema}
                  label="Tema"
                  onChange={(e) => handleConfigChange('geral', 'tema', e.target.value)}
                >
                  <MenuItem value="light">Claro</MenuItem>
                  <MenuItem value="dark">Escuro</MenuItem>
                  <MenuItem value="auto">Automático</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={6}>
              <FormControl fullWidth>
                <InputLabel>Idioma</InputLabel>
                <Select
                  value={config.geral.idioma}
                  label="Idioma"
                  onChange={(e) => handleConfigChange('geral', 'idioma', e.target.value)}
                >
                  <MenuItem value="pt-BR">Português (Brasil)</MenuItem>
                  <MenuItem value="en-US">English (US)</MenuItem>
                  <MenuItem value="es-ES">Español</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={6}>
              <FormControl fullWidth>
                <InputLabel>Fuso Horário</InputLabel>
                <Select
                  value={config.geral.timezone}
                  label="Fuso Horário"
                  onChange={(e) => handleConfigChange('geral', 'timezone', e.target.value)}
                >
                  <MenuItem value="America/Sao_Paulo">America/São Paulo (BRT)</MenuItem>
                  <MenuItem value="America/Manaus">America/Manaus (AMT)</MenuItem>
                  <MenuItem value="America/Noronha">America/Noronha (FNT)</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                type="number"
                label="Manter Logs Por (dias)"
                value={config.geral.manterLogsPor}
                onChange={(e) => handleConfigChange('geral', 'manterLogsPor', parseInt(e.target.value))}
                helperText="Logs mais antigos serão removidos automaticamente"
              />
            </Grid>
          </Grid>
        </TabPanel>

        <TabPanel value={currentTab} index={1}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
            <Typography variant="h6">
              Configurações de Email
            </Typography>
            <Button
              startIcon={<Add />}
              variant="contained"
              onClick={() => handleOpenEmailDialog()}
            >
              Adicionar Servidor
            </Button>
          </Box>
          
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <Card variant="outlined">
                <CardContent>
                  <Typography variant="subtitle1" gutterBottom>
                    Servidores de Email
                  </Typography>
                  
                  <List>
                    {config.email.configuracoes.map((emailConfig, index) => (
                      <ListItem key={emailConfig.id}>
                        <ListItemIcon>
                          <Email color={emailConfig.ativo ? 'primary' : 'disabled'} />
                        </ListItemIcon>
                        <ListItemText
                          primary={
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                              <Typography variant="body1">
                                {emailConfig.nome}
                              </Typography>
                              <Chip
                                label={emailConfig.ativo ? 'Ativo' : 'Inativo'}
                                color={emailConfig.ativo ? 'success' : 'default'}
                                size="small"
                              />
                            </Box>
                          }
                          secondary={`${emailConfig.servidor}:${emailConfig.porta} - ${emailConfig.usuario}`}
                        />
                        <ListItemSecondaryAction>
                          <IconButton
                            size="small"
                            onClick={() => handleToggleEmailActive(emailConfig.id)}
                          >
                            {emailConfig.ativo ? <CheckCircle color="success" /> : <Warning color="warning" />}
                          </IconButton>
                          <IconButton
                            size="small"
                            onClick={() => handleOpenEmailDialog(emailConfig)}
                          >
                            <Edit />
                          </IconButton>
                          <IconButton
                            size="small"
                            color="error"
                            onClick={() => handleDeleteEmail(emailConfig.id)}
                          >
                            <Delete />
                          </IconButton>
                        </ListItemSecondaryAction>
                      </ListItem>
                    ))}
                  </List>
                </CardContent>
              </Card>
            </Grid>
            
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Remetente Padrão"
                value={config.email.remetentePadrao}
                onChange={(e) => handleConfigChange('email', 'remetentePadrao', e.target.value)}
                helperText="Nome e email que aparecerão como remetente"
              />
            </Grid>
            
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                type="number"
                label="Máximo de Tentativas"
                value={config.email.tentativasMax}
                onChange={(e) => handleConfigChange('email', 'tentativasMax', parseInt(e.target.value))}
                helperText="Quantidade de tentativas para reenvio"
              />
            </Grid>
            
            <Grid item xs={12}>
              <FormControlLabel
                control={
                  <Switch
                    checked={config.email.filaAtiva}
                    onChange={(e) => handleConfigChange('email', 'filaAtiva', e.target.checked)}
                  />
                }
                label="Fila de Email Ativa"
              />
            </Grid>
          </Grid>
        </TabPanel>

        <TabPanel value={currentTab} index={2}>
          <Typography variant="h6" gutterBottom>
            Configurações de Segurança
          </Typography>
          
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                type="number"
                label="Sessão Expira em (minutos)"
                value={config.seguranca.sessaoExpiraEm}
                onChange={(e) => handleConfigChange('seguranca', 'sessaoExpiraEm', parseInt(e.target.value))}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                type="number"
                label="Senha Expira em (dias)"
                value={config.seguranca.senhaExpiraEm}
                onChange={(e) => handleConfigChange('seguranca', 'senhaExpiraEm', parseInt(e.target.value))}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                type="number"
                label="Máximo Tentativas de Login"
                value={config.seguranca.tentativasLogin}
                onChange={(e) => handleConfigChange('seguranca', 'tentativasLogin', parseInt(e.target.value))}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                type="number"
                label="Tempo de Bloqueio (minutos)"
                value={config.seguranca.bloqueioTempo}
                onChange={(e) => handleConfigChange('seguranca', 'bloqueioTempo', parseInt(e.target.value))}
              />
            </Grid>
            <Grid item xs={12}>
              <Divider sx={{ my: 2 }} />
            </Grid>
            <Grid item xs={12} md={6}>
              <FormControlLabel
                control={
                  <Switch
                    checked={config.seguranca.exigir2FA}
                    onChange={(e) => handleConfigChange('seguranca', 'exigir2FA', e.target.checked)}
                  />
                }
                label="Exigir Autenticação de Dois Fatores (2FA)"
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <FormControlLabel
                control={
                  <Switch
                    checked={config.seguranca.logAcessos}
                    onChange={(e) => handleConfigChange('seguranca', 'logAcessos', e.target.checked)}
                  />
                }
                label="Registrar Log de Acessos"
              />
            </Grid>
          </Grid>
        </TabPanel>

        <TabPanel value={currentTab} index={3}>
          <Typography variant="h6" gutterBottom>
            Configurações de Notificações
          </Typography>
          
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <Typography variant="subtitle1" gutterBottom>
                Canais de Notificação
              </Typography>
            </Grid>
            <Grid item xs={12} md={4}>
              <FormControlLabel
                control={
                  <Switch
                    checked={config.notificacoes.emailAtivo}
                    onChange={(e) => handleConfigChange('notificacoes', 'emailAtivo', e.target.checked)}
                  />
                }
                label="Email"
              />
            </Grid>
            <Grid item xs={12} md={4}>
              <FormControlLabel
                control={
                  <Switch
                    checked={config.notificacoes.smsAtivo}
                    onChange={(e) => handleConfigChange('notificacoes', 'smsAtivo', e.target.checked)}
                  />
                }
                label="SMS"
              />
            </Grid>
            <Grid item xs={12} md={4}>
              <FormControlLabel
                control={
                  <Switch
                    checked={config.notificacoes.pushAtivo}
                    onChange={(e) => handleConfigChange('notificacoes', 'pushAtivo', e.target.checked)}
                  />
                }
                label="Push Notifications"
              />
            </Grid>
            <Grid item xs={12}>
              <Divider sx={{ my: 2 }} />
            </Grid>
            <Grid item xs={12}>
              <Typography variant="subtitle1" gutterBottom>
                Configurações de Prazo
              </Typography>
            </Grid>
            <Grid item xs={12} md={6}>
              <FormControlLabel
                control={
                  <Switch
                    checked={config.notificacoes.notificarPrazos}
                    onChange={(e) => handleConfigChange('notificacoes', 'notificarPrazos', e.target.checked)}
                  />
                }
                label="Notificar sobre Prazos"
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                type="number"
                label="Dias de Antecedência"
                value={config.notificacoes.diasAntecedencia}
                onChange={(e) => handleConfigChange('notificacoes', 'diasAntecedencia', parseInt(e.target.value))}
                disabled={!config.notificacoes.notificarPrazos}
                helperText="Quantos dias antes do prazo enviar a notificação"
              />
            </Grid>
          </Grid>
        </TabPanel>

        <TabPanel value={currentTab} index={4}>
          <Typography variant="h6" gutterBottom>
            Configurações de Backup
          </Typography>
          
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <FormControlLabel
                control={
                  <Switch
                    checked={config.backup.automatico}
                    onChange={(e) => handleConfigChange('backup', 'automatico', e.target.checked)}
                  />
                }
                label="Backup Automático"
              />
            </Grid>
            
            {config.backup.automatico && (
              <>
                <Grid item xs={12} md={4}>
                  <FormControl fullWidth>
                    <InputLabel>Frequência</InputLabel>
                    <Select
                      value={config.backup.frequencia}
                      label="Frequência"
                      onChange={(e) => handleConfigChange('backup', 'frequencia', e.target.value)}
                    >
                      <MenuItem value="diario">Diário</MenuItem>
                      <MenuItem value="semanal">Semanal</MenuItem>
                      <MenuItem value="mensal">Mensal</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
                
                <Grid item xs={12} md={4}>
                  <TextField
                    fullWidth
                    type="number"
                    label="Manter (quantidade)"
                    value={config.backup.manter}
                    onChange={(e) => handleConfigChange('backup', 'manter', parseInt(e.target.value))}
                    helperText="Quantos backups manter"
                  />
                </Grid>
                
                <Grid item xs={12} md={4}>
                  <FormControlLabel
                    control={
                      <Switch
                        checked={config.backup.incluirAnexos}
                        onChange={(e) => handleConfigChange('backup', 'incluirAnexos', e.target.checked)}
                      />
                    }
                    label="Incluir Anexos"
                  />
                </Grid>
              </>
            )}
            
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Localização dos Backups"
                value={config.backup.localizacao}
                onChange={(e) => handleConfigChange('backup', 'localizacao', e.target.value)}
                helperText="Caminho onde os backups serão armazenados"
              />
            </Grid>
            
            <Grid item xs={12}>
              <Divider sx={{ my: 2 }} />
            </Grid>
            
            <Grid item xs={12}>
              <Typography variant="subtitle1" gutterBottom>
                Ações de Backup
              </Typography>
              <Box sx={{ display: 'flex', gap: 2 }}>
                <Button variant="outlined" startIcon={<Backup />}>
                  Fazer Backup Agora
                </Button>
                <Button variant="outlined" startIcon={<Storage />}>
                  Gerenciar Backups
                </Button>
              </Box>
            </Grid>
          </Grid>
        </TabPanel>
      </Paper>

      {/* Email Configuration Dialog */}
      <Dialog open={openEmailDialog} onClose={() => setOpenEmailDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>
          {editingEmail ? 'Editar Servidor de Email' : 'Novo Servidor de Email'}
        </DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Nome da Configuração"
                value={emailForm.nome}
                onChange={(e) => setEmailForm({ ...emailForm, nome: e.target.value })}
                required
              />
            </Grid>
            <Grid item xs={12} md={8}>
              <TextField
                fullWidth
                label="Servidor SMTP"
                value={emailForm.servidor}
                onChange={(e) => setEmailForm({ ...emailForm, servidor: e.target.value })}
                required
              />
            </Grid>
            <Grid item xs={12} md={4}>
              <TextField
                fullWidth
                type="number"
                label="Porta"
                value={emailForm.porta}
                onChange={(e) => setEmailForm({ ...emailForm, porta: parseInt(e.target.value) })}
                required
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Usuário"
                value={emailForm.usuario}
                onChange={(e) => setEmailForm({ ...emailForm, usuario: e.target.value })}
                required
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                type="password"
                label="Senha"
                value={emailForm.senha}
                onChange={(e) => setEmailForm({ ...emailForm, senha: e.target.value })}
                required={!editingEmail}
                helperText={editingEmail ? 'Deixe em branco para manter a senha atual' : ''}
              />
            </Grid>
            <Grid item xs={12}>
              <FormControlLabel
                control={
                  <Switch
                    checked={emailForm.ssl}
                    onChange={(e) => setEmailForm({ ...emailForm, ssl: e.target.checked })}
                  />
                }
                label="Usar SSL/TLS"
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenEmailDialog(false)}>Cancelar</Button>
          <Button 
            onClick={handleSaveEmail} 
            variant="contained"
            disabled={!emailForm.nome || !emailForm.servidor || !emailForm.usuario || (!emailForm.senha && !editingEmail)}
          >
            {editingEmail ? 'Atualizar' : 'Adicionar'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default Settings;