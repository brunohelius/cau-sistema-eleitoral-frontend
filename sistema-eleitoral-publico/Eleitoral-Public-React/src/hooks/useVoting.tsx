import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useSnackbar } from 'notistack';
import {
  votacaoService,
  Candidato,
  EleicaoVotacao,
  VotoRequest,
  ConfirmacaoVoto,
  StatusVotacao
} from '../services/api/votacaoService';

export const useVoting = (eleicaoId: number) => {
  const { enqueueSnackbar } = useSnackbar();
  const queryClient = useQueryClient();
  
  // Estados locais
  const [selectedCandidato, setSelectedCandidato] = useState<Candidato | null>(null);
  const [showConfirmation, setShowConfirmation] = useState(false);

  // Query para buscar a eleição
  const {
    data: eleicao,
    isLoading: loadingEleicao,
    error: errorEleicao,
    refetch: refetchEleicao
  } = useQuery({
    queryKey: ['eleicao-votacao', eleicaoId],
    queryFn: () => votacaoService.getEleicaoVotacao(eleicaoId),
    enabled: !!eleicaoId
  });

  // Query para status de votação
  const {
    data: statusVotacao,
    isLoading: loadingStatus,
    refetch: refetchStatus
  } = useQuery({
    queryKey: ['status-votacao', eleicaoId],
    queryFn: () => votacaoService.getStatusVotacao(eleicaoId),
    enabled: !!eleicaoId
  });

  // Query para elegibilidade
  const {
    data: eligibilidade,
    isLoading: loadingEligibilidade
  } = useQuery({
    queryKey: ['elegibilidade', eleicaoId],
    queryFn: () => votacaoService.verificarElegibilidade(eleicaoId),
    enabled: !!eleicaoId
  });

  // Query para resultados (se disponível)
  const {
    data: resultados,
    isLoading: loadingResultados,
    refetch: refetchResultados
  } = useQuery({
    queryKey: ['resultados-votacao', eleicaoId],
    queryFn: () => votacaoService.getResultados(eleicaoId),
    enabled: !!eleicaoId && statusVotacao?.jaVotou,
    retry: false // Não retentar se não houver resultados disponíveis
  });

  // Mutação para votar
  const votarMutation = useMutation({
    mutationFn: (votoData: VotoRequest) => votacaoService.votar(votoData),
    onSuccess: (data: ConfirmacaoVoto) => {
      enqueueSnackbar('Voto registrado com sucesso!', { variant: 'success' });
      
      // Invalidar e recarregar queries relacionadas
      queryClient.invalidateQueries({ queryKey: ['status-votacao', eleicaoId] });
      queryClient.invalidateQueries({ queryKey: ['eleicao-votacao', eleicaoId] });
      queryClient.invalidateQueries({ queryKey: ['eleicoes-disponiveis'] });
      
      // Fechar diálogo de confirmação
      setShowConfirmation(false);
      setSelectedCandidato(null);
      
      return data;
    },
    onError: (error: any) => {
      const message = error.response?.data?.message || 'Erro ao registrar voto';
      enqueueSnackbar(message, { variant: 'error' });
    }
  });

  // Mutação para baixar comprovante
  const comprovanteMutation = useMutation({
    mutationFn: () => votacaoService.getComprovanteVotacao(eleicaoId),
    onSuccess: (blob: Blob) => {
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `comprovante-voto-${eleicaoId}-${new Date().getTime()}.pdf`;
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

  // Mutação para justificar ausência
  const justificarMutation = useMutation({
    mutationFn: (justificativa: string) => votacaoService.justificarAusencia(eleicaoId, justificativa),
    onSuccess: () => {
      enqueueSnackbar('Justificativa registrada com sucesso!', { variant: 'success' });
      queryClient.invalidateQueries({ queryKey: ['status-votacao', eleicaoId] });
    },
    onError: (error: any) => {
      const message = error.response?.data?.message || 'Erro ao registrar justificativa';
      enqueueSnackbar(message, { variant: 'error' });
    }
  });

  // Funções de controle
  const handleSelectCandidato = (candidato: Candidato) => {
    setSelectedCandidato(candidato);
    setShowConfirmation(true);
  };

  const handleCancelVote = () => {
    setShowConfirmation(false);
    setSelectedCandidato(null);
  };

  const handleConfirmVote = async () => {
    if (selectedCandidato) {
      return await votarMutation.mutateAsync({
        eleicaoId,
        candidatoId: selectedCandidato.id
      });
    }
  };

  const handleDownloadComprovante = () => {
    comprovanteMutation.mutate();
  };

  const handleJustificarAusencia = (justificativa: string) => {
    justificarMutation.mutate(justificativa);
  };

  // Funções de utilidade
  const canVote = () => {
    return eleicao?.situacao === 'EmAndamento' && 
           eligibilidade?.podeVotar && 
           !statusVotacao?.jaVotou;
  };

  const isEleicaoActive = () => {
    return eleicao?.situacao === 'EmAndamento';
  };

  const hasVoted = () => {
    return statusVotacao?.jaVotou || false;
  };

  const getVotingStatus = () => {
    if (!eleicao || !statusVotacao || !eligibilidade) {
      return 'loading';
    }

    if (hasVoted()) {
      return 'voted';
    }

    if (!eligibilidade.podeVotar) {
      return 'ineligible';
    }

    if (!isEleicaoActive()) {
      return 'inactive';
    }

    return 'can-vote';
  };

  return {
    // Dados
    eleicao,
    statusVotacao,
    eligibilidade,
    resultados,
    selectedCandidato,
    showConfirmation,

    // Estados de carregamento
    isLoading: loadingEleicao || loadingStatus || loadingEligibilidade,
    loadingEleicao,
    loadingStatus,
    loadingEligibilidade,
    loadingResultados,
    errorEleicao,

    // Mutações
    votarMutation,
    comprovanteMutation,
    justificarMutation,

    // Funções de controle
    handleSelectCandidato,
    handleCancelVote,
    handleConfirmVote,
    handleDownloadComprovante,
    handleJustificarAusencia,

    // Funções de utilidade
    canVote,
    isEleicaoActive,
    hasVoted,
    getVotingStatus,

    // Funções de refetch
    refetchEleicao,
    refetchStatus,
    refetchResultados
  };
};

export type VotingStatus = 'loading' | 'can-vote' | 'voted' | 'ineligible' | 'inactive';
