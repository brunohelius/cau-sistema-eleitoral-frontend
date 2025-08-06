import { useState, useEffect } from 'react';
import {
  Box,
  Container,
  Typography,
  Card,
  CardContent,
  Grid,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Button,
  Paper,
  Chip,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Alert,
  Divider,
  Tab,
  Tabs,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  IconButton,
  Tooltip
} from '@mui/material';
import {
  Search as SearchIcon,
  FilterList as FilterIcon,
  Download as DownloadIcon,
  Visibility as VisibilityIcon,
  CalendarToday as CalendarIcon,
  Group as GroupIcon,
  Assignment as AssignmentIcon,
  Gavel as GavelIcon,
  ExpandMore as ExpandMoreIcon,
  CheckCircle as CheckCircleIcon,
  Cancel as CancelIcon,
  Schedule as ScheduleIcon,
  LocationOn as LocationIcon,
  Person as PersonIcon
} from '@mui/icons-material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { ptBR } from 'date-fns/locale';
import { useQuery } from '@tanstack/react-query';
import { format } from 'date-fns';

import { consultaService } from '../../../services/api/consultaService';
import { eleicaoService } from '../../../services/api/eleicaoService';
import { ufService } from '../../../services/api/ufService';

interface ConsultaFiltros {
  termo: string;
  tipo: string;
  uf: string;
  eleicao: string;
  status: string;
  dataInicio: Date | null;
  dataFim: Date | null;
}

interface ResultadoConsulta {
  id: number;
  tipo: 'CHAPA' | 'ELEICAO' | 'CALENDARIO' | 'IMPUGNACAO' | 'DENUNCIA' | 'DOCUMENTO';
  titulo: string;
  subtitulo: string;
  descricao: string;
  status: string;
  data: string;
  uf?: string;
  eleicao?: string;
  metadata: Record<string, any>;
}

const TIPOS_CONSULTA = [
  { value: 'TODOS', label: 'Todos os Tipos' },
  { value: 'CHAPA', label: 'Chapas' },
  { value: 'ELEICAO', label: 'Eleições' },
  { value: 'CALENDARIO', label: 'Calendários' },
  { value: 'DOCUMENTO', label: 'Documentos' },
  { value: 'IMPUGNACAO', label: 'Impugnações' },
  { value: 'DENUNCIA', label: 'Denúncias' }
];

const STATUS_OPCOES = [
  { value: '', label: 'Todos os Status' },
  { value: 'ATIVO', label: 'Ativo' },
  { value: 'APROVADO', label: 'Aprovado' },
  { value: 'PUBLICADO', label: 'Publicado' },
  { value: 'FINALIZADO', label: 'Finalizado' },
  { value: 'EM_ANDAMENTO', label: 'Em Andamento' }
];

