import React, { useState } from 'react';
import {
  Container,
  Paper,
  Typography,
  Box,
  Grid,
  Card,
  CardContent,
  Button,
  Chip,
  Avatar,
  Divider,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Alert,
  Timeline,
  TimelineItem,
  TimelineSeparator,
  TimelineConnector,
  TimelineContent,
  TimelineDot,
  Tabs,
  Tab,
  IconButton,
  Tooltip,
  CircularProgress,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  FormControlLabel,
  Switch
} from '@mui/material';
import {
  ArrowBack as ArrowBackIcon,
  Person as PersonIcon,
  Email as EmailIcon,
  Phone as PhoneIcon,
  Description as DescriptionIcon,
  Attachment as AttachmentIcon,
  Assessment as AssessmentIcon,
  Gavel as GavelIcon,
  CheckCircle as CheckCircleIcon,
  Cancel as CancelIcon,
  Archive as ArchiveIcon,
  Download as DownloadIcon,
  Visibility as ViewIcon,
  Send as SendIcon,
  Edit as EditIcon,
  Timeline as TimelineIcon
} from '@mui/icons-material';
import { useNavigate, useParams } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useSnackbar } from 'notistack';
import { 
  denunciaService,
  Denuncia,
  AnalisarDenunciaRequest,
  DecidirDenunciaRequest,
  STATUS_DENUNCIA_RECEBIDA,
  STATUS_DENUNCIA_EM_ANALISE,
  STATUS_DENUNCIA_ANALISADA,
  STATUS_DENUNCIA_DECIDIDA,
  STATUS_DENUNCIA_IMPLEMENTADA,
  STATUS_DENUNCIA_ARQUIVADA
} from '../../services/api/denunciaService';
import { useAuth } from '../../hooks/useAuth';

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
      id={`tabpanel-${index}`}
      aria-labelledby={`tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ py: 3 }}>{children}</Box>}
    </div>
  );
}

export const DenunciaDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { enqueueSnackbar } = useSnackbar();
  const queryClient = useQueryClient();

  // Estados
  const [tabValue, setTabValue] = useState(0);
  const [showAnaliseModal, setShowAnaliseModal] = useState(false);
  const [showDecisaoModal, setShowDecisaoModal] = useState(false);
  const [showImplementacaoModal, setShowImplementacaoModal] = useState(false);
  const [showArquivarModal, setShowArquivarModal] = useState(false);
  const [parecerAnalise, setParecerAnalise] = useState('');
  const [decisao, setDecisao] = useState<'PROCEDENTE' | 'IMPROCEDENTE' | 'ARQUIVADA'>('PROCEDENTE');
  const [justificativaDecisao, setJustificativaDecisao] = useState('');
  const [medidasAdotadas, setMedidasAdotadas] = useState('');
  const [relatorioImplementacao, setRelatorioImplementacao] = useState('');
  const [motivoArquivamento, setMotivoArquivamento] = useState('');

  // Queries
  const { data: denuncia, isLoading, refetch } = useQuery({
    queryKey: ['denuncia', id],
    queryFn: () => denunciaService.getDenunciaById(Number(id)),
    enabled: !!id
  });

  const { data: historico = [] } = useQuery({
    queryKey: ['historico-denuncia', id],
    queryFn: () => denunciaService.getHistorico(Number(id)),
    enabled: !!id
  });

  // Mutations
  const iniciarAnaliseMutation = useMutation({
    mutationFn: () => denunciaService.iniciarAnalise(Number(id)),
    onSuccess: () => {
      enqueueSnackbar('Análise iniciada com sucesso!', { variant: 'success' });
      refetch();
      queryClient.invalidateQueries(['denuncias']);
    },
    onError: () => {
      enqueueSnackbar('Erro ao iniciar análise', { variant: 'error' });
    }
  });

  const analisarMutation = useMutation({
    mutationFn: (dados: AnalisarDenunciaRequest) => denunciaService.analisarDenuncia(dados),
    onSuccess: () => {
      enqueueSnackbar('Análise salva com sucesso!', { variant: 'success' });
      setShowAnaliseModal(false);
      setParecerAnalise('');
      refetch();
      queryClient.invalidateQueries(['denuncias']);
    },
    onError: () => {
      enqueueSnackbar('Erro ao salvar análise', { variant: 'error' });
    }
  });

  const decidirMutation = useMutation({
    mutationFn: (dados: DecidirDenunciaRequest) => denunciaService.decidirDenuncia(dados),
    onSuccess: () => {
      enqueueSnackbar('Decisão registrada com sucesso!', { variant: 'success' });
      setShowDecisaoModal(false);
      setJustificativaDecisao('');
      setMedidasAdotadas('');
      refetch();
      queryClient.invalidateQueries(['denuncias']);
    },
    onError: () => {
      enqueueSnackbar('Erro ao registrar decisão', { variant: 'error' });
    }
  });

  const implementarMutation = useMutation({
    mutationFn: (relatorio: string) => denunciaService.marcarComoImplementada(Number(id), relatorio),
    onSuccess: () => {
      enqueueSnackbar('Denúncia marcada como implementada!', { variant: 'success' });
      setShowImplementacaoModal(false);
      setRelatorioImplementacao('');
      refetch();
      queryClient.invalidateQueries(['denuncias']);
    },
    onError: () => {
      enqueueSnackbar('Erro ao marcar como implementada', { variant: 'error' });
    }
  });

  const arquivarMutation = useMutation({
    mutationFn: (motivo: string) => denunciaService.arquivarDenuncia(Number(id), motivo),
    onSuccess: () => {
      enqueueSnackbar('Denúncia arquivada com sucesso!', { variant: 'success' });
      setShowArquivarModal(false);
      setMotivoArquivamento('');
      refetch();
      queryClient.invalidateQueries(['denuncias']);
    },
    onError: () => {
      enqueueSnackbar('Erro ao arquivar denúncia', { variant: 'error' });
    }
  });

  if (isLoading) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh">
          <CircularProgress size={60} />
        </Box>
      </Container>
    );
  }

  if (!denuncia) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Alert severity="error">
          Denúncia não encontrada ou você não tem permissão para visualizá-la.
        </Alert>
      </Container>
    );
  }

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

  const canInitiateAnalysis = () => {
    return user && denuncia.statusDenuncia.id === STATUS_DENUNCIA_RECEBIDA;
  };

  const canAnalyze = () => {
    return user && denuncia.statusDenuncia.id === STATUS_DENUNCIA_EM_ANALISE;
  };

  const canDecide = () => {
    return user && denuncia.statusDenuncia.id === STATUS_DENUNCIA_ANALISADA;
  };

  const canImplement = () => {
    return user && denuncia.statusDenuncia.id === STATUS_DENUNCIA_DECIDIDA && denuncia.decisao === 'PROCEDENTE';
  };

  const canArchive = () => {
    return user && [STATUS_DENUNCIA_RECEBIDA, STATUS_DENUNCIA_EM_ANALISE, STATUS_DENUNCIA_ANALISADA].includes(denuncia.statusDenuncia.id);
  };

  const handleDownloadAnexo = async (anexoId: number, nomeArquivo: string) => {
    try {
      const blob = await denunciaService.downloadAnexo(anexoId);
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = nomeArquivo;
      link.click();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      enqueueSnackbar('Erro ao baixar anexo', { variant: 'error' });
    }
  };

  const handleAnalyze = () => {
    analisarMutation.mutate({
      denunciaId: Number(id),
      parecerAnalise
    });
  };

  const handleDecide = () => {
    decidirMutation.mutate({
      denunciaId: Number(id),
      decisao,
      justificativaDecisao,
      medidasAdotadas: decisao === 'PROCEDENTE' ? medidasAdotadas : undefined
    });
  };

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      {/* Header */}
      <Box mb={4}>
        <Button
          startIcon={<ArrowBackIcon />}
          onClick={() => navigate('/denuncias')}
          sx={{ mb: 2 }}
        >
          Voltar para Lista
        </Button>
        
        <Box display="flex" justifyContent="space-between" alignItems="flex-start">
          <Box>
            <Typography variant="h4" component="h1" gutterBottom fontWeight="bold">
              Protocolo: {denuncia.numeroProtocolo}
            </Typography>
            <Box display="flex" alignItems="center" gap={2}>
              <Chip
                label={denuncia.statusDenuncia.descricao}
                color={getStatusColor(denuncia.statusDenuncia.id) as any}
              />
              <Typography variant="body2" color="textSecondary">
                Registrada em {new Date(denuncia.dataInclusao).toLocaleDateString('pt-BR')}
              </Typography>
            </Box>
          </Box>

          {/* Ações */}
          <Box display="flex" gap={1} flexWrap="wrap">
            {canInitiateAnalysis() && (
              <Button
                variant="contained"
                startIcon={<AssessmentIcon />}
                onClick={() => iniciarAnaliseMutation.mutate()}
                disabled={iniciarAnaliseMutation.isLoading}
              >
                Iniciar Análise
              </Button>
            )}
            
            {canAnalyze() && (
              <Button
                variant="contained"
                startIcon={<EditIcon />}
                onClick={() => setShowAnaliseModal(true)}
              >
                Analisar
              </Button>
            )}
            
            {canDecide() && (
              <Button
                variant="contained"
                startIcon={<GavelIcon />}
                onClick={() => setShowDecisaoModal(true)}
              >
                Decidir
              </Button>
            )}
            
            {canImplement() && (
              <Button
                variant="contained"
                color="success"
                startIcon={<CheckCircleIcon />}
                onClick={() => setShowImplementacaoModal(true)}
              >
                Implementar
              </Button>
            )}
            
            {canArchive() && (
              <Button
                variant="outlined"
                color="warning"
                startIcon={<ArchiveIcon />}
                onClick={() => setShowArquivarModal(true)}
              >
                Arquivar
              </Button>
            )}
          </Box>
        </Box>
      </Box>

      {/* Conteúdo Principal */}
      <Grid container spacing={3}>
        <Grid item xs={12} md={8}>
          <Paper sx={{ mb: 3 }}>
            <Tabs value={tabValue} onChange={(_, newValue) => setTabValue(newValue)}>
              <Tab label="Detalhes" />
              <Tab label="Anexos" />
              <Tab label="Análise" />
              <Tab label="Histórico" />
            </Tabs>

            <TabPanel value={tabValue} index={0}>
              {/* Informações Básicas */}
              <Grid container spacing={3}>
                <Grid item xs={12}>
                  <Typography variant="h6" gutterBottom>
                    Informações da Denúncia
                  </Typography>
                  <Divider sx={{ mb: 2 }} />
                </Grid>

                <Grid item xs={12} sm={6}>
                  <Typography variant="subtitle2" color="textSecondary">
                    Tipo de Denúncia
                  </Typography>
                  <Typography variant="body1" gutterBottom>
                    {denuncia.tipoDenuncia.descricao}
                  </Typography>
                </Grid>

                <Grid item xs={12} sm={6}>
                  <Typography variant="subtitle2" color="textSecondary">
                    Eleição Relacionada
                  </Typography>
                  <Typography variant="body1" gutterBottom>
                    {denuncia.eleicao ? `${denuncia.eleicao.titulo} - ${denuncia.eleicao.ano}` : 'Não se aplica'}
                  </Typography>
                </Grid>

                {denuncia.chapaEnvolvida && (
                  <Grid item xs={12}>
                    <Typography variant="subtitle2" color="textSecondary">
                      Chapa/Profissional Envolvido
                    </Typography>
                    <Typography variant="body1" gutterBottom>
                      {denuncia.chapaEnvolvida}
                    </Typography>
                  </Grid>
                )}

                <Grid item xs={12}>
                  <Typography variant="subtitle2" color="textSecondary">
                    Assunto
                  </Typography>
                  <Typography variant="h6" gutterBottom>
                    {denuncia.assunto}
                  </Typography>
                </Grid>

                <Grid item xs={12}>
                  <Typography variant="subtitle2" color="textSecondary">
                    Descrição Detalhada
                  </Typography>
                  <Paper variant="outlined" sx={{ p: 2, mt: 1, bgcolor: 'grey.50' }}>
                    <Typography variant="body1" style={{ whiteSpace: 'pre-wrap' }}>
                      {denuncia.descricao}
                    </Typography>
                  </Paper>
                </Grid>
              </Grid>
            </TabPanel>

            <TabPanel value={tabValue} index={1}>
              <Typography variant="h6" gutterBottom>
                Documentos Anexados
              </Typography>
              <Divider sx={{ mb: 2 }} />

              {denuncia.anexos.length === 0 ? (
                <Alert severity="info">
                  Nenhum documento foi anexado a esta denúncia.
                </Alert>
              ) : (
                <List>
                  {denuncia.anexos.map((anexo) => (
                    <ListItem
                      key={anexo.id}
                      secondaryAction={
                        <Box>
                          <Tooltip title="Visualizar">
                            <IconButton size="small">
                              <ViewIcon />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title="Baixar">
                            <IconButton 
                              size="small"
                              onClick={() => handleDownloadAnexo(anexo.id!, anexo.nomeArquivo)}
                            >
                              <DownloadIcon />
                            </IconButton>
                          </Tooltip>
                        </Box>
                      }
                    >
                      <ListItemIcon>
                        <AttachmentIcon />
                      </ListItemIcon>
                      <ListItemText
                        primary={anexo.nomeArquivo}
                        secondary={`${(anexo.tamanhoArquivo / 1024 / 1024).toFixed(2)} MB - ${anexo.tipoArquivo}`}
                      />
                    </ListItem>
                  ))}
                </List>
              )}
            </TabPanel>

            <TabPanel value={tabValue} index={2}>
              <Typography variant="h6" gutterBottom>
                Análise e Decisão
              </Typography>
              <Divider sx={{ mb: 2 }} />

              {denuncia.responsavelAnalise && (
                <Box mb={3}>
                  <Typography variant="subtitle2" color="textSecondary">
                    Responsável pela Análise
                  </Typography>
                  <Typography variant="body1" gutterBottom>
                    {denuncia.responsavelAnalise.nome}
                  </Typography>
                  {denuncia.dataAnalise && (
                    <Typography variant="body2" color="textSecondary">
                      Analisado em {new Date(denuncia.dataAnalise).toLocaleString('pt-BR')}
                    </Typography>
                  )}
                </Box>
              )}

              {denuncia.parecerAnalise && (
                <Box mb={3}>
                  <Typography variant="subtitle2" color="textSecondary">
                    Parecer da Análise
                  </Typography>
                  <Paper variant="outlined" sx={{ p: 2, mt: 1, bgcolor: 'grey.50' }}>
                    <Typography variant="body1" style={{ whiteSpace: 'pre-wrap' }}>
                      {denuncia.parecerAnalise}
                    </Typography>
                  </Paper>
                </Box>
              )}

              {denuncia.decisao && (
                <Box mb={3}>
                  <Typography variant="subtitle2" color="textSecondary">
                    Decisão Final
                  </Typography>
                  <Box display="flex" alignItems="center" gap={1} mb={1}>
                    <Chip
                      label={denuncia.decisao}
                      color={denuncia.decisao === 'PROCEDENTE' ? 'success' : 
                             denuncia.decisao === 'IMPROCEDENTE' ? 'error' : 'default'}
                    />
                    {denuncia.dataDecisao && (
                      <Typography variant="body2" color="textSecondary">
                        em {new Date(denuncia.dataDecisao).toLocaleString('pt-BR')}
                      </Typography>
                    )}
                  </Box>
                  
                  {denuncia.justificativaDecisao && (
                    <Paper variant="outlined" sx={{ p: 2, bgcolor: 'grey.50' }}>
                      <Typography variant="body1" style={{ whiteSpace: 'pre-wrap' }}>
                        {denuncia.justificativaDecisao}
                      </Typography>
                    </Paper>
                  )}
                </Box>
              )}

              {denuncia.medidasAdotadas && (
                <Box mb={3}>
                  <Typography variant="subtitle2" color="textSecondary">
                    Medidas Adotadas
                  </Typography>
                  <Paper variant="outlined" sx={{ p: 2, mt: 1, bgcolor: 'grey.50' }}>
                    <Typography variant="body1" style={{ whiteSpace: 'pre-wrap' }}>
                      {denuncia.medidasAdotadas}
                    </Typography>
                  </Paper>
                </Box>
              )}
            </TabPanel>

            <TabPanel value={tabValue} index={3}>
              <Typography variant="h6" gutterBottom>
                Histórico de Alterações
              </Typography>
              <Divider sx={{ mb: 2 }} />

              <Timeline>
                {historico.map((evento, index) => (
                  <TimelineItem key={evento.id}>
                    <TimelineSeparator>
                      <TimelineDot color="primary">
                        <TimelineIcon />
                      </TimelineDot>
                      {index < historico.length - 1 && <TimelineConnector />}
                    </TimelineSeparator>
                    <TimelineContent>
                      <Typography variant="body1" fontWeight="medium">
                        {evento.tipo}
                      </Typography>
                      <Typography variant="body2" color="textSecondary">
                        {evento.descricao}
                      </Typography>
                      <Typography variant="caption" color="textSecondary">
                        por {evento.usuario} em {new Date(evento.data).toLocaleString('pt-BR')}
                      </Typography>
                    </TimelineContent>
                  </TimelineItem>
                ))}
              </Timeline>
            </TabPanel>
          </Paper>
        </Grid>

        {/* Sidebar */}
        <Grid item xs={12} md={4}>
          {/* Informações do Denunciante */}
          <Card sx={{ mb: 3 }}>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                <PersonIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
                Denunciante
              </Typography>
              <Divider sx={{ mb: 2 }} />

              {denuncia.anonima ? (
                <Alert severity="info" icon={false}>
                  <Typography variant="body2">
                    <strong>Denúncia Anônima</strong>
                    <br />
                    Identidade mantida em sigilo conforme solicitado.
                  </Typography>
                </Alert>
              ) : (
                <List dense>
                  <ListItem>
                    <ListItemIcon>
                      <PersonIcon />
                    </ListItemIcon>
                    <ListItemText
                      primary="Nome"
                      secondary={denuncia.denuncianteNome}
                    />
                  </ListItem>
                  
                  {denuncia.denuncianteEmail && (
                    <ListItem>
                      <ListItemIcon>
                        <EmailIcon />
                      </ListItemIcon>
                      <ListItemText
                        primary="Email"
                        secondary={denuncia.denuncianteEmail}
                      />
                    </ListItem>
                  )}
                  
                  {denuncia.denuncianteTelefone && (
                    <ListItem>
                      <ListItemIcon>
                        <PhoneIcon />
                      </ListItemIcon>
                      <ListItemText
                        primary="Telefone"
                        secondary={denuncia.denuncianteTelefone}
                      />
                    </ListItem>
                  )}
                </List>
              )}
            </CardContent>
          </Card>

          {/* Resumo */}
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                <DescriptionIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
                Resumo
              </Typography>
              <Divider sx={{ mb: 2 }} />

              <List dense>
                <ListItem>
                  <ListItemText
                    primary="Status Atual"
                    secondary={
                      <Chip
                        label={denuncia.statusDenuncia.descricao}
                        color={getStatusColor(denuncia.statusDenuncia.id) as any}
                        size="small"
                      />
                    }
                  />
                </ListItem>

                <ListItem>
                  <ListItemText
                    primary="Data de Registro"
                    secondary={new Date(denuncia.dataInclusao).toLocaleString('pt-BR')}
                  />
                </ListItem>

                {denuncia.dataAlteracao && (
                  <ListItem>
                    <ListItemText
                      primary="Última Atualização"
                      secondary={new Date(denuncia.dataAlteracao).toLocaleString('pt-BR')}
                    />
                  </ListItem>
                )}

                <ListItem>
                  <ListItemText
                    primary="Anexos"
                    secondary={`${denuncia.anexos.length} arquivo(s)`}
                  />
                </ListItem>
              </List>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Modal de Análise */}
      <Dialog
        open={showAnaliseModal}
        onClose={() => setShowAnaliseModal(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          <AssessmentIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
          Realizar Análise
        </DialogTitle>
        <DialogContent>
          <Box sx={{ mt: 2 }}>
            <TextField
              fullWidth
              multiline
              rows={6}
              label="Parecer da Análise"
              value={parecerAnalise}
              onChange={(e) => setParecerAnalise(e.target.value)}
              placeholder="Descreva sua análise detalhada sobre a denúncia..."
              required
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowAnaliseModal(false)}>
            Cancelar
          </Button>
          <Button
            variant="contained"
            onClick={handleAnalyze}
            disabled={!parecerAnalise.trim() || analisarMutation.isLoading}
            startIcon={analisarMutation.isLoading ? <CircularProgress size={16} /> : <SendIcon />}
          >
            Salvar Análise
          </Button>
        </DialogActions>
      </Dialog>

      {/* Modal de Decisão */}
      <Dialog
        open={showDecisaoModal}
        onClose={() => setShowDecisaoModal(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          <GavelIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
          Registrar Decisão
        </DialogTitle>
        <DialogContent>
          <Box sx={{ mt: 2 }}>
            <FormControl fullWidth sx={{ mb: 3 }}>
              <InputLabel>Decisão</InputLabel>
              <Select
                value={decisao}
                label="Decisão"
                onChange={(e) => setDecisao(e.target.value as any)}
              >
                <MenuItem value="PROCEDENTE">Procedente</MenuItem>
                <MenuItem value="IMPROCEDENTE">Improcedente</MenuItem>
                <MenuItem value="ARQUIVADA">Arquivar</MenuItem>
              </Select>
            </FormControl>

            <TextField
              fullWidth
              multiline
              rows={4}
              label="Justificativa da Decisão"
              value={justificativaDecisao}
              onChange={(e) => setJustificativaDecisao(e.target.value)}
              placeholder="Justifique a decisão tomada..."
              required
              sx={{ mb: 3 }}
            />

            {decisao === 'PROCEDENTE' && (
              <TextField
                fullWidth
                multiline
                rows={4}
                label="Medidas a Serem Adotadas"
                value={medidasAdotadas}
                onChange={(e) => setMedidasAdotadas(e.target.value)}
                placeholder="Descreva as medidas que devem ser implementadas..."
              />
            )}
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowDecisaoModal(false)}>
            Cancelar
          </Button>
          <Button
            variant="contained"
            onClick={handleDecide}
            disabled={!justificativaDecisao.trim() || decidirMutation.isLoading}
            startIcon={decidirMutation.isLoading ? <CircularProgress size={16} /> : <GavelIcon />}
          >
            Registrar Decisão
          </Button>
        </DialogActions>
      </Dialog>

      {/* Modal de Implementação */}
      <Dialog
        open={showImplementacaoModal}
        onClose={() => setShowImplementacaoModal(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          <CheckCircleIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
          Marcar como Implementada
        </DialogTitle>
        <DialogContent>
          <Box sx={{ mt: 2 }}>
            <TextField
              fullWidth
              multiline
              rows={6}
              label="Relatório de Implementação"
              value={relatorioImplementacao}
              onChange={(e) => setRelatorioImplementacao(e.target.value)}
              placeholder="Descreva como as medidas foram implementadas..."
              required
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowImplementacaoModal(false)}>
            Cancelar
          </Button>
          <Button
            variant="contained"
            color="success"
            onClick={() => implementarMutation.mutate(relatorioImplementacao)}
            disabled={!relatorioImplementacao.trim() || implementarMutation.isLoading}
            startIcon={implementarMutation.isLoading ? <CircularProgress size={16} /> : <CheckCircleIcon />}
          >
            Marcar como Implementada
          </Button>
        </DialogActions>
      </Dialog>

      {/* Modal de Arquivamento */}
      <Dialog
        open={showArquivarModal}
        onClose={() => setShowArquivarModal(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          <ArchiveIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
          Arquivar Denúncia
        </DialogTitle>
        <DialogContent>
          <Box sx={{ mt: 2 }}>
            <Alert severity="warning" sx={{ mb: 2 }}>
              Esta ação irá arquivar a denúncia. O processo será interrompido.
            </Alert>
            <TextField
              fullWidth
              multiline
              rows={4}
              label="Motivo do Arquivamento"
              value={motivoArquivamento}
              onChange={(e) => setMotivoArquivamento(e.target.value)}
              placeholder="Informe o motivo do arquivamento..."
              required
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowArquivarModal(false)}>
            Cancelar
          </Button>
          <Button
            variant="contained"
            color="warning"
            onClick={() => arquivarMutation.mutate(motivoArquivamento)}
            disabled={!motivoArquivamento.trim() || arquivarMutation.isLoading}
            startIcon={arquivarMutation.isLoading ? <CircularProgress size={16} /> : <ArchiveIcon />}
          >
            Arquivar
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};