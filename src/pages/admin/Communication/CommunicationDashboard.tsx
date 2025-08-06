import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Grid,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
  LinearProgress,
  Alert,
  Tabs,
  Tab,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  MenuItem
} from '@mui/material';
import {
  Email,
  NotificationsActive,
  Send,
  Error,
  CheckCircle,
  Schedule,
  TrendingUp,
  Refresh
} from '@mui/icons-material';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { communicationApi, EmailLog, Notification } from '../../../services/api/communicationApi';
import { LoadingButton } from '@mui/lab';

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel({ children, value, index, ...other }: TabPanelProps) {
  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`dashboard-tabpanel-${index}`}
      aria-labelledby={`dashboard-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
    </div>
  );
}

interface EmailStats {
  total: number;
  sent: number;
  failed: number;
  pending: number;
  successRate: number;
}

interface NotificationStats {
  total: number;
  unread: number;
  read: number;
  byType: { [key: string]: number };
}

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8'];

export const CommunicationDashboard: React.FC = () => {
  const [tabValue, setTabValue] = useState(0);
  const [loading, setLoading] = useState(false);
  
  // Estados dos dados
  const [emailLogs, setEmailLogs] = useState<EmailLog[]>([]);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [emailStats, setEmailStats] = useState<EmailStats>({
    total: 0,
    sent: 0,
    failed: 0,
    pending: 0,
    successRate: 0
  });

  // Estados dos filtros
  const [dateFrom, setDateFrom] = useState<string>(
    new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
  );
  const [dateTo, setDateTo] = useState<string>(
    new Date().toISOString().split('T')[0]
  );

  // Dados para gráficos
  const [emailTrendData, setEmailTrendData] = useState<any[]>([]);
  const [templateUsageData, setTemplateUsageData] = useState<any[]>([]);
  const [notificationTypeData, setNotificationTypeData] = useState<any[]>([]);

  useEffect(() => {
    loadDashboardData();
  }, [dateFrom, dateTo]);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      
      // Carregar logs de email
      const logs = await communicationApi.getEmailLogs({
        from: dateFrom,
        to: dateTo
      });
      setEmailLogs(logs);

      // Carregar notificações
      const notifs = await communicationApi.getNotifications();
      setNotifications(notifs);

      // Calcular estatísticas
      calculateEmailStats(logs);
      prepareChartData(logs, notifs);

    } catch (error) {
      console.error('Erro ao carregar dados do dashboard:', error);
    } finally {
      setLoading(false);
    }
  };

  const calculateEmailStats = (logs: EmailLog[]) => {
    const total = logs.length;
    const sent = logs.filter(log => log.status === 'Sent').length;
    const failed = logs.filter(log => log.status === 'Failed').length;
    const pending = logs.filter(log => log.status === 'Pending' || log.status === 'Queued').length;
    const successRate = total > 0 ? (sent / total) * 100 : 0;

    setEmailStats({
      total,
      sent,
      failed,
      pending,
      successRate
    });
  };

  const prepareChartData = (logs: EmailLog[], notifs: Notification[]) => {
    // Dados de tendência de emails (últimos 7 dias)
    const last7Days = Array.from({ length: 7 }, (_, i) => {
      const date = new Date();
      date.setDate(date.getDate() - (6 - i));
      return date.toISOString().split('T')[0];
    });

    const trendData = last7Days.map(date => {
      const dayLogs = logs.filter(log => 
        new Date(log.createdAt).toISOString().split('T')[0] === date
      );
      
      return {
        date: new Date(date).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' }),
        sent: dayLogs.filter(log => log.status === 'Sent').length,
        failed: dayLogs.filter(log => log.status === 'Failed').length,
        total: dayLogs.length
      };
    });
    setEmailTrendData(trendData);

    // Dados de uso por template
    const templateUsage: { [key: string]: number } = {};
    logs.forEach(log => {
      if (log.jobType) {
        templateUsage[log.jobType] = (templateUsage[log.jobType] || 0) + 1;
      }
    });
    
    const templateData = Object.entries(templateUsage)
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10);
    setTemplateUsageData(templateData);

    // Dados de notificações por tipo
    const typeCount: { [key: string]: number } = {};
    notifs.forEach(notif => {
      typeCount[notif.type] = (typeCount[notif.type] || 0) + 1;
    });

    const notificationData = Object.entries(typeCount)
      .map(([name, value]) => ({ name, value }));
    setNotificationTypeData(notificationData);
  };

  const getStatusColor = (status: string): 'default' | 'primary' | 'secondary' | 'error' | 'warning' | 'info' | 'success' => {
    const colorMap: Record<string, any> = {
      'Sent': 'success',
      'Failed': 'error',
      'Pending': 'warning',
      'Queued': 'info'
    };
    return colorMap[status] || 'default';
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('pt-BR');
  };

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" component="h1" gutterBottom>
        Dashboard de Comunicação
      </Typography>

      {/* Filtros */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Box sx={{ display: 'flex', gap: 2, alignItems: 'center', flexWrap: 'wrap' }}>
            <TextField
              type="date"
              label="Data Inicial"
              value={dateFrom}
              onChange={(e) => setDateFrom(e.target.value)}
              InputLabelProps={{ shrink: true }}
            />
            <TextField
              type="date"
              label="Data Final"
              value={dateTo}
              onChange={(e) => setDateTo(e.target.value)}
              InputLabelProps={{ shrink: true }}
            />
            <LoadingButton
              onClick={loadDashboardData}
              loading={loading}
              variant="contained"
              startIcon={<Refresh />}
            >
              Atualizar
            </LoadingButton>
          </Box>
        </CardContent>
      </Card>

      {/* Cards de Estatísticas */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                <Email sx={{ mr: 1, color: 'primary.main' }} />
                <Typography variant="h6">Total de Emails</Typography>
              </Box>
              <Typography variant="h3">{emailStats.total}</Typography>
              <Typography color="textSecondary" variant="body2">
                Últimos {Math.ceil((new Date(dateTo).getTime() - new Date(dateFrom).getTime()) / (1000 * 60 * 60 * 24))} dias
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                <CheckCircle sx={{ mr: 1, color: 'success.main' }} />
                <Typography variant="h6">Emails Enviados</Typography>
              </Box>
              <Typography variant="h3" color="success.main">
                {emailStats.sent}
              </Typography>
              <LinearProgress
                variant="determinate"
                value={emailStats.successRate}
                sx={{ mt: 1 }}
                color="success"
              />
              <Typography variant="body2" color="textSecondary">
                {emailStats.successRate.toFixed(1)}% taxa de sucesso
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                <Error sx={{ mr: 1, color: 'error.main' }} />
                <Typography variant="h6">Emails Falhos</Typography>
              </Box>
              <Typography variant="h3" color="error.main">
                {emailStats.failed}
              </Typography>
              <Typography color="textSecondary" variant="body2">
                {emailStats.total > 0 ? ((emailStats.failed / emailStats.total) * 100).toFixed(1) : 0}% do total
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                <Schedule sx={{ mr: 1, color: 'warning.main' }} />
                <Typography variant="h6">Emails Pendentes</Typography>
              </Box>
              <Typography variant="h3" color="warning.main">
                {emailStats.pending}
              </Typography>
              <Typography color="textSecondary" variant="body2">
                Na fila de processamento
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Tabs para diferentes seções */}
      <Card>
        <Tabs value={tabValue} onChange={(e, newValue) => setTabValue(newValue)}>
          <Tab label="Gráficos e Análises" />
          <Tab label="Logs de Email" />
          <Tab label="Notificações" />
        </Tabs>

        <TabPanel value={tabValue} index={0}>
          <Grid container spacing={3}>
            {/* Gráfico de Tendência de Emails */}
            <Grid item xs={12} lg={6}>
              <Typography variant="h6" gutterBottom>
                Tendência de Emails (Últimos 7 dias)
              </Typography>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={emailTrendData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Line type="monotone" dataKey="sent" stroke="#4caf50" name="Enviados" />
                  <Line type="monotone" dataKey="failed" stroke="#f44336" name="Falhas" />
                </LineChart>
              </ResponsiveContainer>
            </Grid>

            {/* Gráfico de Uso por Template */}
            <Grid item xs={12} lg={6}>
              <Typography variant="h6" gutterBottom>
                Templates Mais Utilizados
              </Typography>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={templateUsageData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis 
                    dataKey="name" 
                    angle={-45}
                    textAnchor="end"
                    height={100}
                  />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="count" fill="#2196f3" />
                </BarChart>
              </ResponsiveContainer>
            </Grid>

            {/* Gráfico de Notificações por Tipo */}
            <Grid item xs={12} lg={6}>
              <Typography variant="h6" gutterBottom>
                Notificações por Tipo
              </Typography>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={notificationTypeData}
                    cx="50%"
                    cy="50%"
                    outerRadius={100}
                    fill="#8884d8"
                    dataKey="value"
                    label={(entry) => `${entry.name}: ${entry.value}`}
                  >
                    {notificationTypeData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </Grid>

            {/* Alert de Performance */}
            <Grid item xs={12}>
              {emailStats.successRate < 90 && emailStats.total > 10 && (
                <Alert severity="warning" sx={{ mb: 2 }}>
                  <Typography variant="h6">Atenção: Taxa de Sucesso Baixa</Typography>
                  A taxa de sucesso dos emails está em {emailStats.successRate.toFixed(1)}%.
                  Recomendamos verificar as configurações de SMTP e os logs de erro.
                </Alert>
              )}
              
              {emailStats.pending > 100 && (
                <Alert severity="info">
                  <Typography variant="h6">Fila de Emails Grande</Typography>
                  Há {emailStats.pending} emails pendentes na fila. 
                  Considere verificar o processamento dos jobs em background.
                </Alert>
              )}
            </Grid>
          </Grid>
        </TabPanel>

        <TabPanel value={tabValue} index={1}>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Para</TableCell>
                  <TableCell>Assunto</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Tentativas</TableCell>
                  <TableCell>Data de Criação</TableCell>
                  <TableCell>Data de Envio</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {emailLogs.slice(0, 50).map((log) => (
                  <TableRow key={log.id}>
                    <TableCell>{log.to}</TableCell>
                    <TableCell>
                      <Typography variant="body2" noWrap sx={{ maxWidth: 200 }}>
                        {log.subject}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={log.status}
                        size="small"
                        color={getStatusColor(log.status)}
                      />
                    </TableCell>
                    <TableCell>{log.attempts}</TableCell>
                    <TableCell>{formatDate(log.createdAt)}</TableCell>
                    <TableCell>
                      {log.sentAt ? formatDate(log.sentAt) : '-'}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
          
          {emailLogs.length > 50 && (
            <Box sx={{ mt: 2, textAlign: 'center' }}>
              <Typography variant="body2" color="textSecondary">
                Mostrando os 50 registros mais recentes de {emailLogs.length} total
              </Typography>
            </Box>
          )}
        </TabPanel>

        <TabPanel value={tabValue} index={2}>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Título</TableCell>
                  <TableCell>Mensagem</TableCell>
                  <TableCell>Tipo</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Data</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {notifications.slice(0, 50).map((notification) => (
                  <TableRow key={notification.id}>
                    <TableCell>{notification.title}</TableCell>
                    <TableCell>
                      <Typography variant="body2" noWrap sx={{ maxWidth: 300 }}>
                        {notification.message}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={notification.type}
                        size="small"
                        color={
                          notification.type === 'Success' ? 'success' :
                          notification.type === 'Warning' ? 'warning' :
                          notification.type === 'Error' ? 'error' : 'default'
                        }
                      />
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={notification.isRead ? 'Lida' : 'Não Lida'}
                        size="small"
                        color={notification.isRead ? 'default' : 'primary'}
                      />
                    </TableCell>
                    <TableCell>{formatDate(notification.createdAt)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </TabPanel>
      </Card>
    </Box>
  );
};

export default CommunicationDashboard;