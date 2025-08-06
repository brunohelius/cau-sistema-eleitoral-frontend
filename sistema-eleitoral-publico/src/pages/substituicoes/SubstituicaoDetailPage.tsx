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
  Timeline,
  TimelineItem,
  TimelineSeparator,
  TimelineConnector,
  TimelineContent,
  TimelineDot,
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
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Avatar
} from '@mui/material';
import {
  ArrowBack as ArrowBackIcon,
  Person as PersonIcon,
  SwapHoriz as SwapIcon,
  Description as DescriptionIcon,
  AttachFile as AttachFileIcon,
  Schedule as ScheduleIcon,
  CheckCircle as CheckCircleIcon,
  Cancel as CancelIcon,
  HourglassEmpty as HourglassIcon,
  Download as DownloadIcon,
  Gavel as GavelIcon,
  Appeal as AppealIcon,
  Assignment as AssignmentIcon,
  Info as InfoIcon,
  CompareArrows as CompareArrowsIcon
} from '@mui/icons-material';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useSnackbar } from 'notistack';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { 
  substituicaoService, 
  PedidoSubstituicao,
  JulgamentoSubstituicao,
  RecursoSubstituicao,
  MembroChapa
} from '../../services/api/substituicaoService';

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

const STATUS_CONFIRMADO = 1;
const STATUS_SEM_PENDENCIA = 3;

