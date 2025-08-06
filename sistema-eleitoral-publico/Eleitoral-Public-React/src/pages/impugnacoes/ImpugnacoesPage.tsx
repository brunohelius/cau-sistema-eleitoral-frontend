import React, { useState, useMemo } from 'react';
import {
  Container,
  Paper,
  Typography,
  Box,
  Grid,
  TextField,
  Button,
  Card,
  CardContent,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  IconButton,
  Tooltip,
  Alert,
  Divider,
  Stack,
  InputAdornment,
  Fab
} from '@mui/material';
import {
  Gavel as GavelIcon,
  Search as SearchIcon,
  Visibility as VisibilityIcon,
  Add as AddIcon,
  FilterList as FilterIcon,
  GetApp as DownloadIcon,
  AttachFile as AttachFileIcon,
  Schedule as ScheduleIcon,
  Person as PersonIcon,
  Assignment as AssignmentIcon,
  Clear as ClearIcon
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { useQuery } from '@tanstack/react-query';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { 
  impugnacaoService, 
  PedidoImpugnacao, 
  FiltrosImpugnacao,
  StatusImpugnacao,
  TipoImpugnacao
} from '../../services/api/impugnacaoService';
import { eleicaoService, ufService } from '../../services/api';

export const ImpugnacoesPage: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  // Estados dos filtros
  const [filtros, setFiltros] = useState<FiltrosImpugnacao>({
    page: 0,
    size: 10
  });
  const [busca, setBusca] = useState('');
  const [showFiltros, setShowFiltros] = useState(false);

  // Queries
  const { data: impugnacoesData, isLoading, refetch } = useQuery({
    queryKey: ['impugnacoes', filtros],
    queryFn: () => impugnacaoService.listarImpugnacoes(filtros)
  });

  const { data: tiposImpugnacao = [] } = useQuery({
    queryKey: ['tipos-impugnacao'],
    queryFn: impugnacaoService.getTiposImpugnacao
  });

  const { data: statusImpugnacao = [] } = useQuery({
    queryKey: ['status-impugnacao'],
    queryFn: impugnacaoService.getStatusImpugnacao
  });

  const { data: eleicoes = [] } = useQuery({
    queryKey: ['eleicoes'],
    queryFn: eleicaoService.getAll
  });

  const { data: ufs = [] } = useQuery({
    queryKey: ['ufs'],
    queryFn: ufService.getAll
  });

  const { data: estatisticas } = useQuery({
    queryKey: ['estatisticas-impugnacao'],
    queryFn: () => impugnacaoService.getEstatisticas()
  });

  // Dados processados
  const impugnacoes = impugnacoesData?.content || [];
  const totalElements = impugnacoesData?.totalElements || 0;

  // Handlers
  const handleChangePage = (event: unknown, newPage: number) => {
    setFiltros(prev => ({ ...prev, page: newPage }));
  };

  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setFiltros(prev => ({ 
      ...prev, 
      size: parseInt(event.target.value, 10),
      page: 0 
    }));
  };

  const handleBuscar = () => {
    setFiltros(prev => ({ 
      ...prev, 
      numeroProtocolo: busca || undefined,
      page: 0 
    }));
  };

  const handleLimparFiltros = () => {
    setFiltros({ page: 0, size: 10 });
    setBusca('');
  };

  const handleVerDetalhes = (impugnacao: PedidoImpugnacao) => {
    navigate(`/impugnacoes/${impugnacao.id}`);
  };

  const getStatusColor = (status: StatusImpugnacao): "default" | "primary" | "secondary" | "error" | "info" | "success" | "warning" => {
    switch (status.descricao.toLowerCase()) {
      case 'pendente':
        return 'warning';
      case 'em análise':
        return 'info';
      case 'procedente':
        return 'success';
      case 'improcedente':
        return 'error';
      case 'cancelada':
        return 'default';
      default:
        return 'primary';
    }
  };

  if (!user) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Alert severity="error">
          Você precisa estar logado para ver as impugnações.
          <Button onClick={() => navigate('/login')} sx={{ ml: 2 }}>
            Fazer Login
          </Button>
        </Alert>
      </Container>
    );
  }

  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      {/* Header */}
      <Box mb={4}>
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
          <Box>
            <Typography variant="h3" component="h1" gutterBottom fontWeight="bold">
              <GavelIcon sx={{ mr: 2, verticalAlign: 'middle', fontSize: 'inherit' }} />
              Impugnações
            </Typography>
            <Typography variant="h6" color="textSecondary">
              Acompanhe e gerencie pedidos de impugnação
            </Typography>
          </Box>
          
          <Button
            variant="contained"
            size="large"
            startIcon={<AddIcon />}
            onClick={() => navigate('/impugnacoes/cadastro')}
          >
            Nova Impugnação
          </Button>
        </Box>

        {/* Estatísticas */}
        {estatisticas && (
          <Grid container spacing={3} sx={{ mb: 3 }}>
            <Grid item xs={12} sm={6} md={3}>
              <Card sx={{ bgcolor: 'primary.light', color: 'primary.contrastText' }}>
                <CardContent>
                  <Typography variant="h4" fontWeight="bold">
                    {estatisticas.totalImpugnacoes}
                  </Typography>
                  <Typography variant="body2">
                    Total de Impugnações
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            
            <Grid item xs={12} sm={6} md={3}>
              <Card sx={{ bgcolor: 'warning.light', color: 'warning.contrastText' }}>
                <CardContent>
                  <Typography variant="h4" fontWeight="bold">
                    {estatisticas.impugnacoesPendentes}
                  </Typography>
                  <Typography variant="body2">
                    Pendentes
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            
            <Grid item xs={12} sm={6} md={3}>
              <Card sx={{ bgcolor: 'success.light', color: 'success.contrastText' }}>
                <CardContent>
                  <Typography variant="h4" fontWeight="bold">
                    {estatisticas.impugnacoesProcedentes}
                  </Typography>
                  <Typography variant="body2">
                    Procedentes
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            
            <Grid item xs={12} sm={6} md={3}>
              <Card sx={{ bgcolor: 'error.light', color: 'error.contrastText' }}>
                <CardContent>
                  <Typography variant="h4" fontWeight="bold">
                    {estatisticas.impugnacoesImprocedentes}
                  </Typography>
                  <Typography variant="body2">
                    Improcedentes
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        )}
      </Box>

      {/* Filtros e Busca */}
      <Paper sx={{ p: 3, mb: 3 }}>
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
          <Typography variant="h6">
            Buscar Impugnações
          </Typography>
          <Button
            variant="outlined"
            startIcon={<FilterIcon />}
            onClick={() => setShowFiltros(!showFiltros)}
          >
            {showFiltros ? 'Ocultar Filtros' : 'Mostrar Filtros'}
          </Button>
        </Box>

        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              label="Buscar por Protocolo"
              value={busca}
              onChange={(e) => setBusca(e.target.value)}
              placeholder="Digite o número do protocolo..."
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon />
                  </InputAdornment>
                ),
                endAdornment: busca && (
                  <InputAdornment position="end">
                    <IconButton size="small" onClick={() => setBusca('')}>
                      <ClearIcon />
                    </IconButton>
                  </InputAdornment>
                )
              }}
              onKeyPress={(e) => e.key === 'Enter' && handleBuscar()}
            />
          </Grid>
          
          <Grid item xs={12} md={3}>
            <Button
              fullWidth
              variant="contained"
              onClick={handleBuscar}
              sx={{ height: '56px' }}
            >
              Buscar
            </Button>
          </Grid>
          
          <Grid item xs={12} md={3}>
            <Button
              fullWidth
              variant="outlined"
              onClick={handleLimparFiltros}
              sx={{ height: '56px' }}
            >
              Limpar Filtros
            </Button>
          </Grid>
        </Grid>

        {/* Filtros Avançados */}
        {showFiltros && (
          <>
            <Divider sx={{ my: 3 }} />
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6} md={3}>
                <FormControl fullWidth>
                  <InputLabel>Eleição</InputLabel>
                  <Select
                    value={filtros.eleicaoId || ''}
                    label="Eleição"
                    onChange={(e) => setFiltros(prev => ({ 
                      ...prev, 
                      eleicaoId: e.target.value ? Number(e.target.value) : undefined,
                      page: 0 
                    }))}
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

              <Grid item xs={12} sm={6} md={3}>
                <FormControl fullWidth>
                  <InputLabel>UF</InputLabel>
                  <Select
                    value={filtros.ufId || ''}
                    label="UF"
                    onChange={(e) => setFiltros(prev => ({ 
                      ...prev, 
                      ufId: e.target.value ? Number(e.target.value) : undefined,
                      page: 0 
                    }))}
                  >
                    <MenuItem value="">Todas</MenuItem>
                    {ufs.map((uf) => (
                      <MenuItem key={uf.id} value={uf.id}>
                        {uf.sigla} - {uf.nome}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>

              <Grid item xs={12} sm={6} md={3}>
                <FormControl fullWidth>
                  <InputLabel>Status</InputLabel>
                  <Select
                    value={filtros.statusImpugnacaoId || ''}
                    label="Status"
                    onChange={(e) => setFiltros(prev => ({ 
                      ...prev, 
                      statusImpugnacaoId: e.target.value ? Number(e.target.value) : undefined,
                      page: 0 
                    }))}
                  >
                    <MenuItem value="">Todos</MenuItem>
                    {statusImpugnacao.map((status) => (
                      <MenuItem key={status.id} value={status.id}>
                        {status.descricao}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>

              <Grid item xs={12} sm={6} md={3}>
                <FormControl fullWidth>
                  <InputLabel>Tipo</InputLabel>
                  <Select
                    value={filtros.tipoImpugnacaoId || ''}
                    label="Tipo"
                    onChange={(e) => setFiltros(prev => ({ 
                      ...prev, 
                      tipoImpugnacaoId: e.target.value ? Number(e.target.value) : undefined,
                      page: 0 
                    }))}
                  >
                    <MenuItem value="">Todos</MenuItem>
                    {tiposImpugnacao.map((tipo) => (
                      <MenuItem key={tipo.id} value={tipo.id}>
                        {tipo.descricao}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
            </Grid>
          </>
        )}
      </Paper>

      {/* Tabela de Impugnações */}
      <Paper>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Protocolo</TableCell>
                <TableCell>Profissional Impugnado</TableCell>
                <TableCell>Chapa</TableCell>
                <TableCell>Tipo</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Data</TableCell>
                <TableCell align="center">Ações</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={7} align="center" sx={{ py: 6 }}>
                    Carregando impugnações...
                  </TableCell>
                </TableRow>
              ) : impugnacoes.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} align="center" sx={{ py: 6 }}>
                    <Box textAlign="center">
                      <GavelIcon sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
                      <Typography variant="h6" color="textSecondary" gutterBottom>
                        Nenhuma impugnação encontrada
                      </Typography>
                      <Typography variant="body2" color="textSecondary">
                        {filtros.numeroProtocolo || showFiltros 
                          ? 'Tente ajustar os filtros de busca'
                          : 'Seja o primeiro a criar uma impugnação'
                        }
                      </Typography>
                    </Box>
                  </TableCell>
                </TableRow>
              ) : (
                impugnacoes.map((impugnacao) => (
                  <TableRow key={impugnacao.id} hover>
                    <TableCell>
                      <Typography variant="body2" fontFamily="monospace">
                        {impugnacao.numeroProtocolo}
                      </Typography>
                    </TableCell>
                    
                    <TableCell>
                      <Box>
                        <Typography variant="body2" fontWeight="medium">
                          {impugnacao.membroChapa.profissional.nome}
                        </Typography>
                        <Typography variant="caption" color="textSecondary">
                          Reg: {impugnacao.membroChapa.profissional.registroNacional}
                        </Typography>
                      </Box>
                    </TableCell>
                    
                    <TableCell>
                      <Box>
                        <Typography variant="body2">
                          {impugnacao.membroChapa.chapaEleicao.nome}
                        </Typography>
                        <Typography variant="caption" color="textSecondary">
                          {impugnacao.membroChapa.chapaEleicao.eleicao.titulo}
                        </Typography>
                      </Box>
                    </TableCell>
                    
                    <TableCell>
                      <Typography variant="body2">
                        {impugnacao.tipoImpugnacao.descricao}
                      </Typography>
                    </TableCell>
                    
                    <TableCell>
                      <Chip
                        label={impugnacao.statusImpugnacao.descricao}
                        color={getStatusColor(impugnacao.statusImpugnacao)}
                        size="small"
                      />
                    </TableCell>
                    
                    <TableCell>
                      <Typography variant="body2">
                        {format(new Date(impugnacao.dataInclusao), 'dd/MM/yyyy', { locale: ptBR })}
                      </Typography>
                      <Typography variant="caption" color="textSecondary">
                        {format(new Date(impugnacao.dataInclusao), 'HH:mm', { locale: ptBR })}
                      </Typography>
                    </TableCell>
                    
                    <TableCell align="center">
                      <Stack direction="row" spacing={1} justifyContent="center">
                        <Tooltip title="Ver Detalhes">
                          <IconButton
                            size="small"
                            onClick={() => handleVerDetalhes(impugnacao)}
                          >
                            <VisibilityIcon />
                          </IconButton>
                        </Tooltip>
                        
                        {impugnacao.arquivosPedidoImpugnacao.length > 0 && (
                          <Tooltip title="Documentos">
                            <IconButton size="small">
                              <AttachFileIcon />
                            </IconButton>
                          </Tooltip>
                        )}
                      </Stack>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>

        <TablePagination
          rowsPerPageOptions={[5, 10, 25, 50]}
          component="div"
          count={totalElements}
          rowsPerPage={filtros.size || 10}
          page={filtros.page || 0}
          onPageChange={handleChangePage}
          onRowsPerPageChange={handleChangeRowsPerPage}
          labelRowsPerPage="Linhas por página:"
          labelDisplayedRows={({ from, to, count }) => 
            `${from}-${to} de ${count !== -1 ? count : `mais de ${to}`}`
          }
        />
      </Paper>

      {/* FAB para nova impugnação */}
      <Fab
        color="primary"
        aria-label="nova impugnação"
        sx={{ position: 'fixed', bottom: 16, right: 16 }}
        onClick={() => navigate('/impugnacoes/cadastro')}
      >
        <AddIcon />
      </Fab>
    </Container>
  );
};