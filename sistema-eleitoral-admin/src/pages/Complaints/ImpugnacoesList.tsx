import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  TextField,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
  Button,
  Chip,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Stepper,
  Step,
  StepLabel,
  Alert,
  Grid,
  Paper,
  Tabs,
  Tab,
  Accordion,
  AccordionSummary,
  AccordionDetails
} from '@mui/material';
import {
  Search as SearchIcon,
  Add as AddIcon,
  Visibility as ViewIcon,
  Gavel as JudgeIcon,
  Assignment as DefenseIcon,
  Timeline as WorkflowIcon,
  ExpandMore as ExpandMoreIcon,
  Description as DocumentIcon,
  Schedule as ScheduleIcon,
  CheckCircle as CheckIcon,
  Warning as WarningIcon
} from '@mui/icons-material';

interface Impugnacao {
  id: number;
  numeroProtocolo: number;
  descricao: string;
  dataCadastro: string;
  status: string;
  ufSigla: string;
  membroChapaImpugnado: {
    nome: string;
    chapaNumero: number;
    tipoMembro: string;
  };
  profissionalImpugnante: {
    nome: string;
    numeroCAU: string;
  };
}

interface WorkflowEtapa {
  id: number;
  nome: string;
  descricao: string;
  status: 'Concluído' | 'Em Andamento' | 'Pendente';
  data?: string;
  responsavel: string;
  prazoLegal: string;
  ativa: boolean;
}

interface WorkflowInfo {
  impugnacaoId: number;
  etapaAtual: string;
  progresso: number;
  etapas: WorkflowEtapa[];
  prazosVencidos: any[];
  proximosVencimentos: Array<{
    etapa: string;
    dataVencimento: string;
    diasRestantes: number;
    criticidade: string;
  }>;
}

