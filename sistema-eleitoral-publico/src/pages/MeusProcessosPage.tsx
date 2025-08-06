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
  LinearProgress,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Stepper,
  Step,
  StepLabel,
  StepContent,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Avatar
} from '@mui/material';
import {
  Search as SearchIcon,
  Add as AddIcon,
  Edit as EditIcon,
  Visibility as ViewIcon,
  Group as GroupIcon,
  Person as PersonIcon,
  CheckCircle as CheckCircleIcon,
  Error as ErrorIcon,
  Warning as WarningIcon,
  Schedule as ScheduleIcon,
  Assignment as AssignmentIcon,
  Gavel as GavelIcon,
  Email as EmailIcon,
  Phone as PhoneIcon,
  Badge as BadgeIcon,
  Clear as ClearIcon,
  FilterList as FilterIcon
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

// Mock data for user's processes/chapas
const mockProcesses = [
  {
    id: 1,
    nomeChapa: 'Renovação CAU',
    tipo: 'chapa',
    eleicao: 'Eleições CAU Nacional 2024',
    status: 'aprovada',
    dataSubmissao: new Date('2024-01-15'),
    dataAprovacao: new Date('2024-01-20'),
    membros: [
      { nome: 'João Silva', cargo: 'Presidente', cpf: '123.456.789-00' },
      { nome: 'Maria Santos', cargo: 'Vice-Presidente', cpf: '987.654.321-00' },
      { nome: 'Pedro Oliveira', cargo: 'Conselheiro', cpf: '456.789.123-00' }
    ],
    documentos: [
      { nome: 'Formulário de Registro', status: 'aprovado' },
      { nome: 'Declaração de Elegibilidade', status: 'aprovado' },
      { nome: 'Programa de Gestão', status: 'aprovado' }
    ],
    observacoes: 'Chapa aprovada com todos os documentos em ordem.',
    progresso: 100
  },
  {
    id: 2,
    nomeChapa: 'União Profissional',
    tipo: 'chapa',
    eleicao: 'Eleições CAU SP 2024',
    status: 'em_analise',
    dataSubmissao: new Date('2024-02-01'),
    membros: [
      { nome: 'Ana Costa', cargo: 'Presidente', cpf: '111.222.333-44' },
      { nome: 'Carlos Lima', cargo: 'Vice-Presidente', cpf: '555.666.777-88' }
    ],
    documentos: [
      { nome: 'Formulário de Registro', status: 'aprovado' },
      { nome: 'Declaração de Elegibilidade', status: 'pendente' },
      { nome: 'Programa de Gestão', status: 'em_analise' }
    ],
    observacoes: 'Aguardando complementação da documentação.',
    progresso: 65
  },
  {
    id: 3,
    nomeChapa: 'Transparência Total',
    tipo: 'chapa',
    eleicao: 'Eleições CAU RJ 2024',
    status: 'rejeitada',
    dataSubmissao: new Date('2024-01-10'),
    dataRejeicao: new Date('2024-01-25'),
    membros: [
      { nome: 'Roberto Ferreira', cargo: 'Presidente', cpf: '999.888.777-66' }
    ],
    documentos: [
      { nome: 'Formulário de Registro', status: 'rejeitado' },
      { nome: 'Declaração de Elegibilidade', status: 'aprovado' }
    ],
    observacoes: 'Formulário de registro apresentou inconsistências nas informações dos candidatos.',
    motivo_rejeicao: 'Documentação incompleta - faltam comprovantes de regularidade profissional.',
    progresso: 25
  },
  {
    id: 4,
    tipo: 'impugnacao',
    titulo: 'Impugnação - Chapa "Futuro CAU"',
    eleicao: 'Eleições CAU Nacional 2024',
    status: 'em_julgamento',
    dataSubmissao: new Date('2024-02-05'),
    instancia_atual: 'primeira',
    motivo: 'Candidato não possui regularidade profissional exigida',
    documentos: [
      { nome: 'Petição de Impugnação', status: 'protocolado' },
      { nome: 'Documentos Comprobatórios', status: 'protocolado' }
    ],
    progresso: 40
  },
  {
    id: 5,
    tipo: 'denuncia',
    titulo: 'Denúncia - Propaganda Irregular',
    eleicao: 'Eleições CAU SP 2024',
    status: 'em_apuracao',
    dataSubmissao: new Date('2024-02-10'),
    motivo: 'Propaganda eleitoral em local não permitido',
    documentos: [
      { nome: 'Relato da Denúncia', status: 'protocolado' },
      { nome: 'Evidências Fotográficas', status: 'protocolado' }
    ],
    progresso: 20
  }
];

const statusOptions = [
  { value: 'all', label: 'Todos os status' },
  { value: 'aprovada', label: 'Aprovada' },
  { value: 'em_analise', label: 'Em Análise' },
  { value: 'rejeitada', label: 'Rejeitada' },
  { value: 'em_julgamento', label: 'Em Julgamento' },
  { value: 'em_apuracao', label: 'Em Apuração' }
];

const typeOptions = [
  { value: 'all', label: 'Todos os tipos' },
  { value: 'chapa', label: 'Chapas' },
  { value: 'impugnacao', label: 'Impugnações' },
  { value: 'denuncia', label: 'Denúncias' }
];

export const MeusProcessosPage: React.FC = () => {
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();
  const [processes, setProcesses] = useState(mockProcesses);
  const [filteredProcesses, setFilteredProcesses] = useState(mockProcesses);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [selectedType, setSelectedType] = useState('all');
  const [selectedProcess, setSelectedProcess] = useState<any>(null);
  const [detailDialogOpen, setDetailDialogOpen] = useState(false);

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
    filterProcesses();
  }, [searchTerm, selectedStatus, selectedType, isAuthenticated, navigate]);

  const filterProcesses = () => {
    let filtered = [...processes];

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(proc =>
        (proc.nomeChapa && proc.nomeChapa.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (proc.titulo && proc.titulo.toLowerCase().includes(searchTerm.toLowerCase())) ||
        proc.eleicao.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Filter by status
    if (selectedStatus !== 'all') {
      filtered = filtered.filter(proc => proc.status === selectedStatus);
    }

    // Filter by type
    if (selectedType !== 'all') {
      filtered = filtered.filter(proc => proc.tipo === selectedType);
    }

    setFilteredProcesses(filtered);
  };

  const handleClearFilters = () => {
    setSearchTerm('');
    setSelectedStatus('all');
    setSelectedType('all');
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'aprovada':
        return <CheckCircleIcon color="success" />;
      case 'rejeitada':
        return <ErrorIcon color="error" />;
      case 'em_analise':
      case 'em_julgamento':
      case 'em_apuracao':
        return <ScheduleIcon color="warning" />;
      default:
        return <AssignmentIcon color="action" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'aprovada': return 'success';
      case 'rejeitada': return 'error';
      case 'em_analise':
      case 'em_julgamento':
      case 'em_apuracao': return 'warning';
      default: return 'default';
    }
  };

  const getTypeIcon = (tipo: string) => {
    switch (tipo) {
      case 'chapa':
        return <GroupIcon />;
      case 'impugnacao':
        return <GavelIcon />;
      case 'denuncia':
        return <WarningIcon />;
      default:
        return <AssignmentIcon />;
    }
  };

  const handleViewDetails = (process: any) => {
    setSelectedProcess(process);
    setDetailDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setDetailDialogOpen(false);
    setSelectedProcess(null);
  };

  if (!isAuthenticated) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Alert severity="error">
          Você precisa estar logado para acessar seus processos.
        </Alert>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      {/* Header */}
      <Box mb={4}>
        <Box display="flex" justifyContent="space-between" alignItems="flex-start" mb={2}>
          <Box>
            <Typography variant="h3" component="h1" gutterBottom fontWeight="bold">
              Meus Processos
            </Typography>
            <Typography variant="h6" color="textSecondary">
              Acompanhe o status de suas chapas, impugnações e denúncias
            </Typography>
          </Box>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => navigate('/criar-chapa')}
            size="large"
          >
            Nova Chapa
          </Button>
        </Box>
      </Box>

      {/* Filters */}
      <Paper sx={{ p: 3, mb: 4 }}>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} md={4}>
            <TextField
              fullWidth
              placeholder="Buscar processos..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon />
                  </InputAdornment>
                ),
                endAdornment: searchTerm && (
                  <InputAdornment position="end">
                    <IconButton
                      size="small"
                      onClick={() => setSearchTerm('')}
                    >
                      <ClearIcon />
                    </IconButton>
                  </InputAdornment>
                )
              }}
            />
          </Grid>
          
          <Grid item xs={12} sm={6} md={3}>
            <FormControl fullWidth>
              <InputLabel>Status</InputLabel>
              <Select
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
                label="Status"
              >
                {statusOptions.map(option => (
                  <MenuItem key={option.value} value={option.value}>
                    {option.label}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          
          <Grid item xs={12} sm={6} md={3}>
            <FormControl fullWidth>
              <InputLabel>Tipo</InputLabel>
              <Select
                value={selectedType}
                onChange={(e) => setSelectedType(e.target.value)}
                label="Tipo"
              >
                {typeOptions.map(option => (
                  <MenuItem key={option.value} value={option.value}>
                    {option.label}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          
          <Grid item xs={12} md={2}>
            <Button
              fullWidth
              variant="outlined"
              startIcon={<FilterIcon />}
              onClick={handleClearFilters}
              disabled={!searchTerm && selectedStatus === 'all' && selectedType === 'all'}
            >
              Limpar
            </Button>
          </Grid>
        </Grid>

        {/* Results count */}
        <Box mt={2}>
          <Typography variant="body2" color="textSecondary">
            {filteredProcesses.length} processo{filteredProcesses.length !== 1 ? 's' : ''} encontrado{filteredProcesses.length !== 1 ? 's' : ''}
          </Typography>
        </Box>
      </Paper>

      {/* Processes Grid */}
      {filteredProcesses.length === 0 ? (
        <Alert severity="info">
          Nenhum processo encontrado com os filtros selecionados.
        </Alert>
      ) : (
        <Grid container spacing={3}>
          {filteredProcesses.map((process) => (
            <Grid item xs={12} md={6} key={process.id}>
              <Card 
                sx={{ 
                  height: '100%',
                  display: 'flex',
                  flexDirection: 'column',
                  transition: 'all 0.3s',
                  '&:hover': {
                    transform: 'translateY(-2px)',
                    boxShadow: 4
                  }
                }}
              >
                <CardContent sx={{ flexGrow: 1 }}>
                  {/* Header */}
                  <Box display="flex" justifyContent="space-between" alignItems="flex-start" mb={2}>
                    <Box display="flex" alignItems="center" gap={1}>
                      {getTypeIcon(process.tipo)}
                      <Chip
                        label={process.tipo === 'chapa' ? 'Chapa' : process.tipo === 'impugnacao' ? 'Impugnação' : 'Denúncia'}
                        size="small"
                        variant="outlined"
                      />
                    </Box>
                    <Chip
                      icon={getStatusIcon(process.status)}
                      label={statusOptions.find(s => s.value === process.status)?.label}
                      color={getStatusColor(process.status) as any}
                      size="small"
                    />
                  </Box>

                  {/* Title */}
                  <Typography variant="h6" gutterBottom fontWeight="bold">
                    {process.nomeChapa || process.titulo}
                  </Typography>

                  {/* Election */}
                  <Typography variant="body2" color="textSecondary" gutterBottom>
                    {process.eleicao}
                  </Typography>

                  {/* Progress */}
                  <Box mt={2} mb={2}>
                    <Box display="flex" justifyContent="space-between" alignItems="center" mb={1}>
                      <Typography variant="body2" color="textSecondary">
                        Progresso
                      </Typography>
                      <Typography variant="body2" fontWeight="bold">
                        {process.progresso}%
                      </Typography>
                    </Box>
                    <LinearProgress 
                      variant="determinate" 
                      value={process.progresso} 
                      sx={{ height: 8, borderRadius: 4 }}
                      color={getStatusColor(process.status) as any}
                    />
                  </Box>

                  {/* Submission Date */}
                  <Typography variant="caption" color="textSecondary" display="block">
                    Submetido em {format(process.dataSubmissao, 'dd/MM/yyyy', { locale: ptBR })}
                  </Typography>

                  {/* Members count for chapas */}
                  {process.tipo === 'chapa' && process.membros && (
                    <Typography variant="caption" color="textSecondary" display="block">
                      {process.membros.length} membro{process.membros.length !== 1 ? 's' : ''}
                    </Typography>
                  )}

                  {/* Documents count */}
                  {process.documentos && (
                    <Typography variant="caption" color="textSecondary" display="block">
                      {process.documentos.length} documento{process.documentos.length !== 1 ? 's' : ''}
                    </Typography>
                  )}
                </CardContent>

                <Divider />

                {/* Actions */}
                <Box p={2} display="flex" gap={1}>
                  <Button
                    size="small"
                    startIcon={<ViewIcon />}
                    onClick={() => handleViewDetails(process)}
                  >
                    Ver Detalhes
                  </Button>
                  {process.tipo === 'chapa' && process.status !== 'aprovada' && (
                    <Button
                      size="small"
                      startIcon={<EditIcon />}
                      onClick={() => navigate(`/chapas/${process.id}/editar`)}
                    >
                      Editar
                    </Button>
                  )}
                </Box>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}

      {/* Detail Dialog */}
      <Dialog 
        open={detailDialogOpen} 
        onClose={handleCloseDialog}
        maxWidth="md"
        fullWidth
      >
        {selectedProcess && (
          <>
            <DialogTitle>
              <Box display="flex" alignItems="center" gap={1}>
                {getTypeIcon(selectedProcess.tipo)}
                {selectedProcess.nomeChapa || selectedProcess.titulo}
              </Box>
            </DialogTitle>
            <DialogContent>
              <Grid container spacing={3}>
                {/* Basic Info */}
                <Grid item xs={12} md={6}>
                  <Typography variant="h6" gutterBottom>
                    Informações Gerais
                  </Typography>
                  <List dense>
                    <ListItem>
                      <ListItemIcon><AssignmentIcon /></ListItemIcon>
                      <ListItemText 
                        primary="Eleição" 
                        secondary={selectedProcess.eleicao}
                      />
                    </ListItem>
                    <ListItem>
                      <ListItemIcon>{getStatusIcon(selectedProcess.status)}</ListItemIcon>
                      <ListItemText 
                        primary="Status" 
                        secondary={statusOptions.find(s => s.value === selectedProcess.status)?.label}
                      />
                    </ListItem>
                    <ListItem>
                      <ListItemIcon><ScheduleIcon /></ListItemIcon>
                      <ListItemText 
                        primary="Data de Submissão" 
                        secondary={format(selectedProcess.dataSubmissao, 'dd/MM/yyyy', { locale: ptBR })}
                      />
                    </ListItem>
                    {selectedProcess.dataAprovacao && (
                      <ListItem>
                        <ListItemIcon><CheckCircleIcon /></ListItemIcon>
                        <ListItemText 
                          primary="Data de Aprovação" 
                          secondary={format(selectedProcess.dataAprovacao, 'dd/MM/yyyy', { locale: ptBR })}
                        />
                      </ListItem>
                    )}
                  </List>
                </Grid>

                {/* Members for chapas */}
                {selectedProcess.tipo === 'chapa' && selectedProcess.membros && (
                  <Grid item xs={12} md={6}>
                    <Typography variant="h6" gutterBottom>
                      Membros da Chapa
                    </Typography>
                    <List dense>
                      {selectedProcess.membros.map((membro: any, index: number) => (
                        <ListItem key={index}>
                          <ListItemIcon>
                            <Avatar sx={{ width: 32, height: 32 }}>
                              {membro.nome.charAt(0)}
                            </Avatar>
                          </ListItemIcon>
                          <ListItemText 
                            primary={membro.nome}
                            secondary={`${membro.cargo} - CPF: ${membro.cpf}`}
                          />
                        </ListItem>
                      ))}
                    </List>
                  </Grid>
                )}

                {/* Documents */}
                {selectedProcess.documentos && (
                  <Grid item xs={12}>
                    <Typography variant="h6" gutterBottom>
                      Documentos
                    </Typography>
                    <List dense>
                      {selectedProcess.documentos.map((doc: any, index: number) => (
                        <ListItem key={index}>
                          <ListItemIcon>
                            {doc.status === 'aprovado' ? 
                              <CheckCircleIcon color="success" /> :
                              doc.status === 'rejeitado' ?
                              <ErrorIcon color="error" /> :
                              <ScheduleIcon color="warning" />
                            }
                          </ListItemIcon>
                          <ListItemText 
                            primary={doc.nome}
                            secondary={doc.status === 'aprovado' ? 'Aprovado' : doc.status === 'rejeitado' ? 'Rejeitado' : 'Em análise'}
                          />
                        </ListItem>
                      ))}
                    </List>
                  </Grid>
                )}

                {/* Observations */}
                {selectedProcess.observacoes && (
                  <Grid item xs={12}>
                    <Typography variant="h6" gutterBottom>
                      Observações
                    </Typography>
                    <Alert severity={selectedProcess.status === 'aprovada' ? 'success' : selectedProcess.status === 'rejeitada' ? 'error' : 'info'}>
                      {selectedProcess.observacoes}
                    </Alert>
                  </Grid>
                )}

                {/* Rejection reason */}
                {selectedProcess.motivo_rejeicao && (
                  <Grid item xs={12}>
                    <Typography variant="h6" gutterBottom>
                      Motivo da Rejeição
                    </Typography>
                    <Alert severity="error">
                      {selectedProcess.motivo_rejeicao}
                    </Alert>
                  </Grid>
                )}
              </Grid>
            </DialogContent>
            <DialogActions>
              <Button onClick={handleCloseDialog}>
                Fechar
              </Button>
              {selectedProcess.tipo === 'chapa' && selectedProcess.status !== 'aprovada' && (
                <Button 
                  variant="contained" 
                  onClick={() => {
                    handleCloseDialog();
                    navigate(`/chapas/${selectedProcess.id}/editar`);
                  }}
                >
                  Editar Chapa
                </Button>
              )}
            </DialogActions>
          </>
        )}
      </Dialog>
    </Container>
  );
};