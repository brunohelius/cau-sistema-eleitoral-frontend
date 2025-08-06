import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Grid,
  Chip,
  Button,
  Tab,
  Tabs,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  IconButton,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Divider,
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
  Accordion,
  AccordionSummary,
  AccordionDetails,
  
  
  
  
  
  
} from '@mui/material';
import {
  ArrowBack,
  Edit,
  Gavel,
  Assignment,
  History,
  Person,
  AttachFile,
  Visibility,
  GetApp,
  CheckCircle,
  Warning,
  Error,
  AccessTime,
  ExpandMore,
} from '@mui/icons-material';
import { useParams, useNavigate } from 'react-router-dom';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface Document {
  id: string;
  nome: string;
  tipo: string;
  arquivo: string;
  dataUpload: Date;
}

interface TimelineEvent {
  id: string;
  data: Date;
  evento: string;
  descricao: string;
  responsavel: string;
  status: 'success' | 'warning' | 'error' | 'info';
}

interface Judgment {
  id: string;
  data: Date;
  juiz: string;
  decisao: 'Procedente' | 'Improcedente' | 'Parcialmente Procedente';
  fundamentacao: string;
  instancia: '1ª Instância' | '2ª Instância';
  votos: {
    favor: number;
    contra: number;
    abstencoes: number;
  };
}

