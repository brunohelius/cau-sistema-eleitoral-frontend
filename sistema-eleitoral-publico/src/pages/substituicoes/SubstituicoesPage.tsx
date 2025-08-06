import React, { useState } from 'react';
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
  Fab,
  Avatar,
  AvatarGroup
} from '@mui/material';
import {
  SwapHoriz as SwapIcon,
  Search as SearchIcon,
  Visibility as VisibilityIcon,
  Add as AddIcon,
  FilterList as FilterIcon,
  AttachFile as AttachFileIcon,
  Schedule as ScheduleIcon,
  Person as PersonIcon,
  Clear as ClearIcon,
  Gavel as GavelIcon,
  CheckCircle as CheckCircleIcon,
  Cancel as CancelIcon,
  HourglassEmpty as HourglassIcon
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { useQuery } from '@tanstack/react-query';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { 
  substituicaoService, 
  PedidoSubstituicao, 
  FiltrosSubstituicao,
  StatusSubstituicao
} from '../../services/api/substituicaoService';
import { eleicaoService, ufService } from '../../services/api';

export const SubstituicoesPage: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  // Estados dos filtros
  const [filtros, setFiltros] = useState<FiltrosSubstituicao>({
    page: 0,
    size: 10
  });
  const [busca, setBusca] = useState('');
  const [showFiltros, setShowFiltros] = useState(false);

  // Queries
  const { data: substituicoesData, isLoading, refetch } = useQuery({
    queryKey: ['substituicoes', filtros],
    queryFn: () => substituicaoService.listarSubstituicoes(filtros)
  });

  const { data: statusSubstituicao = [] } = useQuery({
    queryKey: ['status-substituicao'],
    queryFn: substituicaoService.getStatusSubstituicao
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
    queryKey: ['estatisticas-substituicao'],
    queryFn: () => substituicaoService.getEstatisticas()
  });

  // Dados processados
  const substituicoes = substituicoesData?.content || [];
  const totalElements = substituicoesData?.totalElements || 0;

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

  const handleVerDetalhes = (substituicao: PedidoSubstituicao) => {
    navigate(`/substituicoes/${substituicao.id}`);
  };

  const getStatusColor = (status: StatusSubstituicao): "default" | "primary" | "secondary" | "error" | "info" | "success" | "warning" => {
    switch (status.descricao.toLowerCase()) {
      case 'pendente':
        return 'warning';
      case 'em análise':
        return 'info';
      case 'aprovada':
        return 'success';
      case 'rejeitada':
        return 'error';
      case 'cancelada':
        return 'default';
      default:
        return 'primary';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status.toLowerCase()) {
      case 'aprovada':
        return <CheckCircleIcon fontSize="small" />;
      case 'rejeitada':
        return <CancelIcon fontSize="small" />;
      case 'pendente':
      case 'em análise':
        return <HourglassIcon fontSize="small" />;
      default:
        return <SwapIcon fontSize="small" />;
    }
  };

  const renderMembrosAvatar = (substituicao: PedidoSubstituicao) => {
    const membros = [
      substituicao.membroSubstituidoTitular,
      substituicao.membroSubstituidoSuplente,
      substituicao.membroSubstitutoTitular,
      substituicao.membroSubstitutoSuplente
    ].filter(Boolean);

    return (
      <AvatarGroup max={3} sx={{ justifyContent: 'flex-start' }}>
        {membros.map((membro, index) => (
          <Tooltip key={index} title={membro!.profissional.nome}>
            <Avatar sx={{ width: 32, height: 32, fontSize: 14 }}>
              {membro!.profissional.nome.split(' ').map(n => n[0]).join('').substring(0, 2)}
            </Avatar>
          </Tooltip>
        ))}
      </AvatarGroup>
    );
  };

  if (!user) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Alert severity="error">
          Você precisa estar logado para ver as substituições.
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
              <SwapIcon sx={{ mr: 2, verticalAlign: 'middle', fontSize: 'inherit' }} />
              Substituições de Membros
            </Typography>
            <Typography variant="h6" color="textSecondary">
              Acompanhe e gerencie pedidos de substituição de candidatura
            </Typography>
          </Box>
          
          <Button
            variant="contained"
            size="large"
            startIcon={<AddIcon />}
            onClick={() => navigate('/substituicoes/cadastro')}
          >
            Nova Substituição
          </Button>
        </Box>

        {/* Estatísticas */}
        {estatisticas && (
          <Grid container spacing={3} sx={{ mb: 3 }}>
            <Grid item xs={12} sm={6} md={3}>
              <Card sx={{ bgcolor: 'primary.light', color: 'primary.contrastText' }}>
                <CardContent>
                  <Box display="flex" alignItems="center" justifyContent="space-between">
                    <Box>
                      <Typography variant="h4" fontWeight="bold">
                        {estatisticas.totalSubstituicoes}
                      </Typography>
                      <Typography variant="body2">
                        Total de Substituições
                      </Typography>
                    </Box>
                    <SwapIcon sx={{ fontSize: 40, opacity: 0.7 }} />
                  </Box>
                </CardContent>
              </Card>
            </Grid>
            
            <Grid item xs={12} sm={6} md={3}>
              <Card sx={{ bgcolor: 'warning.light', color: 'warning.contrastText' }}>
                <CardContent>
                  <Box display="flex" alignItems="center" justifyContent="space-between">
                    <Box>
                      <Typography variant="h4" fontWeight="bold">
                        {estatisticas.substituicoesPendentes}
                      </Typography>
                      <Typography variant="body2">
                        Pendentes
                      </Typography>
                    </Box>
                    <HourglassIcon sx={{ fontSize: 40, opacity: 0.7 }} />
                  </Box>
                </CardContent>
              </Card>
            </Grid>
            
            <Grid item xs={12} sm={6} md={3}>
              <Card sx={{ bgcolor: 'success.light', color: 'success.contrastText' }}>
                <CardContent>
                  <Box display="flex" alignItems="center" justifyContent="space-between">
                    <Box>
                      <Typography variant="h4" fontWeight="bold">
                        {estatisticas.substituicoesProcedentes}
                      </Typography>
                      <Typography variant="body2">
                        Aprovadas
                      </Typography>
                    </Box>
                    <CheckCircleIcon sx={{ fontSize: 40, opacity: 0.7 }} />
                  </Box>
                </CardContent>
              </Card>
            </Grid>
            
            <Grid item xs={12} sm={6} md={3}>
              <Card sx={{ bgcolor: 'error.light', color: 'error.contrastText' }}>
                <CardContent>
                  <Box display="flex" alignItems="center" justifyContent="space-between">
                    <Box>
                      <Typography variant="h4" fontWeight="bold">
                        {estatisticas.substituicoesImprocedentes}
                      </Typography>
                      <Typography variant="body2">
                        Rejeitadas
                      </Typography>
                    </Box>
                    <CancelIcon sx={{ fontSize: 40, opacity: 0.7 }} />
                  </Box>
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
            Buscar Substituições
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
                    value={filtros.statusSubstituicaoId || ''}
                    label="Status"
                    onChange={(e) => setFiltros(prev => ({ 
                      ...prev, 
                      statusSubstituicaoId: e.target.value ? Number(e.target.value) : undefined,
                      page: 0 
                    }))}
                  >
                    <MenuItem value="">Todos</MenuItem>
                    {statusSubstituicao.map((status) => (
                      <MenuItem key={status.id} value={status.id}>
                        {status.descricao}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
            </Grid>
          </>
        )}
      </Paper>

      {/* Tabela de Substituições */}
      <Paper>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Protocolo</TableCell>
                <TableCell>Chapa</TableCell>
                <TableCell>Membros</TableCell>
                <TableCell>Solicitante</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Data</TableCell>
                <TableCell align="center">Ações</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={7} align="center" sx={{ py: 6 }}>
                    Carregando substituições...
                  </TableCell>
                </TableRow>
              ) : substituicoes.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} align="center" sx={{ py: 6 }}>
                    <Box textAlign="center">
                      <SwapIcon sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
                      <Typography variant="h6" color="textSecondary" gutterBottom>
                        Nenhuma substituição encontrada
                      </Typography>
                      <Typography variant="body2" color="textSecondary">
                        {filtros.numeroProtocolo || showFiltros 
                          ? 'Tente ajustar os filtros de busca'
                          : 'Seja o primeiro a criar uma substituição'
                        }
                      </Typography>
                    </Box>
                  </TableCell>
                </TableRow>
              ) : (
                substituicoes.map((substituicao) => (
                  <TableRow key={substituicao.id} hover>
                    <TableCell>
                      <Typography variant="body2" fontFamily="monospace">
                        {substituicao.numeroProtocolo}
                      </Typography>
                    </TableCell>
                    
                    <TableCell>
                      <Typography variant="body2" fontWeight="medium">
                        {substituicao.chapaEleicao.nome}
                      </Typography>
                    </TableCell>
                    
                    <TableCell>
                      {renderMembrosAvatar(substituicao)}
                    </TableCell>
                    
                    <TableCell>
                      <Box>
                        <Typography variant="body2">
                          {substituicao.solicitante.nome}
                        </Typography>
                        <Typography variant="caption" color="textSecondary">
                          Reg: {substituicao.solicitante.registroNacional}
                        </Typography>
                      </Box>
                    </TableCell>
                    
                    <TableCell>
                      <Chip
                        icon={getStatusIcon(substituicao.statusSubstituicao.descricao)}
                        label={substituicao.statusSubstituicao.descricao}
                        color={getStatusColor(substituicao.statusSubstituicao)}
                        size="small"
                      />
                    </TableCell>
                    
                    <TableCell>
                      <Typography variant="body2">
                        {format(new Date(substituicao.dataInclusao), 'dd/MM/yyyy', { locale: ptBR })}
                      </Typography>
                      <Typography variant="caption" color="textSecondary">
                        {format(new Date(substituicao.dataInclusao), 'HH:mm', { locale: ptBR })}
                      </Typography>
                    </TableCell>
                    
                    <TableCell align="center">
                      <Stack direction="row" spacing={1} justifyContent="center">
                        <Tooltip title="Ver Detalhes">
                          <IconButton
                            size="small"
                            onClick={() => handleVerDetalhes(substituicao)}
                          >
                            <VisibilityIcon />
                          </IconButton>
                        </Tooltip>
                        
                        {substituicao.arquivoJustificativa && (
                          <Tooltip title="Documento">
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

      {/* FAB para nova substituição */}
      <Fab
        color="primary"
        aria-label="nova substituição"
        sx={{ position: 'fixed', bottom: 16, right: 16 }}
        onClick={() => navigate('/substituicoes/cadastro')}
      >
        <AddIcon />
      </Fab>
    </Container>
  );
};