import React, { FC, useState, useEffect } from 'react';
import {
  Box, Typography, Card, Stepper, Step, StepLabel, StepContent,
  Button, TextField, Dialog, DialogTitle, DialogContent, DialogActions,
  Alert, Stack, Chip, Divider, Grid, List, ListItem, ListItemText,
  ListItemIcon, IconButton, Tooltip, FormControlLabel, Switch,
  Accordion, AccordionSummary, AccordionDetails
} from '@mui/material';
import {
  CheckCircle as CheckCircleIcon,
  Schedule as ScheduleIcon,
  Gavel as GavelIcon,
  Edit as EditIcon,
  Visibility as VisibilityIcon,
  Warning as WarningIcon,
  Person as PersonIcon,
  AttachFile as AttachFileIcon,
  Timeline as TimelineIcon,
  ExpandMore as ExpandMoreIcon,
  PlayArrow as PlayArrowIcon,
  Pause as PauseIcon,
  Archive as ArchiveIcon
} from '@mui/icons-material';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

// Interface para os dados do workflow
interface WorkflowStep {
  id: string;
  label: string;
  description: string;
  status: 'completed' | 'active' | 'pending' | 'error';
  completedDate?: string;
  dueDate?: string;
  assignedTo?: string;
  documents?: string[];
  actions?: WorkflowAction[];
}

interface WorkflowAction {
  id: string;
  label: string;
  type: 'primary' | 'secondary' | 'danger';
  enabled: boolean;
  requiresConfirmation?: boolean;
  requiresInput?: boolean;
}

interface ComplaintWorkflowProps {
  denunciaId: number;
  onClose: () => void;
}

