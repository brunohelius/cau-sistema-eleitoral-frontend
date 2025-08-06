import React, { useState, useEffect } from 'react';
import {
  Container,
  Typography,
  Box,
  Card,
  CardContent,
  Grid,
  Button,
  Chip,
  TextField,
  InputAdornment,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  IconButton,
  Tooltip,
  Paper,
  Divider,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  ListItemSecondaryAction,
  Avatar,
  Tabs,
  Tab,
  Badge,
  CircularProgress,
  LinearProgress
} from '@mui/material';
import {
  Search as SearchIcon,
  Gavel as GavelIcon,
  Assignment as AssignmentIcon,
  Group as GroupIcon,
  Person as PersonIcon,
  CheckCircle as CheckCircleIcon,
  Cancel as CancelIcon,
  Warning as WarningIcon,
  Schedule as ScheduleIcon,
  Visibility as ViewIcon,
  Edit as EditIcon,
  Email as EmailIcon,
  Phone as PhoneIcon,
  Badge as BadgeIcon,
  CalendarMonth as CalendarIcon,
  Analytics as AnalyticsIcon,
  Description as DescriptionIcon,
  Download as DownloadIcon,
  Clear as ClearIcon,
  FilterList as FilterIcon
} from '@mui/icons-material';
import { useAuth } from '../hooks/useAuth';
import { useNavigate } from 'react-router-dom';
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
      id={`commission-tabpanel-${index}`}
      aria-labelledby={`commission-tab-${index}`}
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

// Mock data for commission dashboard
const mockStats = {
  chapasPendentes: 8,
  chapasAprovadas: 15,
  chapasRejeitadas: 2,
  impugnacoesPendentes: 3,
  denunciasPendentes: 1,
  julgamentosAgendados: 4
};

const mockPendingChapas = [
  {
    id: 1,
    nome: 'Renovação Profissional',
    eleicao: 'Eleições CAU Nacional 2024',
    dataSubmissao: new Date('2024-02-10'),
    responsavel: 'Carlos Silva',
    status: 'pendente_analise',
    prioridade: 'alta',
    membros: 5,
    documentos: 8,
    documentosPendentes: 2
  },
  {
    id: 2,
    nome: 'União dos Arquitetos',
    eleicao: 'Eleições CAU SP 2024',
    dataSubmissao: new Date('2024-02-08'),
    responsavel: 'Ana Santos',
    status: 'em_revisao',
    prioridade: 'média',
    membros: 3,
    documentos: 6,
    documentosPendentes: 0
  },
  {
    id: 3,
    nome: 'Futuro Sustentável',
    eleicao: 'Eleições CAU RJ 2024',
    dataSubmissao: new Date('2024-02-12'),
    responsavel: 'Pedro Oliveira',
    status: 'documentacao_incompleta',
    prioridade: 'baixa',
    membros: 4,
    documentos: 5,
    documentosPendentes: 3
  }
];

const mockPendingImpugnacoes = [
  {
    id: 1,
    titulo: 'Impugnação - Chapa "Progresso CAU"',
    requerente: 'Maria Costa',
    dataSubmissao: new Date('2024-02-05'),
    instancia: 'primeira',
    status: 'aguardando_julgamento',
    prioridade: 'alta',
    prazoResposta: new Date('2024-02-20')
  },
  {
    id: 2,
    titulo: 'Impugnação - Candidato Inelegibilidade',
    requerente: 'João Lima',
    dataSubmissao: new Date('2024-02-08'),
    instancia: 'primeira',
    status: 'em_analise',
    prioridade: 'média',
    prazoResposta: new Date('2024-02-23')
  }
];

const mockCommissionMembers = [
  {
    id: 1,
    nome: 'Dr. Roberto Ferreira',
    cargo: 'Presidente',
    email: 'roberto@cau.gov.br',
    telefone: '(11) 99999-0001',
    ativo: true
  },
  {
    id: 2,
    nome: 'Dra. Lucia Mendes',
    cargo: 'Vice-Presidente',
    email: 'lucia@cau.gov.br',
    telefone: '(11) 99999-0002',
    ativo: true
  },
  {
    id: 3,
    nome: 'Arq. Carlos Pinto',
    cargo: 'Relator',
    email: 'carlos@cau.gov.br',
    telefone: '(11) 99999-0003',
    ativo: true
  },
  {
    id: 4,
    nome: 'Eng. Ana Paula',
    cargo: 'Membro',
    email: 'ana@cau.gov.br',
    telefone: '(11) 99999-0004',
    ativo: false
  }
];

