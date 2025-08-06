import React, { useState, useEffect } from 'react';
import {
  Container,
  Typography,
  Grid,
  Card,
  CardContent,
  Box,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Avatar,
  Chip,
  Button,
  Tabs,
  Tab,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Divider,
  Alert,
  LinearProgress,
  IconButton,
  Tooltip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions
} from '@mui/material';
import {
  EmojiEvents as TrophyIcon,
  Groups as GroupsIcon,
  Person as PersonIcon,
  LocationOn as LocationIcon,
  CalendarMonth as CalendarIcon,
  Assessment as AssessmentIcon,
  Download as DownloadIcon,
  Share as ShareIcon,
  Print as PrintIcon,
  BarChart as ChartIcon,
  PieChart as PieChartIcon,
  Visibility as VisibilityIcon,
  CheckCircle as CheckCircleIcon,
  Info as InfoIcon,
  Warning as WarningIcon,
  Timeline as TimelineIcon
} from '@mui/icons-material';
import { useParams, useNavigate } from 'react-router-dom';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
  LineChart,
  Line,
  Area,
  AreaChart
} from 'recharts';

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
      id={`resultado-tabpanel-${index}`}
      aria-labelledby={`resultado-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ py: 3 }}>{children}</Box>}
    </div>
  );
}

// Mock data for election results
const mockEleicaoResult = {
  id: 1,
  titulo: 'Eleições CAU Nacional 2024',
  descricao: 'Eleição para o Conselho de Arquitetura e Urbanismo Nacional',
  tipoEleicao: 'Nacional',
  ano: 2024,
  dataInicio: new Date('2024-06-01'),
  dataFim: new Date('2024-06-07'),
  situacao: 'Finalizada',
  
  // Voting statistics
  estatisticas: {
    totalEleitores: 12450,
    totalVotantes: 10287,
    totalVotos: 10287,
    votosValidos: 9854,
    votosBrancos: 298,
    votosNulos: 135,
    abstencoes: 2163,
    participacao: 82.6
  },
  
  // Results by chapa
  resultados: [
    {
      id: 1,
      nomeChapa: 'Renovação CAU',
      numero: 1,
      votos: 4521,
      percentual: 45.9,
      situacao: 'Eleita',
      cor: '#4CAF50',
      membros: [
        {
          nome: 'Dr. Roberto Silva',
          cargo: 'Presidente',
          cau: 'A12345-6',
          foto: '/avatars/roberto.jpg'
        },
        {
          nome: 'Arq. Maria Santos',
          cargo: 'Vice-Presidente',
          cau: 'A67890-1',
          foto: '/avatars/maria.jpg'
        },
        {
          nome: 'Eng. Carlos Lima',
          cargo: 'Conselheiro Titular',
          cau: 'A11111-2',
          foto: '/avatars/carlos.jpg'
        }
      ]
    },
    {
      id: 2,
      nomeChapa: 'Progresso Profissional',
      numero: 2,
      votos: 3201,
      percentual: 32.5,
      situacao: 'Não Eleita',
      cor: '#2196F3',
      membros: [
        {
          nome: 'Arq. Ana Costa',
          cargo: 'Presidente',
          cau: 'A22222-3',
          foto: '/avatars/ana.jpg'
        },
        {
          nome: 'Urb. João Oliveira',
          cargo: 'Vice-Presidente',
          cau: 'A33333-4',
          foto: '/avatars/joao.jpg'
        }
      ]
    },
    {
      id: 3,
      nomeChapa: 'União dos Arquitetos',
      numero: 3,
      votos: 2132,
      percentual: 21.6,
      situacao: 'Não Eleita',
      cor: '#FF9800',
      membros: [
        {
          nome: 'Arq. Pedro Ferreira',
          cargo: 'Presidente',
          cau: 'A44444-5',
          foto: '/avatars/pedro.jpg'
        }
      ]
    }
  ],
  
  // Timeline of voting process
  timeline: [
    {
      data: new Date('2024-05-01'),
      evento: 'Abertura das Inscrições',
      status: 'concluido'
    },
    {
      data: new Date('2024-05-15'),
      evento: 'Prazo Final para Registro de Chapas',
      status: 'concluido'
    },
    {
      data: new Date('2024-05-20'),
      evento: 'Início do Período de Campanha',
      status: 'concluido'
    },
    {
      data: new Date('2024-06-01'),
      evento: 'Início da Votação Eletrônica',
      status: 'concluido'
    },
    {
      data: new Date('2024-06-07'),
      evento: 'Encerramento da Votação',
      status: 'concluido'
    },
    {
      data: new Date('2024-06-08'),
      evento: 'Divulgação dos Resultados',
      status: 'concluido'
    }
  ],
  
  // Regional breakdown (for national elections)
  resultadosRegionais: [
    { regiao: 'Norte', votos: 1205, participacao: 78.5 },
    { regiao: 'Nordeste', votos: 2340, participacao: 85.2 },
    { regiao: 'Centro-Oeste', votos: 980, participacao: 81.3 },
    { regiao: 'Sudeste', votos: 4200, participacao: 83.7 },
    { regiao: 'Sul', votos: 1562, participacao: 79.9 }
  ],
  
  // Hourly voting pattern
  votacaoHoraria: [
    { hora: '08:00', votos: 245 },
    { hora: '09:00', votos: 567 },
    { hora: '10:00', votos: 892 },
    { hora: '11:00', votos: 1234 },
    { hora: '12:00', votos: 987 },
    { hora: '13:00', votos: 654 },
    { hora: '14:00', votos: 1456 },
    { hora: '15:00', votos: 1789 },
    { hora: '16:00', votos: 1923 },
    { hora: '17:00', votos: 1540 }
  ]
};

const COLORS = ['#4CAF50', '#2196F3', '#FF9800', '#9C27B0', '#F44336'];

export const ResultadosDetailPage: React.FC = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState(0);
  const [selectedChapa, setSelectedChapa] = useState<any>(null);
  const [chapaDialog, setChapaDialog] = useState(false);

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setActiveTab(newValue);
  };

  const handleViewChapa = (chapa: any) => {
    setSelectedChapa(chapa);
    setChapaDialog(true);
  };

  // Prepare chart data
  const chartData = mockEleicaoResult.resultados.map(r => ({
    nome: r.nomeChapa,
    votos: r.votos,
    percentual: r.percentual,
    fill: r.cor
  }));

  const votingStatsData = [
    { name: 'Votos Válidos', value: mockEleicaoResult.estatisticas.votosValidos, color: '#4CAF50' },
    { name: 'Votos Brancos', value: mockEleicaoResult.estatisticas.votosBrancos, color: '#FFC107' },
    { name: 'Votos Nulos', value: mockEleicaoResult.estatisticas.votosNulos, color: '#F44336' },
    { name: 'Abstenções', value: mockEleicaoResult.estatisticas.abstencoes, color: '#9E9E9E' }
  ];

  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      {/* Header */}
      <Box mb={4}>
        <Box display="flex" justifyContent="space-between" alignItems="flex-start" mb={2}>
          <Box>
            <Button 
              variant="text" 
              onClick={() => navigate('/resultados')}
              sx={{ mb: 1, p: 0 }}
            >
              ← Voltar aos Resultados
            </Button>
            <Typography variant="h3" component="h1" gutterBottom fontWeight="bold">
              {mockEleicaoResult.titulo}
            </Typography>
            <Box display="flex" alignItems="center" gap={2} flexWrap="wrap">
              <Chip
                icon={<CheckCircleIcon />}
                label={mockEleicaoResult.situacao}
                color="success"
              />
              <Box display="flex" alignItems="center" gap={1}>
                <CalendarIcon sx={{ fontSize: 16, color: 'text.secondary' }} />
                <Typography variant="body2" color="textSecondary">
                  {format(mockEleicaoResult.dataInicio, 'dd/MM/yyyy', { locale: ptBR })} - 
                  {format(mockEleicaoResult.dataFim, 'dd/MM/yyyy', { locale: ptBR })}
                </Typography>
              </Box>
              <Box display="flex" alignItems="center" gap={1}>
                <LocationIcon sx={{ fontSize: 16, color: 'text.secondary' }} />
                <Typography variant="body2" color="textSecondary">
                  {mockEleicaoResult.tipoEleicao}
                </Typography>
              </Box>
            </Box>
          </Box>
          
          <Box display="flex" gap={1}>
            <Tooltip title="Imprimir">
              <IconButton onClick={() => window.print()}>
                <PrintIcon />
              </IconButton>
            </Tooltip>
            <Tooltip title="Compartilhar">
              <IconButton>
                <ShareIcon />
              </IconButton>
            </Tooltip>
            <Button
              variant="outlined"
              startIcon={<DownloadIcon />}
              disabled
            >
              Relatório PDF
            </Button>
          </Box>
        </Box>
      </Box>

      {/* Winner Announcement */}
      <Alert 
        severity="success" 
        icon={<TrophyIcon />} 
        sx={{ mb: 4, fontSize: '1.1rem', fontWeight: 'bold' }}
      >
        <Box>
          <Typography variant="h6" component="div" fontWeight="bold">
            🏆 CHAPA VENCEDORA: {mockEleicaoResult.resultados[0].nomeChapa}
          </Typography>
          <Typography variant="body2">
            {mockEleicaoResult.resultados[0].votos.toLocaleString()} votos 
            ({mockEleicaoResult.resultados[0].percentual}% dos votos válidos)
          </Typography>
        </Box>
      </Alert>

      {/* Key Statistics */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent sx={{ textAlign: 'center' }}>
              <GroupsIcon sx={{ fontSize: 40, color: 'primary.main', mb: 1 }} />
              <Typography variant="h4" fontWeight="bold" color="primary.main">
                {mockEleicaoResult.estatisticas.totalEleitores.toLocaleString()}
              </Typography>
              <Typography variant="body2" color="textSecondary">
                Eleitores Habilitados
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent sx={{ textAlign: 'center' }}>
              <CheckCircleIcon sx={{ fontSize: 40, color: 'success.main', mb: 1 }} />
              <Typography variant="h4" fontWeight="bold" color="success.main">
                {mockEleicaoResult.estatisticas.totalVotantes.toLocaleString()}
              </Typography>
              <Typography variant="body2" color="textSecondary">
                Compareceram
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent sx={ { textAlign: 'center' }}>
              <AssessmentIcon sx={{ fontSize: 40, color: 'info.main', mb: 1 }} />
              <Typography variant="h4" fontWeight="bold" color="info.main">
                {mockEleicaoResult.estatisticas.participacao}%
              </Typography>
              <Typography variant="body2" color="textSecondary">
                Participação
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent sx={{ textAlign: 'center' }}>
              <TrophyIcon sx={{ fontSize: 40, color: 'warning.main', mb: 1 }} />
              <Typography variant="h4" fontWeight="bold" color="warning.main">
                {mockEleicaoResult.resultados.length}
              </Typography>
              <Typography variant="body2" color="textSecondary">
                Chapas Participantes
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Tabs */}
      <Paper sx={{ mb: 2 }}>
        <Tabs value={activeTab} onChange={handleTabChange}>
          <Tab icon={<TrophyIcon />} label="Resultados por Chapa" />
          <Tab icon={<ChartIcon />} label="Gráficos e Análises" />
          <Tab icon={<LocationIcon />} label="Análise Regional" />
          <Tab icon={<TimelineIcon />} label="Timeline da Eleição" />
          <Tab icon={<InfoIcon />} label="Informações Técnicas" />
        </Tabs>
      </Paper>

      {/* Tab Panels */}
      <Paper>
        {/* Results by Chapa Tab */}
        <TabPanel value={activeTab} index={0}>
          <Grid container spacing={3}>
            {mockEleicaoResult.resultados.map((chapa, index) => (
              <Grid item xs={12} key={chapa.id}>
                <Card 
                  variant={index === 0 ? 'elevation' : 'outlined'}
                  sx={{ 
                    border: index === 0 ? '2px solid #4CAF50' : undefined,
                    bgcolor: index === 0 ? 'success.light' : undefined
                  }}
                >
                  <CardContent>
                    <Grid container spacing={3} alignItems="center">
                      {/* Position and Basic Info */}
                      <Grid item xs={12} md={3}>
                        <Box display="flex" alignItems="center" gap={2}>
                          <Box 
                            sx={{
                              width: 60,
                              height: 60,
                              borderRadius: '50%',
                              bgcolor: chapa.cor,
                              color: 'white',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              fontSize: '1.5rem',
                              fontWeight: 'bold'
                            }}
                          >
                            {chapa.numero}
                          </Box>
                          <Box>
                            <Typography variant="h6" fontWeight="bold">
                              {chapa.nomeChapa}
                            </Typography>
                            <Chip
                              label={chapa.situacao}
                              color={chapa.situacao === 'Eleita' ? 'success' : 'default'}
                              size="small"
                              icon={chapa.situacao === 'Eleita' ? <TrophyIcon /> : undefined}
                            />
                          </Box>
                        </Box>
                      </Grid>
                      
                      {/* Vote Count and Percentage */}
                      <Grid item xs={12} md={3}>
                        <Box textAlign="center">
                          <Typography variant="h4" fontWeight="bold" color={chapa.cor}>
                            {chapa.votos.toLocaleString()}
                          </Typography>
                          <Typography variant="body2" color="textSecondary">
                            votos recebidos
                          </Typography>
                          <Typography variant="h5" fontWeight="bold" mt={1}>
                            {chapa.percentual}%
                          </Typography>
                        </Box>
                      </Grid>
                      
                      {/* Progress Bar */}
                      <Grid item xs={12} md={4}>
                        <Box>
                          <Box display="flex" justifyContent="space-between" mb={1}>
                            <Typography variant="body2">Percentual de Votos</Typography>
                            <Typography variant="body2" fontWeight="bold">
                              {chapa.percentual}%
                            </Typography>
                          </Box>
                          <LinearProgress 
                            variant="determinate" 
                            value={chapa.percentual} 
                            sx={{ 
                              height: 10, 
                              borderRadius: 5,
                              bgcolor: 'grey.200',
                              '& .MuiLinearProgress-bar': {
                                bgcolor: chapa.cor
                              }
                            }} 
                          />
                        </Box>
                      </Grid>
                      
                      {/* Actions */}
                      <Grid item xs={12} md={2}>
                        <Box textAlign="center">
                          <Button
                            variant="outlined"
                            startIcon={<VisibilityIcon />}
                            onClick={() => handleViewChapa(chapa)}
                            fullWidth
                          >
                            Ver Detalhes
                          </Button>
                        </Box>
                      </Grid>
                    </Grid>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        </TabPanel>

        {/* Charts and Analysis Tab */}
        <TabPanel value={activeTab} index={1}>
          <Grid container spacing={4}>
            {/* Votes by Chapa - Bar Chart */}
            <Grid item xs={12} md={6}>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom fontWeight="bold">
                    Votos por Chapa
                  </Typography>
                  <Box height={300}>
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={chartData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis 
                          dataKey="nome" 
                          angle={-45}
                          textAnchor="end"
                          height={80}
                          fontSize={12}
                        />
                        <YAxis />
                        <RechartsTooltip />
                        <Bar dataKey="votos" fill={(entry: any) => entry.fill} />
                      </BarChart>
                    </ResponsiveContainer>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
            
            {/* Vote Distribution - Pie Chart */}
            <Grid item xs={12} md={6}>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom fontWeight="bold">
                    Distribuição de Votos
                  </Typography>
                  <Box height={300}>
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={chartData}
                          cx="50%"
                          cy="50%"
                          labelLine={false}
                          label={({ nome, percentual }) => `${nome}: ${percentual}%`}
                          outerRadius={80}
                          fill="#8884d8"
                          dataKey="votos"
                        >
                          {chartData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.fill} />
                          ))}
                        </Pie>
                        <RechartsTooltip />
                      </PieChart>
                    </ResponsiveContainer>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
            
            {/* Voting Statistics */}
            <Grid item xs={12} md={6}>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom fontWeight="bold">
                    Estatísticas de Votação
                  </Typography>
                  <Box height={300}>
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={votingStatsData}
                          cx="50%"
                          cy="50%"
                          labelLine={false}
                          label={({ name, value }) => `${name}: ${value.toLocaleString()}`}
                          outerRadius={80}
                          fill="#8884d8"
                          dataKey="value"
                        >
                          {votingStatsData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Pie>
                        <RechartsTooltip />
                      </PieChart>
                    </ResponsiveContainer>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
            
            {/* Hourly Voting Pattern */}
            <Grid item xs={12} md={6}>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom fontWeight="bold">
                    Padrão de Votação por Hora
                  </Typography>
                  <Box height={300}>
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={mockEleicaoResult.votacaoHoraria}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="hora" />
                        <YAxis />
                        <RechartsTooltip />
                        <Area 
                          type="monotone" 
                          dataKey="votos" 
                          stroke="#8884d8" 
                          fill="#8884d8" 
                          fillOpacity={0.6} 
                        />
                      </AreaChart>
                    </ResponsiveContainer>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </TabPanel>

        {/* Regional Analysis Tab */}
        <TabPanel value={activeTab} index={2}>
          <Typography variant="h6" gutterBottom fontWeight="bold">
            Participação por Região
          </Typography>
          
          <Grid container spacing={3}>
            {mockEleicaoResult.resultadosRegionais.map((regiao) => (
              <Grid item xs={12} sm={6} md={4} key={regiao.regiao}>
                <Card>
                  <CardContent>
                    <Typography variant="h6" gutterBottom fontWeight="bold">
                      {regiao.regiao}
                    </Typography>
                    <Box display="flex" justifyContent="space-between" mb={2}>
                      <Typography variant="body2" color="textSecondary">
                        Votos:
                      </Typography>
                      <Typography variant="body1" fontWeight="bold">
                        {regiao.votos.toLocaleString()}
                      </Typography>
                    </Box>
                    <Box display="flex" justifyContent="space-between" mb={2}>
                      <Typography variant="body2" color="textSecondary">
                        Participação:
                      </Typography>
                      <Typography variant="body1" fontWeight="bold">
                        {regiao.participacao}%
                      </Typography>
                    </Box>
                    <LinearProgress 
                      variant="determinate" 
                      value={regiao.participacao} 
                      sx={{ height: 8, borderRadius: 4 }}
                    />
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        </TabPanel>

        {/* Timeline Tab */}
        <TabPanel value={activeTab} index={3}>
          <Typography variant="h6" gutterBottom fontWeight="bold">
            Cronologia do Processo Eleitoral
          </Typography>
          
          <Box mt={3}>
            {mockEleicaoResult.timeline.map((evento, index) => (
              <Box key={index} display="flex" alignItems="center" mb={3}>
                <Box 
                  sx={{
                    width: 12,
                    height: 12,
                    borderRadius: '50%',
                    bgcolor: 'success.main',
                    mr: 2
                  }} 
                />
                <Box 
                  sx={{
                    width: 2,
                    height: 40,
                    bgcolor: 'divider',
                    mr: 2
                  }}
                />
                <Box>
                  <Typography variant="subtitle1" fontWeight="bold">
                    {evento.evento}
                  </Typography>
                  <Typography variant="body2" color="textSecondary">
                    {format(evento.data, 'dd/MM/yyyy', { locale: ptBR })}
                  </Typography>
                </Box>
              </Box>
            ))}
          </Box>
        </TabPanel>

        {/* Technical Information Tab */}
        <TabPanel value={activeTab} index={4}>
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom fontWeight="bold">
                    Informações Técnicas
                  </Typography>
                  <List>
                    <ListItem>
                      <ListItemText
                        primary="Sistema de Votação"
                        secondary="Eletrônico com certificação digital"
                      />
                    </ListItem>
                    <ListItem>
                      <ListItemText
                        primary="Período de Votação"
                        secondary={`${format(mockEleicaoResult.dataInicio, 'dd/MM/yyyy HH:mm', { locale: ptBR })} - ${format(mockEleicaoResult.dataFim, 'dd/MM/yyyy HH:mm', { locale: ptBR })}`}
                      />
                    </ListItem>
                    <ListItem>
                      <ListItemText
                        primary="Modalidade"
                        secondary="Votação 100% eletrônica"
                      />
                    </ListItem>
                    <ListItem>
                      <ListItemText
                        primary="Apuração"
                        secondary="Automática em tempo real"
                      />
                    </ListItem>
                  </List>
                </CardContent>
              </Card>
            </Grid>
            
            <Grid item xs={12} md={6}>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom fontWeight="bold">
                    Validação e Auditoria
                  </Typography>
                  <List>
                    <ListItem>
                      <ListItemIcon>
                        <CheckCircleIcon color="success" />
                      </ListItemIcon>
                      <ListItemText
                        primary="Integridade dos Dados"
                        secondary="Verificada por hash criptográfico"
                      />
                    </ListItem>
                    <ListItem>
                      <ListItemIcon>
                        <CheckCircleIcon color="success" />
                      </ListItemIcon>
                      <ListItemText
                        primary="Auditoria Externa"
                        secondary="Realizada por empresa certificada"
                      />
                    </ListItem>
                    <ListItem>
                      <ListItemIcon>
                        <CheckCircleIcon color="success" />
                      </ListItemIcon>
                      <ListItemText
                        primary="Logs de Sistema"
                        secondary="Armazenados com timestamping"
                      />
                    </ListItem>
                    <ListItem>
                      <ListItemIcon>
                        <CheckCircleIcon color="success" />
                      </ListItemIcon>
                      <ListItemText
                        primary="Certificação Digital"
                        secondary="ICP-Brasil A3"
                      />
                    </ListItem>
                  </List>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </TabPanel>
      </Paper>

      {/* Chapa Details Dialog */}
      <Dialog
        open={chapaDialog}
        onClose={() => setChapaDialog(false)}
        maxWidth="md"
        fullWidth
      >
        {selectedChapa && (
          <>
            <DialogTitle>
              <Box display="flex" alignItems="center" gap={2}>
                <Box 
                  sx={{
                    width: 40,
                    height: 40,
                    borderRadius: '50%',
                    bgcolor: selectedChapa.cor,
                    color: 'white',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '1.2rem',
                    fontWeight: 'bold'
                  }}
                >
                  {selectedChapa.numero}
                </Box>
                <Box>
                  <Typography variant="h6" fontWeight="bold">
                    {selectedChapa.nomeChapa}
                  </Typography>
                  <Typography variant="body2" color="textSecondary">
                    {selectedChapa.votos.toLocaleString()} votos ({selectedChapa.percentual}%)
                  </Typography>
                </Box>
              </Box>
            </DialogTitle>
            <DialogContent>
              <Typography variant="h6" gutterBottom>
                Membros da Chapa
              </Typography>
              <Grid container spacing={2}>
                {selectedChapa.membros.map((membro: any, index: number) => (
                  <Grid item xs={12} sm={6} key={index}>
                    <Card variant="outlined">
                      <CardContent>
                        <Box display="flex" alignItems="center" gap={2}>
                          <Avatar 
                            src={membro.foto}
                            sx={{ width: 60, height: 60 }}
                          >
                            {membro.nome.charAt(0)}
                          </Avatar>
                          <Box>
                            <Typography variant="subtitle1" fontWeight="bold">
                              {membro.nome}
                            </Typography>
                            <Typography variant="body2" color="textSecondary">
                              {membro.cargo}
                            </Typography>
                            <Typography variant="caption" color="textSecondary">
                              CAU: {membro.cau}
                            </Typography>
                          </Box>
                        </Box>
                      </CardContent>
                    </Card>
                  </Grid>
                ))}
              </Grid>
            </DialogContent>
            <DialogActions>
              <Button onClick={() => setChapaDialog(false)}>
                Fechar
              </Button>
            </DialogActions>
          </>
        )}
      </Dialog>
    </Container>
  );
};