import React, { FC, useEffect } from 'react';
import {
  Box,
  Grid,
  Card,
  CardContent,
  Typography,
  Paper,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Chip,
  Button,
  Alert,
  CircularProgress,
  LinearProgress,
} from '@mui/material';
import {
  Dashboard as DashboardIcon,
  HowToVote,
  Groups,
  Gavel,
  Assignment,
  TrendingUp,
  Warning,
  CheckCircle,
  Schedule,
  People,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useAppSelector, useAppDispatch } from '../../store/hooks';
import { fetchEleicoes } from '../../store/slices/eleicoesSlice';

interface DashboardStats {
  totalEleicoes: number;
  eleicoesAtivas: number;
  totalChapas: number;
  chapasConfirmadas: number;
  totalDenuncias: number;
  denunciasEmAndamento: number;
  totalImpugnacoes: number;
  impugnacoesEmAndamento: number;
}

const mockStats: DashboardStats = {
  totalEleicoes: 5,
  eleicoesAtivas: 2,
  totalChapas: 74,
  chapasConfirmadas: 68,
  totalDenuncias: 12,
  denunciasEmAndamento: 3,
  totalImpugnacoes: 8,
  impugnacoesEmAndamento: 2,
};

const recentActivities = [
  {
    id: 1,
    type: 'chapa',
    message: 'Nova chapa "Renovação CAU-SP" foi inscrita',
    time: '2 horas atrás',
    icon: <Groups color="primary" />,
  },
  {
    id: 2,
    type: 'denuncia',
    message: 'Denúncia #DN-2024-001 foi analisada',
    time: '4 horas atrás',
    icon: <Gavel color="warning" />,
  },
  {
    id: 3,
    type: 'eleicao',
    message: 'Calendário da Eleição 2024 foi atualizado',
    time: '6 horas atrás',
    icon: <HowToVote color="info" />,
  },
  {
    id: 4,
    type: 'impugnacao',
    message: 'Impugnação #IM-2024-003 foi deferida',
    time: '1 dia atrás',
    icon: <Assignment color="success" />,
  },
];

const pendingTasks = [
  {
    id: 1,
    title: 'Validar documentos da Chapa "União CAU-RJ"',
    priority: 'alta',
    dueDate: 'Hoje',
    category: 'Chapas',
  },
  {
    id: 2,
    title: 'Julgar Denúncia #DN-2024-002',
    priority: 'alta',
    dueDate: 'Amanhã',
    category: 'Denúncias',
  },
  {
    id: 3,
    title: 'Gerar relatório semanal de atividades',
    priority: 'média',
    dueDate: 'Sexta-feira',
    category: 'Relatórios',
  },
  {
    id: 4,
    title: 'Revisar configurações da Comissão Eleitoral',
    priority: 'baixa',
    dueDate: 'Próxima semana',
    category: 'Configurações',
  },
];

