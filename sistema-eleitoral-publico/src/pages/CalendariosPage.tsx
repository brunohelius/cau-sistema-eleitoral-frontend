import React, { useState } from 'react';
import {
  Container,
  Typography,
  Grid,
  Card,
  CardContent,
  CardActions,
  Button,
  Box,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip,
  Paper,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Alert,
  Tabs,
  Tab
} from '@mui/material';
import {
  Timeline,
  TimelineItem,
  TimelineSeparator,
  TimelineConnector,
  TimelineContent,
  TimelineDot
} from '@mui/lab';
import {
  Search as SearchIcon,
  CalendarMonth as CalendarIcon,
  Schedule as ScheduleIcon,
  Event as EventIcon,
  LocationOn as LocationIcon,
  Download as DownloadIcon,
  Visibility as VisibilityIcon,
  AccessTime as AccessTimeIcon,
  CheckCircle as CheckCircleIcon,
  RadioButtonUnchecked as PendingIcon,
  Warning as WarningIcon
} from '@mui/icons-material';
import { useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { calendarioService, ufService } from '../services/api';
import { format, isAfter, isBefore, differenceInDays } from 'date-fns';
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
      id={`calendarios-tabpanel-${index}`}
      aria-labelledby={`calendarios-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ py: 3 }}>{children}</Box>}
    </div>
  );
}

export const CalendariosPage: React.FC = () => {
  const navigate = useNavigate();
  const [tabValue, setTabValue] = useState(0);
  const [filters, setFilters] = useState({
    search: '',
    ufId: '',
    ano: new Date().getFullYear().toString()
  });

  // Queries
  const { data: calendarios = [], isLoading } = useQuery({
    queryKey: ['calendarios-publicos', filters],
    queryFn: () => calendarioService.getPublicos({
      ufId: filters.ufId ? parseInt(filters.ufId) : undefined,
      ano: filters.ano ? parseInt(filters.ano) : undefined
    })
  });

  const { data: ufs = [] } = useQuery({
    queryKey: ['ufs'],
    queryFn: ufService.getAll
  });

  const handleFilterChange = (field: string, value: string) => {
    setFilters(prev => ({ ...prev, [field]: value }));
  };

  const handleViewCalendario = (calendarioId: number) => {
    navigate(`/calendarios/${calendarioId}`);
  };

  const getStatusPrazo = (prazo: any) => {
    const agora = new Date();
    const inicio = new Date(prazo.dataInicio);
    const fim = new Date(prazo.dataFim);

    if (isBefore(agora, inicio)) {
      return { status: 'upcoming', label: 'Próximo', icon: <PendingIcon />, color: 'info' };
    } else if (isAfter(agora, inicio) && isBefore(agora, fim)) {
      return { status: 'active', label: 'Em andamento', icon: <WarningIcon />, color: 'warning' };
    } else if (isAfter(agora, fim)) {
      return { status: 'finished', label: 'Finalizado', icon: <CheckCircleIcon />, color: 'success' };
    }
    return { status: 'unknown', label: 'Indefinido', icon: <PendingIcon />, color: 'default' };
  };

  const getTipoColor = (tipo: string) => {
    switch (tipo) {
      case 'Inscricao':
        return 'primary';
      case 'Analise':
        return 'warning';
      case 'Impugnacao':
        return 'error';
      case 'Votacao':
        return 'success';
      case 'Resultado':
        return 'info';
      default:
        return 'default';
    }
  };

  const getTipoLabel = (tipo: string) => {
    switch (tipo) {
      case 'Inscricao':
        return 'Inscrição';
      case 'Analise':
        return 'Análise';
      case 'Impugnacao':
        return 'Impugnação';
      case 'Votacao':
        return 'Votação';
      case 'Resultado':
        return 'Resultado';
      default:
        return tipo;
    }
  };

  const filteredCalendarios = calendarios.filter(calendario => {
    const matchSearch = !filters.search || 
      calendario.titulo.toLowerCase().includes(filters.search.toLowerCase()) ||
      calendario.descricao?.toLowerCase().includes(filters.search.toLowerCase());
    
    return matchSearch;
  });

  const calendariosAtivos = filteredCalendarios.filter(c => 
    c.prazos?.some(p => {
      const agora = new Date();
      const inicio = new Date(p.dataInicio);
      const fim = new Date(p.dataFim);
      return isAfter(agora, inicio) && isBefore(agora, fim);
    })
  );

  const todosCalendarios = filteredCalendarios;

  const anos = [2024, 2025, 2026];

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      {/* Header */}
      <Box mb={4}>
        <Typography variant="h3" component="h1" gutterBottom fontWeight="bold">
          Calendários Eleitorais
        </Typography>
        <Typography variant="h6" color="textSecondary">
          Acompanhe prazos, atividades e cronogramas das eleições CAU
        </Typography>
      </Box>

      {/* Estatísticas Rápidas */}
      <Grid container spacing={2} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={3}>
          <Card>
            <CardContent sx={{ textAlign: 'center' }}>
              <CalendarIcon sx={{ fontSize: 40, color: 'primary.main', mb: 1 }} />
              <Typography variant="h4" fontWeight="bold" color="primary.main">
                {todosCalendarios.length}
              </Typography>
              <Typography variant="body2" color="textSecondary">
                Calendários Publicados
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={3}>
          <Card>
            <CardContent sx={{ textAlign: 'center' }}>
              <ScheduleIcon sx={{ fontSize: 40, color: 'warning.main', mb: 1 }} />
              <Typography variant="h4" fontWeight="bold" color="warning.main">
                {calendariosAtivos.length}
              </Typography>
              <Typography variant="body2" color="textSecondary">
                Com Prazos Ativos
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={3}>
          <Card>
            <CardContent sx={{ textAlign: 'center' }}>
              <EventIcon sx={{ fontSize: 40, color: 'success.main', mb: 1 }} />
              <Typography variant="h4" fontWeight="bold" color="success.main">
                {todosCalendarios.reduce((total, cal) => total + (cal.prazos?.length || 0), 0)}
              </Typography>
              <Typography variant="body2" color="textSecondary">
                Total de Atividades
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={3}>
          <Card>
            <CardContent sx={{ textAlign: 'center' }}>
              <AccessTimeIcon sx={{ fontSize: 40, color: 'info.main', mb: 1 }} />
              <Typography variant="h4" fontWeight="bold" color="info.main">
                {filters.ano}
              </Typography>
              <Typography variant="body2" color="textSecondary">
                Ano Selecionado
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Filtros */}
      <Paper sx={{ p: 3, mb: 3 }}>
        <Grid container spacing={3} alignItems="center">
          <Grid item xs={12} md={4}>
            <TextField
              fullWidth
              label="Buscar calendário"
              value={filters.search}
              onChange={(e) => handleFilterChange('search', e.target.value)}
              placeholder="Título do calendário..."
              InputProps={{
                startAdornment: <SearchIcon sx={{ mr: 1, color: 'action.active' }} />
              }}
            />
          </Grid>
          
          <Grid item xs={12} md={3}>
            <FormControl fullWidth>
              <InputLabel>UF</InputLabel>
              <Select
                value={filters.ufId}
                label="UF"
                onChange={(e) => handleFilterChange('ufId', e.target.value)}
              >
                <MenuItem value="">Todas</MenuItem>
                <MenuItem value="nacional">Nacional</MenuItem>
                {ufs.map((uf) => (
                  <MenuItem key={uf.id} value={uf.id.toString()}>
                    {uf.sigla} - {uf.nome}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>

          <Grid item xs={12} md={2}>
            <FormControl fullWidth>
              <InputLabel>Ano</InputLabel>
              <Select
                value={filters.ano}
                label="Ano"
                onChange={(e) => handleFilterChange('ano', e.target.value)}
              >
                {anos.map((ano) => (
                  <MenuItem key={ano} value={ano.toString()}>
                    {ano}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>

          <Grid item xs={12} md={3}>
            <Typography variant="body2" color="textSecondary">
              {filteredCalendarios.length} calendários encontrados
            </Typography>
          </Grid>
        </Grid>
      </Paper>

      {/* Tabs */}
      <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 0 }}>
        <Tabs value={tabValue} onChange={(e, newValue) => setTabValue(newValue)}>
          <Tab label={`Ativos (${calendariosAtivos.length})`} />
          <Tab label={`Todos (${todosCalendarios.length})`} />
        </Tabs>
      </Box>

      {/* Conteúdo das Tabs */}
      <TabPanel value={tabValue} index={0}>
        <CalendariosGrid 
          calendarios={calendariosAtivos} 
          onViewCalendario={handleViewCalendario}
          isLoading={isLoading}
          showTimeline={true}
        />
      </TabPanel>

      <TabPanel value={tabValue} index={1}>
        <CalendariosGrid 
          calendarios={todosCalendarios} 
          onViewCalendario={handleViewCalendario}
          isLoading={isLoading}
          showTimeline={false}
        />
      </TabPanel>
    </Container>
  );
};

// Componente para o grid de calendários
interface CalendariosGridProps {
  calendarios: any[];
  onViewCalendario: (id: number) => void;
  isLoading: boolean;
  showTimeline: boolean;
}

const CalendariosGrid: React.FC<CalendariosGridProps> = ({ 
  calendarios, 
  onViewCalendario, 
  isLoading, 
  showTimeline 
}) => {
  const getStatusPrazo = (prazo: any) => {
    const agora = new Date();
    const inicio = new Date(prazo.dataInicio);
    const fim = new Date(prazo.dataFim);

    if (isBefore(agora, inicio)) {
      return { status: 'upcoming', label: 'Próximo', icon: <PendingIcon />, color: 'info' };
    } else if (isAfter(agora, inicio) && isBefore(agora, fim)) {
      return { status: 'active', label: 'Em andamento', icon: <WarningIcon />, color: 'warning' };
    } else if (isAfter(agora, fim)) {
      return { status: 'finished', label: 'Finalizado', icon: <CheckCircleIcon />, color: 'success' };
    }
    return { status: 'unknown', label: 'Indefinido', icon: <PendingIcon />, color: 'default' };
  };

  const getTipoColor = (tipo: string) => {
    switch (tipo) {
      case 'Inscricao': return 'primary';
      case 'Analise': return 'warning';
      case 'Impugnacao': return 'error';
      case 'Votacao': return 'success';
      case 'Resultado': return 'info';
      default: return 'default';
    }
  };

  const getTipoLabel = (tipo: string) => {
    switch (tipo) {
      case 'Inscricao': return 'Inscrição';
      case 'Analise': return 'Análise';
      case 'Impugnacao': return 'Impugnação';
      case 'Votacao': return 'Votação';
      case 'Resultado': return 'Resultado';
      default: return tipo;
    }
  };

  if (isLoading) {
    return (
      <Box textAlign="center" py={8}>
        <Typography>Carregando calendários...</Typography>
      </Box>
    );
  }

  if (calendarios.length === 0) {
    return (
      <Box textAlign="center" py={8}>
        <CalendarIcon sx={{ fontSize: 64, color: 'grey.400', mb: 2 }} />
        <Typography variant="h5" color="textSecondary" gutterBottom>
          Nenhum calendário encontrado
        </Typography>
        <Typography color="textSecondary">
          Tente ajustar os filtros de busca
        </Typography>
      </Box>
    );
  }

  return (
    <Grid container spacing={3}>
      {calendarios.map((calendario) => (
        <Grid item xs={12} key={calendario.id}>
          <Card 
            sx={{ 
              cursor: 'pointer',
              '&:hover': {
                boxShadow: 4
              }
            }}
            onClick={() => onViewCalendario(calendario.id)}
          >
            <CardContent>
              {/* Header */}
              <Box display="flex" justifyContent="space-between" alignItems="start" mb={2}>
                <Box>
                  <Typography variant="h6" fontWeight="bold" component="div">
                    {calendario.titulo}
                  </Typography>
                  {calendario.descricao && (
                    <Typography variant="body2" color="textSecondary" sx={{ mt: 1 }}>
                      {calendario.descricao}
                    </Typography>
                  )}
                </Box>
                <Box display="flex" gap={1}>
                  <Chip
                    label={calendario.publicado ? 'Publicado' : 'Rascunho'}
                    color={calendario.publicado ? 'success' : 'default'}
                    size="small"
                  />
                  {calendario.dataPublicacao && (
                    <Typography variant="caption" color="textSecondary">
                      {format(new Date(calendario.dataPublicacao), 'dd/MM/yyyy', { locale: ptBR })}
                    </Typography>
                  )}
                </Box>
              </Box>

              {/* Prazos */}
              {calendario.prazos && calendario.prazos.length > 0 && (
                <Box sx={{ mt: 2 }}>
                  {showTimeline ? (
                    <Timeline sx={{ py: 0, my: 0 }}>
                      {calendario.prazos
                        .sort((a: any, b: any) => new Date(a.dataInicio).getTime() - new Date(b.dataInicio).getTime())
                        .slice(0, 4)
                        .map((prazo: any, index: number) => {
                          const statusInfo = getStatusPrazo(prazo);
                          return (
                            <TimelineItem key={prazo.id}>
                              <TimelineSeparator>
                                <TimelineDot color={statusInfo.color as any}>
                                  {statusInfo.icon}
                                </TimelineDot>
                                {index < Math.min(calendario.prazos.length, 4) - 1 && <TimelineConnector />}
                              </TimelineSeparator>
                              <TimelineContent sx={{ py: '12px', px: 2 }}>
                                <Box display="flex" justifyContent="space-between" alignItems="start">
                                  <Box>
                                    <Typography variant="body1" fontWeight="medium">
                                      {prazo.descricao}
                                    </Typography>
                                    <Typography variant="body2" color="textSecondary">
                                      {format(new Date(prazo.dataInicio), 'dd/MM/yyyy', { locale: ptBR })} até{' '}
                                      {format(new Date(prazo.dataFim), 'dd/MM/yyyy', { locale: ptBR })}
                                    </Typography>
                                  </Box>
                                  <Chip
                                    label={getTipoLabel(prazo.tipo)}
                                    color={getTipoColor(prazo.tipo) as any}
                                    size="small"
                                    variant="outlined"
                                  />
                                </Box>
                              </TimelineContent>
                            </TimelineItem>
                          );
                        })}
                    </Timeline>
                  ) : (
                    <List dense>
                      {calendario.prazos
                        .sort((a: any, b: any) => new Date(a.dataInicio).getTime() - new Date(b.dataInicio).getTime())
                        .slice(0, 3)
                        .map((prazo: any) => {
                          const statusInfo = getStatusPrazo(prazo);
                          return (
                            <ListItem key={prazo.id} disablePadding>
                              <ListItemIcon>
                                {statusInfo.icon}
                              </ListItemIcon>
                              <ListItemText
                                primary={prazo.descricao}
                                secondary={
                                  <>
                                    {format(new Date(prazo.dataInicio), 'dd/MM/yyyy', { locale: ptBR })} até{' '}
                                    {format(new Date(prazo.dataFim), 'dd/MM/yyyy', { locale: ptBR })}
                                    {' • '}
                                    <Chip
                                      label={getTipoLabel(prazo.tipo)}
                                      size="small"
                                      variant="outlined"
                                      sx={{ height: 20, fontSize: '0.7rem' }}
                                    />
                                  </>
                                }
                              />
                            </ListItem>
                          );
                        })}
                    </List>
                  )}

                  {calendario.prazos.length > (showTimeline ? 4 : 3) && (
                    <Typography variant="body2" color="textSecondary" sx={{ mt: 1, textAlign: 'center' }}>
                      +{calendario.prazos.length - (showTimeline ? 4 : 3)} outras atividades
                    </Typography>
                  )}
                </Box>
              )}
            </CardContent>

            <CardActions>
              <Button 
                size="small" 
                startIcon={<VisibilityIcon />}
                onClick={(e) => {
                  e.stopPropagation();
                  onViewCalendario(calendario.id);
                }}
              >
                Ver Detalhes
              </Button>
              <Button 
                size="small" 
                startIcon={<DownloadIcon />}
                disabled
              >
                Baixar PDF
              </Button>
            </CardActions>
          </Card>
        </Grid>
      ))}
    </Grid>
  );
};