import React from 'react';
import {
  Container,
  Typography,
  Box,
  Grid,
  Card,
  CardContent,
  Button,
  Alert,
  Paper,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Chip,
  Divider,
  CircularProgress
} from '@mui/material';
import {
  CheckCircle as CheckCircleIcon,
  Schedule as ScheduleIcon,
  Warning as WarningIcon,
  HowToVote as VoteIcon,
  Receipt as ReceiptIcon,
  Assessment as AssessmentIcon,
  CalendarMonth as CalendarIcon
} from '@mui/icons-material';
import { useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { votacaoService } from '../services/api/votacaoService';
import { format, differenceInDays, differenceInHours } from 'date-fns';
import { ptBR } from 'date-fns/locale';

export const VotingStatusPage: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  // Buscar eleições disponíveis
  const { data: eleicoes = [], isLoading } = useQuery({
    queryKey: ['eleicoes-disponiveis'],
    queryFn: votacaoService.getEleicoesDisponiveis,
    enabled: !!user
  });

  if (isLoading) {
    return (
      <Container maxWidth="lg" sx={{ py: 4, textAlign: 'center' }}>
        <CircularProgress size={48} />
        <Typography variant="h6" sx={{ mt: 2 }}>
          Carregando status de votação...
        </Typography>
      </Container>
    );
  }

  const eleicoesAtivas = eleicoes.filter(e => e.situacao === 'EmAndamento');
  const eleicoesPendentes = eleicoes.filter(e => e.podeVotar && !e.jaVotou && e.situacao === 'EmAndamento');
  const eleicoesVotadas = eleicoes.filter(e => e.jaVotou);
  const eleicoesFinalizadas = eleicoes.filter(e => e.situacao === 'Finalizada');

  const getTimeRemaining = (dataFim: string) => {
    const agora = new Date();
    const fim = new Date(dataFim);
    const dias = differenceInDays(fim, agora);
    const horas = differenceInHours(fim, agora) % 24;

    if (dias > 0) {
      return `${dias} dias restantes`;
    } else if (horas > 0) {
      return `${horas} horas restantes`;
    } else {
      return 'Encerrando hoje!';
    }
  };

  const getUrgencyLevel = (dataFim: string) => {
    const diasRestantes = differenceInDays(new Date(dataFim), new Date());
    if (diasRestantes <= 1) return 'error';
    if (diasRestantes <= 3) return 'warning';
    return 'info';
  };

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      {/* Header */}
      <Box mb={4} textAlign="center">
        <Typography variant="h3" component="h1" gutterBottom fontWeight="bold">
          Status de Votação
        </Typography>
        <Typography variant="h6" color="textSecondary">
          Acompanhe suas eleições e participe do processo democrático
        </Typography>
      </Box>

      {/* Resumo Rápido */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={3}>
          <Card sx={{ textAlign: 'center', backgroundColor: 'primary.50' }}>
            <CardContent>
              <VoteIcon sx={{ fontSize: 40, color: 'primary.main', mb: 1 }} />
              <Typography variant="h4" fontWeight="bold" color="primary.main">
                {eleicoesAtivas.length}
              </Typography>
              <Typography variant="body2" color="textSecondary">
                Eleições Ativas
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} sm={3}>
          <Card sx={{ 
            textAlign: 'center', 
            backgroundColor: eleicoesPendentes.length > 0 ? 'warning.50' : 'grey.50',
            border: eleicoesPendentes.length > 0 ? 2 : 0,
            borderColor: 'warning.main'
          }}>
            <CardContent>
              <ScheduleIcon sx={{ 
                fontSize: 40, 
                color: eleicoesPendentes.length > 0 ? 'warning.main' : 'grey.400', 
                mb: 1 
              }} />
              <Typography variant="h4" fontWeight="bold" color={eleicoesPendentes.length > 0 ? 'warning.main' : 'grey.400'}>
                {eleicoesPendentes.length}
              </Typography>
              <Typography variant="body2" color="textSecondary">
                Pendentes
              </Typography>
              {eleicoesPendentes.length > 0 && (
                <Chip label="AÇÃO NECESSÁRIA" color="warning" size="small" sx={{ mt: 1 }} />
              )}
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} sm={3}>
          <Card sx={{ textAlign: 'center', backgroundColor: 'success.50' }}>
            <CardContent>
              <CheckCircleIcon sx={{ fontSize: 40, color: 'success.main', mb: 1 }} />
              <Typography variant="h4" fontWeight="bold" color="success.main">
                {eleicoesVotadas.length}
              </Typography>
              <Typography variant="body2" color="textSecondary">
                Votadas
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} sm={3}>
          <Card sx={{ textAlign: 'center', backgroundColor: 'info.50' }}>
            <CardContent>
              <AssessmentIcon sx={{ fontSize: 40, color: 'info.main', mb: 1 }} />
              <Typography variant="h4" fontWeight="bold" color="info.main">
                {eleicoesFinalizadas.length}
              </Typography>
              <Typography variant="body2" color="textSecondary">
                Finalizadas
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Eleições Pendentes (Urgente) */}
      {eleicoesPendentes.length > 0 && (
        <Paper elevation={3} sx={{ p: 3, mb: 4, border: 2, borderColor: 'warning.main' }}>
          <Box display="flex" alignItems="center" mb={2}>
            <WarningIcon sx={{ color: 'warning.main', mr: 1 }} />
            <Typography variant="h5" fontWeight="bold" color="warning.main">
              Eleições Aguardando Seu Voto
            </Typography>
            <Chip label="URGENTE" color="warning" sx={{ ml: 2 }} />
          </Box>
          
          <Alert severity="warning" sx={{ mb: 3 }}>
            Você possui {eleicoesPendentes.length} eleição(s) aguardando seu voto. 
            Participe do processo democrático!
          </Alert>

          <Grid container spacing={2}>
            {eleicoesPendentes.map((eleicao) => {
              const urgencyLevel = getUrgencyLevel(eleicao.dataFim);
              const timeRemaining = getTimeRemaining(eleicao.dataFim);
              
              return (
                <Grid item xs={12} sm={6} lg={4} key={eleicao.id}>
                  <Card sx={{ 
                    height: '100%', 
                    border: 1, 
                    borderColor: `${urgencyLevel}.main`,
                    '&:hover': { boxShadow: 4 }
                  }}>
                    <CardContent sx={{ pb: 1 }}>
                      <Box display="flex" justifyContent="between" alignItems="start" mb={1}>
                        <Typography variant="h6" fontWeight="bold" gutterBottom>
                          {eleicao.titulo}
                        </Typography>
                        <Chip
                          label={timeRemaining}
                          color={urgencyLevel as any}
                          size="small"
                        />
                      </Box>
                      
                      <Typography variant="body2" color="textSecondary" gutterBottom>
                        {eleicao.descricao}
                      </Typography>
                      
                      <Box display="flex" alignItems="center" mt={2}>
                        <CalendarIcon sx={{ fontSize: 16, mr: 1, color: 'text.secondary' }} />
                        <Typography variant="body2" color="textSecondary">
                          Até: {format(new Date(eleicao.dataFim), 'dd/MM/yyyy HH:mm', { locale: ptBR })}
                        </Typography>
                      </Box>
                      
                      {eleicao.uf && (
                        <Typography variant="body2" color="textSecondary" sx={{ mt: 1 }}>
                          {eleicao.uf.nome} ({eleicao.uf.sigla})
                        </Typography>
                      )}
                    </CardContent>
                    
                    <Box sx={{ p: 2, pt: 0 }}>
                      <Button
                        variant="contained"
                        color={urgencyLevel as any}
                        fullWidth
                        startIcon={<VoteIcon />}
                        onClick={() => navigate(`/voting/${eleicao.id}`)}
                        size="large"
                      >
                        VOTAR AGORA
                      </Button>
                    </Box>
                  </Card>
                </Grid>
              );
            })}
          </Grid>
        </Paper>
      )}

      {/* Eleições Votadas */}
      {eleicoesVotadas.length > 0 && (
        <Paper elevation={2} sx={{ p: 3, mb: 4 }}>
          <Box display="flex" alignItems="center" mb={2}>
            <CheckCircleIcon sx={{ color: 'success.main', mr: 1 }} />
            <Typography variant="h5" fontWeight="bold">
              Eleições em que Você Já Votou
            </Typography>
          </Box>
          
          <List>
            {eleicoesVotadas.map((eleicao, index) => (
              <React.Fragment key={eleicao.id}>
                <ListItem sx={{ px: 0 }}>
                  <ListItemIcon>
                    <CheckCircleIcon color="success" />
                  </ListItemIcon>
                  <ListItemText
                    primary={
                      <Box display="flex" alignItems="center" gap={1}>
                        <Typography variant="h6" fontWeight="medium">
                          {eleicao.titulo}
                        </Typography>
                        <Chip label="VOTADO" color="success" size="small" />
                      </Box>
                    }
                    secondary={
                      <Box>
                        <Typography variant="body2" color="textSecondary">
                          {eleicao.descricao}
                        </Typography>
                        <Typography variant="body2" color="textSecondary">
                          Eleição: {format(new Date(eleicao.dataInicio), 'dd/MM/yyyy', { locale: ptBR })} 
                          - {format(new Date(eleicao.dataFim), 'dd/MM/yyyy', { locale: ptBR })}
                        </Typography>
                        {eleicao.uf && (
                          <Typography variant="body2" color="textSecondary">
                            {eleicao.uf.nome} ({eleicao.uf.sigla})
                          </Typography>
                        )}
                      </Box>
                    }
                  />
                  <Box display="flex" gap={1}>
                    <Button
                      size="small"
                      startIcon={<ReceiptIcon />}
                      onClick={() => navigate(`/voting/${eleicao.id}`)}
                    >
                      Comprovante
                    </Button>
                    {eleicao.situacao === 'Finalizada' && (
                      <Button
                        size="small"
                        startIcon={<AssessmentIcon />}
                        onClick={() => navigate(`/eleicoes/${eleicao.id}`)}
                      >
                        Resultados
                      </Button>
                    )}
                  </Box>
                </ListItem>
                {index < eleicoesVotadas.length - 1 && <Divider />}
              </React.Fragment>
            ))}
          </List>
        </Paper>
      )}

      {/* Todas as Eleições */}
      <Paper elevation={2} sx={{ p: 3 }}>
        <Typography variant="h5" fontWeight="bold" gutterBottom>
          Histórico de Eleições
        </Typography>
        
        {eleicoes.length === 0 ? (
          <Alert severity="info">
            Não há eleições disponíveis no momento.
          </Alert>
        ) : (
          <List>
            {eleicoes.map((eleicao, index) => {
              let statusColor: 'success' | 'warning' | 'info' | 'default' = 'default';
              let statusLabel = 'Indefinido';
              
              if (eleicao.jaVotou) {
                statusColor = 'success';
                statusLabel = 'VOTADO';
              } else if (eleicao.podeVotar && eleicao.situacao === 'EmAndamento') {
                statusColor = 'warning';
                statusLabel = 'PENDENTE';
              } else if (eleicao.situacao === 'Finalizada') {
                statusColor = 'info';
                statusLabel = 'FINALIZADA';
              } else {
                statusColor = 'default';
                statusLabel = eleicao.situacao.toUpperCase();
              }
              
              return (
                <React.Fragment key={eleicao.id}>
                  <ListItem sx={{ px: 0 }}>
                    <ListItemIcon>
                      {eleicao.jaVotou ? (
                        <CheckCircleIcon color="success" />
                      ) : eleicao.podeVotar && eleicao.situacao === 'EmAndamento' ? (
                        <ScheduleIcon color="warning" />
                      ) : (
                        <VoteIcon color="disabled" />
                      )}
                    </ListItemIcon>
                    <ListItemText
                      primary={
                        <Box display="flex" alignItems="center" gap={1}>
                          <Typography variant="h6" fontWeight="medium">
                            {eleicao.titulo}
                          </Typography>
                          <Chip label={statusLabel} color={statusColor} size="small" />
                        </Box>
                      }
                      secondary={
                        <Box>
                          <Typography variant="body2" color="textSecondary">
                            {eleicao.descricao}
                          </Typography>
                          <Typography variant="body2" color="textSecondary">
                            Período: {format(new Date(eleicao.dataInicio), 'dd/MM/yyyy', { locale: ptBR })} 
                            - {format(new Date(eleicao.dataFim), 'dd/MM/yyyy', { locale: ptBR })}
                          </Typography>
                        </Box>
                      }
                    />
                    <Button
                      variant="outlined"
                      size="small"
                      onClick={() => {
                        if (eleicao.podeVotar && !eleicao.jaVotou && eleicao.situacao === 'EmAndamento') {
                          navigate(`/voting/${eleicao.id}`);
                        } else {
                          navigate(`/eleicoes/${eleicao.id}`);
                        }
                      }}
                    >
                      {eleicao.podeVotar && !eleicao.jaVotou && eleicao.situacao === 'EmAndamento' ? 'Votar' : 'Detalhes'}
                    </Button>
                  </ListItem>
                  {index < eleicoes.length - 1 && <Divider />}
                </React.Fragment>
              );
            })}
          </List>
        )}
      </Paper>
    </Container>
  );
};