export function ConsultasPage() {
  const [selectedTab, setSelectedTab] = useState(0);
  const [filtros, setFiltros] = useState<ConsultaFiltros>({
    termo: '',
    tipo: 'TODOS',
    uf: '',
    eleicao: '',
    status: '',
    dataInicio: null,
    dataFim: null
  });
  const [filtrosAplicados, setFiltrosAplicados] = useState<ConsultaFiltros>({
    termo: '',
    tipo: 'TODOS',
    uf: '',
    eleicao: '',
    status: '',
    dataInicio: null,
    dataFim: null
  });

  // Queries
  const { data: resultados = [], isLoading, error } = useQuery({
    queryKey: ['consulta-geral', filtrosAplicados],
    queryFn: () => consultaService.consultaGeral(filtrosAplicados),
    enabled: Object.values(filtrosAplicados).some(v => v !== '' && v !== null)
  });

  const { data: eleicoes = [] } = useQuery({
    queryKey: ['eleicoes-consulta'],
    queryFn: eleicaoService.getAll
  });

  const { data: ufs = [] } = useQuery({
    queryKey: ['ufs'],
    queryFn: ufService.getAll
  });

  const { data: estatisticas } = useQuery({
    queryKey: ['estatisticas-publicas'],
    queryFn: consultaService.getEstatisticasPublicas
  });

  const handleSearch = () => {
    setFiltrosAplicados({ ...filtros });
  };

  const handleClearFilters = () => {
    const filtrosLimpos = {
      termo: '',
      tipo: 'TODOS',
      uf: '',
      eleicao: '',
      status: '',
      dataInicio: null,
      dataFim: null
    };
    setFiltros(filtrosLimpos);
    setFiltrosAplicados(filtrosLimpos);
  };

  const handleExportResults = () => {
    consultaService.exportarResultados(filtrosAplicados);
  };

  const getIconeByTipo = (tipo: string) => {
    switch (tipo) {
      case 'CHAPA': return <GroupIcon />;
      case 'ELEICAO': return <CalendarIcon />;
      case 'CALENDARIO': return <ScheduleIcon />;
      case 'DOCUMENTO': return <AssignmentIcon />;
      case 'IMPUGNACAO': return <GavelIcon />;
      case 'DENUNCIA': return <GavelIcon />;
      default: return <AssignmentIcon />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status.toUpperCase()) {
      case 'ATIVO':
      case 'APROVADO':
      case 'PUBLICADO': return 'success';
      case 'EM_ANDAMENTO':
      case 'EM_ANALISE': return 'warning';
      case 'REPROVADO':
      case 'CANCELADO': return 'error';
      case 'FINALIZADO': return 'primary';
      default: return 'default';
    }
  };

  const resultadosPorTipo = {
    todos: resultados,
    chapas: resultados.filter(r => r.tipo === 'CHAPA'),
    eleicoes: resultados.filter(r => r.tipo === 'ELEICAO'),
    calendarios: resultados.filter(r => r.tipo === 'CALENDARIO'),
    documentos: resultados.filter(r => r.tipo === 'DOCUMENTO'),
    processos: resultados.filter(r => ['IMPUGNACAO', 'DENUNCIA'].includes(r.tipo))
  };

  const getResultadosPorTab = (tabIndex: number) => {
    switch (tabIndex) {
      case 0: return resultadosPorTipo.todos;
      case 1: return resultadosPorTipo.chapas;
      case 2: return resultadosPorTipo.eleicoes;
      case 3: return resultadosPorTipo.calendarios;
      case 4: return resultadosPorTipo.documentos;
      case 5: return resultadosPorTipo.processos;
      default: return resultadosPorTipo.todos;
    }
  };

  return (
    <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={ptBR}>
      <Container maxWidth="lg" sx={{ py: 4 }}>
        {/* Header */}
        <Box mb={4}>
          <Typography variant="h3" component="h1" gutterBottom align="center">
            Consultas Públicas
          </Typography>
          <Typography variant="h6" color="textSecondary" align="center" mb={3}>
            Consulte informações sobre eleições, chapas, calendários e processos eleitorais
          </Typography>
        </Box>

        {/* Estatísticas */}
        {estatisticas && (
          <Grid container spacing={3} mb={4}>
            <Grid item xs={12} sm={6} md={3}>
              <Card>
                <CardContent>
                  <Box display="flex" alignItems="center" gap={1}>
                    <CalendarIcon color="primary" />
                    <Box>
                      <Typography variant="h5">{estatisticas.totalEleicoes}</Typography>
                      <Typography variant="body2" color="textSecondary">
                        Eleições Realizadas
                      </Typography>
                    </Box>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <Card>
                <CardContent>
                  <Box display="flex" alignItems="center" gap={1}>
                    <GroupIcon color="success" />
                    <Box>
                      <Typography variant="h5">{estatisticas.totalChapas}</Typography>
                      <Typography variant="body2" color="textSecondary">
                        Chapas Registradas
                      </Typography>
                    </Box>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <Card>
                <CardContent>
                  <Box display="flex" alignItems="center" gap={1}>
                    <AssignmentIcon color="info" />
                    <Box>
                      <Typography variant="h5">{estatisticas.totalDocumentos}</Typography>
                      <Typography variant="body2" color="textSecondary">
                        Documentos Públicos
                      </Typography>
                    </Box>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <Card>
                <CardContent>
                  <Box display="flex" alignItems="center" gap={1}>
                    <PersonIcon color="secondary" />
                    <Box>
                      <Typography variant="h5">{estatisticas.totalVotos?.toLocaleString()}</Typography>
                      <Typography variant="body2" color="textSecondary">
                        Votos Computados
                      </Typography>
                    </Box>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        )}

        {/* Filtros de Busca */}
        <Paper elevation={3} sx={{ p: 3, mb: 4 }}>
          <Typography variant="h6" gutterBottom>
            <FilterIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
            Filtros de Busca
          </Typography>

          <Grid container spacing={3}>
            {/* Termo de Busca */}
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Buscar por termo"
                placeholder="Digite nome, número, CPF, palavra-chave..."
                value={filtros.termo}
                onChange={(e) => setFiltros(prev => ({ ...prev, termo: e.target.value }))}
                InputProps={{
                  startAdornment: <SearchIcon sx={{ mr: 1, color: 'action.active' }} />
                }}
              />
            </Grid>

            {/* Tipo */}
            <Grid item xs={12} md={3}>
              <FormControl fullWidth>
                <InputLabel>Tipo de Conteúdo</InputLabel>
                <Select
                  value={filtros.tipo}
                  onChange={(e) => setFiltros(prev => ({ ...prev, tipo: e.target.value }))}
                  label="Tipo de Conteúdo"
                >
                  {TIPOS_CONSULTA.map(tipo => (
                    <MenuItem key={tipo.value} value={tipo.value}>
                      {tipo.label}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>

            {/* Status */}
            <Grid item xs={12} md={3}>
              <FormControl fullWidth>
                <InputLabel>Status</InputLabel>
                <Select
                  value={filtros.status}
                  onChange={(e) => setFiltros(prev => ({ ...prev, status: e.target.value }))}
                  label="Status"
                >
                  {STATUS_OPCOES.map(status => (
                    <MenuItem key={status.value} value={status.value}>
                      {status.label}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>

            {/* UF */}
            <Grid item xs={12} md={6}>
              <FormControl fullWidth>
                <InputLabel>Unidade Federativa</InputLabel>
                <Select
                  value={filtros.uf}
                  onChange={(e) => setFiltros(prev => ({ ...prev, uf: e.target.value }))}
                  label="Unidade Federativa"
                >
                  <MenuItem value="">Todas as UFs</MenuItem>
                  <MenuItem value="NACIONAL">Nacional</MenuItem>
                  {ufs.map(uf => (
                    <MenuItem key={uf.id} value={uf.sigla}>
                      {uf.sigla} - {uf.nome}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>

            {/* Eleição */}
            <Grid item xs={12} md={6}>
              <FormControl fullWidth>
                <InputLabel>Eleição</InputLabel>
                <Select
                  value={filtros.eleicao}
                  onChange={(e) => setFiltros(prev => ({ ...prev, eleicao: e.target.value }))}
                  label="Eleição"
                >
                  <MenuItem value="">Todas as Eleições</MenuItem>
                  {eleicoes.map(eleicao => (
                    <MenuItem key={eleicao.id} value={eleicao.id}>
                      {eleicao.nome} ({eleicao.ano})
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>

            {/* Período */}
            <Grid item xs={12} md={6}>
              <DatePicker
                label="Data Início"
                value={filtros.dataInicio}
                onChange={(date) => setFiltros(prev => ({ ...prev, dataInicio: date }))}
                format="dd/MM/yyyy"
                slotProps={{
                  textField: { fullWidth: true }
                }}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <DatePicker
                label="Data Fim"
                value={filtros.dataFim}
                onChange={(date) => setFiltros(prev => ({ ...prev, dataFim: date }))}
                format="dd/MM/yyyy"
                slotProps={{
                  textField: { fullWidth: true }
                }}
              />
            </Grid>

            {/* Botões */}
            <Grid item xs={12}>
              <Box display="flex" gap={2}>
                <Button
                  variant="contained"
                  startIcon={<SearchIcon />}
                  onClick={handleSearch}
                  size="large"
                >
                  Buscar
                </Button>
                <Button
                  variant="outlined"
                  onClick={handleClearFilters}
                  size="large"
                >
                  Limpar Filtros
                </Button>
                {resultados.length > 0 && (
                  <Button
                    variant="outlined"
                    startIcon={<DownloadIcon />}
                    onClick={handleExportResults}
                    size="large"
                  >
                    Exportar Resultados
                  </Button>
                )}
              </Box>
            </Grid>
          </Grid>
        </Paper>

        {/* Resultados */}
        {isLoading ? (
          <Box display="flex" justifyContent="center" p={4}>
            <Typography>Buscando...</Typography>
          </Box>
        ) : error ? (
          <Alert severity="error">
            Erro ao realizar busca. Tente novamente.
          </Alert>
        ) : resultados.length === 0 ? (
          filtrosAplicados.termo || filtrosAplicados.tipo !== 'TODOS' ? (
            <Alert severity="info">
              Nenhum resultado encontrado com os filtros aplicados.
            </Alert>
          ) : (
            <Alert severity="info">
              Use os filtros acima para realizar uma busca.
            </Alert>
          )
        ) : (
          <Box>
            {/* Tabs dos Resultados */}
            <Box mb={3}>
              <Tabs
                value={selectedTab}
                onChange={(_, newValue) => setSelectedTab(newValue)}
                sx={{ borderBottom: 1, borderColor: 'divider' }}
                variant="scrollable"
                scrollButtons="auto"
              >
                <Tab label={`Todos (${resultadosPorTipo.todos.length})`} />
                <Tab label={`Chapas (${resultadosPorTipo.chapas.length})`} />
                <Tab label={`Eleições (${resultadosPorTipo.eleicoes.length})`} />
                <Tab label={`Calendários (${resultadosPorTipo.calendarios.length})`} />
                <Tab label={`Documentos (${resultadosPorTipo.documentos.length})`} />
                <Tab label={`Processos (${resultadosPorTipo.processos.length})`} />
              </Tabs>
            </Box>

            {/* Lista de Resultados */}
            <Grid container spacing={3}>
              {getResultadosPorTab(selectedTab).map((resultado) => (
                <Grid key={`${resultado.tipo}-${resultado.id}`} item xs={12}>
                  <Card elevation={2}>
                    <CardContent>
                      <Box display="flex" alignItems="flex-start" gap={2}>
                        {/* Ícone do Tipo */}
                        <Box sx={{ 
                          p: 1, 
                          borderRadius: 1, 
                          bgcolor: 'primary.light', 
                          color: 'primary.contrastText',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center'
                        }}>
                          {getIconeByTipo(resultado.tipo)}
                        </Box>

                        {/* Conteúdo Principal */}
                        <Box flexGrow={1}>
                          <Box display="flex" justifyContent="space-between" alignItems="flex-start" mb={1}>
                            <Box>
                              <Typography variant="h6" component="h3">
                                {resultado.titulo}
                              </Typography>
                              <Typography variant="body2" color="textSecondary">
                                {resultado.subtitulo}
                              </Typography>
                            </Box>
                            <Box display="flex" gap={1}>
                              <Chip
                                label={resultado.tipo}
                                size="small"
                                variant="outlined"
                              />
                              <Chip
                                label={resultado.status}
                                size="small"
                                color={getStatusColor(resultado.status) as any}
                              />
                            </Box>
                          </Box>

                          <Typography variant="body1" sx={{ mb: 2 }}>
                            {resultado.descricao}
                          </Typography>

                          {/* Metadados */}
                          <Box display="flex" flexWrap="wrap" gap={2} mb={2}>
                            <Box display="flex" alignItems="center" gap={0.5}>
                              <CalendarIcon fontSize="small" color="action" />
                              <Typography variant="caption">
                                {format(new Date(resultado.data), 'dd/MM/yyyy', { locale: ptBR })}
                              </Typography>
                            </Box>
                            {resultado.uf && (
                              <Box display="flex" alignItems="center" gap={0.5}>
                                <LocationIcon fontSize="small" color="action" />
                                <Typography variant="caption">
                                  {resultado.uf}
                                </Typography>
                              </Box>
                            )}
                            {resultado.eleicao && (
                              <Box display="flex" alignItems="center" gap={0.5}>
                                <AssignmentIcon fontSize="small" color="action" />
                                <Typography variant="caption">
                                  {resultado.eleicao}
                                </Typography>
                              </Box>
                            )}
                          </Box>

                          {/* Ações */}
                          <Box display="flex" gap={1}>
                            <Button
                              size="small"
                              startIcon={<VisibilityIcon />}
                              onClick={() => {
                                // Navegar para detalhes específicos baseado no tipo
                                window.open(`/${resultado.tipo.toLowerCase()}s/${resultado.id}`, '_blank');
                              }}
                            >
                              Visualizar
                            </Button>
                            {resultado.metadata.downloadUrl && (
                              <Button
                                size="small"
                                startIcon={<DownloadIcon />}
                                onClick={() => window.open(resultado.metadata.downloadUrl, '_blank')}
                              >
                                Download
                              </Button>
                            )}
                          </Box>
                        </Box>
                      </Box>
                    </CardContent>
                  </Card>
                </Grid>
              ))}
            </Grid>

            {/* Paginação poderia ser adicionada aqui */}
          </Box>
        )}
      </Container>
    </LocalizationProvider>
  );
}