interface Impugnation {
  id: string;
  protocolo: string;
  tipo: 'Impugnacao de Chapa' | 'Impugnacao de Membro' | 'Impugnacao de Documento';
  assunto: string;
  descricao: string;
  status: 'Registrada' | 'Em Analise' | 'Aguardando Defesa' | 'Em Julgamento' | 'Julgada' | 'Arquivada';
  urgente: boolean;
  dataRegistro: Date;
  prazoDefesa?: Date;
  prazoJulgamento?: Date;
  eleicaoId: string;
  eleicaoNome: string;
  chapaAlvo?: string;
  chapaAlvoNome?: string;
  membroAlvo?: string;
  requerente: {
    nome: string;
    cpf: string;
    email: string;
    telefone: string;
    anonimo: boolean;
  };
  documentos: Document[];
  timeline: TimelineEvent[];
  julgamentos: Judgment[];
  observacoes?: string;
}

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
      id={`impugnation-tabpanel-${index}`}
      aria-labelledby={`impugnation-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box sx={{ p: 3 }}>
          {children}
        </Box>
      )}
    </div>
  );
}

export const ImpugnationDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [currentTab, setCurrentTab] = useState(0);
  const [impugnation, setImpugnation] = useState<Impugnation | null>(null);
  const [openJudgmentDialog, setOpenJudgmentDialog] = useState(false);
  const [judgmentForm, setJudgmentForm] = useState({
    decisao: '',
    fundamentacao: '',
    votosFavor: 0,
    votosContra: 0,
    abstencoes: 0,
  });
  const [loading, setLoading] = useState(true);

  // Mock data - replace with API call
  useEffect(() => {
    const mockImpugnation: Impugnation = {
      id: id || '1',
      protocolo: `IMP-${id}-2024`,
      tipo: 'Impugnacao de Chapa',
      assunto: 'Irregularidades na formação da Chapa 01',
      descricao: 'A chapa em questão apresenta irregularidades nos documentos de alguns membros, especificamente no que tange às certidões de regularidade junto ao CAU. Além disso, há indicátivos de que alguns candidatos não possuem os requisitos mínimos para o exercício do cargo pretendido, conforme estabelecido no regulamento eleitoral.',
      status: 'Em Julgamento',
      urgente: true,
      dataRegistro: new Date('2024-02-10'),
      prazoDefesa: new Date('2024-02-25'),
      prazoJulgamento: new Date('2024-03-10'),
      eleicaoId: '1',
      eleicaoNome: 'Eleições CAU/BR 2024',
      chapaAlvo: '1',
      chapaAlvoNome: 'Chapa Renovação CAU',
      membroAlvo: 'João Silva',
      requerente: {
        nome: 'Maria José Santos',
        cpf: '987.654.321-00',
        email: 'maria.santos@email.com',
        telefone: '(11) 99999-9999',
        anonimo: false,
      },
      documentos: [
        {
          id: '1',
          nome: 'Petição Inicial',
          tipo: 'PDF',
          arquivo: 'peticao_inicial.pdf',
          dataUpload: new Date('2024-02-10'),
        },
        {
          id: '2',
          nome: 'Comprovantes de Irregularidade',
          tipo: 'PDF',
          arquivo: 'comprovantes.pdf',
          dataUpload: new Date('2024-02-10'),
        },
        {
          id: '3',
          nome: 'Defesa da Chapa',
          tipo: 'PDF',
          arquivo: 'defesa_chapa.pdf',
          dataUpload: new Date('2024-02-20'),
        },
      ],
      timeline: [
        {
          id: '1',
          data: new Date('2024-02-10'),
          evento: 'Registro da Impugnação',
          descricao: 'Impugnação registrada no sistema',
          responsavel: 'Sistema',
          status: 'info',
        },
        {
          id: '2',
          data: new Date('2024-02-12'),
          evento: 'Distribuição para Análise',
          descricao: 'Processo distribuído para Comissão Eleitoral',
          responsavel: 'Ana Costa - Secretária',
          status: 'success',
        },
        {
          id: '3',
          data: new Date('2024-02-15'),
          evento: 'Notificação da Chapa',
          descricao: 'Chapa notificada para apresentar defesa',
          responsavel: 'Comissão Eleitoral',
          status: 'warning',
        },
        {
          id: '4',
          data: new Date('2024-02-20'),
          evento: 'Defesa Apresentada',
          descricao: 'Chapa apresentou defesa dentro do prazo',
          responsavel: 'João Silva - Responsável da Chapa',
          status: 'success',
        },
        {
          id: '5',
          data: new Date('2024-02-25'),
          evento: 'Processo em Julgamento',
          descricao: 'Processo encaminhado para julgamento',
          responsavel: 'Comissão Eleitoral',
          status: 'warning',
        },
      ],
      julgamentos: [
        {
          id: '1',
          data: new Date('2024-03-01'),
          juiz: 'Dr. Carlos Oliveira',
          decisao: 'Parcialmente Procedente',
          fundamentacao: 'A impugnação é parcialmente procedente. Foram constatadas irregularidades menores na documentação de dois membros da chapa, porém não suficientes para desqualificar toda a chapa. Determina-se a substituição dos membros irregulares no prazo de 10 dias.',
          instancia: '1ª Instância',
          votos: {
            favor: 3,
            contra: 1,
            abstencoes: 1,
          },
        },
      ],
      observacoes: 'Processo de alta complexidade que requer atenção especial devido ao prazo eleitoral.',
    };
    setImpugnation(mockImpugnation);
    setLoading(false);
  }, [id]);

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setCurrentTab(newValue);
  };

  const handleJudgment = () => {
    setOpenJudgmentDialog(true);
  };

  const handleSaveJudgment = () => {
    if (impugnation) {
      const newJudgment: Judgment = {
        id: Date.now().toString(),
        data: new Date(),
        juiz: 'Usuário Atual', // Replace with actual user
        decisao: judgmentForm.decisao as any,
        fundamentacao: judgmentForm.fundamentacao,
        instancia: '1ª Instância',
        votos: {
          favor: judgmentForm.votosFavor,
          contra: judgmentForm.votosContra,
          abstencoes: judgmentForm.abstencoes,
        },
      };
      
      setImpugnation({
        ...impugnation,
        julgamentos: [...impugnation.julgamentos, newJudgment],
        status: 'Julgada',
      });
    }
    setOpenJudgmentDialog(false);
    setJudgmentForm({
      decisao: '',
      fundamentacao: '',
      votosFavor: 0,
      votosContra: 0,
      abstencoes: 0,
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Julgada': return 'success';
      case 'Em Julgamento': return 'warning';
      case 'Aguardando Defesa': return 'info';
      case 'Em Analise': return 'info';
      case 'Registrada': return 'default';
      case 'Arquivada': return 'error';
      default: return 'default';
    }
  };

  const getTimelineIcon = (status: string) => {
    switch (status) {
      case 'success': return <CheckCircle />;
      case 'warning': return <Warning />;
      case 'error': return <Error />;
      case 'info': return <AccessTime />;
      default: return <AccessTime />;
    }
  };

  const getDecisaoColor = (decisao: string) => {
    switch (decisao) {
      case 'Procedente': return 'success';
      case 'Improcedente': return 'error';
      case 'Parcialmente Procedente': return 'warning';
      default: return 'default';
    }
  };

  if (loading || !impugnation) {
    return (
      <Box sx={{ p: 3 }}>
        <Typography>Carregando...</Typography>
      </Box>
    );
  }

  const isOverdue = impugnation.prazoJulgamento && new Date() > impugnation.prazoJulgamento;
  const daysToDeadline = impugnation.prazoJulgamento 
    ? Math.ceil((impugnation.prazoJulgamento.getTime() - new Date().getTime()) / (1000 * 3600 * 24))
    : null;

  return (
    <Box sx={{ p: 3 }}>
      {/* Header */}
      <Box sx={{ mb: 3, display: 'flex', alignItems: 'center', gap: 2 }}>
        <IconButton onClick={() => navigate('/impugnacoes')}>
          <ArrowBack />
        </IconButton>
        <Box sx={{ flex: 1 }}>
          <Typography variant="h4" gutterBottom>
            {impugnation.protocolo} - {impugnation.assunto}
          </Typography>
          <Typography variant="body1" color="text.secondary">
            {impugnation.tipo} • {impugnation.eleicaoNome}
          </Typography>
        </Box>
        <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
          {impugnation.urgente && (
            <Chip
              label="URGENTE"
              color="error"
              size="small"
              icon={<Warning />}
            />
          )}
          <Chip
            label={impugnation.status}
            color={getStatusColor(impugnation.status) as any}
            variant="filled"
          />
        </Box>
        <Button
          startIcon={<Edit />}
          variant="outlined"
        >
          Editar
        </Button>
      </Box>

      {/* Status Alert */}
      {isOverdue && (
        <Alert severity="error" sx={{ mb: 3 }}>
          ATENÇÃO: Prazo de julgamento vencido há {Math.abs(daysToDeadline!)} dia(s)!
        </Alert>
      )}
      
      {daysToDeadline !== null && daysToDeadline <= 5 && daysToDeadline > 0 && (
        <Alert severity="warning" sx={{ mb: 3 }}>
          Prazo de julgamento se encerra em {daysToDeadline} dia(s).
        </Alert>
      )}

      {/* Summary Cards */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12} md={3}>
          <Card>
            <CardContent>
              <Typography color="text.secondary" gutterBottom>
                Data de Registro
              </Typography>
              <Typography variant="h6">
                {format(impugnation.dataRegistro, 'dd/MM/yyyy', { locale: ptBR })}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={3}>
          <Card>
            <CardContent>
              <Typography color="text.secondary" gutterBottom>
                Prazo para Julgamento
              </Typography>
              <Typography variant="h6" color={isOverdue ? 'error.main' : daysToDeadline && daysToDeadline <= 5 ? 'warning.main' : 'inherit'}>
                {impugnation.prazoJulgamento 
                  ? format(impugnation.prazoJulgamento, 'dd/MM/yyyy', { locale: ptBR })
                  : 'Não definido'
                }
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={3}>
          <Card>
            <CardContent>
              <Typography color="text.secondary" gutterBottom>
                Documentos
              </Typography>
              <Typography variant="h6">
                {impugnation.documentos.length}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={3}>
          <Card>
            <CardContent>
              <Typography color="text.secondary" gutterBottom>
                Julgamentos
              </Typography>
              <Typography variant="h6">
                {impugnation.julgamentos.length}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Tabs */}
      <Paper sx={{ width: '100%' }}>
        <Tabs
          value={currentTab}
          onChange={handleTabChange}
          aria-label="impugnation-tabs"
          variant="scrollable"
          scrollButtons="auto"
        >
          <Tab
            label="Detalhes"
            icon={<Assignment />}
            iconPosition="start"
          />
          <Tab
            label="Timeline"
            icon={<History />}
            iconPosition="start"
          />
          <Tab
            label="Julgamentos"
            icon={<Gavel />}
            iconPosition="start"
          />
          <Tab
            label="Documentos"
            icon={<AttachFile />}
            iconPosition="start"
          />
        </Tabs>

        <TabPanel value={currentTab} index={0}>
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <Card variant="outlined">
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    Informações do Processo
                  </Typography>
                  <List>
                    <ListItem>
                      <ListItemText primary="Protocolo" secondary={impugnation.protocolo} />
                    </ListItem>
                    <Divider />
                    <ListItem>
                      <ListItemText primary="Tipo" secondary={impugnation.tipo} />
                    </ListItem>
                    <Divider />
                    <ListItem>
                      <ListItemText primary="Eleição" secondary={impugnation.eleicaoNome} />
                    </ListItem>
                    {impugnation.chapaAlvoNome && (
                      <>
                        <Divider />
                        <ListItem>
                          <ListItemText primary="Chapa Alvo" secondary={impugnation.chapaAlvoNome} />
                        </ListItem>
                      </>
                    )}
                    {impugnation.membroAlvo && (
                      <>
                        <Divider />
                        <ListItem>
                          <ListItemText primary="Membro Alvo" secondary={impugnation.membroAlvo} />
                        </ListItem>
                      </>
                    )}
                  </List>
                </CardContent>
              </Card>
            </Grid>
            
            <Grid item xs={12} md={6}>
              <Card variant="outlined">
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    Requerente
                  </Typography>
                  {impugnation.requerente.anonimo ? (
                    <Alert severity="info">
                      Impugnação Anônima
                    </Alert>
                  ) : (
                    <List>
                      <ListItem>
                        <ListItemIcon>
                          <Person />
                        </ListItemIcon>
                        <ListItemText 
                          primary={impugnation.requerente.nome}
                          secondary={`CPF: ${impugnation.requerente.cpf}`}
                        />
                      </ListItem>
                      <Divider />
                      <ListItem>
                        <ListItemText 
                          primary="Contato" 
                          secondary={`${impugnation.requerente.email} • ${impugnation.requerente.telefone}`}
                        />
                      </ListItem>
                    </List>
                  )}
                </CardContent>
              </Card>
            </Grid>
            
            <Grid item xs={12}>
              <Card variant="outlined">
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    Descrição da Impugnação
                  </Typography>
                  <Typography variant="body1" paragraph>
                    {impugnation.descricao}
                  </Typography>
                  
                  {impugnation.observacoes && (
                    <>
                      <Typography variant="h6" gutterBottom sx={{ mt: 2 }}>
                        Observações
                      </Typography>
                      <Alert severity="info">
                        {impugnation.observacoes}
                      </Alert>
                    </>
                  )}
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </TabPanel>

        <TabPanel value={currentTab} index={1}>
          <Typography variant="h6" gutterBottom>
            Timeline do Processo
          </Typography>
          
          <div>
            {impugnation.timeline.map((event, index) => (
              <div key={event.id}>
                <div>
                  <div>
                    {getTimelineIcon(event.status)}
                  </div>
                  {index < impugnation.timeline.length - 1 && }
                </div>
                <div>
                  <Box sx={{ mb: 2 }}>
                    <Typography variant="h6">
                      {event.evento}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {format(event.data, "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })} • {event.responsavel}
                    </Typography>
                    <Typography variant="body1" sx={{ mt: 1 }}>
                      {event.descricao}
                    </Typography>
                  </Box>
                </div>
              </div>
            ))}
          </div>
        </TabPanel>

        <TabPanel value={currentTab} index={2}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
            <Typography variant="h6">
              Histórico de Julgamentos
            </Typography>
            {impugnation.status === 'Em Julgamento' && (
              <Button
                variant="contained"
                onClick={handleJudgment}
                startIcon={<Gavel />}
              >
                Novo Julgamento
              </Button>
            )}
          </Box>
          
          {impugnation.julgamentos.length > 0 ? (
            impugnation.julgamentos.map((julgamento) => (
              <Accordion key={julgamento.id} sx={{ mb: 2 }}>
                <AccordionSummary expandIcon={<ExpandMore />}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, width: '100%' }}>
                    <Box sx={{ flex: 1 }}>
                      <Typography variant="h6">
                        {julgamento.instancia} - {format(julgamento.data, 'dd/MM/yyyy', { locale: ptBR })}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Relator: {julgamento.juiz}
                      </Typography>
                    </Box>
                    <Chip
                      label={julgamento.decisao}
                      color={getDecisaoColor(julgamento.decisao) as any}
                      size="small"
                    />
                  </Box>
                </AccordionSummary>
                <AccordionDetails>
                  <Grid container spacing={3}>
                    <Grid item xs={12} md={8}>
                      <Typography variant="subtitle2" gutterBottom>
                        Fundamentação:
                      </Typography>
                      <Typography variant="body1" paragraph>
                        {julgamento.fundamentacao}
                      </Typography>
                    </Grid>
                    <Grid item xs={12} md={4}>
                      <Typography variant="subtitle2" gutterBottom>
                        Votação:
                      </Typography>
                      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                          <Typography variant="body2">A favor:</Typography>
                          <Typography variant="body2" fontWeight="bold">{julgamento.votos.favor}</Typography>
                        </Box>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                          <Typography variant="body2">Contra:</Typography>
                          <Typography variant="body2" fontWeight="bold">{julgamento.votos.contra}</Typography>
                        </Box>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                          <Typography variant="body2">Abstenções:</Typography>
                          <Typography variant="body2" fontWeight="bold">{julgamento.votos.abstencoes}</Typography>
                        </Box>
                        <Divider />
                        <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                          <Typography variant="body2" fontWeight="bold">Total:</Typography>
                          <Typography variant="body2" fontWeight="bold">
                            {julgamento.votos.favor + julgamento.votos.contra + julgamento.votos.abstencoes}
                          </Typography>
                        </Box>
                      </Box>
                    </Grid>
                  </Grid>
                </AccordionDetails>
              </Accordion>
            ))
          ) : (
            <Box sx={{ textAlign: 'center', py: 4 }}>
              <Gavel sx={{ fontSize: 48, color: 'grey.400', mb: 2 }} />
              <Typography variant="body1" color="text.secondary">
                Nenhum julgamento realizado ainda.
              </Typography>
            </Box>
          )}
        </TabPanel>

        <TabPanel value={currentTab} index={3}>
          <Typography variant="h6" gutterBottom>
            Documentos do Processo
          </Typography>
          
          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Nome do Documento</TableCell>
                  <TableCell>Tipo</TableCell>
                  <TableCell>Data de Upload</TableCell>
                  <TableCell align="center">Ações</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {impugnation.documentos.map((doc) => (
                  <TableRow key={doc.id}>
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <AttachFile fontSize="small" />
                        {doc.nome}
                      </Box>
                    </TableCell>
                    <TableCell>{doc.tipo}</TableCell>
                    <TableCell>
                      {format(doc.dataUpload, 'dd/MM/yyyy HH:mm', { locale: ptBR })}
                    </TableCell>
                    <TableCell align="center">
                      <IconButton size="small">
                        <Visibility fontSize="small" />
                      </IconButton>
                      <IconButton size="small">
                        <GetApp fontSize="small" />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </TabPanel>
      </Paper>

      {/* Judgment Dialog */}
      <Dialog open={openJudgmentDialog} onClose={() => setOpenJudgmentDialog(false)} maxWidth="md" fullWidth>
        <DialogTitle>Novo Julgamento</DialogTitle>
        <DialogContent>
          <Grid container spacing={3} sx={{ mt: 1 }}>
            <Grid item xs={12}>
              <FormControl fullWidth required>
                <InputLabel>Decisão</InputLabel>
                <Select
                  value={judgmentForm.decisao}
                  label="Decisão"
                  onChange={(e) => setJudgmentForm({ ...judgmentForm, decisao: e.target.value })}
                >
                  <MenuItem value="Procedente">Procedente</MenuItem>
                  <MenuItem value="Improcedente">Improcedente</MenuItem>
                  <MenuItem value="Parcialmente Procedente">Parcialmente Procedente</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            
            <Grid item xs={12}>
              <TextField
                fullWidth
                multiline
                rows={6}
                label="Fundamentação"
                value={judgmentForm.fundamentacao}
                onChange={(e) => setJudgmentForm({ ...judgmentForm, fundamentacao: e.target.value })}
                required
                placeholder="Fundamente a decisão tomada, citando os dispositivos legais aplicáveis..."
              />
            </Grid>
            
            <Grid item xs={12}>
              <Typography variant="h6" gutterBottom>
                Resultado da Votação
              </Typography>
            </Grid>
            
            <Grid item xs={12} md={4}>
              <TextField
                fullWidth
                type="number"
                label="Votos a Favor"
                value={judgmentForm.votosFavor}
                onChange={(e) => setJudgmentForm({ ...judgmentForm, votosFavor: parseInt(e.target.value) || 0 })}
                inputProps={{ min: 0 }}
              />
            </Grid>
            
            <Grid item xs={12} md={4}>
              <TextField
                fullWidth
                type="number"
                label="Votos Contra"
                value={judgmentForm.votosContra}
                onChange={(e) => setJudgmentForm({ ...judgmentForm, votosContra: parseInt(e.target.value) || 0 })}
                inputProps={{ min: 0 }}
              />
            </Grid>
            
            <Grid item xs={12} md={4}>
              <TextField
                fullWidth
                type="number"
                label="Abstenções"
                value={judgmentForm.abstencoes}
                onChange={(e) => setJudgmentForm({ ...judgmentForm, abstencoes: parseInt(e.target.value) || 0 })}
                inputProps={{ min: 0 }}
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenJudgmentDialog(false)}>Cancelar</Button>
          <Button 
            onClick={handleSaveJudgment} 
            variant="contained"
            disabled={!judgmentForm.decisao || !judgmentForm.fundamentacao}
          >
            Salvar Julgamento
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default ImpugnationDetail;