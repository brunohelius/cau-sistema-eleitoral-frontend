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
  Avatar,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  Paper,
  Divider
} from '@mui/material';
import {
  Search as SearchIcon,
  Groups as GroupsIcon,
  Person as PersonIcon,
  LocationOn as LocationIcon,
  CalendarMonth as CalendarIcon
} from '@mui/icons-material';
import { useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { chapaService, eleicaoService, ufService } from '../services/api';

export const ChapasPage: React.FC = () => {
  const navigate = useNavigate();
  const [filters, setFilters] = useState({
    search: '',
    eleicaoId: '',
    ufId: '',
    status: 'Aprovada' // Mostrar apenas chapas aprovadas no frontend público
  });

  // Queries
  const { data: chapas = [], isLoading } = useQuery({
    queryKey: ['chapas-publicas', filters],
    queryFn: () => chapaService.getPublicas(filters)
  });

  const { data: eleicoes = [] } = useQuery({
    queryKey: ['eleicoes-publicas'],
    queryFn: () => eleicaoService.getPublicas()
  });

  const { data: ufs = [] } = useQuery({
    queryKey: ['ufs'],
    queryFn: ufService.getAll
  });

  const handleFilterChange = (field: string, value: string) => {
    setFilters(prev => ({ ...prev, [field]: value }));
  };

  const handleViewChapa = (chapaId: number) => {
    navigate(`/chapas/${chapaId}`);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Aprovada':
        return 'success';
      case 'EmAnalise':
        return 'warning';
      default:
        return 'default';
    }
  };

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      {/* Header */}
      <Box mb={4}>
        <Typography variant="h3" component="h1" gutterBottom fontWeight="bold">
          Chapas Eleitorais
        </Typography>
        <Typography variant="h6" color="textSecondary">
          Consulte as chapas participantes das eleições do CAU
        </Typography>
      </Box>

      {/* Filters */}
      <Paper sx={{ p: 3, mb: 3 }}>
        <Grid container spacing={3} alignItems="center">
          <Grid item xs={12} md={4}>
            <TextField
              fullWidth
              label="Buscar chapa"
              value={filters.search}
              onChange={(e) => handleFilterChange('search', e.target.value)}
              placeholder="Nome da chapa..."
              InputProps={{
                startAdornment: <SearchIcon sx={{ mr: 1, color: 'action.active' }} />
              }}
            />
          </Grid>
          
          <Grid item xs={12} md={3}>
            <FormControl fullWidth>
              <InputLabel>Eleição</InputLabel>
              <Select
                value={filters.eleicaoId}
                label="Eleição"
                onChange={(e) => handleFilterChange('eleicaoId', e.target.value)}
              >
                <MenuItem value="">Todas as eleições</MenuItem>
                {eleicoes.map((eleicao) => (
                  <MenuItem key={eleicao.id} value={eleicao.id.toString()}>
                    {eleicao.titulo}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>

          <Grid item xs={12} md={3}>
            <FormControl fullWidth>
              <InputLabel>UF</InputLabel>
              <Select
                value={filters.ufId}
                label="UF"
                onChange={(e) => handleFilterChange('ufId', e.target.value)}
              >
                <MenuItem value="">Todas as UFs</MenuItem>
                {ufs.map((uf) => (
                  <MenuItem key={uf.id} value={uf.id.toString()}>
                    {uf.nome} ({uf.sigla})
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>

          <Grid item xs={12} md={2}>
            <Typography variant="body2" color="textSecondary">
              {chapas.length} chapas encontradas
            </Typography>
          </Grid>
        </Grid>
      </Paper>

      {/* Results */}
      {isLoading ? (
        <Box textAlign="center" py={8}>
          <Typography>Carregando chapas...</Typography>
        </Box>
      ) : chapas.length === 0 ? (
        <Box textAlign="center" py={8}>
          <GroupsIcon sx={{ fontSize: 64, color: 'grey.400', mb: 2 }} />
          <Typography variant="h5" color="textSecondary" gutterBottom>
            Nenhuma chapa encontrada
          </Typography>
          <Typography color="textSecondary">
            Tente ajustar os filtros de busca
          </Typography>
        </Box>
      ) : (
        <Grid container spacing={3}>
          {chapas.map((chapa) => (
            <Grid item xs={12} md={6} lg={4} key={chapa.id}>
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
                onClick={() => handleViewChapa(chapa.id)}
              >
                <CardContent sx={{ flexGrow: 1 }}>
                  {/* Header */}
                  <Box display="flex" justifyContent="space-between" alignItems="start" mb={2}>
                    <Typography variant="h6" fontWeight="bold" component="div">
                      {chapa.nome}
                    </Typography>
                    <Chip
                      label={chapa.status}
                      color={getStatusColor(chapa.status)}
                      size="small"
                    />
                  </Box>

                  {/* Eleição */}
                  <Box display="flex" alignItems="center" mb={2}>
                    <CalendarIcon sx={{ fontSize: 16, mr: 1, color: 'text.secondary' }} />
                    <Typography variant="body2" color="textSecondary">
                      {chapa.eleicao?.titulo}
                    </Typography>
                  </Box>

                  {/* UF */}
                  {chapa.eleicao?.uf && (
                    <Box display="flex" alignItems="center" mb={2}>
                      <LocationIcon sx={{ fontSize: 16, mr: 1, color: 'text.secondary' }} />
                      <Typography variant="body2" color="textSecondary">
                        {chapa.eleicao.uf.nome} ({chapa.eleicao.uf.sigla})
                      </Typography>
                    </Box>
                  )}

                  {/* Descrição */}
                  {chapa.descricao && (
                    <Typography variant="body2" color="textSecondary" mb={2}>
                      {chapa.descricao.length > 100 
                        ? `${chapa.descricao.substring(0, 100)}...`
                        : chapa.descricao
                      }
                    </Typography>
                  )}

                  {/* Responsável */}
                  <Box display="flex" alignItems="center" mb={2}>
                    <Avatar sx={{ width: 32, height: 32, mr: 1 }}>
                      <PersonIcon fontSize="small" />
                    </Avatar>
                    <Box>
                      <Typography variant="body2" fontWeight="bold">
                        {chapa.responsavel?.nome}
                      </Typography>
                      <Typography variant="caption" color="textSecondary">
                        Responsável
                      </Typography>
                    </Box>
                  </Box>

                  {/* Membros */}
                  <Box>
                    <Typography variant="body2" color="textSecondary" gutterBottom>
                      Membros da Chapa:
                    </Typography>
                    <List dense sx={{ pt: 0 }}>
                      {chapa.membros?.slice(0, 3).map((membro, index) => (
                        <ListItem key={membro.id} disablePadding>
                          <ListItemAvatar>
                            <Avatar sx={{ width: 24, height: 24 }}>
                              <PersonIcon fontSize="small" />
                            </Avatar>
                          </ListItemAvatar>
                          <ListItemText
                            primary={
                              <Typography variant="body2">
                                {membro.profissional?.nome}
                              </Typography>
                            }
                            secondary={
                              <Typography variant="caption" color="textSecondary">
                                {membro.tipoMembro}
                              </Typography>
                            }
                          />
                        </ListItem>
                      ))}
                      {chapa.membros && chapa.membros.length > 3 && (
                        <ListItem disablePadding>
                          <ListItemText
                            primary={
                              <Typography variant="body2" color="textSecondary">
                                +{chapa.membros.length - 3} outros membros
                              </Typography>
                            }
                          />
                        </ListItem>
                      )}
                    </List>
                  </Box>
                </CardContent>

                <CardActions>
                  <Button 
                    size="small" 
                    fullWidth
                    onClick={(e) => {
                      e.stopPropagation();
                      handleViewChapa(chapa.id);
                    }}
                  >
                    Ver Detalhes
                  </Button>
                </CardActions>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}
    </Container>
  );
};