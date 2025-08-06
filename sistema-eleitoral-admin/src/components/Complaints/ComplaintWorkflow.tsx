import React, { FC, useState } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Stepper,
  Step,
  StepLabel,
  StepContent,
  Button,
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Alert,
  Chip,
  
  
  
  
  
  
  
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Grid,
  Paper,
  Divider,
  CircularProgress,
} from '@mui/material';
import {
  Assignment,
  Gavel,
  Description,
  Schedule,
  CheckCircle,
  Warning,
  Error,
  AttachFile,
  Person,
  AccessTime,
} from '@mui/icons-material';
import { format, parseISO } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useAppSelector, useAppDispatch } from '../../store/hooks';
import {
  analisarAdmissibilidade,
  apresentarDefesa,
  produzirProvas,
  realizarAudiencia,
  apresentarAlegacoes,
  julgarPrimeiraInstancia,
  julgarSegundaInstancia,
} from '../../store/slices/denunciasSlice';
import { Denuncia, DenunciaStatus } from '../../types/denuncias.types';

interface ComplaintWorkflowProps {
  denuncia: Denuncia;
  onUpdate?: () => void;
}

const workflowSteps = [
  { key: 'protocolada', label: 'Protocolada', icon: <Assignment /> },
  { key: 'analise_admissibilidade', label: 'Análise de Admissibilidade', icon: <Gavel /> },
  { key: 'aguardando_defesa', label: 'Aguardando Defesa', icon: <Schedule /> },
  { key: 'defesa_apresentada', label: 'Defesa Apresentada', icon: <Description /> },
  { key: 'producao_provas', label: 'Produção de Provas', icon: <AttachFile /> },
  { key: 'audiencia_instrucao', label: 'Audiência de Instrução', icon: <Person /> },
  { key: 'alegacoes_finais', label: 'Alegações Finais', icon: <Description /> },
  { key: 'julgamento_primeira_instancia', label: 'Julgamento 1ª Instância', icon: <Gavel /> },
  { key: 'julgamento_segunda_instancia', label: 'Julgamento 2ª Instância', icon: <Gavel /> },
  { key: 'transitado_julgado', label: 'Transitado em Julgado', icon: <CheckCircle /> },
];

const admissibilidadeSchema = z.object({
  decisao: z.boolean(),
  justificativa: z.string().min(10, 'Justificativa deve ter pelo menos 10 caracteres'),
});

const defesaSchema = z.object({
  defesa: z.string().min(50, 'Defesa deve ter pelo menos 50 caracteres'),
});

const provasSchema = z.object({
  provas: z.string().min(20, 'Descrição das provas deve ter pelo menos 20 caracteres'),
});

const audienciaSchema = z.object({
  ata: z.string().min(50, 'Ata da audiência deve ter pelo menos 50 caracteres'),
});

const alegacoesSchema = z.object({
  alegacoes: z.string().min(50, 'Alegações finais devem ter pelo menos 50 caracteres'),
});

const julgamentoSchema = z.object({
  decisao: z.enum(['procedente', 'improcedente', 'parcialmente_procedente']),
  fundamentacao: z.string().min(100, 'Fundamentação deve ter pelo menos 100 caracteres'),
});

