import React, { FC, useEffect, useState } from 'react';
import {
  Box, Typography, Card, Alert, Button, Chip, IconButton,
  Dialog, DialogTitle, DialogContent, DialogActions,
  Tooltip, Stack, TextField, Select, MenuItem, FormControl,
  InputLabel, Grid, Divider
} from '@mui/material';
import {
  DataGrid, GridColDef, GridActionsCellItem, GridRenderCellParams,
  GridValueFormatterParams
} from '@mui/x-data-grid';
import {
  Visibility as VisibilityIcon,
  Edit as EditIcon,
  Gavel as GavelIcon,
  Schedule as ScheduleIcon,
  Warning as WarningIcon,
  CheckCircle as CheckCircleIcon,
  Block as BlockIcon,
  Archive as ArchiveIcon,
  Add as AddIcon,
  FilterList as FilterIcon,
  GetApp as GetAppIcon,
  Timeline as TimelineIcon
} from '@mui/icons-material';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { useAppSelector, useAppDispatch } from '../../store/hooks';
import { fetchDenuncias, updateDenunciaStatus } from '../../store/slices/denunciasSlice';

// Interfaces baseadas nos DTOs migrados do PHP
interface DenunciaListItem {
  id: number;
  protocolo: string;
  dataHoraDenuncia: string;
  status: string;
  statusDescricao: string;
  denuncianteName: string;
  tipoDenunciaDescricao: string;
  filialNome: string;
  temSigilo: boolean;
  prazoDefesa?: string;
  prazoRecurso?: string;
  prazoVencido: boolean;
  relatorNome?: string;
}

interface DenunciaFiltro {
  protocolo?: string;
  tipoDenunciaId?: number;
  filialId?: number;
  status?: string;
  dataInicio?: string;
  dataFim?: string;
  denuncianteName?: string;
  relatorId?: number;
  apenasPrazosVencidos?: boolean;
  apenasComSigilo?: boolean;
}

// Mapeamento de status com cores e ícones
const getStatusConfig = (status: string) => {
  const configs = {
    'Recebida': { color: 'primary' as const, icon: <CheckCircleIcon />, description: 'Denúncia recebida e registrada' },
    'EmAnalise': { color: 'info' as const, icon: <TimelineIcon />, description: 'Em análise de admissibilidade' },
    'Admissivel': { color: 'success' as const, icon: <CheckCircleIcon />, description: 'Denúncia admitida para processamento' },
    'Inadmissivel': { color: 'error' as const, icon: <BlockIcon />, description: 'Denúncia inadmitida' },
    'AguardandoDefesa': { color: 'warning' as const, icon: <ScheduleIcon />, description: 'Aguardando apresentação de defesa' },
    'DefesaRecebida': { color: 'info' as const, icon: <CheckCircleIcon />, description: 'Defesa recebida' },
    'AudienciaInstrucao': { color: 'secondary' as const, icon: <GavelIcon />, description: 'Audiência de instrução marcada' },
    'AlegacoesFinais': { color: 'info' as const, icon: <EditIcon />, description: 'Prazo para alegações finais' },
    'AguardandoJulgamento': { color: 'warning' as const, icon: <GavelIcon />, description: 'Aguardando julgamento' },
    'Julgada': { color: 'success' as const, icon: <GavelIcon />, description: 'Julgada em primeira instância' },
    'EmRecurso': { color: 'secondary' as const, icon: <TimelineIcon />, description: 'Em análise de recurso' },
    'Arquivada': { color: 'default' as const, icon: <ArchiveIcon />, description: 'Processo arquivado' }
  };
  
  return configs[status as keyof typeof configs] || { 
    color: 'default' as const, 
    icon: <VisibilityIcon />, 
    description: status 
  };
};

