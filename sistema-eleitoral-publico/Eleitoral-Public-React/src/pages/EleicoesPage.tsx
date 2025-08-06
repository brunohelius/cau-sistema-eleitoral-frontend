import React, { useState } from 'react';
import {
  Container,
  Typography,
  Grid,
  Card,
  CardContent,
  CardActions,
  Button,
  Box,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip,
  Paper,
  Alert,
  Tabs,
  Tab,
  List,
  ListItem,
  ListItemText,
  Divider
} from '@mui/material';
import {
  Search as SearchIcon,
  HowToVote as VoteIcon,
  CalendarMonth as CalendarIcon,
  LocationOn as LocationIcon,
  Assessment as AssessmentIcon,
  Visibility as VisibilityIcon,
  Info as InfoIcon
} from '@mui/icons-material';
import { useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { eleicaoService, ufService } from '../services/api';
import { format, isAfter, isBefore } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`eleicoes-tabpanel-${index}`}
      aria-labelledby={`eleicoes-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ py: 3 }}>{children}</Box>}
    </div>
  );
}

export const EleicoesPage: React.FC = () => {
  const navigate = useNavigate();
  const [tabValue, setTabValue] = useState(0);
  const [filters, setFilters] = useState({
    search: '',
    ufId: '',
    situacao: '',
    ano: ''
  });

  // Queries
  const { data: eleicoes = [], isLoading } = useQuery({
    queryKey: ['eleicoes-publicas', filters],
    queryFn: () => eleicaoService.getPublicas()
  });

  const { data: ufs = [] } = useQuery({
    queryKey: ['ufs'],
    queryFn: ufService.getAll
  });

  const handleFilterChange = (field: string, value: string) => {
    setFilters(prev => ({ ...prev, [field]: value }));
  };

  const handleViewEleicao = (eleicaoId: number) => {
    navigate(`/eleicoes/${eleicaoId}`);
  };

  const getSituacaoColor = (situacao: string) => {
    switch (situacao) {
      case 'EmAndamento':
        return 'success';
      case 'EmElaboracao':
        return 'warning';
      case 'Finalizada':
        return 'info';
      case 'Cancelada':
        return 'error';
      default:
        return 'default';
    }
  };

  const getSituacaoLabel = (situacao: string) => {
    switch (situacao) {
      case 'EmAndamento':
        return 'Em Andamento';
      case 'EmElaboracao':
        return 'Em Elaboração';
      case 'Finalizada':
        return 'Finalizada';
      case 'Cancelada':
        return 'Cancelada';
      default:
        return situacao;
    }
  };

  const getTipoEleicaoIcon = (tipo: string) => {
    switch (tipo) {
      case 'Nacional':
        return '🏛️';
      case 'Regional':
        return '📍';
      default:
        return '🗳️';
    }
  };

  const isEleicaoAtiva = (eleicao: any) => {
    const agora = new Date();
    const inicio = new Date(eleicao.dataInicio);
    const fim = new Date(eleicao.dataFim);
    return isAfter(agora, inicio) && isBefore(agora, fim);
  };

  const eleicoesAtivas = eleicoes.filter(e => e.situacao === 'EmAndamento');
  const eleicoesFinalizadas = eleicoes.filter(e => e.situacao === 'Finalizada');
  const todasEleicoes = eleicoes;

  const filteredEleicoes = (lista: any[]) => {
    return lista.filter(eleicao => {
      const matchSearch = !filters.search || 
        eleicao.titulo.toLowerCase().includes(filters.search.toLowerCase()) ||
        eleicao.descricao?.toLowerCase().includes(filters.search.toLowerCase());
      
      const matchUf = !filters.ufId || eleicao.ufId?.toString() === filters.ufId;
      const matchSituacao = !filters.situacao || eleicao.situacao === filters.situacao;
      const matchAno = !filters.ano || eleicao.ano.toString() === filters.ano;

      return matchSearch && matchUf && matchSituacao && matchAno;
    });
  };

  const getListToShow = () => {
    switch (tabValue) {
      case 0:
        return filteredEleicoes(eleicoesAtivas);
      case 1:
        return filteredEleicoes(eleicoesFinalizadas);
      default:
        return filteredEleicoes(todasEleicoes);
    }
  };

  const anos = [...new Set(eleicoes.map(e => e.ano))].sort((a, b) => b - a);

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      {/* Header */}
      <Box mb={4}>
        <Typography variant="h3" component="h1" gutterBottom fontWeight="bold">
          Eleições CAU
        </Typography>
        <Typography variant="h6" color="textSecondary">
          Acompanhe as eleições do Conselho de Arquitetura e Urbanismo
        </Typography>
      </Box>

      {/* Estatísticas Rápidas */}
      <Grid container spacing={2} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={4}>
          <Card>
            <CardContent sx={{ textAlign: 'center' }}>
              <VoteIcon sx={{ fontSize: 40, color: 'success.main', mb: 1 }} />
              <Typography variant="h4" fontWeight="bold" color="success.main">
                {eleicoesAtivas.length}
              </Typography>
              <Typography variant="body2" color="textSecondary">
                Eleições Ativas
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={4}>
          <Card>
            <CardContent sx={{ textAlign: 'center' }}>
              <AssessmentIcon sx={{ fontSize: 40, color: 'info.main', mb: 1 }} />
              <Typography variant="h4" fontWeight="bold" color="info.main">
                {eleicoesFinalizadas.length}
              </Typography>
              <Typography variant="body2" color="textSecondary">
                Eleições Finalizadas
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={4}>
          <Card>
            <CardContent sx={{ textAlign: 'center' }}>
              <CalendarIcon sx={{ fontSize: 40, color: 'primary.main', mb: 1 }} />
              <Typography variant="h4" fontWeight="bold" color="primary.main">
                {anos[0] || new Date().getFullYear()}
              </Typography>
              <Typography variant="body2" color="textSecondary">
                Ano Mais Recente
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Filtros */}
      <Paper sx={{ p: 3, mb: 3 }}>
        <Grid container spacing={3} alignItems="center">
          <Grid item xs={12} md={3}>
            <TextField
              fullWidth
              label="Buscar eleição"
              value={filters.search}
              onChange={(e) => handleFilterChange('search', e.target.value)}
              placeholder="Título da eleição..."
              InputProps={{
                startAdornment: <SearchIcon sx={{ mr: 1, color: 'action.active' }} />
              }}
            />
          </Grid>
          
          <Grid item xs={12} md={2}>
            <FormControl fullWidth>
              <InputLabel>UF</InputLabel>
              <Select
                value={filters.ufId}
                label="UF"
                onChange={(e) => handleFilterChange('ufId', e.target.value)}
              >
                <MenuItem value="">Todas</MenuItem>
                <MenuItem value="nacional">Nacional</MenuItem>
                {ufs.map((uf) => (
                  <MenuItem key={uf.id} value={uf.id.toString()}>
                    {uf.sigla}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>

          <Grid item xs={12} md={2}>
            <FormControl fullWidth>
              <InputLabel>Situação</InputLabel>
              <Select
                value={filters.situacao}
                label="Situação"
                onChange={(e) => handleFilterChange('situacao', e.target.value)}
              >
                <MenuItem value="">Todas</MenuItem>
                <MenuItem value="EmAndamento">Em Andamento</MenuItem>
                <MenuItem value="Finalizada">Finalizada</MenuItem>
                <MenuItem value="EmElaboracao">Em Elaboração</MenuItem>
              </Select>
            </FormControl>
          </Grid>

          <Grid item xs={12} md={2}>
            <FormControl fullWidth>
              <InputLabel>Ano</InputLabel>
              <Select
                value={filters.ano}
                label="Ano"
                onChange={(e) => handleFilterChange('ano', e.target.value)}
              >
                <MenuItem value="">Todos</MenuItem>
                {anos.map((ano) => (
                  <MenuItem key={ano} value={ano.toString()}>
                    {ano}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>

          <Grid item xs={12} md={3}>
            <Typography variant="body2" color="textSecondary">
              {getListToShow().length} eleições encontradas
            </Typography>
          </Grid>
        </Grid>
      </Paper>

      {/* Tabs */}
      <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 0 }}>
        <Tabs value={tabValue} onChange={(e, newValue) => setTabValue(newValue)}>
          <Tab label={`Ativas (${eleicoesAtivas.length})`} />
          <Tab label={`Finalizadas (${eleicoesFinalizadas.length})`} />
          <Tab label={`Todas (${eleicoes.length})`} />
        </Tabs>
      </Box>

      {/* Conteúdo das Tabs */}
      <TabPanel value={tabValue} index={0}>
        {eleicoesAtivas.length === 0 ? (
          <Alert severity="info" sx={{ mt: 2 }}>
            <Box display="flex" alignItems="center">
              <InfoIcon sx={{ mr: 1 }} />
              <Typography>
                Não há eleições ativas no momento. Consulte o calendário eleitoral para próximas eleições.
              </Typography>
            </Box>
          </Alert>
        ) : null}
        <EleicoesGrid 
          eleicoes={filteredEleicoes(eleicoesAtivas)} 
          onViewEleicao={handleViewEleicao}
          isLoading={isLoading}
        />
      </TabPanel>

      <TabPanel value={tabValue} index={1}>
        <EleicoesGrid 
          eleicoes={filteredEleicoes(eleicoesFinalizadas)} 
          onViewEleicao={handleViewEleicao}
          isLoading={isLoading}
        />
      </TabPanel>

      <TabPanel value={tabValue} index={2}>
        <EleicoesGrid 
          eleicoes={filteredEleicoes(todasEleicoes)} 
          onViewEleicao={handleViewEleicao}
          isLoading={isLoading}
        />
      </TabPanel>
    </Container>
  );
};

// Componente para o grid de eleições
interface EleicoesGridProps {
  eleicoes: any[];
  onViewEleicao: (id: number) => void;
  isLoading: boolean;
}

const EleicoesGrid: React.FC<EleicoesGridProps> = ({ eleicoes, onViewEleicao, isLoading }) => {
  const getSituacaoColor = (situacao: string) => {
    switch (situacao) {
      case 'EmAndamento': return 'success';
      case 'EmElaboracao': return 'warning';
      case 'Finalizada': return 'info';
      case 'Cancelada': return 'error';
      default: return 'default';
    }
  };

  const getSituacaoLabel = (situacao: string) => {
    switch (situacao) {
      case 'EmAndamento': return 'Em Andamento';
      case 'EmElaboracao': return 'Em Elaboração';
      case 'Finalizada': return 'Finalizada';
      case 'Cancelada': return 'Cancelada';
      default: return situacao;
    }
  };

  const getTipoEleicaoIcon = (tipo: string) => {
    switch (tipo) {
      case 'Nacional': return '🏛️';
      case 'Regional': return '📍';
      default: return '🗳️';
    }
  };

  if (isLoading) {
    return (
      <Box textAlign="center" py={8}>
        <Typography>Carregando eleições...</Typography>
      </Box>
    );
  }

  if (eleicoes.length === 0) {
    return (
      <Box textAlign="center" py={8}>
        <VoteIcon sx={{ fontSize: 64, color: 'grey.400', mb: 2 }} />
        <Typography variant="h5" color="textSecondary" gutterBottom>
          Nenhuma eleição encontrada
        </Typography>
        <Typography color="textSecondary">
          Tente ajustar os filtros de busca
        </Typography>
      </Box>
    );
  }

  return (
    <Grid container spacing={3}>
      {eleicoes.map((eleicao) => (
        <Grid item xs={12} md={6} lg={4} key={eleicao.id}>
          <Card 
            sx={{ 
              height: '100%', 
              display: 'flex', 
              flexDirection: 'column',
              cursor: 'pointer',
              '&:hover': {
                boxShadow: 4
              }
            }}
            onClick={() => onViewEleicao(eleicao.id)}
          >
            <CardContent sx={{ flexGrow: 1 }}>
              {/* Header */}
              <Box display="flex" justifyContent="space-between" alignItems="start" mb={2}>
                <Box display="flex" alignItems="center">
                  <Typography sx={{ mr: 1, fontSize: '1.5rem' }}>
                    {getTipoEleicaoIcon(eleicao.tipoEleicao)}
                  </Typography>
                  <Typography variant="h6" fontWeight="bold" component="div">
                    {eleicao.titulo}
                  </Typography>
                </Box>
                <Chip
                  label={getSituacaoLabel(eleicao.situacao)}
                  color={getSituacaoColor(eleicao.situacao)}
                  size="small"
                />
              </Box>

              {/* Ano */}
              <Box display="flex" alignItems="center" mb={2}>
                <CalendarIcon sx={{ fontSize: 16, mr: 1, color: 'text.secondary' }} />
                <Typography variant="body2" color="textSecondary">
                  Ano: {eleicao.ano}
                </Typography>
              </Box>

              {/* UF */}
              {eleicao.uf ? (
                <Box display="flex" alignItems="center" mb={2}>
                  <LocationIcon sx={{ fontSize: 16, mr: 1, color: 'text.secondary' }} />
                  <Typography variant="body2" color="textSecondary">
                    {eleicao.uf.nome} ({eleicao.uf.sigla})
                  </Typography>
                </Box>
              ) : eleicao.tipoEleicao === 'Nacional' && (
                <Box display="flex" alignItems="center" mb={2}>
                  <LocationIcon sx={{ fontSize: 16, mr: 1, color: 'text.secondary' }} />
                  <Typography variant="body2" color="textSecondary">
                    Nacional - Todas as UFs
                  </Typography>
                </Box>
              )}

              {/* Período */}
              <Box mb={2}>
                <Typography variant="body2" color="textSecondary" gutterBottom>
                  <strong>Período:</strong>
                </Typography>
                <Typography variant="body2" color="textSecondary">
                  {format(new Date(eleicao.dataInicio), 'dd/MM/yyyy', { locale: ptBR })} até{' '}
                  {format(new Date(eleicao.dataFim), 'dd/MM/yyyy', { locale: ptBR })}
                </Typography>
              </Box>

              {/* Descrição */}
              {eleicao.descricao && (
                <Typography variant="body2" color="textSecondary">
                  {eleicao.descricao.length > 100 
                    ? `${eleicao.descricao.substring(0, 100)}...`
                    : eleicao.descricao
                  }
                </Typography>
              )}
            </CardContent>

            <CardActions>
              <Button 
                size="small" 
                fullWidth
                startIcon={<VisibilityIcon />}
                onClick={(e) => {
                  e.stopPropagation();
                  onViewEleicao(eleicao.id);
                }}
              >
                Ver Detalhes
              </Button>
            </CardActions>
          </Card>
        </Grid>
      ))}
    </Grid>
  );
};