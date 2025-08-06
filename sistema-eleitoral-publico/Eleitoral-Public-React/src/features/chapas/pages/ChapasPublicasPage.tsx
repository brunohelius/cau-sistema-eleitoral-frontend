import { useState, useEffect } from 'react';
import {
  Box,
  Container,
  Typography,
  Card,
  CardContent,
  Grid,
  Chip,
  Button,
  TextField,
  InputAdornment,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Avatar,
  Divider,
  Paper,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Tab,
  Tabs,
  Accordion,
  AccordionSummary,
  AccordionDetails
} from '@mui/material';
import {
  Search as SearchIcon,
  FilterList as FilterIcon,
  Person as PersonIcon,
  LocationOn as LocationIcon,
  CalendarToday as CalendarIcon,
  Group as GroupIcon,
  Visibility as VisibilityIcon,
  Download as DownloadIcon,
  ExpandMore as ExpandMoreIcon,
  Star as StarIcon,
  Assignment as AssignmentIcon
} from '@mui/icons-material';
import { useQuery } from '@tanstack/react-query';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

import { chapaService } from '../../../services/api/chapaService';
import { eleicaoService } from '../../../services/api/eleicaoService';
import { ufService } from '../../../services/api/ufService';

interface ChapaPublica {
  id: number;
  nome: string;
  numero: number;
  slogan: string;
  plataformaEleitoral: string;
  status: string;
  eleicaoId: number;
  eleicaoNome: string;
  ufSigla: string;
  ufNome: string;
  dataRegistro: string;
  membros: MembroChapa[];
  totalVotos?: number;
  posicaoRanking?: number;
}

interface MembroChapa {
  id: number;
  profissionalNome: string;
  cargo: string;
  principal: boolean;
  ativo: boolean;
  atividadePrincipal: string;
  representatividade: string;
}