export const ComplaintWorkflow: FC<ComplaintWorkflowProps> = ({
  denuncia,
  onUpdate,
}) => {
  const dispatch = useAppDispatch();
  const { isLoading } = useAppSelector((state) => state.denuncias);
  
  const [dialogOpen, setDialogOpen] = useState(false);
  const [dialogType, setDialogType] = useState<string>('');
  const [dialogTitle, setDialogTitle] = useState('');

  // Forms for different actions
  const admissibilidadeForm = useForm({
    resolver: zodResolver(admissibilidadeSchema),
  });

  const defesaForm = useForm({
    resolver: zodResolver(defesaSchema),
  });

  const provasForm = useForm({
    resolver: zodResolver(provasSchema),
  });

  const audienciaForm = useForm({
    resolver: zodResolver(audienciaSchema),
  });

  const alegacoesForm = useForm({
    resolver: zodResolver(alegacoesSchema),
  });

  const julgamentoForm = useForm({
    resolver: zodResolver(julgamentoSchema),
  });

  const getCurrentStepIndex = () => {
    return workflowSteps.findIndex(step => step.key === denuncia.status);
  };

  const getStatusColor = (status: DenunciaStatus) => {
    switch (status) {
      case 'protocolada':
      case 'analise_admissibilidade':
        return 'warning';
      case 'nao_admitida':
      case 'arquivada':
        return 'error';
      case 'transitado_julgado':
        return 'success';
      default:
        return 'primary';
    }
  };

  const handleOpenDialog = (type: string, title: string) => {
    setDialogType(type);
    setDialogTitle(title);
    setDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setDialogOpen(false);
    setDialogType('');
    setDialogTitle('');
  };

  const handleAdmissibilidade = async (data: any) => {
    try {
      await dispatch(analisarAdmissibilidade({
        id: denuncia.id,
        decisao: data.decisao,
        justificativa: data.justificativa,
      }));
      handleCloseDialog();
      onUpdate?.();
    } catch (error) {
      console.error('Erro ao analisar admissibilidade:', error);
    }
  };

  const handleDefesa = async (data: any) => {
    try {
      await dispatch(apresentarDefesa({
        id: denuncia.id,
        defesa: data.defesa,
      }));
      handleCloseDialog();
      onUpdate?.();
    } catch (error) {
      console.error('Erro ao apresentar defesa:', error);
    }
  };

  const handleProvas = async (data: any) => {
    try {
      await dispatch(produzirProvas({
        id: denuncia.id,
        provas: data.provas,
      }));
      handleCloseDialog();
      onUpdate?.();
    } catch (error) {
      console.error('Erro ao produzir provas:', error);
    }
  };

  const handleAudiencia = async (data: any) => {
    try {
      await dispatch(realizarAudiencia({
        id: denuncia.id,
        ata: data.ata,
      }));
      handleCloseDialog();
      onUpdate?.();
    } catch (error) {
      console.error('Erro ao realizar audiência:', error);
    }
  };

  const handleAlegacoes = async (data: any) => {
    try {
      await dispatch(apresentarAlegacoes({
        id: denuncia.id,
        alegacoes: data.alegacoes,
      }));
      handleCloseDialog();
      onUpdate?.();
    } catch (error) {
      console.error('Erro ao apresentar alegações:', error);
    }
  };

  const handleJulgamentoPrimeira = async (data: any) => {
    try {
      await dispatch(julgarPrimeiraInstancia({
        id: denuncia.id,
        decisao: data.decisao,
        fundamentacao: data.fundamentacao,
      }));
      handleCloseDialog();
      onUpdate?.();
    } catch (error) {
      console.error('Erro ao julgar primeira instância:', error);
    }
  };

  const handleJulgamentoSegunda = async (data: any) => {
    try {
      await dispatch(julgarSegundaInstancia({
        id: denuncia.id,
        decisao: data.decisao,
        fundamentacao: data.fundamentacao,
      }));
      handleCloseDialog();
      onUpdate?.();
    } catch (error) {
      console.error('Erro ao julgar segunda instância:', error);
    }
  };

  const getNextActions = () => {
    const actions = [];

    switch (denuncia.status) {
      case 'analise_admissibilidade':
        actions.push({
          label: 'Analisar Admissibilidade',
          action: () => handleOpenDialog('admissibilidade', 'Análise de Admissibilidade'),
          color: 'primary' as const,
        });
        break;
      case 'aguardando_defesa':
        actions.push({
          label: 'Apresentar Defesa',
          action: () => handleOpenDialog('defesa', 'Apresentar Defesa'),
          color: 'primary' as const,
        });
        break;
      case 'defesa_apresentada':
        actions.push({
          label: 'Produzir Provas',
          action: () => handleOpenDialog('provas', 'Produção de Provas'),
          color: 'primary' as const,
        });
        break;
      case 'producao_provas':
        actions.push({
          label: 'Realizar Audiência',
          action: () => handleOpenDialog('audiencia', 'Audiência de Instrução'),
          color: 'primary' as const,
        });
        break;
      case 'audiencia_instrucao':
        actions.push({
          label: 'Apresentar Alegações',
          action: () => handleOpenDialog('alegacoes', 'Alegações Finais'),
          color: 'primary' as const,
        });
        break;
      case 'alegacoes_finais':
        actions.push({
          label: 'Julgar 1ª Instância',
          action: () => handleOpenDialog('julgamento1', 'Julgamento 1ª Instância'),
          color: 'primary' as const,
        });
        break;
      case 'julgamento_primeira_instancia':
        actions.push({
          label: 'Julgar 2ª Instância',
          action: () => handleOpenDialog('julgamento2', 'Julgamento 2ª Instância'),
          color: 'primary' as const,
        });
        break;
    }

    return actions;
  };

  const renderActionDialog = () => {
    let form: any;
    let onSubmit: any;

    switch (dialogType) {
      case 'admissibilidade':
        form = admissibilidadeForm;
        onSubmit = handleAdmissibilidade;
        break;
      case 'defesa':
        form = defesaForm;
        onSubmit = handleDefesa;
        break;
      case 'provas':
        form = provasForm;
        onSubmit = handleProvas;
        break;
      case 'audiencia':
        form = audienciaForm;
        onSubmit = handleAudiencia;
        break;
      case 'alegacoes':
        form = alegacoesForm;
        onSubmit = handleAlegacoes;
        break;
      case 'julgamento1':
      case 'julgamento2':
        form = julgamentoForm;
        onSubmit = dialogType === 'julgamento1' ? handleJulgamentoPrimeira : handleJulgamentoSegunda;
        break;
      default:
        return null;
    }

    return (
      <Dialog open={dialogOpen} onClose={handleCloseDialog} maxWidth="md" fullWidth>
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <DialogTitle>{dialogTitle}</DialogTitle>
          <DialogContent>
            {dialogType === 'admissibilidade' && (
              <Grid container spacing={3} sx={{ mt: 1 }}>
                <Grid item xs={12}>
                  <Controller
                    name="decisao"
                    control={form.control}
                    render={({ field }) => (
                      <Box>
                        <Typography variant="subtitle2" gutterBottom>
                          Decisão:
                        </Typography>
                        <Button
                          variant={field.value === true ? 'contained' : 'outlined'}
                          color="success"
                          onClick={() => field.onChange(true)}
                          sx={{ mr: 1 }}
                        >
                          Admitir
                        </Button>
                        <Button
                          variant={field.value === false ? 'contained' : 'outlined'}
                          color="error"
                          onClick={() => field.onChange(false)}
                        >
                          Não Admitir
                        </Button>
                      </Box>
                    )}
                  />
                </Grid>
                <Grid item xs={12}>
                  <Controller
                    name="justificativa"
                    control={form.control}
                    render={({ field }) => (
                      <TextField
                        {...field}
                        label="Justificativa"
                        fullWidth
                        multiline
                        rows={4}
                        error={!!form.formState.errors.justificativa}
                        helperText={form.formState.errors.justificativa?.message}
                      />
                    )}
                  />
                </Grid>
              </Grid>
            )}

            {(dialogType === 'julgamento1' || dialogType === 'julgamento2') && (
              <Grid container spacing={3} sx={{ mt: 1 }}>
                <Grid item xs={12}>
                  <Controller
                    name="decisao"
                    control={form.control}
                    render={({ field }) => (
                      <Box>
                        <Typography variant="subtitle2" gutterBottom>
                          Decisão:
                        </Typography>
                        <Button
                          variant={field.value === 'procedente' ? 'contained' : 'outlined'}
                          color="success"
                          onClick={() => field.onChange('procedente')}
                          sx={{ mr: 1 }}
                        >
                          Procedente
                        </Button>
                        <Button
                          variant={field.value === 'improcedente' ? 'contained' : 'outlined'}
                          color="error"
                          onClick={() => field.onChange('improcedente')}
                          sx={{ mr: 1 }}
                        >
                          Improcedente
                        </Button>
                        <Button
                          variant={field.value === 'parcialmente_procedente' ? 'contained' : 'outlined'}
                          color="warning"
                          onClick={() => field.onChange('parcialmente_procedente')}
                        >
                          Parcialmente Procedente
                        </Button>
                      </Box>
                    )}
                  />
                </Grid>
                <Grid item xs={12}>
                  <Controller
                    name="fundamentacao"
                    control={form.control}
                    render={({ field }) => (
                      <TextField
                        {...field}
                        label="Fundamentação"
                        fullWidth
                        multiline
                        rows={6}
                        error={!!form.formState.errors.fundamentacao}
                        helperText={form.formState.errors.fundamentacao?.message}
                      />
                    )}
                  />
                </Grid>
              </Grid>
            )}

            {['defesa', 'provas', 'audiencia', 'alegacoes'].includes(dialogType) && (
              <Controller
                name={dialogType === 'defesa' ? 'defesa' : 
                     dialogType === 'provas' ? 'provas' :
                     dialogType === 'audiencia' ? 'ata' : 'alegacoes'}
                control={form.control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    label={dialogType === 'defesa' ? 'Defesa' : 
                           dialogType === 'provas' ? 'Descrição das Provas' :
                           dialogType === 'audiencia' ? 'Ata da Audiência' : 'Alegações Finais'}
                    fullWidth
                    multiline
                    rows={6}
                    sx={{ mt: 2 }}
                    error={!!form.formState.errors[dialogType === 'defesa' ? 'defesa' : 
                                                    dialogType === 'provas' ? 'provas' :
                                                    dialogType === 'audiencia' ? 'ata' : 'alegacoes']}
                    helperText={form.formState.errors[dialogType === 'defesa' ? 'defesa' : 
                                                      dialogType === 'provas' ? 'provas' :
                                                      dialogType === 'audiencia' ? 'ata' : 'alegacoes']?.message}
                  />
                )}
              />
            )}
          </DialogContent>
          <DialogActions>
            <Button onClick={handleCloseDialog}>Cancelar</Button>
            <Button type="submit" variant="contained" disabled={isLoading}>
              {isLoading ? <CircularProgress size={20} /> : 'Confirmar'}
            </Button>
          </DialogActions>
        </form>
      </Dialog>
    );
  };

  return (
    <Box>
      <Grid container spacing={3}>
        {/* Status Current */}
        <Grid item xs={12}>
          <Card>
            <CardContent>
              <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                <Typography variant="h6">
                  Status Atual
                </Typography>
                <Chip
                  label={denuncia.status.replace('_', ' ').toUpperCase()}
                  color={getStatusColor(denuncia.status)}
                  variant="outlined"
                />
              </Box>
              
              <Box display="flex" gap={2} flexWrap="wrap">
                {getNextActions().map((action, index) => (
                  <Button
                    key={index}
                    variant="contained"
                    color={action.color}
                    onClick={action.action}
                    disabled={isLoading}
                  >
                    {action.label}
                  </Button>
                ))}
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Workflow Progress */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Progresso do Processo
              </Typography>
              
              <Stepper activeStep={getCurrentStepIndex()} orientation="vertical">
                {workflowSteps.map((step, index) => (
                  <Step key={step.key}>
                    <StepLabel
                      StepIconComponent={() => (
                        <Box
                          display="flex"
                          alignItems="center"
                          justifyContent="center"
                          width={32}
                          height={32}
                          borderRadius="50%"
                          bgcolor={index <= getCurrentStepIndex() ? 'primary.main' : 'grey.300'}
                          color={index <= getCurrentStepIndex() ? 'white' : 'grey.600'}
                        >
                          {step.icon}
                        </Box>
                      )}
                    >
                      {step.label}
                    </StepLabel>
                  </Step>
                ))}
              </Stepper>
            </CardContent>
          </Card>
        </Grid>

        {/* Timeline */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Histórico do Processo
              </Typography>
              
              <div>
                {denuncia.processoJudicial?.fases?.map((fase, index) => (
                  <div key={fase.id}>
                    <Typography
                      sx={{ m: 'auto 0' }}
                      align="right"
                      variant="body2"
                      color="text.secondary"
                    >
                      {fase.dataFim && format(parseISO(fase.dataFim), 'dd/MM/yyyy HH:mm', { locale: ptBR })}
                    </Typography>
                    <div>
                      <div>
                        <AccessTime />
                      </div>
                      {index < (denuncia.processoJudicial?.fases?.length || 0) - 1 && (
                        <div />
                      )}
                    </div>
                    <div>
                      <Typography variant="h6" component="span">
                        {fase.nome}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {fase.descricao}
                      </Typography>
                      {fase.observacoes && (
                        <Typography variant="caption" display="block">
                          {fase.observacoes}
                        </Typography>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {renderActionDialog()}
    </Box>
  );
};