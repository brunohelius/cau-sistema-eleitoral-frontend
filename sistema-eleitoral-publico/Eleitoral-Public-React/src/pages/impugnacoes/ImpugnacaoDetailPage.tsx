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
  Divider,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Tabs,
  Tab,
  CircularProgress,
  IconButton,
  Tooltip,
  Accordion,
  AccordionSummary,
  AccordionDetails
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
  ArrowBack as ArrowBackIcon,
  Person as PersonIcon,
  Gavel as GavelIcon,
  Description as DescriptionIcon,
  AttachFile as AttachFileIcon,
  Schedule as ScheduleIcon,
  CheckCircle as CheckCircleIcon,
  Cancel as CancelIcon,
  HourglassEmpty as HourglassIcon,
  Download as DownloadIcon,
  Reply as ReplyIcon,
  AccountBalance as JudgeIcon,
  TrendingUp as AppealIcon,
  ExpandMore as ExpandMoreIcon,
  Assignment as AssignmentIcon,
  Info as InfoIcon
} from '@mui/icons-material';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useSnackbar } from 'notistack';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { 
  impugnacaoService, 
  PedidoImpugnacao,
  DefesaImpugnacao,
  JulgamentoImpugnacao,
  RecursoImpugnacao,
  ContrarrazaoRecurso
} from '../../services/api/impugnacaoService';

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