export const SubstituicaoDetailPage: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const { enqueueSnackbar } = useSnackbar();
  const queryClient = useQueryClient();

  // Estados
  const [tabValue, setTabValue] = useState(0);
  const [showJulgamentoDialog, setShowJulgamentoDialog] = useState(false);
  const [showRecursoDialog, setShowRecursoDialog] = useState(false);

  // Queries
  const { data: substituicao, isLoading } = useQuery({
    queryKey: ['substituicao', id],
    queryFn: () => substituicaoService.getSubstituicaoById(Number(id)),
    enabled: !!id
  });

  const { data: julgamentos = [] } = useQuery({
    queryKey: ['julgamentos-substituicao', id],
    queryFn: () => substituicaoService.getJulgamentos(Number(id)),
    enabled: !!id
  });

  const { data: recursos = [] } = useQuery({
    queryKey: ['recursos-substituicao', id],
    queryFn: () => substituicaoService.getRecursos(Number(id)),
    enabled: !!id
  });

  // Handlers
  const handleDownloadArquivo = async () => {
    if (!substituicao?.arquivoJustificativa?.id) return;
    
    try {
      const blob = await substituicaoService.downloadArquivoSubstituicao(substituicao.arquivoJustificativa.id);
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = substituicao.arquivoJustificativa.nomeArquivo;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      enqueueSnackbar('Erro ao fazer download do arquivo', { variant: 'error' });
    }
  };

  const getStatusColor = (status: string): "default" | "primary" | "secondary" | "error" | "info" | "success" | "warning" => {
    switch (status.toLowerCase()) {
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

  const getTimelineIcon = (status: string) => {
    switch (status.toLowerCase()) {
      case 'aprovada':
        return <CheckCircleIcon />;
      case 'rejeitada':
        return <CancelIcon />;
      default:
        return <HourglassIcon />;
    }
  };

  const renderMembroCard = (titulo: string, membro?: MembroChapa) => {
    if (!membro) return null;

    return (
      <Card variant="outlined">
        <CardContent>
          <Typography variant="subtitle2" color="textSecondary" gutterBottom>
            {titulo}
          </Typography>
          
          <Box display="flex" alignItems="center" mb={1}>
            <Avatar sx={{ width: 40, height: 40, mr: 2 }}>
              {membro.profissional.nome.split(' ').map(n => n[0]).join('').substring(0, 2)}
            </Avatar>
            <Box>
              <Typography variant="body1" fontWeight="medium">
                {membro.profissional.nome}
              </Typography>
              <Typography variant="body2" color="textSecondary">
                Registro: {membro.profissional.registroNacional}
              </Typography>
            </Box>
          </Box>
          
          <Divider sx={{ my: 1 }} />
          
          <Typography variant="body2">
            <strong>Tipo:</strong> {membro.tipoParticipacaoChapa.descricao}
          </Typography>
          
          <Box display="flex" gap={1} mt={1}>
            <Chip
              label={membro.statusParticipacaoChapa.descricao}
              color={membro.statusParticipacaoChapa.id === STATUS_CONFIRMADO ? 'primary' : 'warning'}
              size="small"
            />
            {membro.statusValidacaoMembroChapa.id === STATUS_SEM_PENDENCIA ? (
              <Chip
                icon={<CheckCircleIcon />}
                label="Sem Pendências"
                color="success"
                size="small"
              />
            ) : (
              <Chip
                icon={<InfoIcon />}
                label="Com Pendências"
                color="warning"
                size="small"
              />
            )}
          </Box>
          
          {membro.situacaoResponsavel && (
            <Chip
              label="Responsável pela Chapa"
              color="secondary"
              size="small"
              sx={{ mt: 1 }}
            />
          )}
        </CardContent>
      </Card>
    );
  };

  const podeJulgar = () => {
    // Verificar se usuário é membro da comissão
    return !!user; // Simplificado - em produção verificar permissões reais
  };

  if (!user) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Alert severity="error">
          Você precisa estar logado para ver os detalhes da substituição.
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

  if (!substituicao) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Alert severity="error">
          Substituição não encontrada.
          <Button onClick={() => navigate('/substituicoes')} sx={{ ml: 2 }}>
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
          onClick={() => navigate('/substituicoes')}
          sx={{ mb: 2 }}
        >
          Voltar às Substituições
        </Button>
        
        <Box display="flex" justifyContent="space-between" alignItems="flex-start">
          <Box>
            <Typography variant="h3" component="h1" gutterBottom fontWeight="bold">
              <SwapIcon sx={{ mr: 2, verticalAlign: 'middle', fontSize: 'inherit' }} />
              Substituição #{substituicao.numeroProtocolo}
            </Typography>
            <Box display="flex" alignItems="center" gap={2}>
              <Chip
                label={substituicao.statusSubstituicao.descricao}
                color={getStatusColor(substituicao.statusSubstituicao.descricao)}
                size="medium"
              />
              <Typography variant="body2" color="textSecondary">
                Criada em {format(new Date(substituicao.dataInclusao), 'dd/MM/yyyy às HH:mm', { locale: ptBR })}
              </Typography>
            </Box>
          </Box>
          
          {podeJulgar() && substituicao.statusSubstituicao.descricao.toLowerCase() === 'pendente' && (
            <Button
              variant="contained"
              color="secondary"
              startIcon={<GavelIcon />}
              onClick={() => navigate(`/substituicoes/${id}/julgamento/1`)}
            >
              Julgar Substituição
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
                Dados da Substituição
              </Typography>
              
              <Box sx={{ bgcolor: 'grey.50', p: 2, borderRadius: 1, mb: 3 }}>
                <Grid container spacing={2}>
                  <Grid item xs={12} sm={6}>
                    <Typography><strong>Chapa:</strong> {substituicao.chapaEleicao.nome}</Typography>
                    <Typography><strong>Solicitante:</strong> {substituicao.solicitante.nome}</Typography>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <Typography><strong>Registro Solicitante:</strong> {substituicao.solicitante.registroNacional}</Typography>
                    <Typography><strong>Data:</strong> {format(new Date(substituicao.dataInclusao), 'dd/MM/yyyy', { locale: ptBR })}</Typography>
                  </Grid>
                </Grid>
              </Box>
              
              <Typography variant="h6" gutterBottom>
                <DescriptionIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
                Justificativa
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
                {substituicao.justificativa}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                <AttachFileIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
                Documento Comprobatório
              </Typography>
              
              {substituicao.arquivoJustificativa ? (
                <List>
                  <ListItem>
                    <ListItemIcon>
                      <AttachFileIcon />
                    </ListItemIcon>
                    <ListItemText
                      primary={substituicao.arquivoJustificativa.nomeArquivo}
                      secondary={`${(substituicao.arquivoJustificativa.tamanhoArquivo / 1024 / 1024).toFixed(2)} MB`}
                    />
                    <Tooltip title="Download">
                      <IconButton onClick={handleDownloadArquivo}>
                        <DownloadIcon />
                      </IconButton>
                    </Tooltip>
                  </ListItem>
                </List>
              ) : (
                <Alert severity="info">
                  Nenhum documento anexado
                </Alert>
              )}
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
          <Tab label="Membros" icon={<PersonIcon />} />
          <Tab label="Julgamentos" icon={<GavelIcon />} />
          <Tab label="Recursos" icon={<AppealIcon />} />
          <Tab label="Timeline" icon={<ScheduleIcon />} />
        </Tabs>

        <TabPanel value={tabValue} index={0}>
          <Typography variant="h6" gutterBottom>
            <CompareArrowsIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
            Substituições de Membros
          </Typography>
          
          <Grid container spacing={3}>
            {/* Membros Substituídos */}
            <Grid item xs={12} md={6}>
              <Typography variant="subtitle1" gutterBottom fontWeight="bold">
                Membros Substituídos (Saindo)
              </Typography>
              <Grid container spacing={2}>
                <Grid item xs={12}>
                  {renderMembroCard('Titular', substituicao.membroSubstituidoTitular)}
                </Grid>
                <Grid item xs={12}>
                  {renderMembroCard('Suplente', substituicao.membroSubstituidoSuplente)}
                </Grid>
              </Grid>
            </Grid>
            
            {/* Membros Substitutos */}
            <Grid item xs={12} md={6}>
              <Typography variant="subtitle1" gutterBottom fontWeight="bold">
                Membros Substitutos (Entrando)
              </Typography>
              <Grid container spacing={2}>
                <Grid item xs={12}>
                  {renderMembroCard('Titular', substituicao.membroSubstitutoTitular)}
                </Grid>
                <Grid item xs={12}>
                  {renderMembroCard('Suplente', substituicao.membroSubstitutoSuplente)}
                </Grid>
              </Grid>
            </Grid>
          </Grid>
          
          {!substituicao.membroSubstituidoTitular && !substituicao.membroSubstituidoSuplente && 
           !substituicao.membroSubstitutoTitular && !substituicao.membroSubstitutoSuplente && (
            <Alert severity="info">
              Nenhuma informação de membros disponível.
            </Alert>
          )}
        </TabPanel>

        <TabPanel value={tabValue} index={1}>
          <Typography variant="h6" gutterBottom>
            Julgamentos
          </Typography>
          
          {julgamentos.length === 0 ? (
            <Alert severity="info">
              Esta substituição ainda não foi julgada.
              {podeJulgar() && substituicao.statusSubstituicao.descricao.toLowerCase() === 'pendente' && (
                <>
                  <br />
                  <Button
                    onClick={() => navigate(`/substituicoes/${id}/julgamento/1`)}
                    sx={{ mt: 1 }}
                  >
                    Iniciar Julgamento
                  </Button>
                </>
              )}
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
                    
                    <Typography><strong>Relator:</strong> {julgamento.relator.nome}</Typography>
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
                    
                    {julgamento.membrosJulgadores.length > 0 && (
                      <>
                        <Typography variant="subtitle2" sx={{ mt: 2, mb: 1 }}>
                          Votos:
                        </Typography>
                        <TableContainer>
                          <Table size="small">
                            <TableHead>
                              <TableRow>
                                <TableCell>Julgador</TableCell>
                                <TableCell align="center">Voto</TableCell>
                              </TableRow>
                            </TableHead>
                            <TableBody>
                              {julgamento.membrosJulgadores.map((membro, idx) => (
                                <TableRow key={idx}>
                                  <TableCell>{membro.nome}</TableCell>
                                  <TableCell align="center">
                                    <Chip
                                      label={membro.voto}
                                      color={
                                        membro.voto === 'PROCEDENTE' ? 'success' : 
                                        membro.voto === 'IMPROCEDENTE' ? 'error' : 
                                        'warning'
                                      }
                                      size="small"
                                    />
                                  </TableCell>
                                </TableRow>
                              ))}
                            </TableBody>
                          </Table>
                        </TableContainer>
                      </>
                    )}
                  </CardContent>
                </Card>
              ))}
            </Box>
          )}
        </TabPanel>

        <TabPanel value={tabValue} index={2}>
          <Typography variant="h6" gutterBottom>
            Recursos
          </Typography>
          
          {recursos.length === 0 ? (
            <Alert severity="info">
              Nenhum recurso foi interposto para esta substituição.
            </Alert>
          ) : (
            <Box>
              {recursos.map((recurso, index) => (
                <Card key={index} sx={{ mb: 2 }}>
                  <CardContent>
                    <Typography variant="h6" gutterBottom>
                      Recurso #{index + 1}
                    </Typography>
                    <Typography><strong>Recorrente:</strong> {recurso.recorrente.nome}</Typography>
                    <Typography><strong>Tipo:</strong> {recurso.recorrente.tipo}</Typography>
                    <Typography><strong>Data:</strong> {format(new Date(recurso.dataInclusao), 'dd/MM/yyyy', { locale: ptBR })}</Typography>
                    
                    <Typography variant="subtitle2" sx={{ mt: 2, mb: 1 }}>
                      Descrição do Recurso:
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
                      {recurso.descricaoRecurso}
                    </Typography>
                  </CardContent>
                </Card>
              ))}
            </Box>
          )}
        </TabPanel>

        <TabPanel value={tabValue} index={3}>
          <Typography variant="h6" gutterBottom>
            Timeline da Substituição
          </Typography>
          
          <Timeline>
            <TimelineItem>
              <TimelineSeparator>
                <TimelineDot color="primary">
                  <SwapIcon />
                </TimelineDot>
                <TimelineConnector />
              </TimelineSeparator>
              <TimelineContent>
                <Typography variant="h6">Substituição Solicitada</Typography>
                <Typography variant="body2" color="textSecondary">
                  {format(new Date(substituicao.dataInclusao), 'dd/MM/yyyy às HH:mm', { locale: ptBR })}
                </Typography>
                <Typography variant="body2">
                  Por: {substituicao.solicitante.nome}
                </Typography>
              </TimelineContent>
            </TimelineItem>
            
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
                    Relator: {julgamento.relator.nome}
                  </Typography>
                </TimelineContent>
              </TimelineItem>
            ))}
            
            {recursos.map((recurso, index) => (
              <TimelineItem key={`recurso-${index}`}>
                <TimelineSeparator>
                  <TimelineDot color="warning">
                    <AppealIcon />
                  </TimelineDot>
                  <TimelineConnector />
                </TimelineSeparator>
                <TimelineContent>
                  <Typography variant="h6">
                    Recurso Interposto
                  </Typography>
                  <Typography variant="body2" color="textSecondary">
                    {format(new Date(recurso.dataInclusao), 'dd/MM/yyyy', { locale: ptBR })}
                  </Typography>
                  <Typography variant="body2">
                    Por: {recurso.recorrente.nome} ({recurso.recorrente.tipo})
                  </Typography>
                </TimelineContent>
              </TimelineItem>
            ))}
          </Timeline>
        </TabPanel>
      </Paper>
    </Container>
  );
};