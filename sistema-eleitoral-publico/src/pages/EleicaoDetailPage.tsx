import React from 'react';
import {
  Container,
  Typography,
  Box,
  Card,
  CardContent,
  Chip,
  Grid,
  Button,
  Alert,
  Breadcrumbs,
  Link,
  Divider,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Paper
} from '@mui/material';
import {
  CalendarMonth as CalendarIcon,
  LocationOn as LocationIcon,
  ArrowBack as ArrowBackIcon,
  Groups as GroupsIcon,
  Schedule as ScheduleIcon,
  Description as DescriptionIcon,
  Assessment as AssessmentIcon,
  HowToVote as VoteIcon,
  Info as InfoIcon
} from '@mui/icons-material';
import { useQuery } from '@tanstack/react-query';
import { useParams, useNavigate } from 'react-router-dom';
import { eleicaoService, chapaService } from '../services/api';
import { format, isAfter, isBefore, differenceInDays } from 'date-fns';
import { ptBR } from 'date-fns/locale';

export const EleicaoDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const eleicaoId = parseInt(id || '0');

  const { data: eleicao, isLoading, error } = useQuery({
    queryKey: ['eleicao', eleicaoId],
    queryFn: () => eleicaoService.getById(eleicaoId),
    enabled: !!eleicaoId
  });

  const { data: chapas = [] } = useQuery({
    queryKey: ['chapas-eleicao', eleicaoId],
    queryFn: () => chapaService.getPublicas({ eleicaoId: eleicaoId.toString(), status: 'Aprovada' }),
    enabled: !!eleicaoId
  });

  const getSituacaoColor = (situacao: string) => {
    switch (situacao) {
      case 'EmAndamento':
        return 'success';
      case 'EmElaboracao':
        return 'warning';
      case 'Finalizada':
        return 'info';
      case 'Cancelada':
        return 'error';
      default:
        return 'default';
    }
  };

  const getSituacaoLabel = (situacao: string) => {
    switch (situacao) {
      case 'EmAndamento':
        return 'Em Andamento';
      case 'EmElaboracao':
        return 'Em Elaboração';
      case 'Finalizada':
        return 'Finalizada';
      case 'Cancelada':
        return 'Cancelada';
      default:
        return situacao;
    }
  };

  const getTipoEleicaoIcon = (tipo: string) => {
    switch (tipo) {
      case 'Nacional':
        return '🏛️';
      case 'Regional':
        return '📍';
      default:
        return '🗳️';
    }
  };

  const getStatusEleicao = () => {
    if (!eleicao) return { status: 'unknown', label: 'Desconhecido', color: 'default' };
    
    const agora = new Date();
    const inicio = new Date(eleicao.dataInicio);
    const fim = new Date(eleicao.dataFim);
    
    if (isBefore(agora, inicio)) {
      const diasParaInicio = differenceInDays(inicio, agora);
      return {
        status: 'upcoming',
        label: `Inicia em ${diasParaInicio} dias`,
        color: 'info'
      };
    } else if (isAfter(agora, inicio) && isBefore(agora, fim)) {
      const diasParaFim = differenceInDays(fim, agora);
      return {
        status: 'active',
        label: `${diasParaFim} dias restantes`,
        color: 'success'
      };
    } else if (isAfter(agora, fim)) {
      return {
        status: 'finished',
        label: 'Finalizada',
        color: 'default'
      };
    }
    
    return { status: 'unknown', label: 'Status indefinido', color: 'default' };
  };

  if (isLoading) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Box textAlign="center" py={8}>
          <Typography>Carregando detalhes da eleição...</Typography>
        </Box>
      </Container>
    );
  }

  if (error || !eleicao) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Alert severity="error" sx={{ mb: 2 }}>
          Eleição não encontrada ou erro ao carregar dados.
        </Alert>
        <Button
          startIcon={<ArrowBackIcon />}
          onClick={() => navigate('/eleicoes')}
        >
          Voltar para Eleições
        </Button>
      </Container>
    );
  }

  const statusInfo = getStatusEleicao();

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      {/* Breadcrumbs */}
      <Breadcrumbs sx={{ mb: 3 }}>
        <Link 
          color="inherit" 
          href="/"
          onClick={(e) => {
            e.preventDefault();
            navigate('/');
          }}
        >
          Início
        </Link>
        <Link 
          color="inherit" 
          href="/eleicoes"
          onClick={(e) => {
            e.preventDefault();
            navigate('/eleicoes');
          }}
        >
          Eleições
        </Link>
        <Typography color="text.primary">{eleicao.titulo}</Typography>
      </Breadcrumbs>

      {/* Header */}
      <Box sx={{ mb: 4 }}>
        <Button
          startIcon={<ArrowBackIcon />}
          onClick={() => navigate('/eleicoes')}
          sx={{ mb: 2 }}
        >
          Voltar para Eleições
        </Button>
        
        <Box display="flex" justifyContent="space-between" alignItems="start" flexWrap="wrap" gap={2}>
          <Box>
            <Box display="flex" alignItems="center" mb={1}>
              <Typography sx={{ mr: 2, fontSize: '2rem' }}>
                {getTipoEleicaoIcon(eleicao.tipoEleicao)}
              </Typography>
              <Typography variant="h3" component="h1" fontWeight="bold">
                {eleicao.titulo}
              </Typography>
            </Box>
            <Box display="flex" alignItems="center" gap={2} flexWrap="wrap">
              <Chip
                label={getSituacaoLabel(eleicao.situacao)}
                color={getSituacaoColor(eleicao.situacao)}
                size="medium"
              />
              <Chip
                label={statusInfo.label}
                color={statusInfo.color as any}
                variant="outlined"
                size="medium"
              />
              <Typography variant="body1" color="textSecondary">
                Ano: {eleicao.ano}
              </Typography>
            </Box>
          </Box>
        </Box>
      </Box>

      <Grid container spacing={3}>
        {/* Informações da Eleição */}
        <Grid item xs={12} md={8}>
          <Card sx={{ mb: 3 }}>
            <CardContent>
              <Box display="flex" alignItems="center" mb={2}>
                <DescriptionIcon sx={{ mr: 1, color: 'primary.main' }} />
                <Typography variant="h6" fontWeight="bold">
                  Informações da Eleição
                </Typography>
              </Box>

              {/* Tipo de Eleição */}
              <Box display="flex" alignItems="center" mb={2}>
                <VoteIcon sx={{ fontSize: 20, mr: 2, color: 'text.secondary' }} />
                <Box>
                  <Typography variant="body1" fontWeight="medium">
                    {eleicao.tipoEleicao}
                  </Typography>
                  <Typography variant="caption" color="textSecondary">
                    Tipo de Eleição
                  </Typography>
                </Box>
              </Box>

              {/* UF */}
              {eleicao.uf ? (
                <Box display="flex" alignItems="center" mb={2}>
                  <LocationIcon sx={{ fontSize: 20, mr: 2, color: 'text.secondary' }} />
                  <Box>
                    <Typography variant="body1" fontWeight="medium">
                      {eleicao.uf.nome} ({eleicao.uf.sigla})
                    </Typography>
                    <Typography variant="caption" color="textSecondary">
                      Unidade Federativa
                    </Typography>
                  </Box>
                </Box>
              ) : eleicao.tipoEleicao === 'Nacional' && (
                <Box display="flex" alignItems="center" mb={2}>
                  <LocationIcon sx={{ fontSize: 20, mr: 2, color: 'text.secondary' }} />
                  <Box>
                    <Typography variant="body1" fontWeight="medium">
                      Nacional - Todas as UFs
                    </Typography>
                    <Typography variant="caption" color="textSecondary">
                      Abrangência
                    </Typography>
                  </Box>
                </Box>
              )}

              {/* Período */}
              <Box display="flex" alignItems="center" mb={2}>
                <ScheduleIcon sx={{ fontSize: 20, mr: 2, color: 'text.secondary' }} />
                <Box>
                  <Typography variant="body1" fontWeight="medium">
                    {format(new Date(eleicao.dataInicio), 'dd/MM/yyyy', { locale: ptBR })} até{' '}
                    {format(new Date(eleicao.dataFim), 'dd/MM/yyyy', { locale: ptBR })}
                  </Typography>
                  <Typography variant="caption" color="textSecondary">
                    Período da Eleição
                  </Typography>
                </Box>
              </Box>

              {/* Descrição */}
              {eleicao.descricao && (
                <>
                  <Divider sx={{ my: 2 }} />
                  <Typography variant="h6" gutterBottom>
                    Descrição
                  </Typography>
                  <Typography variant="body1" paragraph>
                    {eleicao.descricao}
                  </Typography>
                </>
              )}
            </CardContent>
          </Card>

          {/* Calendário Eleitoral */}
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center" mb={2}>
                <CalendarIcon sx={{ mr: 1, color: 'primary.main' }} />
                <Typography variant="h6" fontWeight="bold">
                  Calendário Eleitoral
                </Typography>
              </Box>
              <Typography variant="body1" color="textSecondary" paragraph>
                Cronograma de atividades e prazos importantes desta eleição.
              </Typography>
              <Box sx={{ p: 2, backgroundColor: 'grey.50', borderRadius: 1 }}>
                <Typography variant="body2" color="textSecondary">
                  📅 Em desenvolvimento: Visualização detalhada do calendário eleitoral com todas as fases do processo.
                </Typography>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Sidebar */}
        <Grid item xs={12} md={4}>
          {/* Estatísticas */}
          <Card sx={{ mb: 3 }}>
            <CardContent>
              <Box display="flex" alignItems="center" mb={2}>
                <AssessmentIcon sx={{ mr: 1, color: 'primary.main' }} />
                <Typography variant="h6" fontWeight="bold">
                  Estatísticas
                </Typography>
              </Box>

              <List disablePadding>
                <ListItem disablePadding>
                  <ListItemIcon>
                    <GroupsIcon color="primary" />
                  </ListItemIcon>
                  <ListItemText
                    primary={chapas.length}
                    secondary="Chapas Aprovadas"
                  />
                </ListItem>
                
                <ListItem disablePadding>
                  <ListItemIcon>
                    <VoteIcon color="primary" />
                  </ListItemIcon>
                  <ListItemText
                    primary={chapas.reduce((total, chapa) => total + (chapa.membros?.length || 0), 0)}
                    secondary="Total de Candidatos"
                  />
                </ListItem>
              </List>
            </CardContent>
          </Card>

          {/* Chapas Participantes */}
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center" mb={2}>
                <GroupsIcon sx={{ mr: 1, color: 'primary.main' }} />
                <Typography variant="h6" fontWeight="bold">
                  Chapas Participantes
                </Typography>
              </Box>

              {chapas.length > 0 ? (
                <>
                  <List disablePadding>
                    {chapas.slice(0, 5).map((chapa, index) => (
                      <React.Fragment key={chapa.id}>
                        <ListItem 
                          disablePadding 
                          sx={{ 
                            py: 1,
                            cursor: 'pointer',
                            '&:hover': {
                              backgroundColor: 'action.hover'
                            }
                          }}
                          onClick={() => navigate(`/chapas/${chapa.id}`)}
                        >
                          <ListItemText
                            primary={
                              <Typography variant="body1" fontWeight="medium">
                                {chapa.nome}
                              </Typography>
                            }
                            secondary={
                              <Typography variant="body2" color="textSecondary">
                                {chapa.responsavel?.nome}
                              </Typography>
                            }
                          />
                        </ListItem>
                        {index < Math.min(chapas.length, 5) - 1 && <Divider />}
                      </React.Fragment>
                    ))}
                  </List>

                  {chapas.length > 5 && (
                    <Box sx={{ mt: 2, textAlign: 'center' }}>
                      <Typography variant="body2" color="textSecondary">
                        +{chapas.length - 5} outras chapas
                      </Typography>
                    </Box>
                  )}

                  <Box sx={{ mt: 2 }}>
                    <Button
                      fullWidth
                      variant="outlined"
                      onClick={() => navigate(`/chapas?eleicaoId=${eleicao.id}`)}
                    >
                      Ver Todas as Chapas
                    </Button>
                  </Box>
                </>
              ) : (
                <Box textAlign="center" py={2}>
                  <Typography variant="body2" color="textSecondary">
                    Nenhuma chapa aprovada ainda.
                  </Typography>
                </Box>
              )}
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Informações Adicionais */}
      <Box sx={{ mt: 4 }}>
        <Paper sx={{ p: 3 }}>
          <Box display="flex" alignItems="center" mb={2}>
            <InfoIcon sx={{ mr: 1, color: 'primary.main' }} />
            <Typography variant="h6" fontWeight="bold">
              Informações Adicionais
            </Typography>
          </Box>
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <Typography variant="body1" paragraph>
                <strong>Processo Eleitoral</strong>
              </Typography>
              <Typography variant="body2" color="textSecondary" paragraph>
                Esta eleição segue o regulamento eleitoral do CAU e todos os prazos estabelecidos 
                em calendário oficial. Para mais informações sobre o processo, consulte os documentos oficiais.
              </Typography>
            </Grid>
            <Grid item xs={12} md={6}>
              <Typography variant="body1" paragraph>
                <strong>Transparência</strong>
              </Typography>
              <Typography variant="body2" color="textSecondary" paragraph>
                Todos os dados desta eleição são públicos e podem ser consultados livremente. 
                O CAU garante total transparência no processo eleitoral.
              </Typography>
            </Grid>
          </Grid>
        </Paper>
      </Box>
    </Container>
  );
};