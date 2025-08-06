import React, { FC, useEffect, useState } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  Chip,
  IconButton,
  Menu,
  MenuItem,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Grid,
  Alert,
  Fab,
} from '@mui/material';
import {
  Add,
  MoreVert,
  Edit,
  Delete,
  Visibility,
  PlayArrow,
  Stop,
  Assignment,
  FilterList,
} from '@mui/icons-material';
import { DataGrid, GridColDef, GridActionsCellItem } from '@mui/x-data-grid';
import { useNavigate } from 'react-router-dom';
import { format, parseISO } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useAppSelector, useAppDispatch } from '../../store/hooks';
import { fetchEleicoes, createEleicao, updateEleicao } from '../../store/slices/eleicoesSlice';
import { Eleicao } from '../../types/eleicoes.types';

const eleicaoSchema = z.object({
  nome: z.string().min(1, 'Nome é obrigatório'),
  ano: z.number().min(2024, 'Ano deve ser 2024 ou posterior'),
  tipo: z.enum(['nacional', 'estadual']),
  dataInicio: z.string().min(1, 'Data de início é obrigatória'),
  dataFim: z.string().min(1, 'Data de fim é obrigatória'),
  resolucao: z.string().min(1, 'Resolução é obrigatória'),
  descricao: z.string().optional(),
  uf: z.string().optional(),
});

type EleicaoFormData = z.infer<typeof eleicaoSchema>;

const UFs = [
  'AC', 'AL', 'AP', 'AM', 'BA', 'CE', 'DF', 'ES', 'GO', 'MA',
  'MT', 'MS', 'MG', 'PA', 'PB', 'PR', 'PE', 'PI', 'RJ', 'RN',
  'RS', 'RO', 'RR', 'SC', 'SP', 'SE', 'TO'
];

