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
  Paper,
  IconButton,
  
  
  
  
  
  
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Alert,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Divider,
} from '@mui/material';
import {
  ArrowBack,
  Edit,
  Gavel,
  Assignment,
  History,
  AttachFile,
  ExpandMore,
  CheckCircle,
  Schedule,
  Warning,
  PersonAdd,
  Add,
} from '@mui/icons-material';
import { useParams, useNavigate } from 'react-router-dom';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface Complaint {
  id: string;
  numero: string;
  titulo: string;
  descricao: string;
  tipo: 'Conduta' | 'Eleitoral' | 'Administrativa';
  status: 'Aberta' | 'Em Analise' | 'Julgada' | 'Arquivada';
  dataAbertura: Date;
  denunciante: string;
  denunciado: string;
  relator?: string;
  instancia: '1ª Instância' | '2ª Instância';
  prazoDefesa?: Date;
  anexos: string[];
}

interface HistoryItem {
  id: string;
  data: Date;
  acao: string;
  usuario: string;
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
      id={`complaint-tabpanel-${index}`}
      aria-labelledby={`complaint-tab-${index}`}
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

export const ComplaintDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [currentTab, setCurrentTab] = useState(0);
  const [complaint, setComplaint] = useState<Complaint | null>(null);
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [openJudgmentDialog, setOpenJudgmentDialog] = useState(false);
  const [judgmentForm, setJudgmentForm] = useState({
    decisao: '',
    fundamentacao: '',
    observacoes: '',
  });

