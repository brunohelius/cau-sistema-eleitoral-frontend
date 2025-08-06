import React, { useState, useEffect } from 'react';
import {
  Container,
  Paper,
  Typography,
  Box,
  Grid,
  Card,
  CardContent,
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
  Avatar,
  LinearProgress,
  IconButton,
  Tooltip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Alert,
  Tabs,
  Tab,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  ListItemSecondaryAction,
  Divider,
  CircularProgress,
  Pagination
} from '@mui/material';
import {
  Groups as GroupsIcon,
  Person as PersonIcon,
  Warning as WarningIcon,
  CheckCircle as CheckCircleIcon,
  Cancel as CancelIcon,
  HourglassEmpty as HourglassIcon,
  Info as InfoIcon,
  Add as AddIcon,
  SwapHoriz as SwapIcon,
  Email as EmailIcon,
  Download as DownloadIcon,
  Search as SearchIcon
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useSnackbar } from 'notistack';
import { 
  comissaoEleitoralService,
  ComissaoEleitoral,
  MembroComissao,
  FiltrosComissao,
  SITUACAO_MEMBRO_PENDENTE,
  SITUACAO_MEMBRO_CONFIRMADO,
  SITUACAO_MEMBRO_REJEITADO,
  TIPO_PARTICIPACAO_COORDENADOR,
  TIPO_PARTICIPACAO_MEMBRO,
  TIPO_PARTICIPACAO_SUBSTITUTO
} from '../../services/api/comissaoEleitoralService';
import { eleicaoService, ufService } from '../../services/api';

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
      id={`simple-tabpanel-${index}`}
      aria-labelledby={`simple-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ py: 3 }}>{children}</Box>}
    </div>
  );
}

export const ComissaoEleitoralPage: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { enqueueSnackbar } = useSnackbar();
  const queryClient = useQueryClient();

  // Estados
  const [filtros, setFiltros] = useState<FiltrosComissao>({
    page: 0,
    size: 10
  });
  const [eleicaoSelecionada, setEleicaoSelecionada] = useState<number | ''>('');
  const [ufSelecionada, setUfSelecionada] = useState<number | ''>('');
  const [anoSelecionado, setAnoSelecionado] = useState<number>(new Date().getFullYear());
  const [tabValue, setTabValue] = useState(0);
  
  // Estados dos modais
  const [showDetalhesModal, setShowDetalhesModal] = useState(false);
  const [membroSelecionado, setMembroSelecionado] = useState<MembroComissao | null>(null);
  const [showAddMembroModal, setShowAddMembroModal] = useState(false);
  const [showSubstituirModal, setShowSubstituirModal] = useState(false);

  // Queries
  const { data: eleicoes = [] } = useQuery({
    queryKey: ['eleicoes'],
    queryFn: eleicaoService.getAll
  });

  const { data: ufs = [] } = useQuery({
    queryKey: ['ufs'],
    queryFn: ufService.getAll
  });

  const { data: comissoesData, isLoading, refetch } = useQuery({
    queryKey: ['comissoes', filtros],
    queryFn: () => comissaoEleitoralService.listarComissoes(filtros),
    enabled: !!eleicaoSelecionada
  });

  const { data: estatisticas } = useQuery({
    queryKey: ['estatisticas-comissao', eleicaoSelecionada],
    queryFn: () => comissaoEleitoralService.getEstatisticas(eleicaoSelecionada as number),
    enabled: !!eleicaoSelecionada
  });

  const comissoes = comissoesData?.content || [];

  // Effects
  useEffect(() => {
    if (eleicaoSelecionada && ufSelecionada) {
      setFiltros(prev => ({
        ...prev,
        eleicaoId: eleicaoSelecionada as number,
        cauUfId: ufSelecionada as number
      }));
    }
  }, [eleicaoSelecionada, ufSelecionada]);

  // Mutations
  const confirmarParticipacaoMutation = useMutation({
    mutationFn: (membroId: number) => comissaoEleitoralService.confirmarParticipacao(membroId),
    onSuccess: () => {
      enqueueSnackbar('Participação confirmada com sucesso!', { variant: 'success' });
      refetch();
    },
    onError: () => {
      enqueueSnackbar('Erro ao confirmar participação', { variant: 'error' });
    }
  });

  const rejeitarParticipacaoMutation = useMutation({
    mutationFn: ({ membroId, motivo }: { membroId: number; motivo: string }) => 
      comissaoEleitoralService.rejeitarParticipacao(membroId, motivo),
    onSuccess: () => {
      enqueueSnackbar('Participação rejeitada', { variant: 'info' });
      refetch();
    },
    onError: () => {
      enqueueSnackbar('Erro ao rejeitar participação', { variant: 'error' });
    }
  });

  // Handlers
  const handleDetalhesMembro = async (membro: MembroComissao) => {
    try {
      const detalhes = await comissaoEleitoralService.getDetalhesMembro(membro.id);
      setMembroSelecionado(detalhes);
      setShowDetalhesModal(true);
    } catch (error) {
      enqueueSnackbar('Erro ao carregar detalhes do membro', { variant: 'error' });
    }
  };

  const getStatusColor = (situacaoId: number) => {
    switch (situacaoId) {
      case SITUACAO_MEMBRO_PENDENTE:
        return 'warning';
      case SITUACAO_MEMBRO_CONFIRMADO:
        return 'primary';
      case SITUACAO_MEMBRO_REJEITADO:
        return 'error';
      default:
        return 'default';
    }
  };

  const getStatusIcon = (situacaoId: number) => {
    switch (situacaoId) {
      case SITUACAO_MEMBRO_PENDENTE:
        return <HourglassIcon />;
      case SITUACAO_MEMBRO_CONFIRMADO:
        return <CheckCircleIcon />;
      case SITUACAO_MEMBRO_REJEITADO:
        return <CancelIcon />;
      default:
        return <InfoIcon />;
    }
  };

  const getTipoParticipacaoLabel = (tipoId: number) => {
    switch (tipoId) {
      case TIPO_PARTICIPACAO_COORDENADOR:
        return 'Coordenador';
      case TIPO_PARTICIPACAO_MEMBRO:
        return 'Membro';
      case TIPO_PARTICIPACAO_SUBSTITUTO:
        return 'Substituto';
      default:
        return 'Outro';
    }
  };

  const renderMembroRow = (membro: MembroComissao, tipo: string) => (
    <TableRow
      key={membro.id}
      hover
      onClick={() => handleDetalhesMembro(membro)}
      sx={{ cursor: 'pointer' }}
    >
      <TableCell>
        <Box display="flex" alignItems="center">
          <Avatar sx={{ mr: 2 }}>
            {membro.profissionalEntity.nome.substring(0, 2).toUpperCase()}
          </Avatar>
          <Box>
            <Typography variant="body2" fontWeight="medium">
              {membro.profissionalEntity.nome}
            </Typography>
            <Typography variant="caption" color="textSecondary">
              CPF: {membro.profissionalEntity.cpf.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4')}
            </Typography>
          </Box>
        </Box>
      </TableCell>
      <TableCell>{membro.tipoParticipacao.descricao}</TableCell>
      <TableCell>
        <LinearProgress
          variant="determinate"
          value={100}
          color={getStatusColor(membro.situacaoVigente.id) as any}
          sx={{ 
            height: 24,
            borderRadius: 12,
            backgroundColor: 'grey.200'
          }}
        />
        <Typography
          variant="caption"
          sx={{
            position: 'relative',
            top: -16,
            left: '50%',
            transform: 'translateX(-50%)',
            display: 'block',
            textAlign: 'center',
            color: 'white',
            fontWeight: 'bold'
          }}
        >
          {membro.situacaoVigente.descricao}
        </Typography>
      </TableCell>
      <TableCell align="center">
        {membro.pendencias.length > 0 ? (
          <Tooltip title={`${membro.pendencias.length} pendência(s)`}>
            <IconButton size="small" color="warning">
              <WarningIcon />
            </IconButton>
          </Tooltip>
        ) : (
          <Tooltip title="Sem pendências">
            <IconButton size="small" color="success">
              <CheckCircleIcon />
            </IconButton>
          </Tooltip>
        )}
      </TableCell>
    </TableRow>
  );

  const renderComissaoCard = (comissao: ComissaoEleitoral) => (
    <Card key={comissao.id} sx={{ mb: 3 }}>
      <CardContent>
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
          <Typography variant="h6">
            <GroupsIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
            Comissão Eleitoral - {comissao.cauUf.prefixo}
          </Typography>
          <Chip
            label={`${comissao.numeroMembros} membros`}
            color="primary"
            variant="outlined"
          />
        </Box>

        <Tabs value={tabValue} onChange={(_, newValue) => setTabValue(newValue)}>
          <Tab label={`Coordenadores (${comissao.coordenadores.length})`} />
          <Tab label={`Membros (${comissao.membros.length})`} />
          <Tab label={`Substitutos (${comissao.substitutos?.length || 0})`} />
        </Tabs>

        <TabPanel value={tabValue} index={0}>
          <TableContainer>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell>Nome</TableCell>
                  <TableCell>Tipo</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell align="center">Situação</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {comissao.coordenadores.map(coord => renderMembroRow(coord, 'coordenador'))}
              </TableBody>
            </Table>
          </TableContainer>
        </TabPanel>

        <TabPanel value={tabValue} index={1}>
          <TableContainer>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell>Nome</TableCell>
                  <TableCell>Tipo</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell align="center">Situação</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {comissao.membros.map(membro => renderMembroRow(membro, 'membro'))}
              </TableBody>
            </Table>
          </TableContainer>
        </TabPanel>

        <TabPanel value={tabValue} index={2}>
          {comissao.substitutos && comissao.substitutos.length > 0 ? (
            <TableContainer>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>Nome</TableCell>
                    <TableCell>Tipo</TableCell>
                    <TableCell>Status</TableCell>
                    <TableCell align="center">Situação</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {comissao.substitutos.map(sub => renderMembroRow(sub, 'substituto'))}
                </TableBody>
              </Table>
            </TableContainer>
          ) : (
            <Alert severity="info">
              Nenhum substituto registrado para esta comissão.
            </Alert>
          )}
        </TabPanel>
      </CardContent>
    </Card>
  );

  if (!user) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Alert severity="error">
          Você precisa estar logado para acessar a gestão da comissão eleitoral.
        </Alert>
      </Container>
    );
  }

  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      {/* Header */}
      <Box mb={4}>
        <Typography variant="h3" component="h1" gutterBottom fontWeight="bold">
          <GroupsIcon sx={{ mr: 2, verticalAlign: 'middle', fontSize: 'inherit' }} />
          Gestão da Comissão Eleitoral
        </Typography>
        <Typography variant="h6" color="textSecondary">
          Gerencie os membros das comissões eleitorais por UF
        </Typography>
      </Box>

      {/* Filtros */}
      <Paper sx={{ p: 3, mb: 3 }}>
        <Grid container spacing={3} alignItems="center">
          <Grid item xs={12} md={3}>
            <FormControl fullWidth>
              <InputLabel>Ano da Eleição</InputLabel>
              <Select
                value={anoSelecionado}
                label="Ano da Eleição"
                onChange={(e) => setAnoSelecionado(Number(e.target.value))}
              >
                {Array.from({ length: 5 }, (_, i) => new Date().getFullYear() + i - 2).map(ano => (
                  <MenuItem key={ano} value={ano}>{ano}</MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>

          <Grid item xs={12} md={3}>
            <FormControl fullWidth>
              <InputLabel>Eleição</InputLabel>
              <Select
                value={eleicaoSelecionada}
                label="Eleição"
                onChange={(e) => setEleicaoSelecionada(e.target.value)}
              >
                <MenuItem value="">Selecione</MenuItem>
                {eleicoes
                  .filter(e => e.ano === anoSelecionado)
                  .map((eleicao) => (
                    <MenuItem key={eleicao.id} value={eleicao.id}>
                      {eleicao.titulo}
                    </MenuItem>
                  ))}
              </Select>
            </FormControl>
          </Grid>

          <Grid item xs={12} md={3}>
            <FormControl fullWidth>
              <InputLabel>UF</InputLabel>
              <Select
                value={ufSelecionada}
                label="UF"
                onChange={(e) => setUfSelecionada(e.target.value)}
                disabled={!eleicaoSelecionada}
              >
                <MenuItem value="">Todas</MenuItem>
                {ufs.map((uf) => (
                  <MenuItem key={uf.id} value={uf.id}>
                    {uf.prefixo} - {uf.nome}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>

          <Grid item xs={12} md={3}>
            {ufSelecionada && (
              <TextField
                fullWidth
                label="Número de Membros"
                value={comissoes[0]?.numeroMembros || 0}
                InputProps={{
                  readOnly: true,
                }}
              />
            )}
          </Grid>
        </Grid>

        {/* Estatísticas */}
        {estatisticas && eleicaoSelecionada && (
          <Box mt={3}>
            <Grid container spacing={2}>
              <Grid item xs={6} md={3}>
                <Card sx={{ bgcolor: 'primary.light', color: 'primary.contrastText' }}>
                  <CardContent sx={{ py: 2 }}>
                    <Typography variant="h5" fontWeight="bold">
                      {estatisticas.totalMembros}
                    </Typography>
                    <Typography variant="body2">Total de Membros</Typography>
                  </CardContent>
                </Card>
              </Grid>
              <Grid item xs={6} md={3}>
                <Card sx={{ bgcolor: 'success.light', color: 'success.contrastText' }}>
                  <CardContent sx={{ py: 2 }}>
                    <Typography variant="h5" fontWeight="bold">
                      {estatisticas.membrosConfirmados}
                    </Typography>
                    <Typography variant="body2">Confirmados</Typography>
                  </CardContent>
                </Card>
              </Grid>
              <Grid item xs={6} md={3}>
                <Card sx={{ bgcolor: 'warning.light', color: 'warning.contrastText' }}>
                  <CardContent sx={{ py: 2 }}>
                    <Typography variant="h5" fontWeight="bold">
                      {estatisticas.membrosPendentes}
                    </Typography>
                    <Typography variant="body2">Pendentes</Typography>
                  </CardContent>
                </Card>
              </Grid>
              <Grid item xs={6} md={3}>
                <Card sx={{ bgcolor: 'error.light', color: 'error.contrastText' }}>
                  <CardContent sx={{ py: 2 }}>
                    <Typography variant="h5" fontWeight="bold">
                      {estatisticas.membrosRejeitados}
                    </Typography>
                    <Typography variant="body2">Rejeitados</Typography>
                  </CardContent>
                </Card>
              </Grid>
            </Grid>
          </Box>
        )}
      </Paper>

      {/* Lista de Comissões */}
      {isLoading ? (
        <Box display="flex" justifyContent="center" py={4}>
          <CircularProgress size={60} />
        </Box>
      ) : comissoes.length === 0 ? (
        <Alert severity="info">
          {!eleicaoSelecionada 
            ? 'Selecione uma eleição para visualizar as comissões'
            : 'Nenhuma comissão encontrada para os filtros selecionados'
          }
        </Alert>
      ) : (
        <>
          {comissoes.map(comissao => renderComissaoCard(comissao))}
          
          <Box display="flex" justifyContent="center" mt={3}>
            <Pagination
              count={comissoesData?.totalPages || 1}
              page={(filtros.page || 0) + 1}
              onChange={(_, page) => setFiltros(prev => ({ ...prev, page: page - 1 }))}
              color="primary"
            />
          </Box>
        </>
      )}

      {/* Modal de Detalhes do Membro */}
      <Dialog
        open={showDetalhesModal}
        onClose={() => setShowDetalhesModal(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle sx={{ bgcolor: 'primary.main', color: 'white' }}>
          <PersonIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
          Detalhes do Membro
        </DialogTitle>
        <DialogContent sx={{ mt: 2 }}>
          {membroSelecionado && (
            <Box>
              <Box display="flex" alignItems="center" mb={3}>
                <Avatar
                  src={membroSelecionado.profissionalEntity.avatar}
                  sx={{ width: 80, height: 80, mr: 2 }}
                >
                  {membroSelecionado.profissionalEntity.nome.substring(0, 2).toUpperCase()}
                </Avatar>
                <Box>
                  <Typography variant="h6">
                    {membroSelecionado.profissionalEntity.nome}
                  </Typography>
                  <Typography variant="body2" color="textSecondary">
                    {membroSelecionado.tipoParticipacao.descricao}
                  </Typography>
                </Box>
              </Box>

              <List>
                <ListItem>
                  <ListItemText
                    primary="CPF"
                    secondary={membroSelecionado.profissionalEntity.cpf.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4')}
                  />
                </ListItem>
                <ListItem>
                  <ListItemText
                    primary="Email"
                    secondary={membroSelecionado.profissionalEntity.email}
                  />
                </ListItem>
                <ListItem>
                  <ListItemText
                    primary="Registro Nacional"
                    secondary={membroSelecionado.profissionalEntity.registroNacional}
                  />
                </ListItem>
                <ListItem>
                  <ListItemText
                    primary="Situação"
                    secondary={
                      <Chip
                        icon={getStatusIcon(membroSelecionado.situacaoVigente.id)}
                        label={membroSelecionado.situacaoVigente.descricao}
                        color={getStatusColor(membroSelecionado.situacaoVigente.id) as any}
                        size="small"
                      />
                    }
                  />
                </ListItem>
                <ListItem>
                  <ListItemText
                    primary="Status"
                    secondary={
                      membroSelecionado.pendencias.length === 0 ? (
                        <Box display="flex" alignItems="center" color="success.main">
                          <CheckCircleIcon sx={{ mr: 1 }} />
                          Apto para o conselho
                        </Box>
                      ) : (
                        <Box>
                          <Box display="flex" alignItems="center" color="warning.main" mb={1}>
                            <WarningIcon sx={{ mr: 1 }} />
                            Existem pendências:
                          </Box>
                          <List dense>
                            {membroSelecionado.pendencias.map((pendencia, index) => (
                              <ListItem key={index}>
                                <ListItemText primary={`• ${pendencia}`} />
                              </ListItem>
                            ))}
                          </List>
                        </Box>
                      )
                    }
                  />
                </ListItem>
              </List>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          {membroSelecionado?.situacaoVigente.id === SITUACAO_MEMBRO_PENDENTE && (
            <>
              <Button
                onClick={() => {
                  rejeitarParticipacaoMutation.mutate({
                    membroId: membroSelecionado.id,
                    motivo: 'Rejeitado pela comissão'
                  });
                  setShowDetalhesModal(false);
                }}
                color="error"
              >
                Rejeitar
              </Button>
              <Button
                onClick={() => {
                  confirmarParticipacaoMutation.mutate(membroSelecionado.id);
                  setShowDetalhesModal(false);
                }}
                color="success"
                variant="contained"
              >
                Confirmar
              </Button>
            </>
          )}
          <Button onClick={() => setShowDetalhesModal(false)}>
            Fechar
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};