export const ElectionsList: FC = () => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { eleicoes, isLoading, error } = useAppSelector((state) => state.eleicoes);
  
  const [selectedEleicao, setSelectedEleicao] = useState<Eleicao | null>(null);
  const [formDialogOpen, setFormDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [actionMenuAnchor, setActionMenuAnchor] = useState<null | HTMLElement>(null);

  const {
    control,
    handleSubmit,
    reset,
    watch,
    formState: { errors },
  } = useForm<EleicaoFormData>({
    resolver: zodResolver(eleicaoSchema),
    defaultValues: {
      tipo: 'estadual',
      ano: new Date().getFullYear(),
    },
  });

  const watchedTipo = watch('tipo');

  useEffect(() => {
    dispatch(fetchEleicoes());
  }, [dispatch]);

  useEffect(() => {
    if (selectedEleicao && formDialogOpen) {
      reset({
        nome: selectedEleicao.nome,
        ano: selectedEleicao.ano,
        tipo: selectedEleicao.tipo,
        dataInicio: selectedEleicao.dataInicio.split('T')[0],
        dataFim: selectedEleicao.dataFim.split('T')[0],
        resolucao: selectedEleicao.resolucao,
        descricao: selectedEleicao.descricao || '',
        uf: selectedEleicao.uf || '',
      });
    }
  }, [selectedEleicao, formDialogOpen, reset]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'ativa':
        return 'success';
      case 'finalizada':
        return 'default';
      case 'cancelada':
        return 'error';
      default:
        return 'warning';
    }
  };

  const handleOpenForm = (eleicao?: Eleicao) => {
    setSelectedEleicao(eleicao || null);
    setFormDialogOpen(true);
  };

  const handleCloseForm = () => {
    setFormDialogOpen(false);
    setSelectedEleicao(null);
    reset();
  };

  const handleOpenDeleteDialog = (eleicao: Eleicao) => {
    setSelectedEleicao(eleicao);
    setDeleteDialogOpen(true);
  };

  const handleCloseDeleteDialog = () => {
    setDeleteDialogOpen(false);
    setSelectedEleicao(null);
  };

  const handleActionMenuOpen = (event: React.MouseEvent<HTMLElement>, eleicao: Eleicao) => {
    event.stopPropagation();
    setSelectedEleicao(eleicao);
    setActionMenuAnchor(event.currentTarget);
  };

  const handleActionMenuClose = () => {
    setActionMenuAnchor(null);
    setSelectedEleicao(null);
  };

  const onSubmit = async (data: EleicaoFormData) => {
    try {
      const eleicaoData = {
        ...data,
        configuracoes: {
          permiteChapaIES: false,
          numeroMinimoMembros: 3,
          numeroMaximoMembros: 15,
          percentualDiversidade: 30,
          prazoImpugnacao: 5,
          prazoDefesa: 10,
          prazoRecurso: 5,
        },
      };

      if (selectedEleicao) {
        await dispatch(updateEleicao({ id: selectedEleicao.id, data: eleicaoData }));
      } else {
        await dispatch(createEleicao(eleicaoData));
      }

      handleCloseForm();
    } catch (error) {
      console.error('Erro ao salvar eleição:', error);
    }
  };

  const handleDelete = async () => {
    if (selectedEleicao) {
      // Implementar exclusão
      console.log('Deletando eleição:', selectedEleicao.id);
      handleCloseDeleteDialog();
    }
  };

  const columns: GridColDef[] = [
    {
      field: 'nome',
      headerName: 'Nome',
      width: 250,
      renderCell: (params) => (
        <Box>
          <Typography variant="body2" fontWeight={500}>
            {params.value}
          </Typography>
          <Typography variant="caption" color="text.secondary">
            {params.row.resolucao}
          </Typography>
        </Box>
      ),
    },
    {
      field: 'ano',
      headerName: 'Ano',
      width: 80,
    },
    {
      field: 'tipo',
      headerName: 'Tipo',
      width: 100,
      renderCell: (params) => (
        <Chip
          label={params.value === 'nacional' ? 'Nacional' : 'Estadual'}
          size="small"
          variant="outlined"
        />
      ),
    },
    {
      field: 'uf',
      headerName: 'UF',
      width: 80,
      renderCell: (params) => params.value || '-',
    },
    {
      field: 'status',
      headerName: 'Status',
      width: 120,
      renderCell: (params) => (
        <Chip
          label={params.value}
          size="small"
          color={getStatusColor(params.value)}
          variant="outlined"
        />
      ),
    },
    {
      field: 'dataInicio',
      headerName: 'Data Início',
      width: 120,
      renderCell: (params) => format(parseISO(params.value), 'dd/MM/yyyy', { locale: ptBR }),
    },
    {
      field: 'dataFim',
      headerName: 'Data Fim',
      width: 120,
      renderCell: (params) => format(parseISO(params.value), 'dd/MM/yyyy', { locale: ptBR }),
    },
    {
      field: 'actions',
      type: 'actions',
      headerName: 'Ações',
      width: 120,
      getActions: (params) => [
        <GridActionsCellItem
          icon={<Visibility />}
          label="Visualizar"
          onClick={() => navigate(`/eleicoes/${params.id}`)}
        />,
        <GridActionsCellItem
          icon={<Edit />}
          label="Editar"
          onClick={() => handleOpenForm(params.row)}
        />,
        <GridActionsCellItem
          icon={<MoreVert />}
          label="Mais opções"
          onClick={(e) => handleActionMenuOpen(e, params.row)}
        />,
      ],
    },
  ];

  return (
    <Box>
      {/* Header */}
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4" component="h1">
          Eleições
        </Typography>
        <Button
          variant="contained"
          startIcon={<Add />}
          onClick={() => handleOpenForm()}
        >
          Nova Eleição
        </Button>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      {/* Data Grid */}
      <Card>
        <DataGrid
          rows={eleicoes}
          columns={columns}
          loading={isLoading}
          pageSizeOptions={[10, 25, 50]}
          initialState={{
            pagination: { paginationModel: { pageSize: 10 } },
          }}
          checkboxSelection={false}
          disableRowSelectionOnClick
          sx={{ minHeight: 400 }}
        />
      </Card>

      {/* Floating Action Button */}
      <Fab
        color="primary"
        aria-label="add"
        sx={{ position: 'fixed', bottom: 16, right: 16 }}
        onClick={() => handleOpenForm()}
      >
        <Add />
      </Fab>

      {/* Form Dialog */}
      <Dialog open={formDialogOpen} onClose={handleCloseForm} maxWidth="md" fullWidth>
        <form onSubmit={handleSubmit(onSubmit)}>
          <DialogTitle>
            {selectedEleicao ? 'Editar Eleição' : 'Nova Eleição'}
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
                      label="Nome da Eleição"
                      fullWidth
                      error={!!errors.nome}
                      helperText={errors.nome?.message}
                    />
                  )}
                />
              </Grid>
              
              <Grid item xs={6}>
                <Controller
                  name="ano"
                  control={control}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      label="Ano"
                      type="number"
                      fullWidth
                      error={!!errors.ano}
                      helperText={errors.ano?.message}
                    />
                  )}
                />
              </Grid>
              
              <Grid item xs={6}>
                <Controller
                  name="tipo"
                  control={control}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      select
                      label="Tipo"
                      fullWidth
                      error={!!errors.tipo}
                      helperText={errors.tipo?.message}
                    >
                      <MenuItem value="nacional">Nacional</MenuItem>
                      <MenuItem value="estadual">Estadual</MenuItem>
                    </TextField>
                  )}
                />
              </Grid>
              
              {watchedTipo === 'estadual' && (
                <Grid item xs={6}>
                  <Controller
                    name="uf"
                    control={control}
                    render={({ field }) => (
                      <TextField
                        {...field}
                        select
                        label="UF"
                        fullWidth
                        error={!!errors.uf}
                        helperText={errors.uf?.message}
                      >
                        {UFs.map((uf) => (
                          <MenuItem key={uf} value={uf}>
                            {uf}
                          </MenuItem>
                        ))}
                      </TextField>
                    )}
                  />
                </Grid>
              )}
              
              <Grid item xs={6}>
                <Controller
                  name="dataInicio"
                  control={control}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      label="Data de Início"
                      type="date"
                      fullWidth
                      InputLabelProps={{ shrink: true }}
                      error={!!errors.dataInicio}
                      helperText={errors.dataInicio?.message}
                    />
                  )}
                />
              </Grid>
              
              <Grid item xs={6}>
                <Controller
                  name="dataFim"
                  control={control}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      label="Data de Fim"
                      type="date"
                      fullWidth
                      InputLabelProps={{ shrink: true }}
                      error={!!errors.dataFim}
                      helperText={errors.dataFim?.message}
                    />
                  )}
                />
              </Grid>
              
              <Grid item xs={12}>
                <Controller
                  name="resolucao"
                  control={control}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      label="Resolução"
                      fullWidth
                      error={!!errors.resolucao}
                      helperText={errors.resolucao?.message}
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
                      label="Descrição (opcional)"
                      fullWidth
                      multiline
                      rows={3}
                    />
                  )}
                />
              </Grid>
            </Grid>
          </DialogContent>
          
          <DialogActions>
            <Button onClick={handleCloseForm}>Cancelar</Button>
            <Button type="submit" variant="contained">
              {selectedEleicao ? 'Atualizar' : 'Criar'}
            </Button>
          </DialogActions>
        </form>
      </Dialog>

      {/* Delete Dialog */}
      <Dialog open={deleteDialogOpen} onClose={handleCloseDeleteDialog}>
        <DialogTitle>Confirmar Exclusão</DialogTitle>
        <DialogContent>
          <Typography>
            Tem certeza que deseja excluir a eleição "{selectedEleicao?.nome}"?
            Esta ação não pode ser desfeita.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDeleteDialog}>Cancelar</Button>
          <Button onClick={handleDelete} color="error" variant="contained">
            Excluir
          </Button>
        </DialogActions>
      </Dialog>

      {/* Action Menu */}
      <Menu
        anchorEl={actionMenuAnchor}
        open={Boolean(actionMenuAnchor)}
        onClose={handleActionMenuClose}
      >
        <MenuItem onClick={() => navigate(`/eleicoes/${selectedEleicao?.id}/calendario`)}>
          <Assignment sx={{ mr: 1 }} />
          Calendário
        </MenuItem>
        <MenuItem onClick={() => navigate(`/eleicoes/${selectedEleicao?.id}/chapas`)}>
          <Assignment sx={{ mr: 1 }} />
          Chapas
        </MenuItem>
        <MenuItem onClick={() => handleOpenDeleteDialog(selectedEleicao!)}>
          <Delete sx={{ mr: 1 }} />
          Excluir
        </MenuItem>
      </Menu>
    </Box>
  );
};