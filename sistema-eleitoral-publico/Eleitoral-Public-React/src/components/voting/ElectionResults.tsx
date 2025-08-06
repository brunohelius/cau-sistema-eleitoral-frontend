import React from 'react';
import {
  Box,
  Typography,
  Grid,
  LinearProgress,
  Avatar,
  Paper,
  Chip,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  Divider,
  Alert,
  CircularProgress
} from '@mui/material';
import {
  Person as PersonIcon,
  EmojiEvents as TrophyIcon,
  Groups as GroupsIcon,
  HowToVote as VoteIcon,
  Assessment as ChartIcon,
  Schedule as ScheduleIcon
} from '@mui/icons-material';
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { ResultadoVotacao } from '../../services/api/votacaoService';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface ElectionResultsProps {
  resultado: ResultadoVotacao;
  isLoading?: boolean;
}

const COLORS = ['#1976d2', '#388e3c', '#f57c00', '#d32f2f', '#7b1fa2', '#0288d1', '#689f38', '#fbc02d'];

export const ElectionResults: React.FC<ElectionResultsProps> = ({ resultado, isLoading = false }) => {
  if (isLoading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" py={8}>
        <CircularProgress size={48} />
        <Typography variant="h6" sx={{ ml: 2 }}>
          Carregando resultados...
        </Typography>
      </Box>
    );
  }

  const chartData = resultado.resultados.map((item, index) => ({
    name: item.candidato.nome.split(' ').slice(0, 2).join(' '), // Primeiros 2 nomes
    votos: item.totalVotos,
    percentual: item.percentualVotos,
    color: COLORS[index % COLORS.length]
  }));

  const vencedor = resultado.resultados[0];
  const isEmpate = resultado.resultados.length > 1 && 
    resultado.resultados[0].totalVotos === resultado.resultados[1].totalVotos;

  return (
    <Box>
      {/* Header com Estatísticas Gerais */}
      <Paper elevation={3} sx={{ p: 3, mb: 4, background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', color: 'white' }}>
        <Typography variant="h4" gutterBottom fontWeight="bold" textAlign="center">
          Resultados da Eleição
        </Typography>
        
        <Grid container spacing={3} sx={{ mt: 2 }}>
          <Grid item xs={12} sm={3}>
            <Box textAlign="center">
              <VoteIcon sx={{ fontSize: 40, mb: 1 }} />
              <Typography variant="h4" fontWeight="bold">
                {resultado.totalVotos.toLocaleString()}
              </Typography>
              <Typography variant="body1">
                Votos Computados
              </Typography>
            </Box>
          </Grid>
          
          <Grid item xs={12} sm={3}>
            <Box textAlign="center">
              <GroupsIcon sx={{ fontSize: 40, mb: 1 }} />
              <Typography variant="h4" fontWeight="bold">
                {resultado.totalEleitores.toLocaleString()}
              </Typography>
              <Typography variant="body1">
                Eleitores Aptos
              </Typography>
            </Box>
          </Grid>
          
          <Grid item xs={12} sm={3}>
            <Box textAlign="center">
              <ChartIcon sx={{ fontSize: 40, mb: 1 }} />
              <Typography variant="h4" fontWeight="bold">
                {resultado.percentualParticipacao.toFixed(1)}%
              </Typography>
              <Typography variant="body1">
                Participação
              </Typography>
            </Box>
          </Grid>
          
          <Grid item xs={12} sm={3}>
            <Box textAlign="center">
              <ScheduleIcon sx={{ fontSize: 40, mb: 1 }} />
              <Typography variant="h4" fontWeight="bold">
                {resultado.situacao === 'Final' ? 'FINAL' : 'PARCIAL'}
              </Typography>
              <Typography variant="body1">
                Situação
              </Typography>
            </Box>
          </Grid>
        </Grid>
      </Paper>

      {/* Alerta sobre situação do resultado */}
      {resultado.situacao === 'Parcial' && (
        <Alert severity="info" sx={{ mb: 3 }}>
          <Typography variant="body1" fontWeight="bold">
            Resultado Parcial
          </Typography>
          <Typography variant="body2">
            Os resultados apresentados são parciais e podem sofrer alterações até o encerramento oficial da eleição.
          </Typography>
        </Alert>
      )}

      {/* Vencedor ou Empate */}
      {!isEmpate ? (
        <Paper elevation={2} sx={{ p: 3, mb: 4, border: 2, borderColor: 'success.main', backgroundColor: 'success.50' }}>
          <Box display="flex" alignItems="center" justifyContent="center" mb={2}>
            <TrophyIcon sx={{ fontSize: 40, color: 'success.main', mr: 2 }} />
            <Typography variant="h5" fontWeight="bold" color="success.main">
              CANDIDATO VENCEDOR{resultado.situacao === 'Parcial' ? ' (PARCIAL)' : ''}
            </Typography>
          </Box>
          
          <Box display="flex" alignItems="center" justifyContent="center">
            <Avatar
              src={vencedor.candidato.foto}
              sx={{ width: 80, height: 80, mr: 3, border: 3, borderColor: 'success.main' }}
            >
              <PersonIcon sx={{ fontSize: 40 }} />
            </Avatar>
            
            <Box textAlign="center">
              <Typography variant="h4" fontWeight="bold" color="text.primary">
                {vencedor.candidato.nome}
              </Typography>
              <Typography variant="h6" color="text.secondary" gutterBottom>
                {vencedor.candidato.cargo}
              </Typography>
              <Typography variant="h5" color="success.main" fontWeight="bold">
                {vencedor.totalVotos.toLocaleString()} votos ({vencedor.percentualVotos.toFixed(1)}%)
              </Typography>
              <Chip 
                label={`Chapa ${vencedor.candidato.chapa.numero} - ${vencedor.candidato.chapa.nome}`}
                color="success"
                sx={{ mt: 1 }}
              />
            </Box>
          </Box>
        </Paper>
      ) : (
        <Alert severity="warning" sx={{ mb: 3 }}>
          <Typography variant="body1" fontWeight="bold">
            Situação de Empate
          </Typography>
          <Typography variant="body2">
            Há empate entre os candidatos mais votados. Aguarde o resultado final para definição.
          </Typography>
        </Alert>
      )}

      <Grid container spacing={3}>
        {/* Gráfico de Pizza */}
        <Grid item xs={12} lg={6}>
          <Paper elevation={2} sx={{ p: 3, height: 'fit-content' }}>
            <Typography variant="h6" gutterBottom fontWeight="bold" textAlign="center">
              Distribuição dos Votos
            </Typography>
            
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={chartData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percentual }) => `${name}: ${percentual.toFixed(1)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="votos"
                >
                  {chartData.map((_, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(value, name) => [`${value} votos`, name]} />
              </PieChart>
            </ResponsiveContainer>
          </Paper>
        </Grid>

        {/* Gráfico de Barras */}
        <Grid item xs={12} lg={6}>
          <Paper elevation={2} sx={{ p: 3, height: 'fit-content' }}>
            <Typography variant="h6" gutterBottom fontWeight="bold" textAlign="center">
              Votos por Candidato
            </Typography>
            
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis 
                  dataKey="name" 
                  angle={-45}
                  textAnchor="end"
                  height={80}
                  fontSize={12}
                />
                <YAxis />
                <Tooltip formatter={(value) => [`${value} votos`, 'Votos']} />
                <Bar dataKey="votos" fill="#1976d2" />
              </BarChart>
            </ResponsiveContainer>
          </Paper>
        </Grid>

        {/* Lista Detalhada de Resultados */}
        <Grid item xs={12}>
          <Paper elevation={2} sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom fontWeight="bold">
              Resultado Detalhado por Candidato
            </Typography>
            
            <List>
              {resultado.resultados.map((item, index) => (
                <React.Fragment key={item.candidatoId}>
                  <ListItem sx={{ py: 2 }}>
                    <ListItemAvatar>
                      <Box position="relative">
                        <Avatar
                          src={item.candidato.foto}
                          sx={{ 
                            width: 56, 
                            height: 56,
                            border: index === 0 && !isEmpate ? 3 : 1,
                            borderColor: index === 0 && !isEmpate ? 'success.main' : 'grey.300'
                          }}
                        >
                          <PersonIcon />
                        </Avatar>
                        {index === 0 && !isEmpate && (
                          <TrophyIcon 
                            sx={{ 
                              position: 'absolute',
                              top: -5,
                              right: -5,
                              fontSize: 20,
                              color: 'success.main',
                              backgroundColor: 'white',
                              borderRadius: '50%'
                            }} 
                          />
                        )}
                      </Box>
                    </ListItemAvatar>
                    
                    <ListItemText
                      primary={
                        <Box display="flex" alignItems="center" gap={2}>
                          <Typography variant="h6" fontWeight="bold">
                            {index + 1}º - {item.candidato.nome}
                          </Typography>
                          {index === 0 && !isEmpate && (
                            <Chip label="VENCEDOR" color="success" size="small" />
                          )}
                        </Box>
                      }
                      secondary={
                        <Box>
                          <Typography variant="body2" color="textSecondary">
                            {item.candidato.cargo} - Chapa {item.candidato.chapa.numero}: {item.candidato.chapa.nome}
                          </Typography>
                          
                          <Box display="flex" alignItems="center" mt={1} gap={2}>
                            <Box flexGrow={1}>
                              <LinearProgress
                                variant="determinate"
                                value={item.percentualVotos}
                                sx={{ 
                                  height: 8, 
                                  borderRadius: 1,
                                  backgroundColor: 'grey.200',
                                  '& .MuiLinearProgress-bar': {
                                    backgroundColor: COLORS[index % COLORS.length]
                                  }
                                }}
                              />
                            </Box>
                            
                            <Typography variant="h6" fontWeight="bold" color="primary.main">
                              {item.totalVotos.toLocaleString()} votos
                            </Typography>
                            
                            <Typography variant="body1" fontWeight="bold">
                              ({item.percentualVotos.toFixed(1)}%)
                            </Typography>
                          </Box>
                        </Box>
                      }
                    />
                  </ListItem>
                  
                  {index < resultado.resultados.length - 1 && <Divider />}
                </React.Fragment>
              ))}
            </List>
          </Paper>
        </Grid>
      </Grid>

      {/* Footer com informações adicionais */}
      <Paper elevation={1} sx={{ p: 2, mt: 3, backgroundColor: 'grey.50' }}>
        <Typography variant="body2" color="textSecondary" textAlign="center">
          Resultado {resultado.situacao.toLowerCase()} • 
          Atualizado em {format(new Date(), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}
        </Typography>
      </Paper>
    </Box>
  );
};
