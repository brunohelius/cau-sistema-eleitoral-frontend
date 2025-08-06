import React, { FC, useEffect, useState } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  
  
  
  
  
  
  
  Chip,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Grid,
  Alert,
  CircularProgress,
} from '@mui/material';
import {
  Event,
  CheckCircle,
  Schedule,
  Warning,
  Edit,
} from '@mui/icons-material';
import { DatePicker } from '@mui/x-date-pickers';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { format, parseISO, isAfter, isBefore } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { useGetCalendarioPorEleicaoQuery, useGetCalendarioDashboardQuery } from '../../services/calendario.api';
import { Calendario, PeriodoEleitoral, PERIODO_LABELS, CORES_PERIODO, TipoPeriodo } from '../../types/calendario.types';

interface ElectionCalendarProps {
  eleicaoId: number;
  editable?: boolean;
  onUpdate?: (calendario: Calendario) => void;
}

const periodoSchema = z.object({
  nome: z.string().min(1, 'Nome é obrigatório'),
  descricao: z.string().min(1, 'Descrição é obrigatória'),
  dataInicio: z.date({ required_error: 'Data de início é obrigatória' }),
  dataFim: z.date({ required_error: 'Data de fim é obrigatória' }),
}).refine((data) => isAfter(data.dataFim, data.dataInicio), {
  message: 'Data de fim deve ser posterior à data de início',
  path: ['dataFim'],
});

type PeriodoFormData = z.infer<typeof periodoSchema>;