export const ImpugnacaoDetailPage: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const { enqueueSnackbar } = useSnackbar();
  const queryClient = useQueryClient();

  // Estados
  const [tabValue, setTabValue] = useState(0);
  const [showDefesaDialog, setShowDefesaDialog] = useState(false);
  const [showJulgamentoDialog, setShowJulgamentoDialog] = useState(false);
  const [showRecursoDialog, setShowRecursoDialog] = useState(false);
  
  // Estados dos formulários
  const [defesaForm, setDefesaForm] = useState({
    descricaoDefesa: '',
    arquivos: [] as File[]
  });

  // Queries
  const { data: impugnacao, isLoading } = useQuery({
    queryKey: ['impugnacao', id],
    queryFn: () => impugnacaoService.getImpugnacaoById(Number(id)),
    enabled: !!id
  });

  const { data: defesa } = useQuery({
    queryKey: ['defesa', id],
    queryFn: () => impugnacaoService.getDefesa(Number(id)),
    enabled: !!id
  });

  const { data: julgamentos = [] } = useQuery({
    queryKey: ['julgamentos', id],
    queryFn: () => impugnacaoService.getJulgamentos(Number(id)),
    enabled: !!id
  });

  const { data: recursos = [] } = useQuery({
    queryKey: ['recursos', id],
    queryFn: () => impugnacaoService.getRecursos(Number(id)),
    enabled: !!id
  });

  // Mutations
  const criarDefesaMutation = useMutation({
    mutationFn: (dados: { descricaoDefesa: string; arquivos: File[] }) =>
      impugnacaoService.criarDefesa(Number(id), dados),
    onSuccess: () => {
      enqueueSnackbar('Defesa enviada com sucesso!', { variant: 'success' });
      setShowDefesaDialog(false);
      setDefesaForm({ descricaoDefesa: '', arquivos: [] });
      queryClient.invalidateQueries({ queryKey: ['defesa', id] });
    },
    onError: (error: any) => {
      enqueueSnackbar(
        error.response?.data?.message || 'Erro ao enviar defesa',
        { variant: 'error' }
      );
    }
  });

  // Handlers
  const handleDownloadArquivo = async (arquivoId: number, nomeArquivo: string) => {
    try {
      const blob = await impugnacaoService.downloadArquivoImpugnacao(arquivoId);
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = nomeArquivo;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      enqueueSnackbar('Erro ao fazer download do arquivo', { variant: 'error' });
    }
  };

  const handleEnviarDefesa = () => {
    if (!defesaForm.descricaoDefesa.trim()) {
      enqueueSnackbar('Descrição da defesa é obrigatória', { variant: 'error' });
      return;
    }
    criarDefesaMutation.mutate(defesaForm);
  };

  const getStatusColor = (status: string): "default" | "primary" | "secondary" | "error" | "info" | "success" | "warning" => {
    switch (status.toLowerCase()) {
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

  const getTimelineIcon = (status: string) => {
    switch (status.toLowerCase()) {
      case 'pendente':
        return <HourglassIcon />;
      case 'procedente':
        return <CheckCircleIcon />;
      case 'improcedente':
        return <CancelIcon />;
      default:
        return <GavelIcon />;
    }
  };

  const podeEnviarDefesa = () => {
    if (!impugnacao || defesa) return false;
    
    // Verificar se é o profissional impugnado ou membro da chapa
    const isImpugnado = user?.id === impugnacao.membroChapa?.profissional?.id;
    const isMembroChapa = user?.id && impugnacao.membroChapa?.chapaEleicao?.id;
    
    // Verificar prazo para defesa (exemplo: 15 dias após criação)
    const prazoDefesa = new Date(impugnacao.dataInclusao);
    prazoDefesa.setDate(prazoDefesa.getDate() + 15);
    const dentroDosPrazo = new Date() <= prazoDefesa;
    
    return (isImpugnado || isMembroChapa) && dentroDosPrazo;
  };

  if (!user) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Alert severity="error">
          Você precisa estar logado para ver os detalhes da impugnação.
        </Alert>
      </Container>
    );
  }

  if (isLoading) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
          <CircularProgress size={60} />
        </Box>
      </Container>
    );
  }

  if (!impugnacao) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Alert severity="error">
          Impugnação não encontrada.
          <Button onClick={() => navigate('/impugnacoes')} sx={{ ml: 2 }}>
            Voltar à Lista
          </Button>
        </Alert>
      </Container>
    );
  }

  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      {/* Header */}
      <Box mb={4}>
        <Button
          startIcon={<ArrowBackIcon />}
          onClick={() => navigate('/impugnacoes')}
          sx={{ mb: 2 }}
        >
          Voltar às Impugnações
        </Button>
        
        <Box display="flex" justifyContent="space-between" alignItems="flex-start">
          <Box>
            <Typography variant="h3" component="h1" gutterBottom fontWeight="bold">
              <GavelIcon sx={{ mr: 2, verticalAlign: 'middle', fontSize: 'inherit' }} />
              Impugnação #{impugnacao.numeroProtocolo}
            </Typography>
            <Box display="flex" alignItems="center" gap={2}>
              <Chip
                label={impugnacao.statusImpugnacao?.descricao || 'Status não informado'}
                color={getStatusColor(impugnacao.statusImpugnacao?.descricao || '')}
                size="medium"
              />
              <Typography variant="body2" color="textSecondary">
                Criada em {format(new Date(impugnacao.dataInclusao), 'dd/MM/yyyy às HH:mm', { locale: ptBR })}
              </Typography>
            </Box>
          </Box>
          
          {podeEnviarDefesa() && (
            <Button
              variant="contained"
              color="secondary"
              startIcon={<ReplyIcon />}
              onClick={() => setShowDefesaDialog(true)}
            >
              Enviar Defesa
            </Button>
          )}
        </Box>
      </Box>

      {/* Informações Principais */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} md={8}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                <PersonIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
                Profissional Impugnado
              </Typography>
              <Box sx={{ bgcolor: 'grey.50', p: 2, borderRadius: 1, mb: 3 }}>
                <Grid container spacing={2}>
                  <Grid item xs={12} sm={6}>
                    <Typography><strong>Nome:</strong> {impugnacao.membroChapa?.profissional?.nome || 'Não informado'}</Typography>
                    <Typography><strong>Registro:</strong> {impugnacao.membroChapa?.profissional?.registroNacional || 'Não informado'}</Typography>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <Typography><strong>Chapa:</strong> {impugnacao.membroChapa?.chapaEleicao?.nome || 'Não informado'}</Typography>
                    <Typography><strong>Eleição:</strong> {impugnacao.membroChapa?.chapaEleicao?.eleicao?.titulo || 'Não informado'}</Typography>
                  </Grid>
                </Grid>
              </Box>
              
              <Typography variant="h6" gutterBottom>
                <DescriptionIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
                Descrição da Impugnação
              </Typography>
              <Typography 
                variant="body1" 
                sx={{ 
                  whiteSpace: 'pre-wrap',
                  bgcolor: 'grey.50',
                  p: 2,
                  borderRadius: 1,
                  border: '1px solid',
                  borderColor: 'grey.300'
                }}
              >
                {impugnacao.descricao}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                <InfoIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
                Informações da Impugnação
              </Typography>
              
              <List dense>
                <ListItem>
                  <ListItemText
                    primary="Tipo de Impugnação"
                    secondary={impugnacao.tipoImpugnacao?.descricao || 'Não informado'}
                  />
                </ListItem>
                
                <ListItem>
                  <ListItemText
                    primary="Impugnante"
                    secondary={impugnacao.impugnante?.nome || 'Não informado'}
                  />
                </ListItem>
                
                <ListItem>
                  <ListItemText
                    primary="Registro do Impugnante"
                    secondary={impugnacao.impugnante?.registroNacional || 'Não informado'}
                  />
                </ListItem>
                
                <ListItem>
                  <ListItemText
                    primary="Data de Inclusão"
                    secondary={format(new Date(impugnacao.dataInclusao), 'dd/MM/yyyy às HH:mm', { locale: ptBR })}
                  />
                </ListItem>
                
                {impugnacao.dataAlteracao && (
                  <ListItem>
                    <ListItemText
                      primary="Última Alteração"
                      secondary={format(new Date(impugnacao.dataAlteracao), 'dd/MM/yyyy às HH:mm', { locale: ptBR })}
                    />
                  </ListItem>
                )}
              </List>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Tabs */}
      <Paper sx={{ mb: 3 }}>
        <Tabs
          value={tabValue}
          onChange={(_, newValue) => setTabValue(newValue)}
          indicatorColor="primary"
          textColor="primary"
        >
          <Tab label="Documentos" icon={<AttachFileIcon />} />
          <Tab label="Declarações" icon={<AssignmentIcon />} />
          <Tab label="Defesa" icon={<ReplyIcon />} />
          <Tab label="Julgamentos" icon={<JudgeIcon />} />
          <Tab label="Recursos" icon={<AppealIcon />} />
          <Tab label="Timeline" icon={<ScheduleIcon />} />
        </Tabs>

        <TabPanel value={tabValue} index={0}>
          <Typography variant="h6" gutterBottom>
            Documentos Comprobatórios
          </Typography>
          
          {!impugnacao.arquivosPedidoImpugnacao || impugnacao.arquivosPedidoImpugnacao.length === 0 ? (
            <Alert severity="info">
              Nenhum documento foi anexado a esta impugnação.
            </Alert>
          ) : (
            <List>
              {impugnacao.arquivosPedidoImpugnacao.map((arquivo, index) => (
                <ListItem key={index}>
                  <ListItemIcon>
                    <AttachFileIcon />
                  </ListItemIcon>
                  <ListItemText
                    primary={arquivo.nomeArquivo}
                    secondary={`${(arquivo.tamanhoArquivo / 1024 / 1024).toFixed(2)} MB`}
                  />
                  <Tooltip title="Download">
                    <IconButton
                      onClick={() => handleDownloadArquivo(arquivo.id!, arquivo.nomeArquivo)}
                    >
                      <DownloadIcon />
                    </IconButton>
                  </Tooltip>
                </ListItem>
              ))}
            </List>
          )}
        </TabPanel>

        <TabPanel value={tabValue} index={1}>
          <Typography variant="h6" gutterBottom>
            Respostas das Declarações
          </Typography>
          
          {!impugnacao.respostasDeclaracao || impugnacao.respostasDeclaracao.length === 0 ? (
            <Alert severity="info">
              Nenhuma declaração foi respondida para esta impugnação.
            </Alert>
          ) : (
            <Box>
              {impugnacao.respostasDeclaracao.map((resposta, index) => (
                <Accordion key={index}>
                  <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                    <Typography>Declaração {index + 1}</Typography>
                  </AccordionSummary>
                  <AccordionDetails>
                    <List dense>
                      {resposta.itensRespostaDeclaracao
                        .filter(item => item.situacaoResposta)
                        .map((item, itemIndex) => (
                          <ListItem key={itemIndex}>
                            <ListItemIcon>
                              <CheckCircleIcon color="success" />
                            </ListItemIcon>
                            <ListItemText
                              primary={`Item ${item.idItemDeclaracao}`}
                              secondary="Marcado como verdadeiro"
                            />
                          </ListItem>
                        ))}
                    </List>
                  </AccordionDetails>
                </Accordion>
              ))}
            </Box>
          )}
        </TabPanel>

        <TabPanel value={tabValue} index={2}>
          <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
            <Typography variant="h6">
              Defesa da Impugnação
            </Typography>
            {podeEnviarDefesa() && (
              <Button
                variant="contained"
                color="secondary"
                startIcon={<ReplyIcon />}
                onClick={() => setShowDefesaDialog(true)}
              >
                Enviar Defesa
              </Button>
            )}
          </Box>
          
          {!defesa ? (
            <Alert severity="info">
              Nenhuma defesa foi apresentada para esta impugnação.
              {podeEnviarDefesa() && (
                <>
                  <br />
                  <Button
                    onClick={() => setShowDefesaDialog(true)}
                    sx={{ mt: 1 }}
                  >
                    Clique aqui para enviar sua defesa
                  </Button>
                </>
              )}
            </Alert>
          ) : (
            <Card>
              <CardContent>
                <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                  <Typography variant="h6">
                    Defesa Apresentada
                  </Typography>
                  <Typography variant="body2" color="textSecondary">
                    {format(new Date(defesa.dataInclusao), 'dd/MM/yyyy às HH:mm', { locale: ptBR })}
                  </Typography>
                </Box>
                
                <Typography variant="body2" color="textSecondary" gutterBottom>
                  Responsável: {defesa.responsavel?.nome || 'Não informado'}
                </Typography>
                
                <Typography 
                  variant="body1" 
                  sx={{ 
                    whiteSpace: 'pre-wrap',
                    bgcolor: 'grey.50',
                    p: 2,
                    borderRadius: 1,
                    mb: 2
                  }}
                >
                  {defesa.descricaoDefesa}
                </Typography>
                
                {defesa.arquivosDefesa && defesa.arquivosDefesa.length > 0 && (
                  <>
                    <Typography variant="subtitle2" gutterBottom>
                      Documentos da Defesa:
                    </Typography>
                    <List dense>
                      {defesa.arquivosDefesa.map((arquivo, index) => (
                        <ListItem key={index}>
                          <ListItemIcon>
                            <AttachFileIcon />
                          </ListItemIcon>
                          <ListItemText
                            primary={arquivo.nomeArquivo}
                            secondary={`${(arquivo.tamanhoArquivo / 1024 / 1024).toFixed(2)} MB`}
                          />
                          <Tooltip title="Download">
                            <IconButton
                              onClick={() => handleDownloadArquivo(arquivo.id!, arquivo.nomeArquivo)}
                            >
                              <DownloadIcon />
                            </IconButton>
                          </Tooltip>
                        </ListItem>
                      ))}
                    </List>
                  </>
                )}
              </CardContent>
            </Card>
          )}
        </TabPanel>

        <TabPanel value={tabValue} index={3}>
          <Typography variant="h6" gutterBottom>
            Julgamentos
          </Typography>
          
          {julgamentos.length === 0 ? (
            <Alert severity="info">
              Esta impugnação ainda não foi julgada.
            </Alert>
          ) : (
            <Box>
              {julgamentos.map((julgamento, index) => (
                <Card key={index} sx={{ mb: 2 }}>
                  <CardContent>
                    <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                      <Typography variant="h6">
                        {julgamento.instancia === 1 ? '1ª Instância' : '2ª Instância'}
                      </Typography>
                      <Chip
                        label={julgamento.resultado}
                        color={julgamento.resultado === 'PROCEDENTE' ? 'success' : 'error'}
                      />
                    </Box>
                    
                    <Typography><strong>Relator:</strong> {julgamento.relator?.nome || 'Não informado'}</Typography>
                    <Typography><strong>Data:</strong> {format(new Date(julgamento.dataJulgamento), 'dd/MM/yyyy', { locale: ptBR })}</Typography>
                    
                    <Typography variant="subtitle2" sx={{ mt: 2, mb: 1 }}>
                      Parecer:
                    </Typography>
                    <Typography 
                      variant="body2" 
                      sx={{ 
                        whiteSpace: 'pre-wrap',
                        bgcolor: 'grey.50',
                        p: 2,
                        borderRadius: 1
                      }}
                    >
                      {julgamento.parecer}
                    </Typography>
                  </CardContent>
                </Card>
              ))}
            </Box>
          )}
        </TabPanel>

        <TabPanel value={tabValue} index={4}>
          <Typography variant="h6" gutterBottom>
            Recursos
          </Typography>
          
          {recursos.length === 0 ? (
            <Alert severity="info">
              Nenhum recurso foi interposto para esta impugnação.
            </Alert>
          ) : (
            <Box>
              {recursos.map((recurso, index) => (
                <Card key={index} sx={{ mb: 2 }}>
                  <CardContent>
                    <Typography variant="h6" gutterBottom>
                      Recurso #{index + 1}
                    </Typography>
                    <Typography><strong>Recorrente:</strong> {recurso.recorrente?.nome || 'Não informado'}</Typography>
                    <Typography><strong>Tipo:</strong> {recurso.recorrente?.tipo || 'Não informado'}</Typography>
                    <Typography><strong>Data:</strong> {format(new Date(recurso.dataInclusao), 'dd/MM/yyyy', { locale: ptBR })}</Typography>
                  </CardContent>
                </Card>
              ))}
            </Box>
          )}
        </TabPanel>

        <TabPanel value={tabValue} index={5}>
          <Typography variant="h6" gutterBottom>
            Timeline da Impugnação
          </Typography>
          
          <Timeline>
            <TimelineItem>
              <TimelineSeparator>
                <TimelineDot color="primary">
                  <GavelIcon />
                </TimelineDot>
                <TimelineConnector />
              </TimelineSeparator>
              <TimelineContent>
                <Typography variant="h6">Impugnação Criada</Typography>
                <Typography variant="body2" color="textSecondary">
                  {format(new Date(impugnacao.dataInclusao), 'dd/MM/yyyy às HH:mm', { locale: ptBR })}
                </Typography>
                <Typography variant="body2">
                  Por: {impugnacao.impugnante?.nome || 'Não informado'}
                </Typography>
              </TimelineContent>
            </TimelineItem>
            
            {defesa && (
              <TimelineItem>
                <TimelineSeparator>
                  <TimelineDot color="secondary">
                    <ReplyIcon />
                  </TimelineDot>
                  <TimelineConnector />
                </TimelineSeparator>
                <TimelineContent>
                  <Typography variant="h6">Defesa Apresentada</Typography>
                  <Typography variant="body2" color="textSecondary">
                    {format(new Date(defesa.dataInclusao), 'dd/MM/yyyy às HH:mm', { locale: ptBR })}
                  </Typography>
                  <Typography variant="body2">
                    Por: {defesa.responsavel?.nome || 'Não informado'}
                  </Typography>
                </TimelineContent>
              </TimelineItem>
            )}
            
            {julgamentos.map((julgamento, index) => (
              <TimelineItem key={index}>
                <TimelineSeparator>
                  <TimelineDot color={julgamento.resultado === 'PROCEDENTE' ? 'success' : 'error'}>
                    {getTimelineIcon(julgamento.resultado)}
                  </TimelineDot>
                  {index < julgamentos.length - 1 && <TimelineConnector />}
                </TimelineSeparator>
                <TimelineContent>
                  <Typography variant="h6">
                    Julgamento - {julgamento.instancia === 1 ? '1ª' : '2ª'} Instância
                  </Typography>
                  <Typography variant="body2" color="textSecondary">
                    {format(new Date(julgamento.dataJulgamento), 'dd/MM/yyyy', { locale: ptBR })}
                  </Typography>
                  <Typography variant="body2">
                    Resultado: {julgamento.resultado}
                  </Typography>
                  <Typography variant="body2">
                    Relator: {julgamento.relator?.nome || 'Não informado'}
                  </Typography>
                </TimelineContent>
              </TimelineItem>
            ))}
          </Timeline>
        </TabPanel>
      </Paper>

      {/* Dialog de Defesa */}
      <Dialog 
        open={showDefesaDialog} 
        onClose={() => setShowDefesaDialog(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          <ReplyIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
          Enviar Defesa
        </DialogTitle>
        <DialogContent>
          <Alert severity="info" sx={{ mb: 3 }}>
            Apresente sua defesa contra a impugnação. Você pode anexar documentos comprobatórios.
          </Alert>
          
          <TextField
            fullWidth
            label="Descrição da Defesa"
            multiline
            rows={8}
            value={defesaForm.descricaoDefesa}
            onChange={(e) => setDefesaForm(prev => ({ ...prev, descricaoDefesa: e.target.value }))}
            placeholder="Descreva detalhadamente sua defesa contra os pontos levantados na impugnação..."
            sx={{ mb: 3 }}
          />
          
          <Box>
            <Button
              variant="outlined"
              component="label"
              startIcon={<AttachFileIcon />}
            >
              Adicionar Documentos
              <input
                type="file"
                hidden
                multiple
                accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                onChange={(e) => setDefesaForm(prev => ({ 
                  ...prev, 
                  arquivos: Array.from(e.target.files || [])
                }))}
              />
            </Button>
            
            {defesaForm.arquivos.length > 0 && (
              <List dense sx={{ mt: 2 }}>
                {defesaForm.arquivos.map((arquivo, index) => (
                  <ListItem key={index}>
                    <ListItemText
                      primary={arquivo.name}
                      secondary={`${(arquivo.size / 1024 / 1024).toFixed(2)} MB`}
                    />
                  </ListItem>
                ))}
              </List>
            )}
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowDefesaDialog(false)}>
            Cancelar
          </Button>
          <Button
            variant="contained"
            onClick={handleEnviarDefesa}
            disabled={criarDefesaMutation.isPending}
            startIcon={criarDefesaMutation.isPending && <CircularProgress size={20} />}
          >
            {criarDefesaMutation.isPending ? 'Enviando...' : 'Enviar Defesa'}
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};