export const ComplaintWorkflow: FC<ComplaintWorkflowProps> = ({ 
  denunciaId, 
  onClose 
}) => {
  // Estados para controle do workflow
  const [activeStep, setActiveStep] = useState(0);
  const [actionDialog, setActionDialog] = useState<{
    open: boolean;
    action: WorkflowAction | null;
    stepId: string;
  }>({
    open: false,
    action: null,
    stepId: ''
  });
  const [inputValue, setInputValue] = useState('');
  const [loading, setLoading] = useState(false);
  const [denuncia, setDenuncia] = useState<any>(null);

  // Definição dos passos do workflow legal
  const workflowSteps: WorkflowStep[] = [
    {
      id: 'recebimento',
      label: 'Recebimento',
      description: 'Denúncia protocolada e registrada no sistema',
      status: 'completed',
      completedDate: '2024-01-15T10:30:00',
      documents: ['Formulário de denúncia', 'Documentos anexos'],
      actions: [
        {
          id: 'view_documents',
          label: 'Ver Documentos',
          type: 'secondary',
          enabled: true
        }
      ]
    },
    {
      id: 'analise_admissibilidade',
      label: 'Análise de Admissibilidade',
      description: 'Verificação dos requisitos legais para processamento',
      status: 'active',
      assignedTo: 'Comissão Eleitoral Nacional',
      dueDate: '2024-01-25T23:59:59',
      actions: [
        {
          id: 'admit',
          label: 'Admitir Denúncia',
          type: 'primary',
          enabled: true,
          requiresConfirmation: true
        },
        {
          id: 'reject',
          label: 'Inadmitir Denúncia',
          type: 'danger',
          enabled: true,
          requiresConfirmation: true,
          requiresInput: true
        }
      ]
    },
    {
      id: 'notificacao_defesa',
      label: 'Notificação para Defesa',
      description: 'Intimação do denunciado para apresentar defesa (15 dias úteis)',
      status: 'pending',
      actions: [
        {
          id: 'send_notification',
          label: 'Enviar Notificação',
          type: 'primary',
          enabled: false
        }
      ]
    },
    {
      id: 'prazo_defesa',
      label: 'Prazo para Defesa',
      description: 'Aguardando apresentação da defesa pelo denunciado',
      status: 'pending',
      dueDate: '2024-02-15T23:59:59',
      actions: [
        {
          id: 'receive_defense',
          label: 'Registrar Defesa Recebida',
          type: 'primary',
          enabled: false,
          requiresInput: true
        },
        {
          id: 'mark_no_defense',
          label: 'Marcar como Revelia',
          type: 'secondary',
          enabled: false
        }
      ]
    },
    {
      id: 'producao_provas',
      label: 'Produção de Provas',
      description: 'Período para coleta e análise de provas (30 dias)',
      status: 'pending',
      actions: [
        {
          id: 'open_evidence_period',
          label: 'Abrir Prazo para Provas',
          type: 'primary',
          enabled: false
        },
        {
          id: 'close_evidence_period',
          label: 'Encerrar Prazo para Provas',
          type: 'secondary',
          enabled: false
        }
      ]
    },
    {
      id: 'audiencia_instrucao',
      label: 'Audiência de Instrução',
      description: 'Oitiva de testemunhas e esclarecimentos',
      status: 'pending',
      actions: [
        {
          id: 'schedule_hearing',
          label: 'Agendar Audiência',
          type: 'primary',
          enabled: false,
          requiresInput: true
        },
        {
          id: 'conduct_hearing',
          label: 'Realizar Audiência',
          type: 'primary',
          enabled: false,
          requiresInput: true
        }
      ]
    },
    {
      id: 'alegacoes_finais',
      label: 'Alegações Finais',
      description: 'Manifestações finais das partes (10 dias)',
      status: 'pending',
      actions: [
        {
          id: 'receive_final_arguments',
          label: 'Receber Alegações',
          type: 'primary',
          enabled: false,
          requiresInput: true
        }
      ]
    },
    {
      id: 'julgamento_primeira_instancia',
      label: 'Julgamento - 1ª Instância',
      description: 'Deliberação da Comissão Eleitoral',
      status: 'pending',
      actions: [
        {
          id: 'schedule_judgment',
          label: 'Agendar Julgamento',
          type: 'primary',
          enabled: false
        },
        {
          id: 'conduct_judgment',
          label: 'Realizar Julgamento',
          type: 'primary',
          enabled: false,
          requiresInput: true
        }
      ]
    },
    {
      id: 'prazo_recurso',
      label: 'Prazo para Recurso',
      description: 'Período para interposição de recurso (15 dias úteis)',
      status: 'pending',
      actions: [
        {
          id: 'file_appeal',
          label: 'Protocolar Recurso',
          type: 'secondary',
          enabled: false,
          requiresInput: true
        }
      ]
    },
    {
      id: 'julgamento_segunda_instancia',
      label: 'Julgamento - 2ª Instância',
      description: 'Análise do recurso pela instância superior',
      status: 'pending',
      actions: [
        {
          id: 'judge_appeal',
          label: 'Julgar Recurso',
          type: 'primary',
          enabled: false,
          requiresInput: true
        }
      ]
    },
    {
      id: 'arquivamento',
      label: 'Arquivamento',
      description: 'Processo finalizado e arquivado',
      status: 'pending',
      actions: [
        {
          id: 'archive',
          label: 'Arquivar Processo',
          type: 'primary',
          enabled: false,
          requiresInput: true
        }
      ]
    }
  ];

  useEffect(() => {
    // Simular carregamento dos dados da denúncia
    setDenuncia({
      id: denunciaId,
      protocolo: 'DEN/2024/000123',
      status: 'EmAnalise',
      denunciante: 'João Silva',
      tipoDenuncia: 'Conduta irregular em campanha',
      dataRecebimento: '2024-01-15T10:30:00'
    });

    // Definir o passo ativo baseado no status
    setActiveStep(1); // Em análise de admissibilidade
  }, [denunciaId]);

  const handleAction = (action: WorkflowAction, stepId: string) => {
    if (action.requiresConfirmation || action.requiresInput) {
      setActionDialog({
        open: true,
        action,
        stepId
      });
    } else {
      executeAction(action, stepId);
    }
  };

  const executeAction = async (action: WorkflowAction, stepId: string, input?: string) => {
    setLoading(true);
    
    try {
      // Simular chamada para API
      console.log('Executing action:', action.id, 'for step:', stepId, 'with input:', input);
      
      // Aqui seria feita a chamada real para a API
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Atualizar o estado do workflow
      // Esta lógica seria baseada na resposta da API
      
    } catch (error) {
      console.error('Error executing action:', error);
    } finally {
      setLoading(false);
      setActionDialog({ open: false, action: null, stepId: '' });
      setInputValue('');
    }
  };

  const getStepIcon = (step: WorkflowStep) => {
    switch (step.status) {
      case 'completed':
        return <CheckCircleIcon color="success" />;
      case 'active':
        return <PlayArrowIcon color="primary" />;
      case 'error':
        return <WarningIcon color="error" />;
      default:
        return <ScheduleIcon color="disabled" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'success';
      case 'active':
        return 'primary';
      case 'error':
        return 'error';
      default:
        return 'default';
    }
  };

  return (
    <Box sx={{ p: 3 }}>
      {/* Cabeçalho */}
      <Box sx={{ mb: 3 }}>
        <Typography variant="h5" gutterBottom>
          Workflow da Denúncia {denuncia?.protocolo}
        </Typography>
        <Typography variant="body2" color="textSecondary">
          Acompanhamento completo do processo legal de denúncia eleitoral
        </Typography>
      </Box>

      {/* Informações rápidas */}
      {denuncia && (
        <Card sx={{ p: 2, mb: 3 }}>
          <Grid container spacing={2}>
            <Grid item xs={12} md={3}>
              <Typography variant="caption" color="textSecondary">Denunciante</Typography>
              <Typography variant="body2">{denuncia.denunciante}</Typography>
            </Grid>
            <Grid item xs={12} md={3}>
              <Typography variant="caption" color="textSecondary">Tipo</Typography>
              <Typography variant="body2">{denuncia.tipoDenuncia}</Typography>
            </Grid>
            <Grid item xs={12} md={3}>
              <Typography variant="caption" color="textSecondary">Data Recebimento</Typography>
              <Typography variant="body2">
                {format(new Date(denuncia.dataRecebimento), 'dd/MM/yyyy HH:mm', { locale: ptBR })}
              </Typography>
            </Grid>
            <Grid item xs={12} md={3}>
              <Typography variant="caption" color="textSecondary">Status Atual</Typography>
              <Chip 
                label={denuncia.status} 
                color={getStatusColor(denuncia.status) as any}
                size="small" 
              />
            </Grid>
          </Grid>
        </Card>
      )}

      {/* Workflow Steps */}
      <Card>
        <Stepper activeStep={activeStep} orientation="vertical">
          {workflowSteps.map((step, index) => (
            <Step key={step.id} completed={step.status === 'completed'}>
              <StepLabel 
                icon={getStepIcon(step)}
                error={step.status === 'error'}
              >
                <Stack direction="row" alignItems="center" spacing={2}>
                  <Typography variant="h6">{step.label}</Typography>
                  <Chip 
                    label={step.status === 'active' ? 'Em andamento' : 
                          step.status === 'completed' ? 'Concluído' :
                          step.status === 'error' ? 'Erro' : 'Pendente'} 
                    color={getStatusColor(step.status) as any}
                    size="small" 
                  />
                </Stack>
              </StepLabel>
              
              <StepContent>
                <Box sx={{ pb: 2 }}>
                  <Typography variant="body2" color="textSecondary" paragraph>
                    {step.description}
                  </Typography>

                  {/* Informações do passo */}
                  <Grid container spacing={2} sx={{ mb: 2 }}>
                    {step.assignedTo && (
                      <Grid item xs={12} sm={6}>
                        <Stack direction="row" alignItems="center" spacing={1}>
                          <PersonIcon fontSize="small" color="action" />
                          <Typography variant="caption">
                            <strong>Responsável:</strong> {step.assignedTo}
                          </Typography>
                        </Stack>
                      </Grid>
                    )}
                    
                    {step.completedDate && (
                      <Grid item xs={12} sm={6}>
                        <Stack direction="row" alignItems="center" spacing={1}>
                          <CheckCircleIcon fontSize="small" color="success" />
                          <Typography variant="caption">
                            <strong>Concluído em:</strong> {format(new Date(step.completedDate), 'dd/MM/yyyy HH:mm', { locale: ptBR })}
                          </Typography>
                        </Stack>
                      </Grid>
                    )}
                    
                    {step.dueDate && (
                      <Grid item xs={12} sm={6}>
                        <Stack direction="row" alignItems="center" spacing={1}>
                          <ScheduleIcon fontSize="small" color="warning" />
                          <Typography variant="caption">
                            <strong>Prazo:</strong> {format(new Date(step.dueDate), 'dd/MM/yyyy HH:mm', { locale: ptBR })}
                          </Typography>
                        </Stack>
                      </Grid>
                    )}
                  </Grid>

                  {/* Documentos */}
                  {step.documents && step.documents.length > 0 && (
                    <Accordion sx={{ mb: 2 }}>
                      <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                        <Stack direction="row" alignItems="center" spacing={1}>
                          <AttachFileIcon fontSize="small" />
                          <Typography variant="body2">
                            Documentos ({step.documents.length})
                          </Typography>
                        </Stack>
                      </AccordionSummary>
                      <AccordionDetails>
                        <List dense>
                          {step.documents.map((doc, idx) => (
                            <ListItem key={idx}>
                              <ListItemIcon>
                                <AttachFileIcon fontSize="small" />
                              </ListItemIcon>
                              <ListItemText primary={doc} />
                              <IconButton size="small">
                                <VisibilityIcon fontSize="small" />
                              </IconButton>
                            </ListItem>
                          ))}
                        </List>
                      </AccordionDetails>
                    </Accordion>
                  )}

                  {/* Ações disponíveis */}
                  {step.actions && step.actions.length > 0 && (
                    <Box>
                      <Typography variant="body2" gutterBottom>
                        <strong>Ações disponíveis:</strong>
                      </Typography>
                      <Stack direction="row" spacing={1} flexWrap="wrap">
                        {step.actions.map((action) => (
                          <Button
                            key={action.id}
                            variant={action.type === 'primary' ? 'contained' : 
                                   action.type === 'danger' ? 'outlined' : 'text'}
                            color={action.type === 'danger' ? 'error' : 
                                  action.type === 'primary' ? 'primary' : 'secondary'}
                            size="small"
                            disabled={!action.enabled || loading}
                            onClick={() => handleAction(action, step.id)}
                          >
                            {action.label}
                          </Button>
                        ))}
                      </Stack>
                    </Box>
                  )}
                </Box>
              </StepContent>
            </Step>
          ))}
        </Stepper>
      </Card>

      {/* Dialog de Confirmação/Input */}
      <Dialog
        open={actionDialog.open}
        onClose={() => setActionDialog({ open: false, action: null, stepId: '' })}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          {actionDialog.action?.label}
        </DialogTitle>
        <DialogContent>
          <Typography variant="body2" color="textSecondary" paragraph>
            Tem certeza que deseja executar esta ação?
          </Typography>
          
          {actionDialog.action?.requiresInput && (
            <TextField
              fullWidth
              multiline
              rows={4}
              label="Observações / Justificativa"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              placeholder="Digite a justificativa para esta ação..."
              sx={{ mt: 2 }}
            />
          )}
        </DialogContent>
        <DialogActions>
          <Button 
            onClick={() => setActionDialog({ open: false, action: null, stepId: '' })}
            disabled={loading}
          >
            Cancelar
          </Button>
          <Button
            variant="contained"
            color={actionDialog.action?.type === 'danger' ? 'error' : 'primary'}
            onClick={() => actionDialog.action && executeAction(
              actionDialog.action, 
              actionDialog.stepId, 
              actionDialog.action.requiresInput ? inputValue : undefined
            )}
            disabled={loading || (actionDialog.action?.requiresInput && !inputValue.trim())}
          >
            {loading ? 'Executando...' : 'Confirmar'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Botões de ação geral */}
      <Stack direction="row" spacing={2} sx={{ mt: 3 }} justifyContent="flex-end">
        <Button
          variant="outlined"
          startIcon={<TimelineIcon />}
          onClick={() => console.log('View full timeline')}
        >
          Histórico Completo
        </Button>
        
        <Button
          variant="outlined"
          startIcon={<ArchiveIcon />}
          onClick={() => console.log('Generate report')}
        >
          Relatório do Processo
        </Button>
        
        <Button onClick={onClose}>
          Fechar
        </Button>
      </Stack>
    </Box>
  );
};