export const ElectionCalendar: FC<ElectionCalendarProps> = ({
  eleicaoId,
  editable = false,
  onUpdate,
}) => {
  const { 
    data: calendario, 
    isLoading, 
    error,
    refetch
  } = useGetCalendarioPorEleicaoQuery(eleicaoId);
  
  const { 
    data: dashboard, 
    isLoading: dashboardLoading 
  } = useGetCalendarioDashboardQuery(calendario?.id || 0, {
    skip: !calendario?.id,
  });
  
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [selectedPeriodo, setSelectedPeriodo] = useState<PeriodoEleitoral | null>(null);

  const {
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<PeriodoFormData>({
    resolver: zodResolver(periodoSchema),
  });

  // Removido useEffect - RTK Query gerencia automaticamente

  useEffect(() => {
    if (selectedPeriodo) {
      reset({
        nome: selectedPeriodo.nome,
        descricao: selectedPeriodo.descricao,
        dataInicio: parseISO(selectedPeriodo.dataInicio),
        dataFim: parseISO(selectedPeriodo.dataFim),
      });
    }
  }, [selectedPeriodo, reset]);

  const handleEditPeriodo = (periodo: PeriodoEleitoral) => {
    setSelectedPeriodo(periodo);
    setEditDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setEditDialogOpen(false);
    setSelectedPeriodo(null);
    reset();
  };

  const onSubmit = async (data: PeriodoFormData) => {
    // Implementar atualização do período
    console.log('Updating periodo:', data);
    handleCloseDialog();
  };

  const getPeriodoStatus = (periodo: PeriodoEleitoral) => {
    const now = new Date();
    const inicio = parseISO(periodo.dataInicio);
    const fim = parseISO(periodo.dataFim);

    if (isBefore(now, inicio)) {
      return 'pendente';
    } else if (isAfter(now, fim)) {
      return 'concluida';
    } else {
      return 'ativa';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'ativa':
        return 'success';
      case 'concluida':
        return 'default';
      case 'pendente':
        return 'warning';
      default:
        return 'default';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'ativa':
        return <Schedule color="success" />;
      case 'concluida':
        return <CheckCircle color="action" />;
      case 'pendente':
        return <Warning color="warning" />;
      default:
        return <Event />;
    }
  };

  if (isLoading) {
    return (
      <Box display="flex" justifyContent="center" p={4}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Alert severity="error" sx={{ m: 2 }}>
        {error}
      </Alert>
    );
  }

  if (!calendario) {
    return (
      <Alert severity="info" sx={{ m: 2 }}>
        Calendário eleitoral não encontrado.
      </Alert>
    );
  }

  return (
    <Box>
      <Card>
        <CardContent>
          <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
            <Typography variant="h5" component="h2">
              Calendário Eleitoral
            </Typography>
            {editable && (
              <Button
                variant="outlined"
                startIcon={<Edit />}
                onClick={() => setEditDialogOpen(true)}
              >
                Editar Calendário
              </Button>
            )}
          </Box>

          <Timeline >
            {calendario.periodos.map((periodo, index) => {
              const status = getPeriodoStatus(periodo);
              const cor = CORES_PERIODO[periodo.tipo as TipoPeriodo] || '#666';
              
              return (
                <div key={periodo.id}>
                  <div
                    sx={{ m: 'auto 0' }}
                    align="right"
                    variant="body2"
                    color="text.secondary"
                  >
                    <Typography variant="caption" display="block">
                      Início: {format(parseISO(periodo.dataInicio), 'dd/MM/yyyy', { locale: ptBR })}
                    </Typography>
                    <Typography variant="caption" display="block">
                      Fim: {format(parseISO(periodo.dataFim), 'dd/MM/yyyy', { locale: ptBR })}
                    </Typography>
                  </div>
                  
                  <div>
                    <TimelineDot 
                      sx={{ 
                        bgcolor: cor,
                        color: 'white'
                      }}
                    >
                      {getStatusIcon(status)}
                    </div>
                    {index < calendario.periodos.length - 1 && }
                  </div>
                  
                  <div>
                    <Box>
                      <Box display="flex" alignItems="center" gap={1} mb={1}>
                        <Typography variant="h6" component="span">
                          {PERIODO_LABELS[periodo.tipo as TipoPeriodo] || periodo.nome}
                        </Typography>
                        <Chip
                          label={status}
                          size="small"
                          color={getStatusColor(status) as any}
                          variant="outlined"
                        />
                        {editable && (
                          <Button
                            size="small"
                            onClick={() => handleEditPeriodo(periodo)}
                          >
                            Editar
                          </Button>
                        )}
                      </Box>
                      <Typography variant="body2" color="text.secondary">
                        {periodo.descricao}
                      </Typography>
                    </Box>
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Edit Dialog */}
      <Dialog
        open={editDialogOpen}
        onClose={handleCloseDialog}
        maxWidth="md"
        fullWidth
      >
        <form onSubmit={handleSubmit(onSubmit)}>
          <DialogTitle>
            {selectedPeriodo ? 'Editar Período' : 'Novo Período'}
          </DialogTitle>
          
          <DialogContent>
            <Grid container spacing={3} sx={{ mt: 1 }}>
              <Grid item xs={12}>
                <Controller
                  name="nome"
                  control={control}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      label="Nome do Período"
                      fullWidth
                      error={!!errors.nome}
                      helperText={errors.nome?.message}
                    />
                  )}
                />
              </Grid>
              
              <Grid item xs={12}>
                <Controller
                  name="descricao"
                  control={control}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      label="Descrição"
                      fullWidth
                      multiline
                      rows={3}
                      error={!!errors.descricao}
                      helperText={errors.descricao?.message}
                    />
                  )}
                />
              </Grid>
              
              <Grid item xs={6}>
                <Controller
                  name="dataInicio"
                  control={control}
                  render={({ field }) => (
                    <DatePicker
                      label="Data de Início"
                      value={field.value}
                      onChange={field.onChange}
                      slotProps={{
                        textField: {
                          fullWidth: true,
                          error: !!errors.dataInicio,
                          helperText: errors.dataInicio?.message,
                        },
                      }}
                    />
                  )}
                />
              </Grid>
              
              <Grid item xs={6}>
                <Controller
                  name="dataFim"
                  control={control}
                  render={({ field }) => (
                    <DatePicker
                      label="Data de Fim"
                      value={field.value}
                      onChange={field.onChange}
                      slotProps={{
                        textField: {
                          fullWidth: true,
                          error: !!errors.dataFim,
                          helperText: errors.dataFim?.message,
                        },
                      }}
                    />
                  )}
                />
              </Grid>
            </Grid>
          </DialogContent>
          
          <DialogActions>
            <Button onClick={handleCloseDialog}>
              Cancelar
            </Button>
            <Button type="submit" variant="contained">
              Salvar
            </Button>
          </DialogActions>
        </form>
      </Dialog>
    </Box>
  );
};