export const Dashboard: FC = () => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { user } = useAppSelector((state) => state.auth);
  const { eleicoes, isLoading } = useAppSelector((state) => state.eleicoes);

  useEffect(() => {
    dispatch(fetchEleicoes());
  }, [dispatch]);

  const StatCard: FC<{
    title: string;
    value: number;
    subtitle?: string;
    icon: React.ReactElement;
    color?: 'primary' | 'secondary' | 'success' | 'warning' | 'error';
    onClick?: () => void;
  }> = ({ title, value, subtitle, icon, color = 'primary', onClick }) => (
    <Card 
      sx={{ 
        cursor: onClick ? 'pointer' : 'default',
        '&:hover': onClick ? { boxShadow: 4 } : {},
      }}
      onClick={onClick}
    >
      <CardContent>
        <Box display="flex" alignItems="center" justifyContent="space-between">
          <Box>
            <Typography variant="h4" component="div" color={`${color}.main`}>
              {value}
            </Typography>
            <Typography variant="h6" component="div" gutterBottom>
              {title}
            </Typography>
            {subtitle && (
              <Typography variant="body2" color="text.secondary">
                {subtitle}
              </Typography>
            )}
          </Box>
          <Box color={`${color}.main`}>
            {React.cloneElement(icon, { fontSize: 'large' })}
          </Box>
        </Box>
      </CardContent>
    </Card>
  );

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'alta':
        return 'error';
      case 'média':
        return 'warning';
      case 'baixa':
        return 'info';
      default:
        return 'default';
    }
  };

  return (
    <Box>
      {/* Header */}
      <Box mb={4}>
        <Typography variant="h4" component="h1" gutterBottom>
          Dashboard
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Bem-vindo, {user?.nome}! Aqui está um resumo das atividades do sistema eleitoral.
        </Typography>
      </Box>

      {/* Stats Cards */}
      <Grid container spacing={3} mb={4}>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Eleições"
            value={mockStats.totalEleicoes}
            subtitle={`${mockStats.eleicoesAtivas} ativas`}
            icon={<HowToVote />}
            color="primary"
            onClick={() => navigate('/eleicoes')}
          />
        </Grid>
        
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Chapas"
            value={mockStats.totalChapas}
            subtitle={`${mockStats.chapasConfirmadas} confirmadas`}
            icon={<Groups />}
            color="success"
            onClick={() => navigate('/chapas')}
          />
        </Grid>
        
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Denúncias"
            value={mockStats.totalDenuncias}
            subtitle={`${mockStats.denunciasEmAndamento} em andamento`}
            icon={<Gavel />}
            color="warning"
            onClick={() => navigate('/denuncias')}
          />
        </Grid>
        
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Impugnações"
            value={mockStats.totalImpugnacoes}
            subtitle={`${mockStats.impugnacoesEmAndamento} em andamento`}
            icon={<Assignment />}
            color="error"
            onClick={() => navigate('/impugnacoes')}
          />
        </Grid>
      </Grid>

      <Grid container spacing={3}>
        {/* Recent Activities */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Atividades Recentes
              </Typography>
              
              {isLoading ? (
                <Box display="flex" justifyContent="center" p={2}>
                  <CircularProgress />
                </Box>
              ) : (
                <List>
                  {recentActivities.map((activity) => (
                    <ListItem key={activity.id} divider>
                      <ListItemIcon>
                        {activity.icon}
                      </ListItemIcon>
                      <ListItemText
                        primary={activity.message}
                        secondary={activity.time}
                      />
                    </ListItem>
                  ))}
                </List>
              )}
              
              <Box display="flex" justifyContent="center" mt={2}>
                <Button variant="outlined" onClick={() => navigate('/atividades')}>
                  Ver Todas as Atividades
                </Button>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Pending Tasks */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Tarefas Pendentes
              </Typography>
              
              <List>
                {pendingTasks.map((task) => (
                  <ListItem key={task.id} divider>
                    <ListItemText
                      primary={task.title}
                      secondary={
                        <Box display="flex" alignItems="center" gap={1} mt={1}>
                          <Chip
                            label={task.priority}
                            size="small"
                            color={getPriorityColor(task.priority) as any}
                            variant="outlined"
                          />
                          <Typography variant="caption">
                            {task.category} • {task.dueDate}
                          </Typography>
                        </Box>
                      }
                    />
                  </ListItem>
                ))}
              </List>
              
              <Box display="flex" justifyContent="center" mt={2}>
                <Button variant="outlined" onClick={() => navigate('/tarefas')}>
                  Ver Todas as Tarefas
                </Button>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* System Status */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Status do Sistema
              </Typography>
              
              <Box mb={2}>
                <Box display="flex" justifyContent="space-between" alignItems="center" mb={1}>
                  <Typography variant="body2">Processamento de Chapas</Typography>
                  <Typography variant="body2" color="success.main">
                    92%
                  </Typography>
                </Box>
                <LinearProgress variant="determinate" value={92} color="success" />
              </Box>
              
              <Box mb={2}>
                <Box display="flex" justifyContent="space-between" alignItems="center" mb={1}>
                  <Typography variant="body2">Validação de Membros</Typography>
                  <Typography variant="body2" color="warning.main">
                    78%
                  </Typography>
                </Box>
                <LinearProgress variant="determinate" value={78} color="warning" />
              </Box>
              
              <Box mb={2}>
                <Box display="flex" justifyContent="space-between" alignItems="center" mb={1}>
                  <Typography variant="body2">Processos Judiciais</Typography>
                  <Typography variant="body2" color="info.main">
                    65%
                  </Typography>
                </Box>
                <LinearProgress variant="determinate" value={65} color="info" />
              </Box>

              <Alert severity="info" sx={{ mt: 2 }}>
                Sistema operando normalmente. Última atualização: há 5 minutos.
              </Alert>
            </CardContent>
          </Card>
        </Grid>

        {/* Quick Actions */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Ações Rápidas
              </Typography>
              
              <Grid container spacing={2}>
                <Grid item xs={6}>
                  <Button
                    variant="outlined"
                    fullWidth
                    startIcon={<HowToVote />}
                    onClick={() => navigate('/eleicoes/nova')}
                  >
                    Nova Eleição
                  </Button>
                </Grid>
                
                <Grid item xs={6}>
                  <Button
                    variant="outlined"
                    fullWidth
                    startIcon={<Groups />}
                    onClick={() => navigate('/chapas/nova')}
                  >
                    Nova Chapa
                  </Button>
                </Grid>
                
                <Grid item xs={6}>
                  <Button
                    variant="outlined"
                    fullWidth
                    startIcon={<Gavel />}
                    onClick={() => navigate('/denuncias/nova')}
                  >
                    Nova Denúncia
                  </Button>
                </Grid>
                
                <Grid item xs={6}>
                  <Button
                    variant="outlined"
                    fullWidth
                    startIcon={<Assignment />}
                    onClick={() => navigate('/relatorios')}
                  >
                    Gerar Relatório
                  </Button>
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};