  // Mock data - replace with API call
  useEffect(() => {
    const mockComplaint: Complaint = {
      id: id || '1',
      numero: 'DEN/2024/001',
      titulo: 'Denúncia contra irregularidades na chapa 02',
      descricao: 'Relato de possível irregularidade na composição da chapa eleitoral, com indicação de documentos fraudulentos apresentados pelo candidato a presidente.',
      tipo: 'Eleitoral',
      status: 'Em Analise',
      dataAbertura: new Date('2024-02-10'),
      denunciante: 'Ana Silva',
      denunciado: 'Chapa 02 - Renovação CAU',
      relator: 'Dr. Carlos Santos',
      instancia: '1ª Instância',
      prazoDefesa: new Date('2024-03-10'),
      anexos: ['documento1.pdf', 'evidencia.jpg', 'depoimento.pdf'],
    };

    const mockHistory: HistoryItem[] = [
      {
        id: '1',
        data: new Date('2024-02-10'),
        acao: 'Denúncia protocolada',
        usuario: 'Sistema',
        observacoes: 'Denúncia recebida e numerada automaticamente',
      },
      {
        id: '2',
        data: new Date('2024-02-12'),
        acao: 'Relator designado',
        usuario: 'Secretaria',
        observacoes: 'Dr. Carlos Santos designado como relator',
      },
      {
        id: '3',
        data: new Date('2024-02-15'),
        acao: 'Notificação para defesa',
        usuario: 'Dr. Carlos Santos',
        observacoes: 'Prazo de 30 dias para apresentação de defesa',
      },
    ];

    setComplaint(mockComplaint);
    setHistory(mockHistory);
    setLoading(false);
  }, [id]);

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setCurrentTab(newValue);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Julgada': return 'success';
      case 'Em Analise': return 'warning';
      case 'Aberta': return 'info';
      case 'Arquivada': return 'default';
      default: return 'default';
    }
  };

  const getTipoColor = (tipo: string) => {
    switch (tipo) {
      case 'Eleitoral': return 'primary';
      case 'Conduta': return 'error';
      case 'Administrativa': return 'secondary';
      default: return 'default';
    }
  };

  const handleJudgment = () => {
    console.log('Judgment submitted:', judgmentForm);
    // Here you would make the API call to submit the judgment
    setOpenJudgmentDialog(false);
    // Update complaint status
    if (complaint) {
      setComplaint({ ...complaint, status: 'Julgada' });
    }
  };

  if (loading || !complaint) {
    return (
      <Box sx={{ p: 3 }}>
        <Typography>Carregando...</Typography>
      </Box>
    );
  }

  const isOverdue = complaint.prazoDefesa && complaint.prazoDefesa < new Date();

  return (
    <Box sx={{ p: 3 }}>
      {/* Header */}
      <Box sx={{ mb: 3, display: 'flex', alignItems: 'center', gap: 2 }}>
        <IconButton onClick={() => navigate('/denuncias')}>
          <ArrowBack />
        </IconButton>
        <Box sx={{ flex: 1 }}>
          <Typography variant="h4" gutterBottom>
            {complaint.numero}
          </Typography>
          <Typography variant="body1" color="text.secondary">
            {complaint.titulo}
          </Typography>
        </Box>
        <Chip
          label={complaint.tipo}
          color={getTipoColor(complaint.tipo) as any}
          variant="outlined"
        />
        <Chip
          label={complaint.status}
          color={getStatusColor(complaint.status) as any}
          variant="filled"
        />
        <Button
          startIcon={<Gavel />}
          variant="contained"
          onClick={() => setOpenJudgmentDialog(true)}
          disabled={complaint.status === 'Julgada'}
        >
          Julgar
        </Button>
      </Box>

      {/* Status Alert */}
      {isOverdue && (
        <Alert severity="warning" sx={{ mb: 3 }}>
          O prazo para defesa venceu em {format(complaint.prazoDefesa!, 'dd/MM/yyyy', { locale: ptBR })}.
        </Alert>
      )}

      {/* Summary Cards */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12} md={3}>
          <Card>
            <CardContent>
              <Typography color="text.secondary" gutterBottom>
                Data de Abertura
              </Typography>
              <Typography variant="h6">
                {format(complaint.dataAbertura, 'dd/MM/yyyy', { locale: ptBR })}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={3}>
          <Card>
            <CardContent>
              <Typography color="text.secondary" gutterBottom>
                Instância
              </Typography>
              <Typography variant="h6">
                {complaint.instancia}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={3}>
          <Card>
            <CardContent>
              <Typography color="text.secondary" gutterBottom>
                Relator
              </Typography>
              <Typography variant="h6">
                {complaint.relator || 'Não designado'}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={3}>
          <Card>
            <CardContent>
              <Typography color="text.secondary" gutterBottom>
                Anexos
              </Typography>
              <Typography variant="h6">
                {complaint.anexos.length}
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
          aria-label="complaint-tabs"
          variant="scrollable"
          scrollButtons="auto"
        >
          <Tab
            label="Detalhes"
            icon={<Assignment />}
            iconPosition="start"
          />
          <Tab
            label="Histórico"
            icon={<History />}
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
            <Grid item xs={12} md={8}>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    Descrição da Denúncia
                  </Typography>
                  <Typography variant="body1" paragraph>
                    {complaint.descricao}
                  </Typography>
                  
                  <Divider sx={{ my: 2 }} />
                  
                  <Grid container spacing={2}>
                    <Grid item xs={12} md={6}>
                      <Typography variant="subtitle2" color="text.secondary">
                        Denunciante
                      </Typography>
                      <Typography variant="body1">
                        {complaint.denunciante}
                      </Typography>
                    </Grid>
                    <Grid item xs={12} md={6}>
                      <Typography variant="subtitle2" color="text.secondary">
                        Denunciado
                      </Typography>
                      <Typography variant="body1">
                        {complaint.denunciado}
                      </Typography>
                    </Grid>
                  </Grid>
                </CardContent>
              </Card>
            </Grid>
            
            <Grid item xs={12} md={4}>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    Informações do Processo
                  </Typography>
                  <List>
                    <ListItem>
                      <ListItemIcon>
                        <Schedule />
                      </ListItemIcon>
                      <ListItemText
                        primary="Prazo para Defesa"
                        secondary={complaint.prazoDefesa ? format(complaint.prazoDefesa, 'dd/MM/yyyy', { locale: ptBR }) : 'Não definido'}
                      />
                    </ListItem>
                    <ListItem>
                      <ListItemIcon>
                        <PersonAdd />
                      </ListItemIcon>
                      <ListItemText
                        primary="Relator"
                        secondary={complaint.relator || 'Não designado'}
                      />
                    </ListItem>
                    <ListItem>
                      <ListItemIcon>
                        <Gavel />
                      </ListItemIcon>
                      <ListItemText
                        primary="Instância"
                        secondary={complaint.instancia}
                      />
                    </ListItem>
                  </List>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </TabPanel>

        <TabPanel value={currentTab} index={1}>
          <Typography variant="h6" gutterBottom>
            Histórico do Processo
          </Typography>
          <div>
            {history.map((item, index) => (
              <div key={item.id}>
                <div>
                  <div>
                    {index === 0 && <CheckCircle />}
                  </div>
                  {index < history.length - 1 && }
                </div>
                <div>
                  <Card variant="outlined" sx={{ mb: 2 }}>
                    <CardContent>
                      <Typography variant="h6">
                        {item.acao}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {format(item.data, 'dd/MM/yyyy HH:mm', { locale: ptBR })} - {item.usuario}
                      </Typography>
                      {item.observacoes && (
                        <Typography variant="body2" sx={{ mt: 1 }}>
                          {item.observacoes}
                        </Typography>
                      )}
                    </CardContent>
                  </Card>
                </div>
              </div>
            ))}
          </div>
        </TabPanel>

        <TabPanel value={currentTab} index={2}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
            <Typography variant="h6">
              Documentos Anexos
            </Typography>
            <Button startIcon={<Add />} variant="outlined">
              Adicionar Documento
            </Button>
          </Box>
          
          <Grid container spacing={2}>
            {complaint.anexos.map((anexo, index) => (
              <Grid item xs={12} md={4} key={index}>
                <Card variant="outlined">
                  <CardContent>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <AttachFile />
                      <Typography variant="body1">
                        {anexo}
                      </Typography>
                    </Box>
                    <Button size="small" sx={{ mt: 1 }}>
                      Download
                    </Button>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        </TabPanel>
      </Paper>

      {/* Judgment Dialog */}
      <Dialog open={openJudgmentDialog} onClose={() => setOpenJudgmentDialog(false)} maxWidth="md" fullWidth>
        <DialogTitle>
          Julgamento da Denúncia {complaint.numero}
        </DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12}>
              <FormControl fullWidth>
                <InputLabel>Decisão</InputLabel>
                <Select
                  value={judgmentForm.decisao}
                  label="Decisão"
                  onChange={(e) => setJudgmentForm({ ...judgmentForm, decisao: e.target.value })}
                >
                  <MenuItem value="procedente">Procedente</MenuItem>
                  <MenuItem value="improcedente">Improcedente</MenuItem>
                  <MenuItem value="parcialmente_procedente">Parcialmente Procedente</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Fundamentação"
                multiline
                rows={4}
                value={judgmentForm.fundamentacao}
                onChange={(e) => setJudgmentForm({ ...judgmentForm, fundamentacao: e.target.value })}
                required
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Observações"
                multiline
                rows={2}
                value={judgmentForm.observacoes}
                onChange={(e) => setJudgmentForm({ ...judgmentForm, observacoes: e.target.value })}
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenJudgmentDialog(false)}>Cancelar</Button>
          <Button onClick={handleJudgment} variant="contained" disabled={!judgmentForm.decisao || !judgmentForm.fundamentacao}>
            Julgar
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default ComplaintDetail;