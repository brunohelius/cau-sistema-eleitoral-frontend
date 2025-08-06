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
  Tooltip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
} from '@mui/material';
import {
  ArrowBack,
  Edit,
  CalendarMonth,
  People,
  Assessment,
  Visibility,
  Add,
} from '@mui/icons-material';
import { useParams, useNavigate } from 'react-router-dom';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface Election {
  id: string;
  nome: string;
  descricao: string;
  dataInicio: Date;
  dataFim: Date;
  status: 'Planejamento' | 'Ativa' | 'Concluida' | 'Cancelada';
  tipoEleicao: string;
  totalChapas: number;
  totalVotos: number;
  eleitoresAptos: number;
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
      id={`election-tabpanel-${index}`}
      aria-labelledby={`election-tab-${index}`}
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

export const ElectionDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [currentTab, setCurrentTab] = useState(0);
  const [election, setElection] = useState<Election | null>(null);
  const [loading, setLoading] = useState(true);

  // Mock data - replace with API call
  useEffect(() => {
    const mockElection: Election = {
      id: id || '1',
      nome: 'Eleições CAU/BR 2024',
      descricao: 'Eleições para Conselho de Arquitetura e Urbanismo do Brasil',
      dataInicio: new Date('2024-03-15'),
      dataFim: new Date('2024-04-15'),
      status: 'Ativa',
      tipoEleicao: 'Ordinária',
      totalChapas: 5,
      totalVotos: 1250,
      eleitoresAptos: 2500,
    };
    setElection(mockElection);
    setLoading(false);
  }, [id]);

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setCurrentTab(newValue);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Ativa': return 'success';
      case 'Planejamento': return 'warning';
      case 'Concluida': return 'info';
      case 'Cancelada': return 'error';
      default: return 'default';
    }
  };

  if (loading || !election) {
    return (
      <Box sx={{ p: 3 }}>
        <Typography>Carregando...</Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      {/* Header */}
      <Box sx={{ mb: 3, display: 'flex', alignItems: 'center', gap: 2 }}>
        <IconButton onClick={() => navigate('/eleicoes')}>
          <ArrowBack />
        </IconButton>
        <Box sx={{ flex: 1 }}>
          <Typography variant="h4" gutterBottom>
            {election.nome}
          </Typography>
          <Typography variant="body1" color="text.secondary">
            {election.descricao}
          </Typography>
        </Box>
        <Chip
          label={election.status}
          color={getStatusColor(election.status) as any}
          variant="filled"
        />
        <Button
          startIcon={<Edit />}
          variant="outlined"
        >
          Editar
        </Button>
      </Box>

      {/* Summary Cards */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12} md={3}>
          <Card>
            <CardContent>
              <Typography color="text.secondary" gutterBottom>
                Chapas Registradas
              </Typography>
              <Typography variant="h4">
                {election.totalChapas}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={3}>
          <Card>
            <CardContent>
              <Typography color="text.secondary" gutterBottom>
                Total de Votos
              </Typography>
              <Typography variant="h4">
                {election.totalVotos}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={3}>
          <Card>
            <CardContent>
              <Typography color="text.secondary" gutterBottom>
                Eleitores Aptos
              </Typography>
              <Typography variant="h4">
                {election.eleitoresAptos}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={3}>
          <Card>
            <CardContent>
              <Typography color="text.secondary" gutterBottom>
                Participação
              </Typography>
              <Typography variant="h4">
                {((election.totalVotos / election.eleitoresAptos) * 100).toFixed(1)}%
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
          aria-label="election-tabs"
          variant="scrollable"
          scrollButtons="auto"
        >
          <Tab
            label="Informações Gerais"
            icon={<Visibility />}
            iconPosition="start"
          />
          <Tab
            label="Calendário"
            icon={<CalendarMonth />}
            iconPosition="start"
          />
          <Tab
            label="Chapas"
            icon={<People />}
            iconPosition="start"
          />
          <Tab
            label="Relatórios"
            icon={<Assessment />}
            iconPosition="start"
          />
        </Tabs>

        <TabPanel value={currentTab} index={0}>
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    Detalhes da Eleição
                  </Typography>
                  <Box sx={{ mt: 2 }}>
                    <Typography variant="body2" color="text.secondary">
                      Tipo de Eleição
                    </Typography>
                    <Typography variant="body1" sx={{ mb: 2 }}>
                      {election.tipoEleicao}
                    </Typography>
                    
                    <Typography variant="body2" color="text.secondary">
                      Data de Início
                    </Typography>
                    <Typography variant="body1" sx={{ mb: 2 }}>
                      {format(election.dataInicio, 'dd/MM/yyyy', { locale: ptBR })}
                    </Typography>
                    
                    <Typography variant="body2" color="text.secondary">
                      Data de Término
                    </Typography>
                    <Typography variant="body1">
                      {format(election.dataFim, 'dd/MM/yyyy', { locale: ptBR })}
                    </Typography>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
            
            <Grid item xs={12} md={6}>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    Estatísticas
                  </Typography>
                  <Box sx={{ mt: 2 }}>
                    <Typography variant="body2" color="text.secondary">
                      Status
                    </Typography>
                    <Chip
                      label={election.status}
                      color={getStatusColor(election.status) as any}
                      sx={{ mb: 2 }}
                    />
                    
                    <Typography variant="body2" color="text.secondary">
                      Progresso da Votação
                    </Typography>
                    <Typography variant="h6">
                      {election.totalVotos} de {election.eleitoresAptos} votos
                    </Typography>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </TabPanel>

        <TabPanel value={currentTab} index={1}>
          <Typography variant="h6" gutterBottom>
            Calendário Eleitoral
          </Typography>
          <Button
            startIcon={<Add />}
            variant="contained"
            sx={{ mb: 2 }}
            onClick={() => navigate(`/eleicoes/${id}/calendario/novo`)}
          >
            Adicionar Evento
          </Button>
          <Typography variant="body2" color="text.secondary">
            Cronograma e prazos da eleição serão exibidos aqui.
          </Typography>
        </TabPanel>

        <TabPanel value={currentTab} index={2}>
          <Typography variant="h6" gutterBottom>
            Chapas Registradas
          </Typography>
          <Button
            startIcon={<Add />}
            variant="contained"
            sx={{ mb: 2 }}
            onClick={() => navigate('/chapas/nova')}
          >
            Nova Chapa
          </Button>
          <Typography variant="body2" color="text.secondary">
            Lista de chapas registradas para esta eleição.
          </Typography>
        </TabPanel>

        <TabPanel value={currentTab} index={3}>
          <Typography variant="h6" gutterBottom>
            Relatórios
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Relatórios e estatísticas da eleição.
          </Typography>
        </TabPanel>
      </Paper>
    </Box>
  );
};

export default ElectionDetail;