export const ComplaintsList: FC = () => {
  const dispatch = useAppDispatch();
  const { denuncias, isLoading, error, totalCount, estatisticas } = useAppSelector((state) => state.denuncias);
  
  // Estados locais para filtros e controles
  const [filtros, setFiltros] = useState<DenunciaFiltro>({});
  const [filtroDialogOpen, setFiltroDialogOpen] = useState(false);
  const [selectedDenuncia, setSelectedDenuncia] = useState<DenunciaListItem | null>(null);
  const [detailDialogOpen, setDetailDialogOpen] = useState(false);
  const [paginationModel, setPaginationModel] = useState({ page: 0, pageSize: 25 });

  useEffect(() => {
    // Buscar denúncias com filtros e paginação
    dispatch(fetchDenuncias({
      filtros,
      page: paginationModel.page + 1,
      pageSize: paginationModel.pageSize
    }));
  }, [dispatch, filtros, paginationModel]);

  // Colunas da grid migradas do sistema PHP
  const columns: GridColDef[] = [
    {
      field: 'protocolo',
      headerName: 'Protocolo',
      width: 150,
      renderCell: (params: GridRenderCellParams) => (
        <Tooltip title={`Clique para ver detalhes da denúncia ${params.value}`}>
          <Typography 
            variant="body2" 
            sx={{ 
              fontWeight: 'bold', 
              color: 'primary.main',
              cursor: 'pointer',
              '&:hover': { textDecoration: 'underline' }
            }}
            onClick={() => handleViewDetails(params.row)}
          >
            {params.value}
          </Typography>
        </Tooltip>
      )
    },
    {
      field: 'dataHoraDenuncia',
      headerName: 'Data',
      width: 110,
      valueFormatter: (params: GridValueFormatterParams) => 
        format(new Date(params.value), 'dd/MM/yyyy', { locale: ptBR })
    },
    {
      field: 'status',
      headerName: 'Status',
      width: 180,
      renderCell: (params: GridRenderCellParams) => {
        const config = getStatusConfig(params.value);
        const isPrazoVencido = params.row.prazoVencido;
        
        return (
          <Stack direction="row" alignItems="center" spacing={1}>
            <Chip
              icon={config.icon}
              label={config.description}
              color={isPrazoVencido ? 'error' : config.color}
              size="small"
              variant={isPrazoVencido ? 'filled' : 'outlined'}
            />
            {isPrazoVencido && (
              <Tooltip title="Prazo processual vencido">
                <WarningIcon color="error" fontSize="small" />
              </Tooltip>
            )}
          </Stack>
        );
      }
    },
    {
      field: 'denuncianteName',
      headerName: 'Denunciante',
      width: 200,
      renderCell: (params: GridRenderCellParams) => (
        <Stack>
          <Typography variant="body2">{params.value}</Typography>
          {params.row.temSigilo && (
            <Chip 
              label="SIGILOSO" 
              color="secondary" 
              size="small" 
              variant="filled"
              sx={{ width: 'fit-content', fontSize: '0.6rem', height: '16px' }}
            />
          )}
        </Stack>
      )
    },
    {
      field: 'tipoDenunciaDescricao',
      headerName: 'Tipo',
      width: 150
    },
    {
      field: 'filialNome',
      headerName: 'CAU/UF',
      width: 100,
      renderCell: (params: GridRenderCellParams) => (
        <Chip label={params.value} size="small" variant="outlined" />
      )
    },
    {
      field: 'relatorNome',
      headerName: 'Relator',
      width: 150,
      renderCell: (params: GridRenderCellParams) => (
        params.value ? (
          <Typography variant="body2" color="textSecondary">
            {params.value}
          </Typography>
        ) : (
          <Chip label="Não designado" size="small" color="warning" variant="outlined" />
        )
      )
    },
    {
      field: 'prazoDefesa',
      headerName: 'Prazo Defesa',
      width: 120,
      renderCell: (params: GridRenderCellParams) => {
        if (!params.value) return <Typography variant="body2" color="textSecondary">-</Typography>;
        
        const prazo = new Date(params.value);
        const hoje = new Date();
        const isVencido = prazo < hoje;
        const diasRestantes = Math.ceil((prazo.getTime() - hoje.getTime()) / (1000 * 3600 * 24));
        
        return (
          <Stack alignItems="center">
            <Typography 
              variant="body2" 
              color={isVencido ? 'error' : diasRestantes <= 3 ? 'warning.main' : 'textPrimary'}
              fontWeight={isVencido || diasRestantes <= 3 ? 'bold' : 'normal'}
            >
              {format(prazo, 'dd/MM/yyyy', { locale: ptBR })}
            </Typography>
            {diasRestantes > 0 && diasRestantes <= 15 && (
              <Typography variant="caption" color={diasRestantes <= 3 ? 'error' : 'warning.main'}>
                {diasRestantes === 1 ? '1 dia' : `${diasRestantes} dias`}
              </Typography>
            )}
            {isVencido && (
              <Typography variant="caption" color="error" fontWeight="bold">
                VENCIDO
              </Typography>
            )}
          </Stack>
        );
      }
    },
    {
      field: 'actions',
      type: 'actions',
      headerName: 'Ações',
      width: 200,
      getActions: (params) => [
        <GridActionsCellItem
          key="view"
          icon={<VisibilityIcon />}
          label="Ver detalhes"
          onClick={() => handleViewDetails(params.row)}
          color="primary"
        />,
        <GridActionsCellItem
          key="edit"
          icon={<EditIcon />}
          label="Editar"
          onClick={() => handleEdit(params.row)}
          disabled={!canEdit(params.row)}
          color="secondary"
        />,
        <GridActionsCellItem
          key="workflow"
          icon={<GavelIcon />}
          label="Ações do processo"
          onClick={() => handleWorkflowActions(params.row)}
          color="info"
        />,
        <GridActionsCellItem
          key="timeline"
          icon={<TimelineIcon />}
          label="Histórico"
          onClick={() => handleViewTimeline(params.row)}
          color="default"
        />
      ]
    }
  ];

  // Handlers para ações
  const handleViewDetails = (denuncia: DenunciaListItem) => {
    setSelectedDenuncia(denuncia);
    setDetailDialogOpen(true);
  };

  const handleEdit = (denuncia: DenunciaListItem) => {
    // Navegar para tela de edição
    console.log('Edit denuncia:', denuncia);
  };

  const handleWorkflowActions = (denuncia: DenunciaListItem) => {
    // Abrir dialog de ações do workflow
    console.log('Workflow actions for:', denuncia);
  };

  const handleViewTimeline = (denuncia: DenunciaListItem) => {
    // Abrir timeline/histórico da denúncia
    console.log('View timeline for:', denuncia);
  };

  const canEdit = (denuncia: DenunciaListItem): boolean => {
    return ['Recebida', 'EmAnalise'].includes(denuncia.status);
  };

  const handleApplyFilters = () => {
    setPaginationModel({ ...paginationModel, page: 0 });
    setFiltroDialogOpen(false);
  };

  const handleClearFilters = () => {
    setFiltros({});
    setFiltroDialogOpen(false);
  };

  const handleExportData = () => {
    // Implementar exportação de dados
    console.log('Export data with filters:', filtros);
  };

  return (
    <Box>
      {/* Cabeçalho com estatísticas rápidas */}
      <Box sx={{ mb: 3 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Sistema de Denúncias
        </Typography>
        <Typography variant="body1" color="textSecondary" gutterBottom>
          Gestão completa do processo de denúncias eleitorais - Migrado do sistema PHP (3.899 linhas)
        </Typography>

        {estatisticas && (
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12} sm={6} md={3}>
              <Card sx={{ p: 2, textAlign: 'center' }}>
                <Typography variant="h5" color="primary">{estatisticas.totalDenuncias}</Typography>
                <Typography variant="body2">Total</Typography>
              </Card>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <Card sx={{ p: 2, textAlign: 'center' }}>
                <Typography variant="h5" color="warning.main">{estatisticas.aguardandoDefesa}</Typography>
                <Typography variant="body2">Aguardando Defesa</Typography>
              </Card>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <Card sx={{ p: 2, textAlign: 'center' }}>
                <Typography variant="h5" color="info.main">{estatisticas.aguardandoJulgamento}</Typography>
                <Typography variant="body2">Aguardando Julgamento</Typography>
              </Card>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <Card sx={{ p: 2, textAlign: 'center' }}>
                <Typography variant="h5" color="error.main">{estatisticas.prazosVencidos}</Typography>
                <Typography variant="body2">Prazos Vencidos</Typography>
              </Card>
            </Grid>
          </Grid>
        )}
      </Box>

      {/* Toolbar com ações */}
      <Stack direction="row" spacing={2} sx={{ mb: 2 }} alignItems="center">
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => console.log('Create new denuncia')}
        >
          Nova Denúncia
        </Button>
        
        <Button
          variant="outlined"
          startIcon={<FilterIcon />}
          onClick={() => setFiltroDialogOpen(true)}
        >
          Filtros
        </Button>

        <Button
          variant="outlined"
          startIcon={<GetAppIcon />}
          onClick={handleExportData}
        >
          Exportar
        </Button>

        <Box sx={{ flexGrow: 1 }} />

        <Typography variant="body2" color="textSecondary">
          {totalCount} denúncias encontradas
        </Typography>
      </Stack>

      {/* Mensagem de erro */}
      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      {/* Grid principal */}
      <Card>
        <DataGrid
          rows={denuncias}
          columns={columns}
          loading={isLoading}
          pageSizeOptions={[10, 25, 50, 100]}
          paginationModel={paginationModel}
          onPaginationModelChange={setPaginationModel}
          paginationMode="server"
          rowCount={totalCount}
          disableRowSelectionOnClick
          sx={{ 
            minHeight: 600,
            '& .MuiDataGrid-row:hover': {
              backgroundColor: 'action.hover',
              cursor: 'pointer'
            }
          }}
          initialState={{
            sorting: {
              sortModel: [{ field: 'dataHoraDenuncia', sort: 'desc' }],
            },
          }}
        />
      </Card>

      {/* Dialog de Filtros */}
      <Dialog
        open={filtroDialogOpen}
        onClose={() => setFiltroDialogOpen(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>Filtrar Denúncias</DialogTitle>
        <DialogContent>
          <Grid container spacing={3} sx={{ mt: 1 }}>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Protocolo"
                value={filtros.protocolo || ''}
                onChange={(e) => setFiltros({ ...filtros, protocolo: e.target.value })}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Nome do Denunciante"
                value={filtros.denuncianteName || ''}
                onChange={(e) => setFiltros({ ...filtros, denuncianteName: e.target.value })}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <FormControl fullWidth>
                <InputLabel>Status</InputLabel>
                <Select
                  value={filtros.status || ''}
                  label="Status"
                  onChange={(e) => setFiltros({ ...filtros, status: e.target.value })}
                >
                  <MenuItem value="">Todos</MenuItem>
                  <MenuItem value="Recebida">Recebida</MenuItem>
                  <MenuItem value="EmAnalise">Em Análise</MenuItem>
                  <MenuItem value="Admissivel">Admissível</MenuItem>
                  <MenuItem value="Inadmissivel">Inadmissível</MenuItem>
                  <MenuItem value="AguardandoDefesa">Aguardando Defesa</MenuItem>
                  <MenuItem value="DefesaRecebida">Defesa Recebida</MenuItem>
                  <MenuItem value="AguardandoJulgamento">Aguardando Julgamento</MenuItem>
                  <MenuItem value="Julgada">Julgada</MenuItem>
                  <MenuItem value="EmRecurso">Em Recurso</MenuItem>
                  <MenuItem value="Arquivada">Arquivada</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                type="date"
                label="Data Início"
                InputLabelProps={{ shrink: true }}
                value={filtros.dataInicio || ''}
                onChange={(e) => setFiltros({ ...filtros, dataInicio: e.target.value })}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                type="date"
                label="Data Fim"
                InputLabelProps={{ shrink: true }}
                value={filtros.dataFim || ''}
                onChange={(e) => setFiltros({ ...filtros, dataFim: e.target.value })}
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setFiltroDialogOpen(false)}>
            Cancelar
          </Button>
          <Button onClick={handleClearFilters} color="secondary">
            Limpar Filtros
          </Button>
          <Button onClick={handleApplyFilters} variant="contained">
            Aplicar Filtros
          </Button>
        </DialogActions>
      </Dialog>

      {/* Dialog de Detalhes */}
      <Dialog
        open={detailDialogOpen}
        onClose={() => setDetailDialogOpen(false)}
        maxWidth="lg"
        fullWidth
      >
        <DialogTitle>
          {selectedDenuncia && (
            <Stack direction="row" alignItems="center" spacing={2}>
              <Typography variant="h6">
                Denúncia {selectedDenuncia.protocolo}
              </Typography>
              {getStatusConfig(selectedDenuncia.status).icon}
            </Stack>
          )}
        </DialogTitle>
        <DialogContent>
          {selectedDenuncia && (
            <Box>
              <Typography variant="h6" gutterBottom>Informações Gerais</Typography>
              <Grid container spacing={2}>
                <Grid item xs={6}>
                  <Typography><strong>Data:</strong> {format(new Date(selectedDenuncia.dataHoraDenuncia), 'dd/MM/yyyy HH:mm', { locale: ptBR })}</Typography>
                  <Typography><strong>Denunciante:</strong> {selectedDenuncia.denuncianteName}</Typography>
                  <Typography><strong>Tipo:</strong> {selectedDenuncia.tipoDenunciaDescricao}</Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography><strong>Status:</strong> {getStatusConfig(selectedDenuncia.status).description}</Typography>
                  <Typography><strong>CAU/UF:</strong> {selectedDenuncia.filialNome}</Typography>
                  <Typography><strong>Relator:</strong> {selectedDenuncia.relatorNome || 'Não designado'}</Typography>
                </Grid>
              </Grid>
              
              <Divider sx={{ my: 2 }} />
              
              <Typography variant="h6" gutterBottom>Prazos Processuais</Typography>
              <Grid container spacing={2}>
                {selectedDenuncia.prazoDefesa && (
                  <Grid item xs={6}>
                    <Typography><strong>Prazo Defesa:</strong> {format(new Date(selectedDenuncia.prazoDefesa), 'dd/MM/yyyy', { locale: ptBR })}</Typography>
                  </Grid>
                )}
                {selectedDenuncia.prazoRecurso && (
                  <Grid item xs={6}>
                    <Typography><strong>Prazo Recurso:</strong> {format(new Date(selectedDenuncia.prazoRecurso), 'dd/MM/yyyy', { locale: ptBR })}</Typography>
                  </Grid>
                )}
              </Grid>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDetailDialogOpen(false)}>
            Fechar
          </Button>
          {selectedDenuncia && canEdit(selectedDenuncia) && (
            <Button variant="contained" onClick={() => handleEdit(selectedDenuncia)}>
              Editar
            </Button>
          )}
        </DialogActions>
      </Dialog>
    </Box>
  );
};