const ImpugnacoesList: React.FC = () => {
  const [impugnacoes, setImpugnacoes] = useState<Impugnacao[]>([]);
  const [filtros, setFiltros] = useState({
    uf: '',
    status: '',
    eleicao: '',
    busca: ''
  });
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [totalRecords, setTotalRecords] = useState(0);
  const [loading, setLoading] = useState(false);
  
  // Modais
  const [selectedImpugnacao, setSelectedImpugnacao] = useState<number | null>(null);
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [workflowOpen, setWorkflowOpen] = useState(false);
  const [workflowData, setWorkflowData] = useState<WorkflowInfo | null>(null);
  const [tabValue, setTabValue] = useState(0);

  const [statusOptions] = useState([
    { id: 1, nome: 'Protocolada', cor: '#2196F3' },
    { id: 2, nome: 'Em Análise', cor: '#FF9800' },
    { id: 3, nome: 'Defesa Apresentada', cor: '#9C27B0' },
    { id: 4, nome: 'Em Julgamento', cor: '#FF5722' },
    { id: 5, nome: 'Julgada Procedente', cor: '#4CAF50' },
    { id: 6, nome: 'Julgada Improcedente', cor: '#F44336' },
    { id: 7, nome: 'Recurso Interposto', cor: '#607D8B' },
    { id: 8, nome: 'Arquivada', cor: '#9E9E9E' }
  ]);

  const [ufsOptions] = useState([
    { id: 35, sigla: 'SP', nome: 'São Paulo' },
    { id: 33, sigla: 'RJ', nome: 'Rio de Janeiro' },
    { id: 31, sigla: 'MG', nome: 'Minas Gerais' },
    { id: 23, sigla: 'RS', nome: 'Rio Grande do Sul' },
    { id: 41, sigla: 'PR', nome: 'Paraná' }
  ]);

  useEffect(() => {
    carregarImpugnacoes();
  }, [page, rowsPerPage, filtros]);

  const carregarImpugnacoes = async () => {
    setLoading(true);
    try {
      const queryParams = new URLSearchParams({
        page: (page + 1).toString(),
        pageSize: rowsPerPage.toString(),
        ...(filtros.uf && { ufId: filtros.uf }),
        ...(filtros.status && { statusId: filtros.status }),
        ...(filtros.eleicao && { eleicaoId: filtros.eleicao })
      });

      const response = await fetch(`/api/impugnacao?${queryParams}`);
      const data = await response.json();
      
      setImpugnacoes(data.data || []);
      setTotalRecords(data.totalRecords || 0);
    } catch (error) {
      console.error('Erro ao carregar impugnações:', error);
    } finally {
      setLoading(false);
    }
  };

  const carregarWorkflow = async (impugnacaoId: number) => {
    try {
      const response = await fetch(`/api/impugnacao/${impugnacaoId}/workflow`);
      const data = await response.json();
      setWorkflowData(data);
    } catch (error) {
      console.error('Erro ao carregar workflow:', error);
    }
  };

  const getStatusColor = (status: string) => {
    const statusOption = statusOptions.find(s => s.nome === status);
    return statusOption?.cor || '#9E9E9E';
  };

  const getStepIcon = (status: string) => {
    switch (status) {
      case 'Concluído':
        return <CheckIcon sx={{ color: '#4CAF50' }} />;
      case 'Em Andamento':
        return <ScheduleIcon sx={{ color: '#FF9800' }} />;
      default:
        return <WarningIcon sx={{ color: '#9E9E9E' }} />;
    }
  };

  const handleViewDetails = (impugnacaoId: number) => {
    setSelectedImpugnacao(impugnacaoId);
    setDetailsOpen(true);
  };

  const handleViewWorkflow = async (impugnacaoId: number) => {
    setSelectedImpugnacao(impugnacaoId);
    await carregarWorkflow(impugnacaoId);
    setWorkflowOpen(true);
  };

  const handleChangePage = (event: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR');
  };

  const WorkflowDialog = () => (
    <Dialog 
      open={workflowOpen} 
      onClose={() => setWorkflowOpen(false)}
      maxWidth="md" 
      fullWidth
    >
      <DialogTitle>
        <Box display="flex" alignItems="center" gap={1}>
          <WorkflowIcon />
          Workflow da Impugnação #{selectedImpugnacao}
        </Box>
      </DialogTitle>
      <DialogContent>
        {workflowData && (
          <Box>
            {/* Progresso Geral */}
            <Paper elevation={1} sx={{ p: 2, mb: 3 }}>
              <Typography variant="h6" gutterBottom>
                Progresso Atual: {workflowData.etapaAtual}
              </Typography>
              <Box sx={{ width: '100%', bgcolor: '#E0E0E0', borderRadius: 1, p: 0.5 }}>
                <Box 
                  sx={{ 
                    width: `${workflowData.progresso}%`, 
                    bgcolor: '#4CAF50', 
                    height: 8, 
                    borderRadius: 1 
                  }} 
                />
              </Box>
              <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                {workflowData.progresso}% concluído
              </Typography>
            </Paper>

            {/* Próximos Vencimentos */}
            {workflowData.proximosVencimentos.length > 0 && (
              <Alert severity="warning" sx={{ mb: 3 }}>
                <Typography variant="subtitle2">Próximos Vencimentos:</Typography>
                {workflowData.proximosVencimentos.map((vencimento, index) => (
                  <Typography key={index} variant="body2">
                    • {vencimento.etapa} - {vencimento.diasRestantes} dias restantes
                  </Typography>
                ))}
              </Alert>
            )}

            {/* Timeline das Etapas */}
            <Typography variant="h6" gutterBottom>
              Etapas do Processo
            </Typography>
            <Box sx={{ mb: 2 }}>
              {workflowData.etapas.map((etapa) => (
                <Accordion key={etapa.id} defaultExpanded={etapa.ativa}>
                  <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                    <Box display="flex" alignItems="center" gap={2} width="100%">
                      {getStepIcon(etapa.status)}
                      <Box flex={1}>
                        <Typography variant="subtitle1" fontWeight={etapa.ativa ? 'bold' : 'normal'}>
                          {etapa.nome}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          Prazo: {etapa.prazoLegal} | Responsável: {etapa.responsavel}
                        </Typography>
                      </Box>
                      <Chip 
                        label={etapa.status}
                        size="small"
                        color={etapa.status === 'Concluído' ? 'success' : etapa.status === 'Em Andamento' ? 'warning' : 'default'}
                      />
                    </Box>
                  </AccordionSummary>
                  <AccordionDetails>
                    <Typography variant="body2" paragraph>
                      {etapa.descricao}
                    </Typography>
                    {etapa.data && (
                      <Typography variant="body2" color="text.secondary">
                        <strong>Data:</strong> {new Date(etapa.data).toLocaleString('pt-BR')}
                      </Typography>
                    )}
                  </AccordionDetails>
                </Accordion>
              ))}
            </Box>
          </Box>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={() => setWorkflowOpen(false)}>Fechar</Button>
      </DialogActions>
    </Dialog>
  );

  const DetailsDialog = () => (
    <Dialog 
      open={detailsOpen} 
      onClose={() => setDetailsOpen(false)}
      maxWidth="lg" 
      fullWidth
    >
      <DialogTitle>
        Detalhes da Impugnação #{selectedImpugnacao}
      </DialogTitle>
      <DialogContent>
        <Box sx={{ width: '100%' }}>
          <Tabs value={tabValue} onChange={(e, newValue) => setTabValue(newValue)}>
            <Tab label="Informações Gerais" />
            <Tab label="Documentos" />
            <Tab label="Histórico" />
          </Tabs>
          
          <Box sx={{ mt: 2 }}>
            {tabValue === 0 && (
              <Grid container spacing={2}>
                <Grid item xs={12} md={6}>
                  <Typography variant="h6" gutterBottom>Dados da Impugnação</Typography>
                  <Typography><strong>Protocolo:</strong> 2024001</Typography>
                  <Typography><strong>Data:</strong> {formatDate(new Date().toISOString())}</Typography>
                  <Typography><strong>Status:</strong> Em Análise</Typography>
                  <Typography sx={{ mt: 2 }}><strong>Descrição:</strong></Typography>
                  <Typography variant="body2">
                    Impugnação por impedimento legal - candidato sem quitação eleitoral
                  </Typography>
                </Grid>
                <Grid item xs={12} md={6}>
                  <Typography variant="h6" gutterBottom>Partes Envolvidas</Typography>
                  <Typography><strong>Impugnado:</strong> João Silva Santos</Typography>
                  <Typography><strong>Chapa:</strong> Nº 10 (Membro Efetivo)</Typography>
                  <Typography><strong>Impugnante:</strong> Maria Oliveira Costa</Typography>
                  <Typography><strong>CAU:</strong> A987654-3</Typography>
                </Grid>
              </Grid>
            )}
            
            {tabValue === 1 && (
              <Box>
                <Typography variant="h6" gutterBottom>Documentos Anexados</Typography>
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell>Documento</TableCell>
                      <TableCell>Tipo</TableCell>
                      <TableCell>Data Upload</TableCell>
                      <TableCell>Ações</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    <TableRow>
                      <TableCell>
                        <Box display="flex" alignItems="center" gap={1}>
                          <DocumentIcon />
                          Documento_Impugnacao.pdf
                        </Box>
                      </TableCell>
                      <TableCell>Impugnação</TableCell>
                      <TableCell>{formatDate(new Date().toISOString())}</TableCell>
                      <TableCell>
                        <IconButton size="small">
                          <ViewIcon />
                        </IconButton>
                      </TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell>
                        <Box display="flex" alignItems="center" gap={1}>
                          <DocumentIcon />
                          Comprovante_Irregularidade.pdf
                        </Box>
                      </TableCell>
                      <TableCell>Comprovante</TableCell>
                      <TableCell>{formatDate(new Date().toISOString())}</TableCell>
                      <TableCell>
                        <IconButton size="small">
                          <ViewIcon />
                        </IconButton>
                      </TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </Box>
            )}
            
            {tabValue === 2 && (
              <Box>
                <Typography variant="h6" gutterBottom>Histórico de Ações</Typography>
                <Box>
                  <Paper elevation={1} sx={{ p: 2, mb: 2 }}>
                    <Typography variant="subtitle2">Impugnação Protocolada</Typography>
                    <Typography variant="body2" color="text.secondary">
                      {formatDate(new Date().toISOString())} - Sistema
                    </Typography>
                    <Typography variant="body2">
                      Impugnação registrada no sistema com protocolo nº 2024001
                    </Typography>
                  </Paper>
                  
                  <Paper elevation={1} sx={{ p: 2, mb: 2 }}>
                    <Typography variant="subtitle2">Análise Iniciada</Typography>
                    <Typography variant="body2" color="text.secondary">
                      {formatDate(new Date().toISOString())} - Comissão Eleitoral SP
                    </Typography>
                    <Typography variant="body2">
                      Processo encaminhado para análise de admissibilidade
                    </Typography>
                  </Paper>
                </Box>
              </Box>
            )}
          </Box>
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={() => setDetailsOpen(false)}>Fechar</Button>
        <Button 
          variant="contained" 
          startIcon={<DefenseIcon />}
          onClick={() => {/* Apresentar Defesa */}}
        >
          Apresentar Defesa
        </Button>
        <Button 
          variant="contained" 
          color="secondary"
          startIcon={<JudgeIcon />}
          onClick={() => {/* Julgar */}}
        >
          Julgar
        </Button>
      </DialogActions>
    </Dialog>
  );

  return (
    <Box sx={{ width: '100%', p: 3 }}>
      {/* Header */}
      <Box sx={{ mb: 3 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Impugnações Eleitorais
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Gestão completa de impugnações a membros de chapas eleitorais
        </Typography>
      </Box>

      {/* Filtros */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={12} md={3}>
              <TextField
                fullWidth
                label="Buscar"
                variant="outlined"
                size="small"
                value={filtros.busca}
                onChange={(e) => setFiltros({ ...filtros, busca: e.target.value })}
                InputProps={{
                  endAdornment: <SearchIcon />
                }}
              />
            </Grid>
            <Grid item xs={12} md={2}>
              <FormControl fullWidth size="small">
                <InputLabel>UF</InputLabel>
                <Select
                  value={filtros.uf}
                  onChange={(e) => setFiltros({ ...filtros, uf: e.target.value })}
                  label="UF"
                >
                  <MenuItem value="">Todas</MenuItem>
                  {ufsOptions.map(uf => (
                    <MenuItem key={uf.id} value={uf.id.toString()}>{uf.sigla}</MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={3}>
              <FormControl fullWidth size="small">
                <InputLabel>Status</InputLabel>
                <Select
                  value={filtros.status}
                  onChange={(e) => setFiltros({ ...filtros, status: e.target.value })}
                  label="Status"
                >
                  <MenuItem value="">Todos</MenuItem>
                  {statusOptions.map(status => (
                    <MenuItem key={status.id} value={status.id.toString()}>{status.nome}</MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={2}>
              <Button
                fullWidth
                variant="contained"
                startIcon={<AddIcon />}
                onClick={() => {/* Nova Impugnação */}}
              >
                Nova Impugnação
              </Button>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* Tabela */}
      <Card>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Protocolo</TableCell>
                <TableCell>Descrição</TableCell>
                <TableCell>Impugnado</TableCell>
                <TableCell>Impugnante</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Data</TableCell>
                <TableCell>UF</TableCell>
                <TableCell>Ações</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {impugnacoes.map((impugnacao) => (
                <TableRow key={impugnacao.id} hover>
                  <TableCell>{impugnacao.numeroProtocolo}</TableCell>
                  <TableCell>
                    <Typography variant="body2" noWrap sx={{ maxWidth: 200 }}>
                      {impugnacao.descricao}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Box>
                      <Typography variant="body2" fontWeight="medium">
                        {impugnacao.membroChapaImpugnado.nome}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        Chapa {impugnacao.membroChapaImpugnado.chapaNumero} - {impugnacao.membroChapaImpugnado.tipoMembro}
                      </Typography>
                    </Box>
                  </TableCell>
                  <TableCell>
                    <Box>
                      <Typography variant="body2">
                        {impugnacao.profissionalImpugnante.nome}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {impugnacao.profissionalImpugnante.numeroCAU}
                      </Typography>
                    </Box>
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={impugnacao.status}
                      size="small"
                      sx={{ 
                        backgroundColor: getStatusColor(impugnacao.status),
                        color: 'white'
                      }}
                    />
                  </TableCell>
                  <TableCell>{formatDate(impugnacao.dataCadastro)}</TableCell>
                  <TableCell>{impugnacao.ufSigla}</TableCell>
                  <TableCell>
                    <IconButton 
                      size="small" 
                      onClick={() => handleViewDetails(impugnacao.id)}
                      title="Ver Detalhes"
                    >
                      <ViewIcon />
                    </IconButton>
                    <IconButton 
                      size="small" 
                      onClick={() => handleViewWorkflow(impugnacao.id)}
                      title="Ver Workflow"
                    >
                      <WorkflowIcon />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
        
        <TablePagination
          component="div"
          count={totalRecords}
          page={page}
          onPageChange={handleChangePage}
          rowsPerPage={rowsPerPage}
          onRowsPerPageChange={handleChangeRowsPerPage}
          labelRowsPerPage="Registros por página:"
          labelDisplayedRows={({ from, to, count }) => `${from}-${to} de ${count !== -1 ? count : `mais de ${to}`}`}
        />
      </Card>

      {/* Diálogos */}
      <DetailsDialog />
      <WorkflowDialog />
    </Box>
  );
};

export default ImpugnacoesList;