export function ChapasPublicasPage() {
  const [selectedTab, setSelectedTab] = useState(0);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedUf, setSelectedUf] = useState('');
  const [selectedEleicao, setSelectedEleicao] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('APROVADA');
  const [detailDialogOpen, setDetailDialogOpen] = useState(false);
  const [selectedChapa, setSelectedChapa] = useState<ChapaPublica | null>(null);

  // Queries
  const { data: chapas = [], isLoading: chapasLoading } = useQuery({
    queryKey: ['chapas-publicas', selectedUf, selectedEleicao, selectedStatus, searchTerm],
    queryFn: () => chapaService.getPublicas({
      uf: selectedUf,
      eleicaoId: selectedEleicao ? selectedEleicao : undefined,
      status: selectedStatus,
      search: searchTerm
    })
  });

  const { data: eleicoes = [] } = useQuery({
    queryKey: ['eleicoes-ativas'],
    queryFn: () => eleicaoService.getAtivas()
  });

  const { data: ufs = [] } = useQuery({
    queryKey: ['ufs'],
    queryFn: ufService.getAll
  });

  const handleViewDetails = (chapa: ChapaPublica) => {
    setSelectedChapa(chapa);
    setDetailDialogOpen(true);
  };

  const handleDownloadPlataforma = (chapaId: number) => {
    // Implementar download da plataforma eleitoral
    window.open(`/api/chapas/${chapaId}/plataforma/download`, '_blank');
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'APROVADA': return 'success';
      case 'EM_ANALISE': return 'warning';
      case 'ELEITA': return 'primary';
      default: return 'default';
    }
  };

  const getCargoColor = (cargo: string) => {
    switch (cargo) {
      case 'PRESIDENTE': return 'primary';
      case 'VICE_PRESIDENTE': return 'secondary';
      case 'CONSELHEIRO_TITULAR': return 'info';
      case 'CONSELHEIRO_SUPLENTE': return 'default';
      default: return 'default';
    }
  };

  const chapasFiltradas = chapas.filter(chapa => {
    const matchesSearch = !searchTerm || 
      chapa.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
      chapa.slogan.toLowerCase().includes(searchTerm.toLowerCase()) ||
      chapa.membros.some(m => m.profissionalNome.toLowerCase().includes(searchTerm.toLowerCase()));
    
    return matchesSearch;
  });

  const chapasPorCategoria = {
    todas: chapasFiltradas,
    nacional: chapasFiltradas.filter(c => !c.ufSigla),
    regionais: chapasFiltradas.filter(c => c.ufSigla),
    eleitas: chapasFiltradas.filter(c => c.status === 'ELEITA')
  };

  const getChapasPorTab = (tabIndex: number) => {
    switch (tabIndex) {
      case 0: return chapasPorCategoria.todas;
      case 1: return chapasPorCategoria.nacional;
      case 2: return chapasPorCategoria.regionais;
      case 3: return chapasPorCategoria.eleitas;
      default: return chapasPorCategoria.todas;
    }
  };

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      {/* Header */}
      <Box mb={4}>
        <Typography variant="h3" component="h1" gutterBottom align="center">
          Chapas Eleitorais
        </Typography>
        <Typography variant="h6" color="textSecondary" align="center" mb={3}>
          Conheça as chapas registradas para as eleições do CAU
        </Typography>

        {/* Filtros */}
        <Paper elevation={2} sx={{ p: 3, mb: 3 }}>
          <Grid container spacing={3} alignItems="center">
            <Grid item xs={12} md={4}>
              <TextField
                fullWidth
                placeholder="Buscar chapas, candidatos..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchIcon />
                    </InputAdornment>
                  )
                }}
              />
            </Grid>
            <Grid item xs={12} md={3}>
              <FormControl fullWidth>
                <InputLabel>Eleição</InputLabel>
                <Select
                  value={selectedEleicao}
                  onChange={(e) => setSelectedEleicao(e.target.value)}
                  label="Eleição"
                >
                  <MenuItem value="">Todas as Eleições</MenuItem>
                  {eleicoes.map(eleicao => (
                    <MenuItem key={eleicao.id} value={eleicao.id}>
                      {eleicao.nome}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={3}>
              <FormControl fullWidth>
                <InputLabel>UF</InputLabel>
                <Select
                  value={selectedUf}
                  onChange={(e) => setSelectedUf(e.target.value)}
                  label="UF"
                >
                  <MenuItem value="">Todas as UFs</MenuItem>
                  <MenuItem value="NACIONAL">Nacional</MenuItem>
                  {ufs.map(uf => (
                    <MenuItem key={uf.id} value={uf.sigla}>
                      {uf.sigla} - {uf.nome}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={2}>
              <FormControl fullWidth>
                <InputLabel>Status</InputLabel>
                <Select
                  value={selectedStatus}
                  onChange={(e) => setSelectedStatus(e.target.value)}
                  label="Status"
                >
                  <MenuItem value="">Todos</MenuItem>
                  <MenuItem value="APROVADA">Aprovadas</MenuItem>
                  <MenuItem value="ELEITA">Eleitas</MenuItem>
                </Select>
              </FormControl>
            </Grid>
          </Grid>
        </Paper>

        {/* Estatísticas */}
        <Grid container spacing={3} mb={3}>
          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent>
                <Box display="flex" alignItems="center" gap={1}>
                  <GroupIcon color="primary" />
                  <Box>
                    <Typography variant="h5">{chapas.length}</Typography>
                    <Typography variant="body2" color="textSecondary">
                      Total de Chapas
                    </Typography>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent>
                <Box display="flex" alignItems="center" gap={1}>
                  <LocationIcon color="info" />
                  <Box>
                    <Typography variant="h5">{chapasPorCategoria.regionais.length}</Typography>
                    <Typography variant="body2" color="textSecondary">
                      Chapas Regionais
                    </Typography>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent>
                <Box display="flex" alignItems="center" gap={1}>
                  <StarIcon color="warning" />
                  <Box>
                    <Typography variant="h5">{chapasPorCategoria.nacional.length}</Typography>
                    <Typography variant="body2" color="textSecondary">
                      Chapas Nacionais
                    </Typography>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent>
                <Box display="flex" alignItems="center" gap={1}>
                  <Assignment color="success" />
                  <Box>
                    <Typography variant="h5">{chapasPorCategoria.eleitas.length}</Typography>
                    <Typography variant="body2" color="textSecondary">
                      Chapas Eleitas
                    </Typography>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Box>

      {/* Tabs */}
      <Box mb={3}>
        <Tabs
          value={selectedTab}
          onChange={(_, newValue) => setSelectedTab(newValue)}
          sx={{ borderBottom: 1, borderColor: 'divider' }}
        >
          <Tab label={`Todas (${chapasPorCategoria.todas.length})`} />
          <Tab label={`Nacional (${chapasPorCategoria.nacional.length})`} />
          <Tab label={`Regionais (${chapasPorCategoria.regionais.length})`} />
          <Tab label={`Eleitas (${chapasPorCategoria.eleitas.length})`} />
        </Tabs>
      </Box>

      {/* Lista de Chapas */}
      {chapasLoading ? (
        <Box display="flex" justifyContent="center" p={3}>
          <Typography>Carregando chapas...</Typography>
        </Box>
      ) : getChapasPorTab(selectedTab).length === 0 ? (
        <Alert severity="info">
          Nenhuma chapa encontrada com os filtros selecionados.
        </Alert>
      ) : (
        <Grid container spacing={3}>
          {getChapasPorTab(selectedTab).map((chapa) => (
            <Grid key={chapa.id} item xs={12} md={6} lg={4}>
              <Card 
                elevation={3} 
                sx={{ 
                  height: '100%', 
                  display: 'flex', 
                  flexDirection: 'column',
                  transition: 'transform 0.2s',
                  '&:hover': {
                    transform: 'translateY(-4px)',
                    boxShadow: 6
                  }
                }}
              >
                <CardContent sx={{ flexGrow: 1 }}>
                  {/* Header da Chapa */}
                  <Box display="flex" justifyContent="space-between" alignItems="flex-start" mb={2}>
                    <Box>
                      <Typography variant="h6" component="h3" gutterBottom>
                        {chapa.nome}
                      </Typography>
                      <Typography variant="h4" color="primary" fontWeight="bold">
                        {chapa.numero}
                      </Typography>
                    </Box>
                    <Box>
                      <Chip
                        label={chapa.status}
                        color={getStatusColor(chapa.status) as any}
                        size="small"
                      />
                      {chapa.status === 'ELEITA' && (
                        <Chip
                          icon={<StarIcon />}
                          label="ELEITA"
                          color="primary"
                          size="small"
                          sx={{ ml: 1 }}
                        />
                      )}
                    </Box>
                  </Box>

                  {/* Slogan */}
                  {chapa.slogan && (
                    <Typography 
                      variant="body2" 
                      color="textSecondary" 
                      fontStyle="italic" 
                      mb={2}
                    >
                      "{chapa.slogan}"
                    </Typography>
                  )}

                  {/* Informações da Eleição */}
                  <Box display="flex" alignItems="center" gap={1} mb={2}>
                    <CalendarIcon fontSize="small" color="action" />
                    <Typography variant="body2">
                      {chapa.eleicaoNome}
                    </Typography>
                  </Box>

                  <Box display="flex" alignItems="center" gap={1} mb={2}>
                    <LocationIcon fontSize="small" color="action" />
                    <Typography variant="body2">
                      {chapa.ufSigla ? `${chapa.ufSigla} - ${chapa.ufNome}` : 'Nacional'}
                    </Typography>
                  </Box>

                  {/* Membros Principais */}
                  <Typography variant="subtitle2" gutterBottom>
                    Membros Principais:
                  </Typography>
                  {chapa.membros
                    .filter(m => m.principal && m.ativo)
                    .slice(0, 3)
                    .map((membro, index) => (
                      <Box key={index} display="flex" alignItems="center" gap={1} mb={1}>
                        <Avatar sx={{ width: 24, height: 24, fontSize: '0.75rem' }}>
                          {membro.profissionalNome.charAt(0)}
                        </Avatar>
                        <Box>
                          <Typography variant="body2">
                            {membro.profissionalNome}
                          </Typography>
                          <Chip
                            label={membro.cargo.replace('_', ' ').toLowerCase()}
                            color={getCargoColor(membro.cargo) as any}
                            size="small"
                            variant="outlined"
                          />
                        </Box>
                      </Box>
                    ))}

                  {chapa.membros.filter(m => m.ativo).length > 3 && (
                    <Typography variant="caption" color="textSecondary">
                      +{chapa.membros.filter(m => m.ativo).length - 3} outros membros
                    </Typography>
                  )}

                  {/* Votação (se eleição finalizada) */}
                  {chapa.totalVotos && (
                    <Box mt={2}>
                      <Divider />
                      <Box display="flex" justifyContent="space-between" alignItems="center" mt={1}>
                        <Typography variant="body2" color="textSecondary">
                          Total de Votos:
                        </Typography>
                        <Typography variant="h6" color="primary">
                          {chapa.totalVotos.toLocaleString()}
                        </Typography>
                      </Box>
                      {chapa.posicaoRanking && (
                        <Typography variant="caption" color="textSecondary">
                          {chapa.posicaoRanking}ª colocação
                        </Typography>
                      )}
                    </Box>
                  )}
                </CardContent>

                {/* Ações */}
                <Box sx={{ p: 2, pt: 0 }}>
                  <Grid container spacing={1}>
                    <Grid item xs={6}>
                      <Button
                        fullWidth
                        variant="outlined"
                        startIcon={<VisibilityIcon />}
                        onClick={() => handleViewDetails(chapa)}
                        size="small"
                      >
                        Detalhes
                      </Button>
                    </Grid>
                    <Grid item xs={6}>
                      <Button
                        fullWidth
                        variant="contained"
                        startIcon={<DownloadIcon />}
                        onClick={() => handleDownloadPlataforma(chapa.id)}
                        size="small"
                      >
                        Plataforma
                      </Button>
                    </Grid>
                  </Grid>
                </Box>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}

      {/* Dialog de Detalhes */}
      <Dialog
        open={detailDialogOpen}
        onClose={() => setDetailDialogOpen(false)}
        maxWidth="md"
        fullWidth
      >
        {selectedChapa && (
          <>
            <DialogTitle>
              <Box display="flex" justifyContent="space-between" alignItems="center">
                <Box>
                  <Typography variant="h5">
                    {selectedChapa.nome} - {selectedChapa.numero}
                  </Typography>
                  <Typography variant="body2" color="textSecondary">
                    {selectedChapa.eleicaoNome} • {selectedChapa.ufSigla ? `${selectedChapa.ufSigla} - ${selectedChapa.ufNome}` : 'Nacional'}
                  </Typography>
                </Box>
                <Chip
                  label={selectedChapa.status}
                  color={getStatusColor(selectedChapa.status) as any}
                />
              </Box>
            </DialogTitle>
            <DialogContent>
              {/* Slogan */}
              {selectedChapa.slogan && (
                <Alert severity="info" sx={{ mb: 3 }}>
                  <Typography variant="h6" component="div">
                    "{selectedChapa.slogan}"
                  </Typography>
                </Alert>
              )}

              {/* Plataforma Eleitoral */}
              <Accordion defaultExpanded>
                <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                  <Typography variant="h6">Plataforma Eleitoral</Typography>
                </AccordionSummary>
                <AccordionDetails>
                  <Typography variant="body1" sx={{ whiteSpace: 'pre-wrap' }}>
                    {selectedChapa.plataformaEleitoral || 'Plataforma não disponível'}
                  </Typography>
                </AccordionDetails>
              </Accordion>

              {/* Membros da Chapa */}
              <Accordion>
                <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                  <Typography variant="h6">
                    Membros da Chapa ({selectedChapa.membros.filter(m => m.ativo).length})
                  </Typography>
                </AccordionSummary>
                <AccordionDetails>
                  <Grid container spacing={2}>
                    {selectedChapa.membros
                      .filter(m => m.ativo)
                      .sort((a, b) => {
                        if (a.principal && !b.principal) return -1;
                        if (!a.principal && b.principal) return 1;
                        return 0;
                      })
                      .map((membro, index) => (
                        <Grid key={index} item xs={12} sm={6}>
                          <Card variant="outlined">
                            <CardContent>
                              <Box display="flex" alignItems="center" gap={2} mb={2}>
                                <Avatar>
                                  {membro.profissionalNome.charAt(0)}
                                </Avatar>
                                <Box>
                                  <Typography variant="subtitle1">
                                    {membro.profissionalNome}
                                  </Typography>
                                  <Chip
                                    label={membro.cargo.replace('_', ' ')}
                                    color={getCargoColor(membro.cargo) as any}
                                    size="small"
                                  />
                                  {membro.principal && (
                                    <Chip
                                      label="Principal"
                                      color="primary"
                                      size="small"
                                      sx={{ ml: 0.5 }}
                                    />
                                  )}
                                </Box>
                              </Box>
                              <Typography variant="body2" color="textSecondary">
                                <strong>Atividade:</strong> {membro.atividadePrincipal}
                              </Typography>
                              <Typography variant="body2" color="textSecondary">
                                <strong>Representatividade:</strong> {membro.representatividade}
                              </Typography>
                            </CardContent>
                          </Card>
                        </Grid>
                      ))}
                  </Grid>
                </AccordionDetails>
              </Accordion>

              {/* Informações Adicionais */}
              <Box mt={3}>
                <Typography variant="body2" color="textSecondary">
                  <strong>Data de Registro:</strong> {format(new Date(selectedChapa.dataRegistro), 'dd/MM/yyyy HH:mm', { locale: ptBR })}
                </Typography>
              </Box>
            </DialogContent>
            <DialogActions>
              <Button onClick={() => setDetailDialogOpen(false)}>
                Fechar
              </Button>
              <Button
                variant="contained"
                startIcon={<DownloadIcon />}
                onClick={() => handleDownloadPlataforma(selectedChapa.id)}
              >
                Download Plataforma
              </Button>
            </DialogActions>
          </>
        )}
      </Dialog>
    </Container>
  );
}