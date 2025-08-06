import React, { FC, useEffect, useState } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Grid,
  TextField,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Autocomplete,
  Chip,
  Alert,
  Stepper,
  Step,
  StepLabel,
  StepContent,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  LinearProgress,
} from '@mui/material';
import {
  Add,
  Delete,
  Person,
  Save,
  Cancel,
  CheckCircle,
  Warning,
} from '@mui/icons-material';
import { useForm, Controller, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useAppSelector, useAppDispatch } from '../../store/hooks';
import { createChapa, updateChapa, addMembroChapa } from '../../store/slices/chapasSlice';
import { ChapaFormData, MembroChapa } from '../types/chapas.types';

interface TicketFormProps {
  chapaId?: number;
  eleicaoId: number;
  onSuccess?: () => void;
  onCancel?: () => void;
}

const chapaSchema = z.object({
  nome: z.string().min(1, 'Nome é obrigatório'),
  slogan: z.string().optional(),
  tipo: z.enum(['nacional', 'estadual', 'ies']),
  uf: z.string().optional(),
  ies: z.string().optional(),
  coordenadorId: z.number({ required_error: 'Coordenador é obrigatório' }),
  viceId: z.number().optional(),
  observacoes: z.string().optional(),
}).refine((data) => {
  if (data.tipo === 'estadual' && !data.uf) {
    return false;
  }
  if (data.tipo === 'ies' && (!data.uf || !data.ies)) {
    return false;
  }
  return true;
}, {
  message: 'UF é obrigatória para chapas estaduais e IES',
  path: ['uf'],
});

type ChapaFormDataType = z.infer<typeof chapaSchema>;

const steps = [
  'Informações Básicas',
  'Coordenação',
  'Membros',
  'Revisão e Confirmação',
];

const UFs = [
  'AC', 'AL', 'AP', 'AM', 'BA', 'CE', 'DF', 'ES', 'GO', 'MA',
  'MT', 'MS', 'MG', 'PA', 'PB', 'PR', 'PE', 'PI', 'RJ', 'RN',
  'RS', 'RO', 'RR', 'SC', 'SP', 'SE', 'TO'
];

