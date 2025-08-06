import React, { useState, useEffect } from 'react';
import {
  Container,
  Paper,
  Typography,
  Box,
  Grid,
  Card,
  CardContent,
  TextField,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  IconButton,
  Tooltip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Alert,
  Pagination,
  CircularProgress,
  Avatar,
  InputAdornment,
  Fab
} from '@mui/material';
import {
  Search as SearchIcon,
  FilterList as FilterIcon,
  Visibility as ViewIcon,
  Add as AddIcon,
  Download as DownloadIcon,
  Report as ReportIcon,
  Assessment as AssessmentIcon,
  Warning as WarningIcon,
  CheckCircle as CheckCircleIcon,
  Cancel as CancelIcon,
  HourglassEmpty as PendingIcon,
  Archive as ArchiveIcon
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { useSnackbar } from 'notistack';
import { 
  denunciaService,
  Denuncia,
  FiltrosDenuncia,
  EstatisticasDenuncia,
  STATUS_DENUNCIA_RECEBIDA,
  STATUS_DENUNCIA_EM_ANALISE,
  STATUS_DENUNCIA_ANALISADA,
  STATUS_DENUNCIA_DECIDIDA,
  STATUS_DENUNCIA_IMPLEMENTADA,
  STATUS_DENUNCIA_ARQUIVADA
} from '../../services/api/denunciaService';
import { eleicaoService } from '../../services/api';

export const DenunciasListPage: React.FC = () => {
  const navigate = useNavigate();
  const { enqueueSnackbar } = useSnackbar();

  // Estados
  const [filtros, setFiltros] = useState<FiltrosDenuncia>({
    page: 0,
    size: 10
  });
  const [showFilters, setShowFilters] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDenuncia, setSelectedDenuncia] = useState<Denuncia | null>(null);
  const [showProtocoloModal, setShowProtocoloModal] = useState(false);

  // Queries
  const { data: denunciasData, isLoading, refetch } = useQuery({
    queryKey: ['denuncias', filtros],
    queryFn: () => denunciaService.listarDenuncias(filtros)
  });

  const { data: estatisticas } = useQuery({
    queryKey: ['estatisticas-denuncias'],
    queryFn: () => denunciaService.getEstatisticas()
  });

  const { data: tiposDenuncia = [] } = useQuery({
    queryKey: ['tipos-denuncia'],
    queryFn: denunciaService.getTiposDenuncia
  });

  const { data: statusDenuncia = [] } = useQuery({
    queryKey: ['status-denuncia'],
    queryFn: denunciaService.getStatusDenuncia
  });

  const { data: eleicoes = [] } = useQuery({
    queryKey: ['eleicoes'],
    queryFn: eleicaoService.getAll
  });

  const denuncias = denunciasData?.content || [];

  // Effects
  useEffect(() => {
    const timer = setTimeout(() => {
      if (searchTerm) {
        setFiltros(prev => ({ ...prev, numeroProtocolo: searchTerm, page: 0 }));
      } else {
        setFiltros(prev => ({ ...prev, numeroProtocolo: undefined, page: 0 }));
      }
    }, 500);

    return () => clearTimeout(timer);
  }, [searchTerm]);

  // Handlers
  const handleViewDenuncia = (denuncia: Denuncia) => {
    navigate(`/denuncias/${denuncia.id}`);
  };

  const handleExportReport = async () => {
    try {
      const blob = await denunciaService.exportarRelatorio(filtros, 'pdf');
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `denuncias-${new Date().toISOString().split('T')[0]}.pdf`;
      link.click();
      window.URL.revokeObjectURL(url);
      enqueueSnackbar('Relatório exportado com sucesso!', { variant: 'success' });
    } catch (error) {
      enqueueSnackbar('Erro ao exportar relatório', { variant: 'error' });
    }
  };

  const getStatusColor = (statusId: number) => {
    switch (statusId) {
      case STATUS_DENUNCIA_RECEBIDA:
        return 'info';
      case STATUS_DENUNCIA_EM_ANALISE:
        return 'warning';
      case STATUS_DENUNCIA_ANALISADA:
        return 'primary';
      case STATUS_DENUNCIA_DECIDIDA:
        return 'success';
      case STATUS_DENUNCIA_IMPLEMENTADA:
        return 'success';
      case STATUS_DENUNCIA_ARQUIVADA:
        return 'default';
      default:
        return 'default';
    }
  };

  const getStatusIcon = (statusId: number) => {
    switch (statusId) {
      case STATUS_DENUNCIA_RECEBIDA:
        return <ReportIcon />;
      case STATUS_DENUNCIA_EM_ANALISE:
        return <PendingIcon />;
      case STATUS_DENUNCIA_ANALISADA:
        return <AssessmentIcon />;
      case STATUS_DENUNCIA_DECIDIDA:
        return <CheckCircleIcon />;
      case STATUS_DENUNCIA_IMPLEMENTADA:
        return <CheckCircleIcon />;
      case STATUS_DENUNCIA_ARQUIVADA:
        return <ArchiveIcon />;
      default:
        return <ReportIcon />;
    }
  };

  const updateFiltro = (key: keyof FiltrosDenuncia, value: any) => {
    setFiltros(prev => ({ ...prev, [key]: value, page: 0 }));
  };

  const clearFiltros = () => {
    setFiltros({ page: 0, size: 10 });
    setSearchTerm('');
  };

  const renderEstatisticasCards = () => {
    if (!estatisticas) return null;

    return (
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ bgcolor: 'primary.light', color: 'primary.contrastText' }}>
            <CardContent sx={{ py: 2 }}>
              <Typography variant="h4" fontWeight="bold">
                {estatisticas.totalDenuncias}
              </Typography>
              <Typography variant="body2">Total de Denúncias</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ bgcolor: 'warning.light', color: 'warning.contrastText' }}>
            <CardContent sx={{ py: 2 }}>
              <Typography variant="h4" fontWeight="bold">
                {estatisticas.denunciasAbertas}
              </Typography>
              <Typography variant="body2">Em Análise</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ bgcolor: 'success.light', color: 'success.contrastText' }}>
            <CardContent sx={{ py: 2 }}>
              <Typography variant="h4" fontWeight="bold">
                {estatisticas.denunciasProcedentes}
              </Typography>
              <Typography variant="body2">Procedentes</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ bgcolor: 'error.light', color: 'error.contrastText' }}>
            <CardContent sx={{ py: 2 }}>
              <Typography variant="h4" fontWeight="bold">
                {estatisticas.denunciasImprocedentes}
              </Typography>
              <Typography variant="body2">Improcedentes</Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    );
  };

  const renderFiltros = () => (
    <Paper sx={{ p: 3, mb: 3 }}>
      <Box display="flex" justifyContent="between" alignItems="center" mb={2}>
        <Typography variant="h6">Filtros</Typography>
        <Button onClick={clearFiltros} size="small">
          Limpar Filtros
        </Button>
      </Box>
      
      <Grid container spacing={2}>
        <Grid item xs={12} md={3}>
          <FormControl fullWidth size="small">
            <InputLabel>Tipo de Denúncia</InputLabel>
            <Select
              value={filtros.tipoDenunciaId || ''}
              label="Tipo de Denúncia"
              onChange={(e) => updateFiltro('tipoDenunciaId', e.target.value || undefined)}
            >
              <MenuItem value="">Todos</MenuItem>
              {tiposDenuncia.map((tipo) => (
                <MenuItem key={tipo.id} value={tipo.id}>
                  {tipo.descricao}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Grid>

        <Grid item xs={12} md={3}>
          <FormControl fullWidth size="small">
            <InputLabel>Status</InputLabel>
            <Select
              value={filtros.statusDenunciaId || ''}
              label="Status"
              onChange={(e) => updateFiltro('statusDenunciaId', e.target.value || undefined)}
            >
              <MenuItem value="">Todos</MenuItem>
              {statusDenuncia.map((status) => (
                <MenuItem key={status.id} value={status.id}>
                  {status.descricao}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Grid>

        <Grid item xs={12} md={3}>
          <FormControl fullWidth size="small">
            <InputLabel>Eleição</InputLabel>
            <Select
              value={filtros.eleicaoId || ''}
              label="Eleição"
              onChange={(e) => updateFiltro('eleicaoId', e.target.value || undefined)}
            >
              <MenuItem value="">Todas</MenuItem>
              {eleicoes.map((eleicao) => (
                <MenuItem key={eleicao.id} value={eleicao.id}>
                  {eleicao.titulo} - {eleicao.ano}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Grid>

        <Grid item xs={12} md={3}>
          <FormControl fullWidth size="small">
            <InputLabel>Decisão</InputLabel>
            <Select
              value={filtros.decisao || ''}
              label="Decisão"
              onChange={(e) => updateFiltro('decisao', e.target.value || undefined)}
            >
              <MenuItem value="">Todas</MenuItem>
              <MenuItem value="PROCEDENTE">Procedente</MenuItem>
              <MenuItem value="IMPROCEDENTE">Improcedente</MenuItem>
              <MenuItem value="ARQUIVADA">Arquivada</MenuItem>
            </Select>
          </FormControl>
        </Grid>

        <Grid item xs={12} md={6}>
          <TextField
            fullWidth
            size="small"
            label="Data Início"
            type="date"
            value={filtros.dataInicio || ''}
            onChange={(e) => updateFiltro('dataInicio', e.target.value || undefined)}
            InputLabelProps={{ shrink: true }}
          />
        </Grid>

        <Grid item xs={12} md={6}>
          <TextField
            fullWidth
            size="small"
            label="Data Fim"
            type="date"
            value={filtros.dataFim || ''}
            onChange={(e) => updateFiltro('dataFim', e.target.value || undefined)}
            InputLabelProps={{ shrink: true }}
          />
        </Grid>
      </Grid>
    </Paper>
  );

  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      {/* Header */}  
      <Box mb={4}>
        <Typography variant="h3" component="h1" gutterBottom fontWeight="bold">
          <ReportIcon sx={{ mr: 2, verticalAlign: 'middle', fontSize: 'inherit' }} />
          Gestão de Denúncias
        </Typography>
        <Typography variant="h6" color="textSecondary">
          Acompanhe e gerencie todas as denúncias do sistema eleitoral
        </Typography>
      </Box>

      {/* Estatísticas */}
      {renderEstatisticasCards()}

      {/* Barra de Busca e Ações */}
      <Paper sx={{ p: 3, mb: 3 }}>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              placeholder="Buscar por número de protocolo..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon />
                  </InputAdornment>
                ),
              }}
            />
          </Grid>
          
          <Grid item xs={12} md={6}>
            <Box display="flex" gap={1} justifyContent="flex-end">
              <Button
                variant="outlined"
                startIcon={<FilterIcon />}
                onClick={() => setShowFilters(!showFilters)}
              >
                Filtros
              </Button>
              
              <Button
                variant="outlined"
                startIcon={<DownloadIcon />}
                onClick={handleExportReport}
              >
                Exportar
              </Button>
              
              <Button
                variant="contained"
                startIcon={<AddIcon />}
                onClick={() => navigate('/denuncias/nova')}
              >
                Nova Denúncia
              </Button>
            </Box>
          </Grid>
        </Grid>
      </Paper>

      {/* Filtros */}
      {showFilters && renderFiltros()}

      {/* Lista de Denúncias */}
      <Paper>
        {isLoading ? (
          <Box display="flex" justifyContent="center" py={6}>
            <CircularProgress size={60} />
          </Box>
        ) : denuncias.length === 0 ? (
          <Box p={6} textAlign="center">
            <ReportIcon sx={{ fontSize: 80, color: 'grey.400', mb: 2 }} />
            <Typography variant="h6" color="textSecondary" gutterBottom>
              Nenhuma denúncia encontrada
            </Typography>
            <Typography variant="body2" color="textSecondary">
              {searchTerm || Object.keys(filtros).some(key => filtros[key as keyof FiltrosDenuncia])
                ? 'Tente ajustar os filtros ou termo de busca'
                : 'Seja o primeiro a registrar uma denúncia'
              }
            </Typography>
          </Box>
        ) : (
          <>
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow sx={{ bgcolor: 'grey.50' }}>
                    <TableCell>Protocolo</TableCell>
                    <TableCell>Tipo</TableCell>
                    <TableCell>Assunto</TableCell>
                    <TableCell>Denunciante</TableCell>
                    <TableCell>Status</TableCell>
                    <TableCell>Data</TableCell>
                    <TableCell align="center">Ações</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {denuncias.map((denuncia) => (
                    <TableRow 
                      key={denuncia.id} 
                      hover
                      sx={{ cursor: 'pointer' }}
                      onClick={() => handleViewDenuncia(denuncia)}
                    >
                      <TableCell>
                        <Typography variant="body2" fontWeight="medium">
                          {denuncia.numeroProtocolo}
                        </Typography>
                      </TableCell>
                      
                      <TableCell>
                        <Typography variant="body2">
                          {denuncia.tipoDenuncia.descricao}
                        </Typography>
                      </TableCell>
                      
                      <TableCell>
                        <Typography 
                          variant="body2" 
                          sx={{ 
                            maxWidth: 200,
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            whiteSpace: 'nowrap'
                          }}
                        >
                          {denuncia.assunto}
                        </Typography>
                      </TableCell>
                      
                      <TableCell>
                        {denuncia.anonima ? (
                          <Chip size="small" label="Anônimo" color="default" />
                        ) : (
                          <Box display="flex" alignItems="center">
                            <Avatar sx={{ width: 24, height: 24, mr: 1, fontSize: '0.75rem' }}>
                              {denuncia.denuncianteNome?.substring(0, 2).toUpperCase()}
                            </Avatar>
                            <Typography variant="body2">
                              {denuncia.denuncianteNome}
                            </Typography>
                          </Box>
                        )}
                      </TableCell>
                      
                      <TableCell>
                        <Chip
                          icon={getStatusIcon(denuncia.statusDenuncia.id)}
                          label={denuncia.statusDenuncia.descricao}
                          color={getStatusColor(denuncia.statusDenuncia.id) as any}
                          size="small"
                        />
                      </TableCell>
                      
                      <TableCell>
                        <Typography variant="body2" color="textSecondary">
                          {new Date(denuncia.dataInclusao).toLocaleDateString('pt-BR')}
                        </Typography>
                      </TableCell>
                      
                      <TableCell align="center">
                        <Tooltip title="Ver detalhes">
                          <IconButton 
                            size="small" 
                            onClick={(e) => {
                              e.stopPropagation();
                              handleViewDenuncia(denuncia);
                            }}
                          >
                            <ViewIcon />
                          </IconButton>
                        </Tooltip>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>

            {/* Paginação */}
            <Box display="flex" justifyContent="center" p={3}>
              <Pagination
                count={denunciasData?.totalPages || 1}
                page={(filtros.page || 0) + 1}
                onChange={(_, page) => updateFiltro('page', page - 1)}
                color="primary"
              />
            </Box>
          </>
        )}
      </Paper>

      {/* FAB para Nova Denúncia */}
      <Fab
        color="primary"
        aria-label="Nova denúncia"
        sx={{ position: 'fixed', bottom: 16, right: 16 }}
        onClick={() => navigate('/denuncias/nova')}
      >
        <AddIcon />
      </Fab>
    </Container>
  );
};