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
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Avatar,
  Alert,
  Tabs,
  Tab,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  Divider
} from '@mui/material';
import {
  Search as SearchIcon,
  Assessment as AssessmentIcon,
  EmojiEvents as TrophyIcon,
  LocationOn as LocationIcon,
  CalendarMonth as CalendarIcon,
  Download as DownloadIcon,
  Visibility as VisibilityIcon,
  Person as PersonIcon,
  Groups as GroupsIcon,
  BarChart as ChartIcon
} from '@mui/icons-material';
import { useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { eleicaoService, chapaService, ufService } from '../services/api';
import { format } from 'date-fns';
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
      id={`resultados-tabpanel-${index}`}
      aria-labelledby={`resultados-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ py: 3 }}>{children}</Box>}
    </div>
  );
}

export const ResultadosPage: React.FC = () => {
  const navigate = useNavigate();
  const [tabValue, setTabValue] = useState(0);
  const [filters, setFilters] = useState({
    search: '',
    ufId: '',
    ano: ''
  });

  // Queries
  const { data: eleicoes = [], isLoading } = useQuery({
    queryKey: ['eleicoes-finalizadas', filters],
    queryFn: () => eleicaoService.getPublicas()
  });

  const { data: ufs = [] } = useQuery({
    queryKey: ['ufs'],
    queryFn: ufService.getAll
  });

  const handleFilterChange = (field: string, value: string) => {
    setFilters(prev => ({ ...prev, [field]: value }));
  };

  const handleViewResultado = (eleicaoId: number) => {
    navigate(`/resultados/${eleicaoId}`);
  };

  // Filtrar apenas eleições finalizadas
  const eleicoesFinalizadas = eleicoes.filter(e => e.situacao === 'Finalizada');
  
  const filteredEleicoes = eleicoesFinalizadas.filter(eleicao => {
    const matchSearch = !filters.search || 
      eleicao.titulo.toLowerCase().includes(filters.search.toLowerCase());
    
    const matchUf = !filters.ufId || 
      (filters.ufId === 'nacional' && eleicao.tipoEleicao === 'Nacional') ||
      eleicao.ufId?.toString() === filters.ufId;
    
    const matchAno = !filters.ano || eleicao.ano.toString() === filters.ano;

    return matchSearch && matchUf && matchAno;
  });

  const eleicoesNacionais = filteredEleicoes.filter(e => e.tipoEleicao === 'Nacional');
  const eleicoesRegionais = filteredEleicoes.filter(e => e.tipoEleicao === 'Regional');

  const anos = [...new Set(eleicoesFinalizadas.map(e => e.ano))].sort((a, b) => b - a);

  // Dados mockados para demonstração
  const estatisticasGerais = {
    totalEleicoes: eleicoesFinalizadas.length,
    totalVotos: 15420,
    totalProfissionais: 8750,
    participacao: 87.5
  };

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      {/* Header */}
      <Box mb={4}>
        <Typography variant="h3" component="h1" gutterBottom fontWeight="bold">
          Resultados Eleitorais
        </Typography>
        <Typography variant="h6" color="textSecondary">
          Consulte os resultados oficiais das eleições finalizadas do CAU
        </Typography>
      </Box>

      {/* Estatísticas Gerais */}
      <Grid container spacing={2} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={3}>
          <Card>
            <CardContent sx={{ textAlign: 'center' }}>
              <AssessmentIcon sx={{ fontSize: 40, color: 'primary.main', mb: 1 }} />
              <Typography variant="h4" fontWeight="bold" color="primary.main">
                {estatisticasGerais.totalEleicoes}
              </Typography>
              <Typography variant="body2" color="textSecondary">
                Eleições Finalizadas
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={3}>
          <Card>
            <CardContent sx={{ textAlign: 'center' }}>
              <GroupsIcon sx={{ fontSize: 40, color: 'success.main', mb: 1 }} />
              <Typography variant="h4" fontWeight="bold" color="success.main">
                {estatisticasGerais.totalProfissionais.toLocaleString()}
              </Typography>
              <Typography variant="body2" color="textSecondary">
                Profissionais Habilitados
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={3}>
          <Card>
            <CardContent sx={{ textAlign: 'center' }}>
              <TrophyIcon sx={{ fontSize: 40, color: 'warning.main', mb: 1 }} />
              <Typography variant="h4" fontWeight="bold" color="warning.main">
                {estatisticasGerais.totalVotos.toLocaleString()}
              </Typography>
              <Typography variant="body2" color="textSecondary">
                Total de Votos
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={3}>
          <Card>
            <CardContent sx={{ textAlign: 'center' }}>
              <ChartIcon sx={{ fontSize: 40, color: 'info.main', mb: 1 }} />
              <Typography variant="h4" fontWeight="bold" color="info.main">
                {estatisticasGerais.participacao}%
              </Typography>
              <Typography variant="body2" color="textSecondary">
                Participação Média
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Filtros */}
      <Paper sx={{ p: 3, mb: 3 }}>
        <Grid container spacing={3} alignItems="center">
          <Grid item xs={12} md={4}>
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
          
          <Grid item xs={12} md={3}>
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
                    {uf.sigla} - {uf.nome}
                  </MenuItem>
                ))}
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
              {filteredEleicoes.length} resultados encontrados
            </Typography>
          </Grid>
        </Grid>
      </Paper>

      {/* Tabs */}
      <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 0 }}>
        <Tabs value={tabValue} onChange={(e, newValue) => setTabValue(newValue)}>
          <Tab label={`Nacionais (${eleicoesNacionais.length})`} />
          <Tab label={`Regionais (${eleicoesRegionais.length})`} />
          <Tab label={`Todas (${filteredEleicoes.length})`} />
        </Tabs>
      </Box>

      {/* Conteúdo das Tabs */}
      <TabPanel value={tabValue} index={0}>
        <ResultadosGrid 
          eleicoes={eleicoesNacionais} 
          onViewResultado={handleViewResultado}
          isLoading={isLoading}
        />
      </TabPanel>

      <TabPanel value={tabValue} index={1}>
        <ResultadosGrid 
          eleicoes={eleicoesRegionais} 
          onViewResultado={handleViewResultado}
          isLoading={isLoading}
        />
      </TabPanel>

      <TabPanel value={tabValue} index={2}>
        <ResultadosGrid 
          eleicoes={filteredEleicoes} 
          onViewResultado={handleViewResultado}
          isLoading={isLoading}
        />
      </TabPanel>

      {/* Informações de Transparência */}
      <Box sx={{ mt: 6 }}>
        <Paper sx={{ p: 3 }}>
          <Typography variant="h6" gutterBottom fontWeight="bold">
            Transparência Eleitoral
          </Typography>
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <Typography variant="body1" paragraph>
                <strong>Dados Abertos</strong>
              </Typography>
              <Typography variant="body2" color="textSecondary" paragraph>
                Todos os resultados eleitorais são públicos e podem ser verificados. 
                O CAU mantém total transparência nos processos eleitorais.
              </Typography>
              <Button variant="outlined" startIcon={<DownloadIcon />} disabled>
                Baixar Dados (CSV)
              </Button>
            </Grid>
            <Grid item xs={12} md={6}>
              <Typography variant="body1" paragraph>
                <strong>Metodologia</strong>
              </Typography>
              <Typography variant="body2" color="textSecondary" paragraph>
                As eleições seguem metodologia estabelecida no regulamento eleitoral,
                garantindo legitimidade e representatividade dos resultados.
              </Typography>
              <Button variant="outlined" disabled>
                Ver Regulamento
              </Button>
            </Grid>
          </Grid>
        </Paper>
      </Box>
    </Container>
  );
};

// Componente para o grid de resultados
interface ResultadosGridProps {
  eleicoes: any[];
  onViewResultado: (id: number) => void;
  isLoading: boolean;
}

const ResultadosGrid: React.FC<ResultadosGridProps> = ({ 
  eleicoes, 
  onViewResultado, 
  isLoading 
}) => {
  if (isLoading) {
    return (
      <Box textAlign="center" py={8}>
        <Typography>Carregando resultados...</Typography>
      </Box>
    );
  }

  if (eleicoes.length === 0) {
    return (
      <Box textAlign="center" py={8}>
        <AssessmentIcon sx={{ fontSize: 64, color: 'grey.400', mb: 2 }} />
        <Typography variant="h5" color="textSecondary" gutterBottom>
          Nenhum resultado encontrado
        </Typography>
        <Typography color="textSecondary">
          Tente ajustar os filtros de busca ou aguarde a finalização das eleições
        </Typography>
      </Box>
    );
  }

  // Dados mockados para demonstração dos resultados
  const getResultadoMock = (eleicao: any) => ({
    chapaVencedora: `Chapa ${eleicao.id % 3 + 1}`,
    totalVotos: Math.floor(Math.random() * 5000) + 1000,
    participacao: Math.floor(Math.random() * 30) + 70,
    totalChapas: Math.floor(Math.random() * 5) + 2
  });

  return (
    <Grid container spacing={3}>
      {eleicoes.map((eleicao) => {
        const resultado = getResultadoMock(eleicao);
        
        return (
          <Grid item xs={12} md={6} key={eleicao.id}>
            <Card 
              sx={{ 
                cursor: 'pointer',
                '&:hover': {
                  boxShadow: 4
                }
              }}
              onClick={() => onViewResultado(eleicao.id)}
            >
              <CardContent>
                {/* Header */}
                <Box display="flex" justifyContent="space-between" alignItems="start" mb={2}>
                  <Box>
                    <Typography variant="h6" fontWeight="bold" component="div">
                      {eleicao.titulo}
                    </Typography>
                    <Box display="flex" alignItems="center" gap={1} mt={1}>
                      <CalendarIcon sx={{ fontSize: 16, color: 'text.secondary' }} />
                      <Typography variant="body2" color="textSecondary">
                        Ano: {eleicao.ano}
                      </Typography>
                    </Box>
                  </Box>
                  <Chip
                    label="Finalizada"
                    color="success"
                    size="small"
                  />
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

                {/* Resultado Resumido */}
                <Box sx={{ mt: 2, p: 2, backgroundColor: 'success.light', borderRadius: 1 }}>
                  <Box display="flex" alignItems="center" mb={1}>
                    <TrophyIcon sx={{ fontSize: 20, mr: 1, color: 'success.dark' }} />
                    <Typography variant="body1" fontWeight="bold" color="success.dark">
                      Chapa Vencedora: {resultado.chapaVencedora}
                    </Typography>
                  </Box>
                  
                  <Grid container spacing={2} sx={{ mt: 1 }}>
                    <Grid item xs={6}>
                      <Typography variant="body2" color="text.secondary">
                        <strong>Total de Votos:</strong>
                      </Typography>
                      <Typography variant="body1" fontWeight="medium">
                        {resultado.totalVotos.toLocaleString()}
                      </Typography>
                    </Grid>
                    <Grid item xs={6}>
                      <Typography variant="body2" color="text.secondary">
                        <strong>Participação:</strong>
                      </Typography>
                      <Typography variant="body1" fontWeight="medium">
                        {resultado.participacao}%
                      </Typography>
                    </Grid>
                  </Grid>
                </Box>

                {/* Estatísticas */}
                <Box sx={{ mt: 2 }}>
                  <Typography variant="body2" color="textSecondary" gutterBottom>
                    <strong>Estatísticas da Eleição:</strong>
                  </Typography>
                  <List dense>
                    <ListItem disablePadding>
                      <ListItemText
                        primary={`${resultado.totalChapas} chapas participantes`}
                        secondary="Total de opções de voto"
                      />
                    </ListItem>
                    <ListItem disablePadding>
                      <ListItemText
                        primary={format(new Date(eleicao.dataFim), 'dd/MM/yyyy', { locale: ptBR })}
                        secondary="Data de encerramento"
                      />
                    </ListItem>
                  </List>
                </Box>
              </CardContent>

              <CardActions>
                <Button 
                  size="small" 
                  startIcon={<VisibilityIcon />}
                  onClick={(e) => {
                    e.stopPropagation();
                    onViewResultado(eleicao.id);
                  }}
                >
                  Ver Resultado Completo
                </Button>
                <Button 
                  size="small" 
                  startIcon={<DownloadIcon />}
                  disabled
                >
                  Baixar Relatório
                </Button>
              </CardActions>
            </Card>
          </Grid>
        );
      })}
    </Grid>
  );
};