import React from 'react';
import {
  Container,
  Typography,
  Box,
  Card,
  CardContent,
  Grid,
  Button,
  Avatar,
  Paper,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Chip,
  Divider,
  Alert,
  CardActions,
  CircularProgress
} from '@mui/material';
import {
  Person as PersonIcon,
  HowToVote as VoteIcon,
  Groups as GroupsIcon,
  Assignment as AssignmentIcon,
  Notifications as NotificationsIcon,
  CalendarMonth as CalendarIcon,
  Email as EmailIcon,
  Phone as PhoneIcon,
  Badge as BadgeIcon,
  Edit as EditIcon,
  CheckCircle as CheckCircleIcon,
  Schedule as ScheduleIcon,
  Warning as WarningIcon,
  Assessment as AssessmentIcon
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { useAuth } from '../hooks/useAuth';
import { votacaoService } from '../services/api/votacaoService';
import { format, isAfter, isBefore, differenceInDays } from 'date-fns';
import { ptBR } from 'date-fns/locale';

export const DashboardPage: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  // Buscar eleições disponíveis para votação
  const { data: eleicoesDisponiveis = [], isLoading: loadingEleicoes } = useQuery({
    queryKey: ['eleicoes-disponiveis'],
    queryFn: votacaoService.getEleicoesDisponiveis,
    enabled: !!user
  });

  if (!user) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Alert severity="error">
          Usuário não autenticado. Faça login para acessar o dashboard.
        </Alert>
      </Container>
    );
  }

  // Dados mockados para demonstração + dados reais de votação
  const userStats = {
    chapasCriadas: 2,
    convitesRecebidos: 1,
    processos: 3,
    ultimoAcesso: new Date(),
    eleicoesAtivas: eleicoesDisponiveis.filter(e => e.situacao === 'EmAndamento').length,
    eleicoesPendenteVoto: eleicoesDisponiveis.filter(e => e.podeVotar && !e.jaVotou).length,
    eleicoesVotadas: eleicoesDisponiveis.filter(e => e.jaVotou).length
  };

  // Gerar notificações baseadas nas eleições
  const notifications = [
    ...eleicoesDisponiveis
      .filter(e => e.podeVotar && !e.jaVotou)
      .map(eleicao => {
        const diasRestantes = differenceInDays(new Date(eleicao.dataFim), new Date());
        return {
          id: `vote-${eleicao.id}`,
          type: diasRestantes <= 3 ? 'warning' : 'info',
          message: `${eleicao.titulo} - ${diasRestantes > 0 ? `${diasRestantes} dias restantes` : 'Último dia para votar!'}`,
          date: new Date(eleicao.dataFim)
        };
      }),
    {
      id: 1,
      type: 'info',
      message: 'Nova eleição Nacional 2025 foi publicada',
      date: new Date('2025-01-10')
    },
    {
      id: 2,
      type: 'warning',
      message: 'Prazo para inscrição de chapas termina em 5 dias',
      date: new Date('2025-01-08')
    },
    {
      id: 3,
      type: 'success',
      message: 'Sua chapa "Renovação CAU" foi aprovada',
      date: new Date('2025-01-05')
    }
  ];

  const quickActions = [
    {
      title: 'Criar Nova Chapa',
      description: 'Inicie o processo de criação de uma nova chapa eleitoral',
      icon: <GroupsIcon />,
      action: () => navigate('/criar-chapa'),
      color: 'primary'
    },
    {
      title: 'Votar em Eleições',
      description: `${userStats.eleicoesPendenteVoto} eleições aguardando seu voto`,
      icon: <VoteIcon />,
      action: () => navigate('/eleicoes'),
      color: 'success',
      urgent: userStats.eleicoesPendenteVoto > 0
    },
    {
      title: 'Meus Processos',
      description: 'Acompanhe o status de suas chapas e processos',
      icon: <AssignmentIcon />,
      action: () => navigate('/meus-processos'),
      color: 'info'
    },
    {
      title: 'Calendário Eleitoral',
      description: 'Veja prazos e datas importantes',
      icon: <CalendarIcon />,
      action: () => navigate('/calendarios'),
      color: 'warning'
    }
  ];

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      {/* Header */}
      <Box mb={4}>
        <Typography variant="h3" component="h1" gutterBottom fontWeight="bold">
          Dashboard
        </Typography>
        <Typography variant="h6" color="textSecondary">
          Bem-vindo de volta, {user.nome.split(' ')[0]}!
        </Typography>
      </Box>

      <Grid container spacing={3}>
        {/* Profile Card */}
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Box display="flex" flexDirection="column" alignItems="center" textAlign="center">
                <Avatar
                  sx={{
                    width: 80,
                    height: 80,
                    bgcolor: 'primary.main',
                    fontSize: '2rem',
                    mb: 2
                  }}
                >
                  {user.nome.charAt(0).toUpperCase()}
                </Avatar>
                
                <Typography variant="h6" fontWeight="bold" gutterBottom>
                  {user.nome}
                </Typography>
                
                <Chip
                  label={user.ativo ? 'Ativo' : 'Inativo'}
                  color={user.ativo ? 'success' : 'error'}
                  size="small"
                  sx={{ mb: 2 }}
                />

                <Box width="100%" textAlign="left">
                  <Box display="flex" alignItems="center" mb={1}>
                    <EmailIcon sx={{ fontSize: 16, mr: 1, color: 'text.secondary' }} />
                    <Typography variant="body2" color="textSecondary">
                      {user.email}
                    </Typography>
                  </Box>
                  
                  <Box display="flex" alignItems="center" mb={1}>
                    <BadgeIcon sx={{ fontSize: 16, mr: 1, color: 'text.secondary' }} />
                    <Typography variant="body2" color="textSecondary">
                      CPF: {user.cpf}
                    </Typography>
                  </Box>
                  
                  {user.telefone && (
                    <Box display="flex" alignItems="center" mb={1}>
                      <PhoneIcon sx={{ fontSize: 16, mr: 1, color: 'text.secondary' }} />
                      <Typography variant="body2" color="textSecondary">
                        {user.telefone}
                      </Typography>
                    </Box>
                  )}
                  
                  <Box display="flex" alignItems="center" mb={2}>
                    <PersonIcon sx={{ fontSize: 16, mr: 1, color: 'text.secondary' }} />
                    <Typography variant="body2" color="textSecondary">
                      Cadastrado em {format(new Date(user.dataCadastro), 'dd/MM/yyyy', { locale: ptBR })}
                    </Typography>
                  </Box>
                </Box>

                <Button
                  variant="outlined"
                  fullWidth
                  startIcon={<EditIcon />}
                  onClick={() => navigate('/perfil')}
                >
                  Editar Perfil
                </Button>
              </Box>
            </CardContent>
          </Card>

          {/* Verificação de Email */}
          {!user.emailVerificado && (
            <Alert severity="warning" sx={{ mt: 2 }}>
              <Typography variant="body2">
                <strong>Email não verificado</strong>
                <br />
                Verifique sua caixa de entrada para ativar sua conta.
              </Typography>
              <Button size="small" sx={{ mt: 1 }}>
                Reenviar Email
              </Button>
            </Alert>
          )}
        </Grid>

        {/* Main Content */}
        <Grid item xs={12} md={8}>
          {/* Statistics Cards */}
          <Grid container spacing={2} sx={{ mb: 3 }}>
            <Grid item xs={6} sm={3}>
              <Card>
                <CardContent sx={{ textAlign: 'center' }}>
                  <VoteIcon sx={{ fontSize: 40, color: 'success.main', mb: 1 }} />
                  <Typography variant="h4" fontWeight="bold" color="success.main">
                    {loadingEleicoes ? <CircularProgress size={24} /> : userStats.eleicoesAtivas}
                  </Typography>
                  <Typography variant="body2" color="textSecondary">
                    Eleições Ativas
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            
            <Grid item xs={6} sm={3}>
              <Card sx={{ border: userStats.eleicoesPendenteVoto > 0 ? 2 : 0, borderColor: 'warning.main' }}>
                <CardContent sx={{ textAlign: 'center' }}>
                  <ScheduleIcon sx={{ 
                    fontSize: 40, 
                    color: userStats.eleicoesPendenteVoto > 0 ? 'warning.main' : 'grey.400', 
                    mb: 1 
                  }} />
                  <Typography variant="h4" fontWeight="bold" color={userStats.eleicoesPendenteVoto > 0 ? 'warning.main' : 'grey.400'}>
                    {loadingEleicoes ? <CircularProgress size={24} /> : userStats.eleicoesPendenteVoto}
                  </Typography>
                  <Typography variant="body2" color="textSecondary">
                    Pendentes
                  </Typography>
                  {userStats.eleicoesPendenteVoto > 0 && (
                    <Chip label="URGENTE" color="warning" size="small" sx={{ mt: 1 }} />
                  )}
                </CardContent>
              </Card>
            </Grid>
            
            <Grid item xs={6} sm={3}>
              <Card>
                <CardContent sx={{ textAlign: 'center' }}>
                  <CheckCircleIcon sx={{ fontSize: 40, color: 'info.main', mb: 1 }} />
                  <Typography variant="h4" fontWeight="bold" color="info.main">
                    {loadingEleicoes ? <CircularProgress size={24} /> : userStats.eleicoesVotadas}
                  </Typography>
                  <Typography variant="body2" color="textSecondary">
                    Votadas
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            
            <Grid item xs={6} sm={3}>
              <Card>
                <CardContent sx={{ textAlign: 'center' }}>
                  <GroupsIcon sx={{ fontSize: 40, color: 'primary.main', mb: 1 }} />
                  <Typography variant="h4" fontWeight="bold" color="primary.main">
                    {userStats.chapasCriadas}
                  </Typography>
                  <Typography variant="body2" color="textSecondary">
                    Chapas
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          </Grid>

          {/* Quick Actions */}
          <Paper sx={{ p: 3, mb: 3 }}>
            <Typography variant="h6" gutterBottom fontWeight="bold">
              Ações Rápidas
            </Typography>
            <Grid container spacing={2}>
              {quickActions.map((action, index) => (
                <Grid item xs={12} sm={6} key={index}>
                  <Card 
                    sx={{ 
                      cursor: 'pointer',
                      '&:hover': { boxShadow: 4 },
                      border: action.urgent ? 2 : 0,
                      borderColor: action.urgent ? 'warning.main' : 'transparent',
                      position: 'relative'
                    }}
                    onClick={action.action}
                  >
                    {action.urgent && (
                      <Box
                        sx={{
                          position: 'absolute',
                          top: 8,
                          right: 8,
                          zIndex: 1
                        }}
                      >
                        <WarningIcon color="warning" />
                      </Box>
                    )}
                    <CardContent>
                      <Box display="flex" alignItems="center" mb={1}>
                        <Box 
                          sx={{ 
                            color: `${action.color}.main`,
                            mr: 2 
                          }}
                        >
                          {action.icon}
                        </Box>
                        <Typography variant="h6" fontWeight="medium">
                          {action.title}
                        </Typography>
                      </Box>
                      <Typography variant="body2" color="textSecondary">
                        {action.description}
                      </Typography>
                      {action.urgent && (
                        <Chip 
                          label="Ação Necessária" 
                          color="warning" 
                          size="small" 
                          sx={{ mt: 1 }} 
                        />
                      )}
                    </CardContent>
                  </Card>
                </Grid>
              ))}
            </Grid>
          </Paper>

          {/* Eleições Disponíveis para Votação */}
          {eleicoesDisponiveis.filter(e => e.podeVotar && !e.jaVotou).length > 0 && (
            <Paper sx={{ p: 3, mb: 3, border: 2, borderColor: 'warning.main' }}>
              <Box display="flex" alignItems="center" mb={2}>
                <VoteIcon sx={{ mr: 1, color: 'warning.main' }} />
                <Typography variant="h6" fontWeight="bold" color="warning.main">
                  Eleições Aguardando Seu Voto
                </Typography>
                <Chip label="URGENTE" color="warning" size="small" sx={{ ml: 2 }} />
              </Box>
              
              <Grid container spacing={2}>
                {eleicoesDisponiveis
                  .filter(e => e.podeVotar && !e.jaVotou)
                  .slice(0, 2)
                  .map((eleicao) => {
                    const diasRestantes = differenceInDays(new Date(eleicao.dataFim), new Date());
                    return (
                      <Grid item xs={12} sm={6} key={eleicao.id}>
                        <Card sx={{ border: 1, borderColor: 'warning.main' }}>
                          <CardContent>
                            <Typography variant="h6" gutterBottom fontWeight="bold">
                              {eleicao.titulo}
                            </Typography>
                            <Typography variant="body2" color="textSecondary" gutterBottom>
                              {eleicao.descricao}
                            </Typography>
                            <Box display="flex" alignItems="center" mt={1} mb={2}>
                              <ScheduleIcon sx={{ fontSize: 16, mr: 1, color: 'text.secondary' }} />
                              <Typography variant="body2" color={diasRestantes <= 3 ? 'error.main' : 'textSecondary'}>
                                {diasRestantes > 0 ? `${diasRestantes} dias restantes` : 'Último dia!'}
                              </Typography>
                            </Box>
                            <Typography variant="body2" color="textSecondary">
                              Até: {format(new Date(eleicao.dataFim), 'dd/MM/yyyy', { locale: ptBR })}
                            </Typography>
                          </CardContent>
                          <CardActions>
                            <Button
                              variant="contained"
                              color="warning"
                              fullWidth
                              startIcon={<VoteIcon />}
                              onClick={() => navigate(`/voting/${eleicao.id}`)}
                            >
                              VOTAR AGORA
                            </Button>
                          </CardActions>
                        </Card>
                      </Grid>
                    );
                  })
                }
              </Grid>
              
              {eleicoesDisponiveis.filter(e => e.podeVotar && !e.jaVotou).length > 2 && (
                <Button
                  variant="outlined"
                  fullWidth
                  sx={{ mt: 2 }}
                  onClick={() => navigate('/eleicoes')}
                >
                  Ver Todas as Eleições ({eleicoesDisponiveis.filter(e => e.podeVotar && !e.jaVotou).length})
                </Button>
              )}
            </Paper>
          )}

          {/* Eleições Já Votadas */}
          {eleicoesDisponiveis.filter(e => e.jaVotou).length > 0 && (
            <Paper sx={{ p: 3, mb: 3 }}>
              <Box display="flex" alignItems="center" mb={2}>
                <CheckCircleIcon sx={{ mr: 1, color: 'success.main' }} />
                <Typography variant="h6" fontWeight="bold">
                  Eleições em que Você Já Votou
                </Typography>
              </Box>
              
              <List>
                {eleicoesDisponiveis
                  .filter(e => e.jaVotou)
                  .slice(0, 3)
                  .map((eleicao, index) => (
                    <React.Fragment key={eleicao.id}>
                      <ListItem>
                        <ListItemIcon>
                          <CheckCircleIcon color="success" />
                        </ListItemIcon>
                        <ListItemText
                          primary={eleicao.titulo}
                          secondary={`Votação até ${format(new Date(eleicao.dataFim), 'dd/MM/yyyy', { locale: ptBR })}`}
                        />
                        <Button
                          size="small"
                          onClick={() => navigate(`/eleicoes/${eleicao.id}`)}
                        >
                          Ver Resultados
                        </Button>
                      </ListItem>
                      {index < eleicoesDisponiveis.filter(e => e.jaVotou).length - 1 && <Divider />}
                    </React.Fragment>
                  ))
                }
              </List>
            </Paper>
          )}

          {/* Notifications */}
          <Paper sx={{ p: 3 }}>
            <Box display="flex" alignItems="center" mb={2}>
              <NotificationsIcon sx={{ mr: 1, color: 'primary.main' }} />
              <Typography variant="h6" fontWeight="bold">
                Notificações Recentes
              </Typography>
            </Box>
            
            {notifications.length > 0 ? (
              <List disablePadding>
                {notifications.map((notification, index) => (
                  <React.Fragment key={notification.id}>
                    <ListItem disablePadding sx={{ py: 1 }}>
                      <ListItemIcon>
                        <Box
                          sx={{
                            width: 8,
                            height: 8,
                            borderRadius: '50%',
                            bgcolor: notification.type === 'info' ? 'info.main' :
                                   notification.type === 'warning' ? 'warning.main' : 
                                   notification.type === 'error' ? 'error.main' : 'success.main'
                          }}
                        />
                      </ListItemIcon>
                      <ListItemText
                        primary={notification.message}
                        secondary={format(notification.date, 'dd/MM/yyyy', { locale: ptBR })}
                      />
                    </ListItem>
                    {index < notifications.length - 1 && <Divider />}
                  </React.Fragment>
                ))}
              </List>
            ) : (
              <Typography variant="body2" color="textSecondary">
                Nenhuma notificação recente.
              </Typography>
            )}
          </Paper>
        </Grid>
      </Grid>
    </Container>
  );
};