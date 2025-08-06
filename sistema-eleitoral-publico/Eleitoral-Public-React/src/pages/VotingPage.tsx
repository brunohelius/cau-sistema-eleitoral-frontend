import React, { useState, useEffect } from 'react';
import {
  Container,
  Typography,
  Box,
  Grid,
  Paper,
  Alert,
  Button,
  CircularProgress,
  Stepper,
  Step,
  StepLabel,
  Chip,
  List,
  ListItem,
  ListItemText,
  ListItemIcon
} from '@mui/material';
import {
  HowToVote as VoteIcon,
  CheckCircle as CheckCircleIcon,
  Error as ErrorIcon,
  Schedule as ScheduleIcon,
  Download as DownloadIcon
} from '@mui/icons-material';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useParams, useNavigate } from 'react-router-dom';
import { useSnackbar } from 'notistack';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import {
  votacaoService,
  Candidato,
  ConfirmacaoVoto
} from '../services/api/votacaoService';
import { useAuth } from '../hooks/useAuth';
import { CandidateCard } from '../components/voting/CandidateCard';
import { VoteConfirmation } from '../components/voting/VoteConfirmation';

const steps = [
  'Seleção do Candidato',
  'Confirmação do Voto',
  'Voto Registrado'
];

export const VotingPage: React.FC = () => {
  const { id: eleicaoId } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const { enqueueSnackbar } = useSnackbar();
  const queryClient = useQueryClient();

  // Estados
  const [activeStep, setActiveStep] = useState(0);
  const [selectedCandidato, setSelectedCandidato] = useState<Candidato | null>(null);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [confirmacaoVoto, setConfirmacaoVoto] = useState<ConfirmacaoVoto | null>(null);
  // const [showEligibilityDialog, setShowEligibilityDialog] = useState(false);

  // Verificar autenticação
  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
  }, [isAuthenticated, navigate]);

  // Queries
  const { 
    data: eleicao, 
    isLoading: loadingEleicao,
    error: errorEleicao 
  } = useQuery({
    queryKey: ['eleicao-votacao', eleicaoId],
    queryFn: () => votacaoService.getEleicaoVotacao(Number(eleicaoId)),
    enabled: !!eleicaoId && isAuthenticated
  });

  const { 
    data: statusVotacao,
    isLoading: loadingStatus 
  } = useQuery({
    queryKey: ['status-votacao', eleicaoId],
    queryFn: () => votacaoService.getStatusVotacao(Number(eleicaoId)),
    enabled: !!eleicaoId && isAuthenticated
  });

  const { 
    data: eligibilidade,
    isLoading: loadingEligibilidade
  } = useQuery({
    queryKey: ['elegibilidade', eleicaoId],
    queryFn: () => votacaoService.verificarElegibilidade(Number(eleicaoId)),
    enabled: !!eleicaoId && isAuthenticated
  });

  // Mutação para votar
  const votarMutation = useMutation({
    mutationFn: votacaoService.votar,
    onSuccess: (data) => {
      setConfirmacaoVoto(data);
      setActiveStep(2);
      setShowConfirmation(false);
      enqueueSnackbar('Voto registrado com sucesso!', { variant: 'success' });
      // Invalidar queries relacionadas
      queryClient.invalidateQueries({ queryKey: ['status-votacao', eleicaoId] });
    },
    onError: (error: any) => {
      const message = error.response?.data?.message || 'Erro ao registrar voto';
      enqueueSnackbar(message, { variant: 'error' });
    }
  });

  // Mutação para baixar comprovante
  const comprovanteMutation = useMutation({
    mutationFn: () => votacaoService.getComprovanteVotacao(Number(eleicaoId)),
    onSuccess: (blob) => {
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `comprovante-voto-${eleicaoId}.pdf`;
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
      enqueueSnackbar('Comprovante baixado com sucesso!', { variant: 'success' });
    },
    onError: (error: any) => {
      const message = error.response?.data?.message || 'Erro ao baixar comprovante';
      enqueueSnackbar(message, { variant: 'error' });
    }
  });

  // Handlers
  const handleSelectCandidato = (candidato: Candidato) => {
    setSelectedCandidato(candidato);
    setActiveStep(1);
    setShowConfirmation(true);
  };

  const handleConfirmVote = () => {
    if (selectedCandidato && eleicaoId) {
      votarMutation.mutate({
        eleicaoId: Number(eleicaoId),
        candidatoId: selectedCandidato.id
      });
    }
  };

  const handleCancelVote = () => {
    setShowConfirmation(false);
    setActiveStep(0);
    setSelectedCandidato(null);
  };

  const handleDownloadComprovante = () => {
    comprovanteMutation.mutate();
  };

  const handleVoltarEleicoes = () => {
    navigate('/eleicoes');
  };

  // Loading states
  if (loadingEleicao || loadingStatus || loadingEligibilidade) {
    return (
      <Container maxWidth="lg" sx={{ py: 4, textAlign: 'center' }}>
        <CircularProgress size={48} />
        <Typography variant="h6" sx={{ mt: 2 }}>
          Carregando informações da votação...
        </Typography>
      </Container>
    );
  }

  // Error states
  if (errorEleicao || !eleicao) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Alert severity="error" sx={{ mb: 2 }}>
          <Typography variant="h6" gutterBottom>
            Erro ao carregar eleição
          </Typography>
          <Typography>
            Não foi possível carregar as informações da eleição.
          </Typography>
        </Alert>
        <Button variant="contained" onClick={handleVoltarEleicoes}>
          Voltar para Eleições
        </Button>
      </Container>
    );
  }

  // Verificar se já votou
  if (statusVotacao?.jaVotou) {
    return (
      <Container maxWidth="md" sx={{ py: 4 }}>
        <Paper elevation={3} sx={{ p: 4, textAlign: 'center' }}>
          <CheckCircleIcon sx={{ fontSize: 64, color: 'success.main', mb: 2 }} />
          <Typography variant="h4" gutterBottom color="success.main" fontWeight="bold">
            Voto Já Registrado
          </Typography>
          <Typography variant="h6" color="textSecondary" gutterBottom>
            {eleicao.titulo}
          </Typography>
          <Typography variant="body1" sx={{ mb: 3 }}>
            Seu voto foi registrado em: {' '}
            <strong>
              {statusVotacao.dataVoto && 
                format(new Date(statusVotacao.dataVoto), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })
              }
            </strong>
          </Typography>
          {statusVotacao.numeroProtocolo && (
            <Typography variant="body2" color="textSecondary" sx={{ mb: 3 }}>
              Protocolo: <strong>{statusVotacao.numeroProtocolo}</strong>
            </Typography>
          )}
          <Box display="flex" gap={2} justifyContent="center">
            <Button
              variant="outlined"
              startIcon={<DownloadIcon />}
              onClick={handleDownloadComprovante}
              disabled={comprovanteMutation.isPending}
            >
              {comprovanteMutation.isPending ? 'Baixando...' : 'Baixar Comprovante'}
            </Button>
            <Button
              variant="contained"
              onClick={handleVoltarEleicoes}
            >
              Voltar para Eleições
            </Button>
          </Box>
        </Paper>
      </Container>
    );
  }

  // Verificar elegibilidade
  if (!eligibilidade?.podeVotar) {
    return (
      <Container maxWidth="md" sx={{ py: 4 }}>
        <Paper elevation={3} sx={{ p: 4, textAlign: 'center' }}>
          <ErrorIcon sx={{ fontSize: 64, color: 'error.main', mb: 2 }} />
          <Typography variant="h4" gutterBottom color="error.main" fontWeight="bold">
            Não Elegível para Votar
          </Typography>
          <Typography variant="h6" color="textSecondary" gutterBottom>
            {eleicao.titulo}
          </Typography>
          <Typography variant="body1" sx={{ mb: 3 }}>
            {eligibilidade?.motivo || 'Você não atende aos requisitos para votar nesta eleição.'}
          </Typography>
          
          {/* Requisitos */}
          {eligibilidade?.requisitos && (
            <Box sx={{ mb: 3 }}>
              <Typography variant="h6" gutterBottom>
                Requisitos:
              </Typography>
              <List>
                <ListItem>
                  <ListItemIcon>
                    {eligibilidade.requisitos.situacaoRegular ? 
                      <CheckCircleIcon color="success" /> : 
                      <ErrorIcon color="error" />
                    }
                  </ListItemIcon>
                  <ListItemText primary="Situação regular no CAU" />
                </ListItem>
                <ListItem>
                  <ListItemIcon>
                    {eligibilidade.requisitos.anuidadeEmDia ? 
                      <CheckCircleIcon color="success" /> : 
                      <ErrorIcon color="error" />
                    }
                  </ListItemIcon>
                  <ListItemText primary="Anuidade em dia" />
                </ListItem>
                <ListItem>
                  <ListItemIcon>
                    {eligibilidade.requisitos.habilitacaoAtiva ? 
                      <CheckCircleIcon color="success" /> : 
                      <ErrorIcon color="error" />
                    }
                  </ListItemIcon>
                  <ListItemText primary="Habilitação ativa" />
                </ListItem>
              </List>
            </Box>
          )}
          
          <Button variant="contained" onClick={handleVoltarEleicoes}>
            Voltar para Eleições
          </Button>
        </Paper>
      </Container>
    );
  }

  // Verificar se a eleição está ativa
  if (eleicao.situacao !== 'EmAndamento') {
    return (
      <Container maxWidth="md" sx={{ py: 4 }}>
        <Alert severity="warning" sx={{ mb: 2 }}>
          <Typography variant="h6" gutterBottom>
            Eleição Não Disponível para Votação
          </Typography>
          <Typography>
            Esta eleição não está em andamento no momento.
          </Typography>
        </Alert>
        <Button variant="contained" onClick={handleVoltarEleicoes}>
          Voltar para Eleições
        </Button>
      </Container>
    );
  }

  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      {/* Header */}
      <Box mb={4} textAlign="center">
        <Typography variant="h3" component="h1" gutterBottom fontWeight="bold">
          {eleicao.titulo}
        </Typography>
        <Typography variant="h6" color="textSecondary" gutterBottom>
          {eleicao.descricao}
        </Typography>
        
        {/* Informações da eleição */}
        <Box display="flex" justifyContent="center" gap={2} mt={2}>
          <Chip
            icon={<ScheduleIcon />}
            label={`${format(new Date(eleicao.dataInicio), 'dd/MM/yyyy', { locale: ptBR })} - ${format(new Date(eleicao.dataFim), 'dd/MM/yyyy', { locale: ptBR })}`}
            color="info"
          />
          <Chip
            icon={<VoteIcon />}
            label={eleicao.tipoEleicao}
            color="primary"
          />
          {eleicao.uf && (
            <Chip
              label={eleicao.uf.sigla}
              color="secondary"
            />
          )}
        </Box>
      </Box>

      {/* Stepper */}
      <Paper elevation={2} sx={{ p: 3, mb: 4 }}>
        <Stepper activeStep={activeStep} alternativeLabel>
          {steps.map((label, index) => (
            <Step key={label} completed={index < activeStep}>
              <StepLabel>{label}</StepLabel>
            </Step>
          ))}
        </Stepper>
      </Paper>

      {/* Instruções */}
      {activeStep === 0 && (
        <Alert severity="info" sx={{ mb: 4 }}>
          <Typography variant="body1">
            <strong>Como votar:</strong>
          </Typography>
          <Typography variant="body2">
            1. Escolha seu candidato clicando no botão "VOTAR" do cartão desejado<br/>
            2. Confirme sua escolha na tela seguinte<br/>
            3. Seu voto será registrado de forma definitiva
          </Typography>
        </Alert>
      )}

      {/* Lista de Candidatos */}
      {activeStep === 0 && eleicao.candidatos && eleicao.candidatos.length > 0 ? (
        <Grid container spacing={3}>
          {eleicao.candidatos.map((candidato) => (
            <Grid item xs={12} md={6} lg={4} key={candidato.id}>
              <CandidateCard
                candidato={candidato}
                isSelected={selectedCandidato?.id === candidato.id}
                onSelect={handleSelectCandidato}
                showDetails
              />
            </Grid>
          ))}
        </Grid>
      ) : activeStep === 0 && (
        <Alert severity="warning">
          <Typography variant="body1">
            Não há candidatos disponíveis para esta eleição.
          </Typography>
        </Alert>
      )}

      {/* Resultado Final */}
      {activeStep === 2 && confirmacaoVoto && (
        <Paper elevation={3} sx={{ p: 4, textAlign: 'center' }}>
          <CheckCircleIcon sx={{ fontSize: 64, color: 'success.main', mb: 2 }} />
          <Typography variant="h4" gutterBottom color="success.main" fontWeight="bold">
            Voto Registrado com Sucesso!
          </Typography>
          <Typography variant="body1" sx={{ mb: 2 }}>
            Data: <strong>{format(new Date(confirmacaoVoto.dataVoto), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}</strong>
          </Typography>
          <Typography variant="body2" color="textSecondary" sx={{ mb: 4 }}>
            Protocolo: <strong>{confirmacaoVoto.numeroProtocolo}</strong>
          </Typography>
          
          <Box display="flex" gap={2} justifyContent="center">
            <Button
              variant="outlined"
              startIcon={<DownloadIcon />}
              onClick={handleDownloadComprovante}
              disabled={comprovanteMutation.isPending}
            >
              {comprovanteMutation.isPending ? 'Baixando...' : 'Baixar Comprovante'}
            </Button>
            <Button
              variant="contained"
              onClick={handleVoltarEleicoes}
            >
              Voltar para Eleições
            </Button>
          </Box>
        </Paper>
      )}

      {/* Dialog de Confirmação */}
      <VoteConfirmation
        open={showConfirmation}
        candidato={selectedCandidato}
        eleicaoTitulo={eleicao.titulo}
        onConfirm={handleConfirmVote}
        onCancel={handleCancelVote}
        isLoading={votarMutation.isPending}
      />
    </Container>
  );
};
