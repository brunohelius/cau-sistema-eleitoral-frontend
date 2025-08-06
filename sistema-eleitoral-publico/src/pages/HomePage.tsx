import React from 'react';
import {
  Box,
  Container,
  Typography,
  Grid,
  Card,
  CardContent,
  CardActions,
  Button,
  Chip,
  Paper,
  List,
  ListItem,
  ListItemText,
  Divider
} from '@mui/material';
import {
  HowToVote as VoteIcon,
  CalendarMonth as CalendarIcon,
  Groups as GroupsIcon,
  Assessment as ReportIcon,
  Announcement as AnnouncementIcon
} from '@mui/icons-material';
import { useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { eleicaoService, calendarioService } from '../services/api';

export const HomePage: React.FC = () => {
  const navigate = useNavigate();

  // Query for active elections
  const { data: eleicoesAtivas = [] } = useQuery({
    queryKey: ['eleicoes-ativas'],
    queryFn: () => eleicaoService.getAtivas()
  });

  // Query for public calendars
  const { data: calendarios = [] } = useQuery({
    queryKey: ['calendarios-publicos'],
    queryFn: () => calendarioService.getPublicos()
  });

  const handleViewEleicao = (eleicaoId: number) => {
    navigate(`/eleicoes/${eleicaoId}`);
  };

  const handleViewCalendario = (calendarioId: number) => {
    navigate(`/calendarios/${calendarioId}`);
  };

  const getSituacaoColor = (status: string) => {
    switch (status) {
      case 'ATIVA':
        return 'success';
      case 'PLANEJADA':
        return 'info';
      case 'FINALIZADA':
        return 'warning';
      default:
        return 'default';
    }
  };

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      {/* Hero Section */}
      <Box
        sx={{
          background: 'linear-gradient(135deg, #1976d2 0%, #42a5f5 100%)',
          color: 'white',
          p: 6,
          borderRadius: 2,
          mb: 4,
          textAlign: 'center'
        }}
      >
        <Typography variant="h2" component="h1" gutterBottom fontWeight="bold">
          Sistema Eleitoral CAU
        </Typography>
        <Typography variant="h5" sx={{ opacity: 0.9, mb: 3 }}>
          Conselho de Arquitetura e Urbanismo do Brasil
        </Typography>
        <Typography variant="body1" sx={{ maxWidth: 600, mx: 'auto' }}>
          Portal oficial para acompanhar eleições, consultar chapas participantes,
          verificar calendários eleitorais e resultados.
        </Typography>
      </Box>

      <Grid container spacing={4}>
        {/* Eleições Ativas */}
        <Grid item xs={12} md={8}>
          <Paper sx={{ p: 3, mb: 3 }}>
            <Box display="flex" alignItems="center" mb={2}>
              <VoteIcon sx={{ mr: 1, color: 'primary.main' }} />
              <Typography variant="h5" fontWeight="bold">
                Eleições Ativas
              </Typography>
            </Box>
            
            {eleicoesAtivas.length > 0 ? (
              <Grid container spacing={2}>
                {eleicoesAtivas.map((eleicao) => (
                  <Grid item xs={12} key={eleicao.id}>
                    <Card variant="outlined">
                      <CardContent>
                        <Box display="flex" justifyContent="space-between" alignItems="start" mb={2}>
                          <Typography variant="h6" fontWeight="bold">
                            {eleicao.titulo}
                          </Typography>
                          <Chip
                            label={eleicao.status}
                            color={getSituacaoColor(eleicao.status)}
                            size="small"
                          />
                        </Box>
                        <Typography variant="body2" color="textSecondary" mb={2}>
                          {eleicao.descricao}
                        </Typography>
                        <Box display="flex" justifyContent="space-between" alignItems="center">
                          <Typography variant="body2">
                            <strong>Período:</strong> {new Date(eleicao.dataInicio).toLocaleDateString('pt-BR')} - {new Date(eleicao.dataFim).toLocaleDateString('pt-BR')}
                          </Typography>
                          {eleicao.uf && (
                            <Chip label={eleicao.uf.sigla} size="small" variant="outlined" />
                          )}
                        </Box>
                      </CardContent>
                      <CardActions>
                        <Button
                          size="small"
                          onClick={() => handleViewEleicao(eleicao.id)}
                          startIcon={<GroupsIcon />}
                        >
                          Ver Chapas
                        </Button>
                        <Button
                          size="small"
                          startIcon={<CalendarIcon />}
                          onClick={() => navigate(`/eleicoes/${eleicao.id}/calendario`)}
                        >
                          Calendário
                        </Button>
                      </CardActions>
                    </Card>
                  </Grid>
                ))}
              </Grid>
            ) : (
              <Box textAlign="center" py={4}>
                <AnnouncementIcon sx={{ fontSize: 48, color: 'grey.400', mb: 2 }} />
                <Typography variant="h6" color="textSecondary">
                  Nenhuma eleição ativa no momento
                </Typography>
                <Typography variant="body2" color="textSecondary">
                  Acompanhe nossos canais oficiais para informações sobre próximas eleições
                </Typography>
              </Box>
            )}
          </Paper>

          {/* Quick Access */}
          <Paper sx={{ p: 3 }}>
            <Typography variant="h5" fontWeight="bold" mb={3}>
              Acesso Rápido
            </Typography>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6} md={3}>
                <Card sx={{ textAlign: 'center', p: 2, cursor: 'pointer' }} onClick={() => navigate('/chapas')}>
                  <GroupsIcon sx={{ fontSize: 40, color: 'primary.main', mb: 1 }} />
                  <Typography variant="h6">Chapas</Typography>
                  <Typography variant="body2" color="textSecondary">
                    Consultar chapas participantes
                  </Typography>
                </Card>
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <Card sx={{ textAlign: 'center', p: 2, cursor: 'pointer' }} onClick={() => navigate('/calendarios')}>
                  <CalendarIcon sx={{ fontSize: 40, color: 'primary.main', mb: 1 }} />
                  <Typography variant="h6">Calendários</Typography>
                  <Typography variant="body2" color="textSecondary">
                    Datas importantes
                  </Typography>
                </Card>
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <Card sx={{ textAlign: 'center', p: 2, cursor: 'pointer' }} onClick={() => navigate('/resultados')}>
                  <ReportIcon sx={{ fontSize: 40, color: 'primary.main', mb: 1 }} />
                  <Typography variant="h6">Resultados</Typography>
                  <Typography variant="body2" color="textSecondary">
                    Resultados de eleições
                  </Typography>
                </Card>
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <Card sx={{ textAlign: 'center', p: 2, cursor: 'pointer' }} onClick={() => navigate('/documentos')}>
                  <AnnouncementIcon sx={{ fontSize: 40, color: 'primary.main', mb: 1 }} />
                  <Typography variant="h6">Documentos</Typography>
                  <Typography variant="body2" color="textSecondary">
                    Downloads e editais
                  </Typography>
                </Card>
              </Grid>
            </Grid>
          </Paper>
        </Grid>

        {/* Sidebar */}
        <Grid item xs={12} md={4}>
          {/* Próximos Prazos */}
          <Paper sx={{ p: 3, mb: 3 }}>
            <Box display="flex" alignItems="center" mb={2}>
              <CalendarIcon sx={{ mr: 1, color: 'primary.main' }} />
              <Typography variant="h6" fontWeight="bold">
                Próximos Prazos
              </Typography>
            </Box>
            
            {calendarios.length > 0 ? (
              <List dense>
                {calendarios.slice(0, 5).map((calendario, index) => (
                  <React.Fragment key={calendario.id}>
                    <ListItem disablePadding>
                      <ListItemText
                        primary={calendario.titulo}
                        secondary={calendario.descricao}
                        onClick={() => handleViewCalendario(calendario.id)}
                        sx={{ cursor: 'pointer' }}
                      />
                    </ListItem>
                    {index < 4 && <Divider />}
                  </React.Fragment>
                ))}
              </List>
            ) : (
              <Typography color="textSecondary">
                Nenhum prazo próximo
              </Typography>
            )}
            
            <Button
              fullWidth
              variant="outlined"
              sx={{ mt: 2 }}
              onClick={() => navigate('/calendarios')}
            >
              Ver Todos os Calendários
            </Button>
          </Paper>

          {/* Informações */}
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" fontWeight="bold" mb={2}>
              Informações Importantes
            </Typography>
            <List dense>
              <ListItem disablePadding>
                <ListItemText
                  primary="Dúvidas sobre eleições?"
                  secondary="Entre em contato conosco"
                />
              </ListItem>
              <Divider />
              <ListItem disablePadding>
                <ListItemText
                  primary="Legislação eleitoral"
                  secondary="Consulte as normas vigentes"
                />
              </ListItem>
              <Divider />
              <ListItem disablePadding>
                <ListItemText
                  primary="Portal CAU/BR"
                  secondary="www.caubr.gov.br"
                />
              </ListItem>
            </List>
          </Paper>
        </Grid>
      </Grid>
    </Container>
  );
};