export const ComissaoEleitoralPage: React.FC = () => {
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState(0);
  const [selectedChapa, setSelectedChapa] = useState<any>(null);
  const [chapaDetailDialog, setChapaDetailDialog] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [priorityFilter, setPriorityFilter] = useState('all');

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
    
    // Check if user has commission role
    if (!user?.roles?.includes('COMISSAO')) {
      navigate('/dashboard');
      return;
    }
  }, [isAuthenticated, user, navigate]);

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setActiveTab(newValue);
  };

  const handleViewChapa = (chapa: any) => {
    setSelectedChapa(chapa);
    setChapaDetailDialog(true);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pendente_analise': return 'warning';
      case 'em_revisao': return 'info';
      case 'documentacao_incompleta': return 'error';
      case 'aprovada': return 'success';
      default: return 'default';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'alta': return 'error';
      case 'média': return 'warning';
      case 'baixa': return 'success';
      default: return 'default';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'pendente_analise': return 'Pendente Análise';
      case 'em_revisao': return 'Em Revisão';
      case 'documentacao_incompleta': return 'Documentação Incompleta';
      case 'aprovada': return 'Aprovada';
      case 'rejeitada': return 'Rejeitada';
      case 'aguardando_julgamento': return 'Aguardando Julgamento';
      case 'em_analise': return 'Em Análise';
      default: return status;
    }
  };

  if (!isAuthenticated || !user?.roles?.includes('COMISSAO')) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Alert severity="error">
          Acesso negado. Você precisa ter permissões de membro da Comissão Eleitoral para acessar esta área.
        </Alert>
      </Container>
    );
  }

  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      {/* Header */}
      <Box mb={4}>
        <Typography variant="h3" component="h1" gutterBottom fontWeight="bold">
          Comissão Eleitoral
        </Typography>
        <Typography variant="h6" color="textSecondary">
          Painel de controle para membros da Comissão Eleitoral
        </Typography>
      </Box>

      {/* Statistics Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={2}>
          <Card>
            <CardContent sx={{ textAlign: 'center' }}>
              <Badge badgeContent={mockStats.chapasPendentes} color="warning" max={99}>
                <GroupIcon sx={{ fontSize: 40, color: 'warning.main', mb: 1 }} />
              </Badge>
              <Typography variant="h6" fontWeight="bold" color="warning.main">
                {mockStats.chapasPendentes}
              </Typography>
              <Typography variant="body2" color="textSecondary">
                Chapas Pendentes
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} sm={6} md={2}>
          <Card>
            <CardContent sx={{ textAlign: 'center' }}>
              <CheckCircleIcon sx={{ fontSize: 40, color: 'success.main', mb: 1 }} />
              <Typography variant="h6" fontWeight="bold" color="success.main">
                {mockStats.chapasAprovadas}
              </Typography>
              <Typography variant="body2" color="textSecondary">
                Chapas Aprovadas
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} sm={6} md={2}>
          <Card>
            <CardContent sx={{ textAlign: 'center' }}>
              <CancelIcon sx={{ fontSize: 40, color: 'error.main', mb: 1 }} />
              <Typography variant="h6" fontWeight="bold" color="error.main">
                {mockStats.chapasRejeitadas}
              </Typography>
              <Typography variant="body2" color="textSecondary">
                Chapas Rejeitadas
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} sm={6} md={2}>
          <Card>
            <CardContent sx={{ textAlign: 'center' }}>
              <Badge badgeContent={mockStats.impugnacoesPendentes} color="error" max={99}>
                <GavelIcon sx={{ fontSize: 40, color: 'info.main', mb: 1 }} />
              </Badge>
              <Typography variant="h6" fontWeight="bold" color="info.main">
                {mockStats.impugnacoesPendentes}
              </Typography>
              <Typography variant="body2" color="textSecondary">
                Impugnações
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} sm={6} md={2}>
          <Card>
            <CardContent sx={{ textAlign: 'center' }}>
              <Badge badgeContent={mockStats.denunciasPendentes} color="error" max={99}>
                <WarningIcon sx={{ fontSize: 40, color: 'warning.main', mb: 1 }} />
              </Badge>
              <Typography variant="h6" fontWeight="bold" color="warning.main">
                {mockStats.denunciasPendentes}
              </Typography>
              <Typography variant="body2" color="textSecondary">
                Denúncias
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} sm={6} md={2}>
          <Card>
            <CardContent sx={{ textAlign: 'center' }}>
              <ScheduleIcon sx={{ fontSize: 40, color: 'secondary.main', mb: 1 }} />
              <Typography variant="h6" fontWeight="bold" color="secondary.main">
                {mockStats.julgamentosAgendados}
              </Typography>
              <Typography variant="body2" color="textSecondary">
                Julgamentos
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Tabs */}
      <Paper sx={{ mb: 2 }}>
        <Tabs value={activeTab} onChange={handleTabChange} aria-label="commission tabs">
          <Tab icon={<GroupIcon />} label="Chapas Pendentes" />
          <Tab icon={<GavelIcon />} label="Impugnações" />
          <Tab icon={<PersonIcon />} label="Membros da Comissão" />
          <Tab icon={<AnalyticsIcon />} label="Relatórios" />
        </Tabs>
      </Paper>

      {/* Tab Panels */}
      <Paper>
        {/* Pending Chapas Tab */}
        <TabPanel value={activeTab} index={0}>
          <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
            <Typography variant="h6" fontWeight="bold">
              Chapas Aguardando Análise
            </Typography>
            <Button variant="outlined" startIcon={<DownloadIcon />}>
              Exportar Lista
            </Button>
          </Box>

          {/* Filters */}
          <Grid container spacing={2} sx={{ mb: 3 }}>
            <Grid item xs={12} md={4}>
              <TextField
                fullWidth
                placeholder="Buscar chapas..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchIcon />
                    </InputAdornment>
                  )
                }}
              />
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <FormControl fullWidth>
                <InputLabel>Status</InputLabel>
                <Select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  label="Status"
                >
                  <MenuItem value="all">Todos os status</MenuItem>
                  <MenuItem value="pendente_analise">Pendente Análise</MenuItem>
                  <MenuItem value="em_revisao">Em Revisão</MenuItem>
                  <MenuItem value="documentacao_incompleta">Documentação Incompleta</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <FormControl fullWidth>
                <InputLabel>Prioridade</InputLabel>
                <Select
                  value={priorityFilter}
                  onChange={(e) => setPriorityFilter(e.target.value)}
                  label="Prioridade"
                >
                  <MenuItem value="all">Todas as prioridades</MenuItem>
                  <MenuItem value="alta">Alta</MenuItem>
                  <MenuItem value="média">Média</MenuItem>
                  <MenuItem value="baixa">Baixa</MenuItem>
                </Select>
              </FormControl>
            </Grid>
          </Grid>

          {/* Chapas List */}
          <Grid container spacing={3}>
            {mockPendingChapas.map((chapa) => (
              <Grid item xs={12} md={6} lg={4} key={chapa.id}>
                <Card sx={{ height: '100%' }}>
                  <CardContent>
                    <Box display="flex" justifyContent="space-between" alignItems="flex-start" mb={2}>
                      <Chip
                        label={chapa.prioridade.toUpperCase()}
                        size="small"
                        color={getPriorityColor(chapa.prioridade) as any}
                      />
                      <Chip
                        label={getStatusLabel(chapa.status)}
                        size="small"
                        color={getStatusColor(chapa.status) as any}
                      />
                    </Box>

                    <Typography variant="h6" gutterBottom fontWeight="bold">
                      {chapa.nome}
                    </Typography>

                    <Typography variant="body2" color="textSecondary" gutterBottom>
                      {chapa.eleicao}
                    </Typography>

                    <Box mt={2}>
                      <Typography variant="caption" color="textSecondary" display="block">
                        Responsável: {chapa.responsavel}
                      </Typography>
                      <Typography variant="caption" color="textSecondary" display="block">
                        Submetido em {format(chapa.dataSubmissao, 'dd/MM/yyyy', { locale: ptBR })}
                      </Typography>
                      <Typography variant="caption" color="textSecondary" display="block">
                        {chapa.membros} membros | {chapa.documentos} documentos
                      </Typography>
                      {chapa.documentosPendentes > 0 && (
                        <Typography variant="caption" color="error" display="block">
                          {chapa.documentosPendentes} documentos pendentes
                        </Typography>
                      )}
                    </Box>

                    {/* Progress bar */}
                    <Box mt={2}>
                      <Box display="flex" justifyContent="space-between" alignItems="center" mb={1}>
                        <Typography variant="caption" color="textSecondary">
                          Progresso da Análise
                        </Typography>
                        <Typography variant="caption" fontWeight="bold">
                          {Math.round(((chapa.documentos - chapa.documentosPendentes) / chapa.documentos) * 100)}%
                        </Typography>
                      </Box>
                      <LinearProgress 
                        variant="determinate" 
                        value={((chapa.documentos - chapa.documentosPendentes) / chapa.documentos) * 100}
                        sx={{ height: 6, borderRadius: 3 }}
                      />
                    </Box>
                  </CardContent>

                  <Divider />

                  <Box p={2} display="flex" gap={1}>
                    <Button
                      size="small"
                      startIcon={<ViewIcon />}
                      onClick={() => handleViewChapa(chapa)}
                    >
                      Analisar
                    </Button>
                    <Button
                      size="small"
                      startIcon={<EditIcon />}
                      onClick={() => navigate(`/admin/chapas/${chapa.id}/avaliar`)}
                    >
                      Avaliar
                    </Button>
                  </Box>
                </Card>
              </Grid>
            ))}
          </Grid>
        </TabPanel>

        {/* Impugnações Tab */}
        <TabPanel value={activeTab} index={1}>
          <Typography variant="h6" gutterBottom fontWeight="bold">
            Impugnações Pendentes
          </Typography>
          
          <List>
            {mockPendingImpugnacoes.map((impugnacao) => (
              <React.Fragment key={impugnacao.id}>
                <ListItem>
                  <ListItemIcon>
                    <GavelIcon color="primary" />
                  </ListItemIcon>
                  <ListItemText
                    primary={
                      <Box display="flex" alignItems="center" gap={1}>
                        <Typography variant="subtitle1" fontWeight="bold">
                          {impugnacao.titulo}
                        </Typography>
                        <Chip
                          label={impugnacao.prioridade.toUpperCase()}
                          size="small"
                          color={getPriorityColor(impugnacao.prioridade) as any}
                        />
                      </Box>
                    }
                    secondary={
                      <Box>
                        <Typography variant="body2" color="textSecondary">
                          Requerente: {impugnacao.requerente} | {impugnacao.instancia}ª instância
                        </Typography>
                        <Typography variant="caption" color="textSecondary">
                          Submetido em {format(impugnacao.dataSubmissao, 'dd/MM/yyyy', { locale: ptBR })} |
                          Prazo: {format(impugnacao.prazoResposta, 'dd/MM/yyyy', { locale: ptBR })}
                        </Typography>
                      </Box>
                    }
                  />
                  <ListItemSecondaryAction>
                    <Box display="flex" gap={1}>
                      <Chip
                        label={getStatusLabel(impugnacao.status)}
                        size="small"
                        color={getStatusColor(impugnacao.status) as any}
                      />
                      <IconButton
                        edge="end"
                        onClick={() => navigate(`/admin/impugnacoes/${impugnacao.id}`)}
                      >
                        <ViewIcon />
                      </IconButton>
                    </Box>
                  </ListItemSecondaryAction>
                </ListItem>
                <Divider />
              </React.Fragment>
            ))}
          </List>
        </TabPanel>

        {/* Commission Members Tab */}
        <TabPanel value={activeTab} index={2}>
          <Typography variant="h6" gutterBottom fontWeight="bold">
            Membros da Comissão Eleitoral
          </Typography>
          
          <Grid container spacing={3}>
            {mockCommissionMembers.map((member) => (
              <Grid item xs={12} sm={6} md={4} key={member.id}>
                <Card>
                  <CardContent>
                    <Box display="flex" alignItems="center" mb={2}>
                      <Avatar sx={{ mr: 2, bgcolor: 'primary.main' }}>
                        {member.nome.split(' ').map(n => n[0]).join('')}
                      </Avatar>
                      <Box>
                        <Typography variant="subtitle1" fontWeight="bold">
                          {member.nome}
                        </Typography>
                        <Typography variant="body2" color="textSecondary">
                          {member.cargo}
                        </Typography>
                      </Box>
                      <Box ml="auto">
                        <Chip
                          label={member.ativo ? 'Ativo' : 'Inativo'}
                          size="small"
                          color={member.ativo ? 'success' : 'default'}
                        />
                      </Box>
                    </Box>

                    <Box mt={2}>
                      <Box display="flex" alignItems="center" mb={1}>
                        <EmailIcon sx={{ fontSize: 16, mr: 1, color: 'text.secondary' }} />
                        <Typography variant="body2" color="textSecondary">
                          {member.email}
                        </Typography>
                      </Box>
                      <Box display="flex" alignItems="center">
                        <PhoneIcon sx={{ fontSize: 16, mr: 1, color: 'text.secondary' }} />
                        <Typography variant="body2" color="textSecondary">
                          {member.telefone}
                        </Typography>
                      </Box>
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        </TabPanel>

        {/* Reports Tab */}
        <TabPanel value={activeTab} index={3}>
          <Typography variant="h6" gutterBottom fontWeight="bold">
            Relatórios e Estatísticas
          </Typography>
          
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    Resumo de Atividades
                  </Typography>
                  <List dense>
                    <ListItem>
                      <ListItemIcon><GroupIcon /></ListItemIcon>
                      <ListItemText primary="Total de Chapas Analisadas" secondary="25" />
                    </ListItem>
                    <ListItem>
                      <ListItemIcon><GavelIcon /></ListItemIcon>
                      <ListItemText primary="Impugnações Julgadas" secondary="12" />
                    </ListItem>
                    <ListItem>
                      <ListItemIcon><WarningIcon /></ListItemIcon>
                      <ListItemText primary="Denúncias Apuradas" secondary="8" />
                    </ListItem>
                    <ListItem>
                      <ListItemIcon><CalendarIcon /></ListItemIcon>
                      <ListItemText primary="Sessões Realizadas" secondary="15" />
                    </ListItem>
                  </List>
                </CardContent>
              </Card>
            </Grid>
            
            <Grid item xs={12} md={6}>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    Ações Rápidas
                  </Typography>
                  <Box display="flex" flexDirection="column" gap={2}>
                    <Button
                      variant="contained"
                      startIcon={<DescriptionIcon />}
                      fullWidth
                    >
                      Gerar Relatório Mensal
                    </Button>
                    <Button
                      variant="outlined"
                      startIcon={<DownloadIcon />}
                      fullWidth
                    >
                      Exportar Dados
                    </Button>
                    <Button
                      variant="outlined"
                      startIcon={<CalendarIcon />}
                      fullWidth
                    >
                      Agendar Sessão
                    </Button>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </TabPanel>
      </Paper>

      {/* Chapa Detail Dialog */}
      <Dialog 
        open={chapaDetailDialog} 
        onClose={() => setChapaDetailDialog(false)}
        maxWidth="md"
        fullWidth
      >
        {selectedChapa && (
          <>
            <DialogTitle>
              <Box display="flex" alignItems="center" gap={1}>
                <GroupIcon />
                {selectedChapa.nome}
              </Box>
            </DialogTitle>
            <DialogContent>
              <Grid container spacing={3}>
                <Grid item xs={12}>
                  <Typography variant="h6" gutterBottom>
                    Informações Gerais
                  </Typography>
                  <List dense>
                    <ListItem>
                      <ListItemIcon><AssignmentIcon /></ListItemIcon>
                      <ListItemText 
                        primary="Eleição" 
                        secondary={selectedChapa.eleicao}
                      />
                    </ListItem>
                    <ListItem>
                      <ListItemIcon><PersonIcon /></ListItemIcon>
                      <ListItemText 
                        primary="Responsável" 
                        secondary={selectedChapa.responsavel}
                      />
                    </ListItem>
                    <ListItem>
                      <ListItemIcon><ScheduleIcon /></ListItemIcon>
                      <ListItemText 
                        primary="Data de Submissão" 
                        secondary={format(selectedChapa.dataSubmissao, 'dd/MM/yyyy', { locale: ptBR })}
                      />
                    </ListItem>
                  </List>
                </Grid>
              </Grid>
            </DialogContent>
            <DialogActions>
              <Button onClick={() => setChapaDetailDialog(false)}>
                Fechar
              </Button>
              <Button 
                variant="contained" 
                onClick={() => {
                  setChapaDetailDialog(false);
                  navigate(`/admin/chapas/${selectedChapa.id}/avaliar`);
                }}
              >
                Avaliar Chapa
              </Button>
            </DialogActions>
          </>
        )}
      </Dialog>
    </Container>
  );
};