export const TicketForm: FC<TicketFormProps> = ({
  chapaId,
  eleicaoId,
  onSuccess,
  onCancel,
}) => {
  const dispatch = useAppDispatch();
  const { chapaAtual, isLoading, error } = useAppSelector((state) => state.chapas);
  
  const [activeStep, setActiveStep] = useState(0);
  const [selectedMembros, setSelectedMembros] = useState<MembroChapa[]>([]);
  const [membroDialogOpen, setMembroDialogOpen] = useState(false);
  const [diversidadeInfo, setDiversidadeInfo] = useState<any>(null);

  const {
    control,
    handleSubmit,
    watch,
    setValue,
    formState: { errors, isValid },
    reset,
  } = useForm<ChapaFormDataType>({
    resolver: zodResolver(chapaSchema),
    defaultValues: {
      tipo: 'estadual',
    },
  });

  const watchedTipo = watch('tipo');

  useEffect(() => {
    if (chapaAtual && chapaId) {
      reset({
        nome: chapaAtual.nome,
        slogan: chapaAtual.slogan,
        tipo: chapaAtual.tipo,
        uf: chapaAtual.uf,
        ies: chapaAtual.ies,
        coordenadorId: chapaAtual.coordenador.id,
        viceId: chapaAtual.vice?.id,
        observacoes: chapaAtual.observacoes,
      });
      setSelectedMembros(chapaAtual.membros);
    }
  }, [chapaAtual, chapaId, reset]);

  const handleNext = () => {
    setActiveStep((prevActiveStep) => prevActiveStep + 1);
  };

  const handleBack = () => {
    setActiveStep((prevActiveStep) => prevActiveStep - 1);
  };

  const handleAddMembro = () => {
    setMembroDialogOpen(true);
  };

  const handleRemoveMembro = (membroId: number) => {
    setSelectedMembros(prev => prev.filter(m => m.id !== membroId));
  };

  const calculateDiversidade = () => {
    const total = selectedMembros.length;
    if (total === 0) return null;

    const feminino = selectedMembros.filter(m => m.genero === 'feminino').length;
    const etnico = selectedMembros.filter(m => ['preto', 'pardo', 'amarelo', 'indigena'].includes(m.etnia)).length;
    const lgbtqi = selectedMembros.filter(m => m.lgbtqi).length;
    const pcd = selectedMembros.filter(m => m.pcd).length;

    return {
      totalMembros: total,
      percentualFeminino: (feminino / total) * 100,
      percentualEtnico: (etnico / total) * 100,
      percentualLGBTQI: (lgbtqi / total) * 100,
      percentualPCD: (pcd / total) * 100,
      atendeCriterios: (feminino / total) >= 0.3, // 30% mínimo
    };
  };

  useEffect(() => {
    setDiversidadeInfo(calculateDiversidade());
  }, [selectedMembros]);

  const onSubmit = async (data: ChapaFormDataType) => {
    try {
      const chapaData: ChapaFormData = {
        ...data,
        membrosIds: selectedMembros.map(m => m.id),
      };

      if (chapaId) {
        await dispatch(updateChapa({ id: chapaId, data: chapaData }));
      } else {
        await dispatch(createChapa(chapaData));
      }

      onSuccess?.();
    } catch (error) {
      console.error('Erro ao salvar chapa:', error);
    }
  };

  const renderStepContent = (step: number) => {
    switch (step) {
      case 0:
        return (
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <Controller
                name="nome"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    label="Nome da Chapa"
                    fullWidth
                    error={!!errors.nome}
                    helperText={errors.nome?.message}
                  />
                )}
              />
            </Grid>
            
            <Grid item xs={12}>
              <Controller
                name="slogan"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    label="Slogan (opcional)"
                    fullWidth
                    multiline
                    rows={2}
                  />
                )}
              />
            </Grid>
            
            <Grid item xs={6}>
              <Controller
                name="tipo"
                control={control}
                render={({ field }) => (
                  <FormControl fullWidth>
                    <InputLabel>Tipo de Chapa</InputLabel>
                    <Select {...field} label="Tipo de Chapa">
                      <MenuItem value="nacional">Nacional</MenuItem>
                      <MenuItem value="estadual">Estadual</MenuItem>
                      <MenuItem value="ies">IES</MenuItem>
                    </Select>
                  </FormControl>
                )}
              />
            </Grid>
            
            {(watchedTipo === 'estadual' || watchedTipo === 'ies') && (
              <Grid item xs={6}>
                <Controller
                  name="uf"
                  control={control}
                  render={({ field }) => (
                    <FormControl fullWidth>
                      <InputLabel>UF</InputLabel>
                      <Select {...field} label="UF" error={!!errors.uf}>
                        {UFs.map((uf) => (
                          <MenuItem key={uf} value={uf}>
                            {uf}
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  )}
                />
              </Grid>
            )}
            
            {watchedTipo === 'ies' && (
              <Grid item xs={12}>
                <Controller
                  name="ies"
                  control={control}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      label="Instituição de Ensino Superior"
                      fullWidth
                      error={!!errors.ies}
                      helperText={errors.ies?.message}
                    />
                  )}
                />
              </Grid>
            )}
          </Grid>
        );

      case 1:
        return (
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <Typography variant="h6" gutterBottom>
                Seleção da Coordenação
              </Typography>
              <Alert severity="info" sx={{ mb: 2 }}>
                Selecione o coordenador e vice-coordenador da chapa.
              </Alert>
            </Grid>
            
            {/* Implementar seleção de coordenador e vice */}
            <Grid item xs={12}>
              <Typography variant="body2" color="text.secondary">
                Interface de seleção de coordenador será implementada aqui.
              </Typography>
            </Grid>
          </Grid>
        );

      case 2:
        return (
          <Box>
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
              <Typography variant="h6">
                Membros da Chapa ({selectedMembros.length})
              </Typography>
              <Button
                variant="contained"
                startIcon={<Add />}
                onClick={handleAddMembro}
              >
                Adicionar Membro
              </Button>
            </Box>

            {diversidadeInfo && (
              <Card sx={{ mb: 2 }}>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    Análise de Diversidade
                  </Typography>
                  <Grid container spacing={2}>
                    <Grid item xs={3}>
                      <Typography variant="body2" color="text.secondary">
                        Feminino
                      </Typography>
                      <Typography variant="h6">
                        {diversidadeInfo.percentualFeminino.toFixed(1)}%
                      </Typography>
                    </Grid>
                    <Grid item xs={3}>
                      <Typography variant="body2" color="text.secondary">
                        Étnico
                      </Typography>
                      <Typography variant="h6">
                        {diversidadeInfo.percentualEtnico.toFixed(1)}%
                      </Typography>
                    </Grid>
                    <Grid item xs={3}>
                      <Typography variant="body2" color="text.secondary">
                        LGBTQI+
                      </Typography>
                      <Typography variant="h6">
                        {diversidadeInfo.percentualLGBTQI.toFixed(1)}%
                      </Typography>
                    </Grid>
                    <Grid item xs={3}>
                      <Typography variant="body2" color="text.secondary">
                        PCD
                      </Typography>
                      <Typography variant="h6">
                        {diversidadeInfo.percentualPCD.toFixed(1)}%
                      </Typography>
                    </Grid>
                  </Grid>
                  <Box mt={2}>
                    <Chip
                      icon={diversidadeInfo.atendeCriterios ? <CheckCircle /> : <Warning />}
                      label={diversidadeInfo.atendeCriterios ? 'Critérios atendidos' : 'Critérios não atendidos'}
                      color={diversidadeInfo.atendeCriterios ? 'success' : 'warning'}
                    />
                  </Box>
                </CardContent>
              </Card>
            )}

            <List>
              {selectedMembros.map((membro) => (
                <ListItem key={membro.id} divider>
                  <ListItemText
                    primary={membro.nome}
                    secondary={`${membro.cargo} - ${membro.cau} - ${membro.uf}`}
                  />
                  <ListItemSecondaryAction>
                    <IconButton
                      edge="end"
                      onClick={() => handleRemoveMembro(membro.id)}
                    >
                      <Delete />
                    </IconButton>
                  </ListItemSecondaryAction>
                </ListItem>
              ))}
            </List>
          </Box>
        );

      case 3:
        return (
          <Box>
            <Typography variant="h6" gutterBottom>
              Revisão e Confirmação
            </Typography>
            <Alert severity="info" sx={{ mb: 2 }}>
              Revise todas as informações antes de confirmar a chapa.
            </Alert>
            
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <Typography variant="subtitle2">Informações da Chapa:</Typography>
                <Typography variant="body2">
                  Nome: {watch('nome')}
                </Typography>
                <Typography variant="body2">
                  Tipo: {watch('tipo')}
                </Typography>
                {watch('uf') && (
                  <Typography variant="body2">
                    UF: {watch('uf')}
                  </Typography>
                )}
              </Grid>
              
              <Grid item xs={12}>
                <Typography variant="subtitle2">Membros: {selectedMembros.length}</Typography>
              </Grid>
              
              {diversidadeInfo && (
                <Grid item xs={12}>
                  <Typography variant="subtitle2">
                    Diversidade: {diversidadeInfo.atendeCriterios ? 'Atende critérios' : 'Não atende critérios'}
                  </Typography>
                </Grid>
              )}
            </Grid>
          </Box>
        );

      default:
        return null;
    }
  };

  return (
    <Box>
      <Card>
        <CardContent>
          <Typography variant="h5" component="h2" gutterBottom>
            {chapaId ? 'Editar Chapa' : 'Nova Chapa'}
          </Typography>

          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}

          {isLoading && <LinearProgress sx={{ mb: 2 }} />}

          <Stepper activeStep={activeStep} orientation="vertical">
            {steps.map((label, index) => (
              <Step key={label}>
                <StepLabel>{label}</StepLabel>
                <StepContent>
                  {renderStepContent(index)}
                  
                  <Box sx={{ mb: 2, mt: 2 }}>
                    <div>
                      <Button
                        variant="contained"
                        onClick={index === steps.length - 1 ? handleSubmit(onSubmit) : handleNext}
                        sx={{ mt: 1, mr: 1 }}
                        disabled={isLoading}
                      >
                        {index === steps.length - 1 ? 'Confirmar' : 'Continuar'}
                      </Button>
                      <Button
                        disabled={index === 0}
                        onClick={handleBack}
                        sx={{ mt: 1, mr: 1 }}
                      >
                        Voltar
                      </Button>
                      <Button
                        onClick={onCancel}
                        sx={{ mt: 1 }}
                      >
                        Cancelar
                      </Button>
                    </div>
                  </Box>
                </StepContent>
              </Step>
            ))}
          </Stepper>
        </CardContent>
      </Card>
    </Box>
  );
};