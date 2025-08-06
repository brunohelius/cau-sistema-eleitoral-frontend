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
  LinearProgress,
  CircularProgress,
} from '@mui/material';
import {
  ArrowBack,
  GetApp,
  Refresh,
  Share,
  Print,
  BarChart,
  PieChart,
  
  TrendingUp,
  TrendingDown,
  CheckCircle,
  Warning,
  Error,
  Info,
} from '@mui/icons-material';
import { useParams, useNavigate } from 'react-router-dom';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import {
  BarChart as RechartsBarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  PieChart as RechartsPieChart,
  Cell,
  Pie,
  LineChart,
  Line,
  ResponsiveContainer,
  Area,
  AreaChart,
} from 'recharts';

interface ChartData {
  name: string;
  value: number;
  percentage?: number;
  status?: string;
  trend?: 'up' | 'down' | 'stable';
}

interface Metric {
  id: string;
  title: string;
  value: number | string;
  change?: number;
  trend?: 'up' | 'down' | 'stable';
  format?: 'number' | 'percentage' | 'currency' | 'text';
  color?: 'primary' | 'success' | 'warning' | 'error';
}

interface Report {
  id: string;
  titulo: string;
  tipo: 'Eleitoral' | 'Financeiro' | 'Operacional' | 'Compliance' | 'Auditoria';
  descricao: string;
  periodo: {
    inicio: Date;
    fim: Date;
  };
  status: 'Gerando' | 'Concluido' | 'Erro' | 'Agendado';
  dataGeracao: Date;
  ultimaAtualizacao: Date;
  responsavel: string;
  eleicaoId?: string;
  eleicaoNome?: string;
  metricas: Metric[];
  graficos: {
    barras: ChartData[];
    pizza: ChartData[];
    linha: ChartData[];
    area: ChartData[];
  };
  tabelas: {
    resumo: any[];
    detalhes: any[];
  };
  observacoes?: string;
  anexos?: string[];
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
      id={`report-tabpanel-${index}`}
      aria-labelledby={`report-tab-${index}`}
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

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d'];

export const ReportDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [currentTab, setCurrentTab] = useState(0);
  const [report, setReport] = useState<Report | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Mock data - replace with API call
  useEffect(() => {
    const mockReport: Report = {
      id: id || '1',
      titulo: 'Relatório de Acompanhamento Eleitoral - Março 2024',
      tipo: 'Eleitoral',
      descricao: 'Relatório detalhado do progresso das eleições do CAU/BR 2024, incluindo estatCsticas de chapas registradas, processos em andamento, cronograma de atividades e indicadores de performance.',
      periodo: {
        inicio: new Date('2024-03-01'),
        fim: new Date('2024-03-31'),
      },
      status: 'Concluido',
      dataGeracao: new Date('2024-03-31T23:59:59'),
      ultimaAtualizacao: new Date('2024-04-01T08:30:00'),
      responsavel: 'Ana Costa - Secretária Eleitoral',
      eleicaoId: '1',
      eleicaoNome: 'Eleições CAU/BR 2024',
      metricas: [
        {
          id: '1',
          title: 'Chapas Registradas',
          value: 12,
          change: 20,
          trend: 'up',
          format: 'number',
          color: 'success',
        },
        {
          id: '2',
          title: 'Processos Ativos',
          value: 8,
          change: -12.5,
          trend: 'down',
          format: 'number',
          color: 'warning',
        },
        {
          id: '3',
          title: 'Taxa de Aprovação',
          value: '85%',
          change: 5.2,
          trend: 'up',
          format: 'percentage',
          color: 'success',
        },
        {
          id: '4',
          title: 'Prazos em Dia',
          value: '92%',
          change: 2.1,
          trend: 'up',
          format: 'percentage',
          color: 'primary',
        },
      ],
      graficos: {
        barras: [
          { name: 'Jan', value: 4, status: 'Concluído' },
          { name: 'Fev', value: 7, status: 'Em Andamento' },
          { name: 'Mar', value: 12, status: 'Concluído' },
          { name: 'Abr', value: 8, status: 'Planejado' },
          { name: 'Mai', value: 6, status: 'Planejado' },
          { name: 'Jun', value: 3, status: 'Planejado' },
        ],
        pizza: [
          { name: 'Aprovadas', value: 75, percentage: 62.5 },
          { name: 'Em Análise', value: 25, percentage: 20.8 },
          { name: 'Rejeitadas', value: 15, percentage: 12.5 },
          { name: 'Pendentes', value: 5, percentage: 4.2 },
        ],
        linha: [
          { name: 'Sem 1', value: 20 },
          { name: 'Sem 2', value: 35 },
          { name: 'Sem 3', value: 45 },
          { name: 'Sem 4', value: 38 },
          { name: 'Sem 5', value: 52 },
        ],
        area: [
          { name: 'Jan', value: 100 },
          { name: 'Fev', value: 180 },
          { name: 'Mar', value: 250 },
          { name: 'Abr', value: 320 },
          { name: 'Mai', value: 280 },
          { name: 'Jun', value: 350 },
        ],
      },
      tabelas: {
        resumo: [
          {
            item: 'Total de Chapas',
            valor: 12,
            meta: 15,
            status: 'Em Progresso',
            responsavel: 'Comissão Eleitoral',
          },
          {
            item: 'Processos Julgados',
            valor: 23,
            meta: 25,
            status: 'No Prazo',
            responsavel: 'Comissão Disciplinar',
          },
          {
            item: 'Recursos Analisados',
            valor: 8,
            meta: 10,
            status: 'Em Progresso',
            responsavel: 'Comissão Recursal',
          },
          {
            item: 'Reuniões Realizadas',
            valor: 15,
            meta: 12,
            status: 'Superado',
            responsavel: 'Todas as Comissões',
          },
        ],
        detalhes: [
          {
            protocolo: 'CHA-001-2024',
            tipo: 'Registro',
            descricao: 'Chapa Renovação CAU',
            data: new Date('2024-02-01'),
            status: 'Aprovado',
            responsavel: 'Dr. Carlos Mendes',
          },
          {
            protocolo: 'IMP-002-2024',
            tipo: 'Impugnação',
            descricao: 'Impugnação Chapa 01',
            data: new Date('2024-02-15'),
            status: 'Em Julgamento',
            responsavel: 'Arq. Ana Santos',
          },
          {
            protocolo: 'REC-003-2024',
            tipo: 'Recurso',
            descricao: 'Recurso contra indeferimento',
            data: new Date('2024-03-01'),
            status: 'Julgado',
            responsavel: 'Urb. Roberto Silva',
          },
        ],
      },
      observacoes: 'O processo eleitoral está transcorrendo dentro da normalidade, com todos os prazos sendo cumpridos adequadamente. Recomenda-se manter o acompanhamento mensal para garantir a continuidade do cronograma.',
      anexos: [
        'cronograma_eleitoral_2024.pdf',
        'atas_reunioes_comissao.pdf',
        'planilha_detalhada_processos.xlsx',
      ],
    };
    setReport(mockReport);
    setLoading(false);
  }, [id]);

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setCurrentTab(newValue);
  };

  const handleRefresh = () => {
    setRefreshing(true);
    // Simulate API call
    setTimeout(() => {
      setRefreshing(false);
      if (report) {
        setReport({
          ...report,
          ultimaAtualizacao: new Date(),
        });
      }
    }, 2000);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Concluido': case 'Aprovado': case 'Superado': case 'No Prazo': return 'success';
      case 'Em Andamento': case 'Em Julgamento': case 'Em Progresso': return 'warning';
      case 'Erro': case 'Rejeitado': case 'Atrasado': return 'error';
      case 'Agendado': case 'Planejado': return 'info';
      default: return 'default';
    }
  };

  const getTrendIcon = (trend?: string) => {
    switch (trend) {
      case 'up': return <TrendingUp color="success" fontSize="small" />;
      case 'down': return <TrendingDown color="error" fontSize="small" />;
      default: return null;
    }
  };

  const formatValue = (value: number | string, format?: string) => {
    if (format === 'percentage') {
      return typeof value === 'number' ? `${value}%` : value;
    }
    if (format === 'currency') {
      return typeof value === 'number' ? `R$ ${value.toLocaleString()}` : value;
    }
    return value.toLocaleString();
  };

  const getTipoColor = (tipo: string) => {
    switch (tipo) {
      case 'Eleitoral': return 'primary';
      case 'Financeiro': return 'success';
      case 'Operacional': return 'info';
      case 'Compliance': return 'warning';
      case 'Auditoria': return 'error';
      default: return 'default';
    }
  };

  if (loading || !report) {
    return (
      <Box sx={{ p: 3, display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  const progressPercentage = report.status === 'Concluido' ? 100 : report.status === 'Gerando' ? 45 : 0;

  return (
    <Box sx={{ p: 3 }}>
      {/* Header */}
      <Box sx={{ mb: 3, display: 'flex', alignItems: 'center', gap: 2 }}>
        <IconButton onClick={() => navigate('/relatorios')}>
          <ArrowBack />
        </IconButton>
        <Box sx={{ flex: 1 }}>
          <Typography variant="h4" gutterBottom>
            {report.titulo}
          </Typography>
          <Typography variant="body1" color="text.secondary">
            {report.tipo} • Período: {format(report.periodo.inicio, 'dd/MM/yyyy', { locale: ptBR })} - {format(report.periodo.fim, 'dd/MM/yyyy', { locale: ptBR })}
            {report.eleicaoNome && ` • ${report.eleicaoNome}`}
          </Typography>
        </Box>
        <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
          <Chip
            label={report.tipo}
            color={getTipoColor(report.tipo) as any}
            size="small"
          />
          <Chip
            label={report.status}
            color={getStatusColor(report.status) as any}
            variant="filled"
          />
        </Box>
        <Button
          startIcon={refreshing ? <CircularProgress size={16} /> : <Refresh />}
          variant="outlined"
          onClick={handleRefresh}
          disabled={refreshing}
        >
          Atualizar
        </Button>
        <Button
          startIcon={<GetApp />}
          variant="contained"
        >
          Exportar
        </Button>
      </Box>

      {/* Progress Bar for generating reports */}
      {report.status === 'Gerando' && (
        <Box sx={{ mb: 3 }}>
          <Alert severity="info" sx={{ mb: 2 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <CircularProgress size={16} />
              <Typography variant="body2">
                Gerando relatório... Isso pode levar alguns minutos.
              </Typography>
            </Box>
          </Alert>
          <LinearProgress variant="determinate" value={progressPercentage} />
        </Box>
      )}

      {/* Summary Cards */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        {report.metricas.map((metrica) => (
          <Grid item xs={12} md={3} key={metrica.id}>
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <Box sx={{ flex: 1 }}>
                    <Typography color="text.secondary" gutterBottom variant="body2">
                      {metrica.title}
                    </Typography>
                    <Typography variant="h4" color={`${metrica.color}.main`}>
                      {formatValue(metrica.value, metrica.format)}
                    </Typography>
                    {metrica.change !== undefined && (
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mt: 1 }}>
                        {getTrendIcon(metrica.trend)}
                        <Typography 
                          variant="body2" 
                          color={metrica.trend === 'up' ? 'success.main' : metrica.trend === 'down' ? 'error.main' : 'text.secondary'}
                        >
                          {metrica.change > 0 ? '+' : ''}{metrica.change}%
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          vs. período anterior
                        </Typography>
                      </Box>
                    )}
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* Report Info Card */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Grid container spacing={3}>
            <Grid item xs={12} md={8}>
              <Typography variant="h6" gutterBottom>
                Sobre este Relatório
              </Typography>
              <Typography variant="body1" paragraph>
                {report.descricao}
              </Typography>
            </Grid>
            <Grid item xs={12} md={4}>
              <Typography variant="h6" gutterBottom>
                Informações Gerais
              </Typography>
              <List dense>
                <ListItem>
                  <ListItemText 
                    primary="Data de Geração" 
                    secondary={format(report.dataGeracao, "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}
                  />
                </ListItem>
                <ListItem>
                  <ListItemText 
                    primary="Última Atualização" 
                    secondary={format(report.ultimaAtualizacao, "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}
                  />
                </ListItem>
                <ListItem>
                  <ListItemText 
                    primary="Responsável" 
                    secondary={report.responsavel}
                  />
                </ListItem>
              </List>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* Tabs */}
      <Paper sx={{ width: '100%' }}>
        <Tabs
          value={currentTab}
          onChange={handleTabChange}
          aria-label="report-tabs"
          variant="scrollable"
          scrollButtons="auto"
        >
          <Tab
            label="Gráficos"
            icon={<BarChart />}
            iconPosition="start"
          />
          <Tab
            label="Tabelas"
            icon={<Timeline />}
            iconPosition="start"
          />
          <Tab
            label="Análises"
            icon={<PieChart />}
            iconPosition="start"
          />
        </Tabs>

        <TabPanel value={currentTab} index={0}>
          <Grid container spacing={3}>
            {/* Bar Chart */}
            <Grid item xs={12} md={6}>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    Chapas Registradas por Mês
                  </Typography>
                  <ResponsiveContainer width="100%" height={300}>
                    <RechartsBarChart data={report.graficos.barras}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Bar dataKey="value" fill="#8884d8" />
                    </RechartsBarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </Grid>

            {/* Pie Chart */}
            <Grid item xs={12} md={6}>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    Status das Chapas
                  </Typography>
                  <ResponsiveContainer width="100%" height={300}>
                    <RechartsPieChart>
                      <Pie
                        data={report.graficos.pizza}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={(entry) => `${entry.name}: ${entry.percentage}%`}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                      >
                        {report.graficos.pizza.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </RechartsPieChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </Grid>

            {/* Line Chart */}
            <Grid item xs={12} md={6}>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    Tendência Semanal de Processos
                  </Typography>
                  <ResponsiveContainer width="100%" height={300}>
                    <LineChart data={report.graficos.linha}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Line type="monotone" dataKey="value" stroke="#8884d8" strokeWidth={2} />
                    </LineChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </Grid>

            {/* Area Chart */}
            <Grid item xs={12} md={6}>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    Crescimento Acumulado de Atividades
                  </Typography>
                  <ResponsiveContainer width="100%" height={300}>
                    <AreaChart data={report.graficos.area}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" />
                      <YAxis />
                      <Tooltip />
                      <Area type="monotone" dataKey="value" stroke="#8884d8" fill="#8884d8" fillOpacity={0.6} />
                    </AreaChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </TabPanel>

        <TabPanel value={currentTab} index={1}>
          <Grid container spacing={3}>
            {/* Summary Table */}
            <Grid item xs={12}>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    Resumo de Atividades
                  </Typography>
                  <TableContainer>
                    <Table>
                      <TableHead>
                        <TableRow>
                          <TableCell>Item</TableCell>
                          <TableCell align="right">Realizado</TableCell>
                          <TableCell align="right">Meta</TableCell>
                          <TableCell>Status</TableCell>
                          <TableCell>Responsável</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {report.tabelas.resumo.map((row, index) => (
                          <TableRow key={index}>
                            <TableCell>{row.item}</TableCell>
                            <TableCell align="right">{row.valor}</TableCell>
                            <TableCell align="right">{row.meta}</TableCell>
                            <TableCell>
                              <Chip
                                label={row.status}
                                color={getStatusColor(row.status) as any}
                                size="small"
                              />
                            </TableCell>
                            <TableCell>{row.responsavel}</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </TableContainer>
                </CardContent>
              </Card>
            </Grid>

            {/* Details Table */}
            <Grid item xs={12}>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    Detalhamento de Processos
                  </Typography>
                  <TableContainer>
                    <Table>
                      <TableHead>
                        <TableRow>
                          <TableCell>Protocolo</TableCell>
                          <TableCell>Tipo</TableCell>
                          <TableCell>Descrição</TableCell>
                          <TableCell>Data</TableCell>
                          <TableCell>Status</TableCell>
                          <TableCell>Responsável</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {report.tabelas.detalhes.map((row, index) => (
                          <TableRow key={index}>
                            <TableCell>
                              <Typography variant="body2" fontWeight="bold">
                                {row.protocolo}
                              </Typography>
                            </TableCell>
                            <TableCell>{row.tipo}</TableCell>
                            <TableCell>{row.descricao}</TableCell>
                            <TableCell>
                              {format(row.data, 'dd/MM/yyyy', { locale: ptBR })}
                            </TableCell>
                            <TableCell>
                              <Chip
                                label={row.status}
                                color={getStatusColor(row.status) as any}
                                size="small"
                              />
                            </TableCell>
                            <TableCell>{row.responsavel}</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </TableContainer>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </TabPanel>

        <TabPanel value={currentTab} index={2}>
          <Grid container spacing={3}>
            {/* Key Insights */}
            <Grid item xs={12} md={6}>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    Principais Indicadores
                  </Typography>
                  <List>
                    <ListItem>
                      <ListItemIcon>
                        <CheckCircle color="success" />
                      </ListItemIcon>
                      <ListItemText 
                        primary="Taxa de Aprovação Alta"
                        secondary="85% das chapas foram aprovadas, superando a meta de 80%"
                      />
                    </ListItem>
                    <Divider />
                    <ListItem>
                      <ListItemIcon>
                        <TrendingUp color="success" />
                      </ListItemIcon>
                      <ListItemText 
                        primary="Crescimento de Registros"
                        secondary="20% de aumento no número de chapas registradas em relação ao mês anterior"
                      />
                    </ListItem>
                    <Divider />
                    <ListItem>
                      <ListItemIcon>
                        <Warning color="warning" />
                      </ListItemIcon>
                      <ListItemText 
                        primary="Atenção aos Prazos"
                        secondary="8 processos ainda estão em andamento e requerem acompanhamento"
                      />
                    </ListItem>
                    <Divider />
                    <ListItem>
                      <ListItemIcon>
                        <Info color="info" />
                      </ListItemIcon>
                      <ListItemText 
                        primary="Performance Geral"
                        secondary="92% dos prazos estão sendo cumpridos adequadamente"
                      />
                    </ListItem>
                  </List>
                </CardContent>
              </Card>
            </Grid>

            {/* Recommendations */}
            <Grid item xs={12} md={6}>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    Recomendações
                  </Typography>
                  <List>
                    <ListItem>
                      <ListItemText 
                        primary="1. Manter Cronograma"
                        secondary="Continuar seguindo o cronograma estabelecido para garantir o sucesso das eleições"
                      />
                    </ListItem>
                    <Divider />
                    <ListItem>
                      <ListItemText 
                        primary="2. Acompanhar Processos Ativos"
                        secondary="Intensificar o monitoramento dos 8 processos em andamento para evitar atrasos"
                      />
                    </ListItem>
                    <Divider />
                    <ListItem>
                      <ListItemText 
                        primary="3. Preparar para Próxima Fase"
                        secondary="Iniciar preparações para a fase de votação com base no cronograma"
                      />
                    </ListItem>
                    <Divider />
                    <ListItem>
                      <ListItemText 
                        primary="4. Comunicação"
                        secondary="Manter comunicação transparente com todas as partes interessadas"
                      />
                    </ListItem>
                  </List>
                </CardContent>
              </Card>
            </Grid>

            {/* Observations */}
            {report.observacoes && (
              <Grid item xs={12}>
                <Alert severity="info">
                  <Typography variant="h6" gutterBottom>
                    Observações
                  </Typography>
                  <Typography variant="body1">
                    {report.observacoes}
                  </Typography>
                </Alert>
              </Grid>
            )}

            {/* Attachments */}
            {report.anexos && report.anexos.length > 0 && (
              <Grid item xs={12}>
                <Card>
                  <CardContent>
                    <Typography variant="h6" gutterBottom>
                      Anexos ({report.anexos.length})
                    </Typography>
                    <List>
                      {report.anexos.map((anexo, index) => (
                        <ListItem key={index}>
                          <ListItemIcon>
                            <GetApp />
                          </ListItemIcon>
                          <ListItemText primary={anexo} />
                          <Button size="small" startIcon={<GetApp />}>
                            Download
                          </Button>
                        </ListItem>
                      ))}
                    </List>
                  </CardContent>
                </Card>
              </Grid>
            )}
          </Grid>
        </TabPanel>
      </Paper>

      {/* Action Buttons */}
      <Box sx={{ mt: 3, display: 'flex', gap: 2, justifyContent: 'flex-end' }}>
        <Button startIcon={<Print />} variant="outlined">
          Imprimir
        </Button>
        <Button startIcon={<Share />} variant="outlined">
          Compartilhar
        </Button>
        <Button startIcon={<GetApp />} variant="contained">
          Exportar PDF
        </Button>
      </Box>
    </Box>
  );
};

export default ReportDetail;