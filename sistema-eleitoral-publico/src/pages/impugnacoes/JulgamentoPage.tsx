import React, { useState } from 'react';
import {
  Container,
  Paper,
  Typography,
  Box,
  Grid,
  Card,
  CardContent,
  Button,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  FormControlLabel,
  Radio,
  RadioGroup,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  CircularProgress,
  Chip,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Divider
} from '@mui/material';
import {
  ArrowBack as ArrowBackIcon,
  Gavel as GavelIcon,
  Person as PersonIcon,
  Assignment as AssignmentIcon,
  AttachFile as AttachFileIcon,
  Save as SaveIcon,
  Send as SendIcon,
  CheckCircle as CheckCircleIcon,
  Cancel as CancelIcon,
  HourglassEmpty as HourglassIcon
} from '@mui/icons-material';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useSnackbar } from 'notistack';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { 
  impugnacaoService, 
  PedidoImpugnacao,
  JulgamentoImpugnacao
} from '../../services/api/impugnacaoService';

interface MembroJulgador {
  id: number;
  nome: string;
  voto?: 'PROCEDENTE' | 'IMPROCEDENTE' | 'ABSTENCAO';
}

interface JulgamentoForm {
  relatorId: number;
  parecer: string;
  resultado: 'PROCEDENTE' | 'IMPROCEDENTE';
  votosJulgadores: { membroId: number; voto: 'PROCEDENTE' | 'IMPROCEDENTE' | 'ABSTENCAO' }[];
  arquivos: File[];
}

export const JulgamentoPage: React.FC = () => {
  const navigate = useNavigate();
  const { id, instancia } = useParams<{ id: string; instancia: '1' | '2' }>();
  const { user } = useAuth();
  const { enqueueSnackbar } = useSnackbar();
  const queryClient = useQueryClient();

  // Estados
  const [showConfirmacao, setShowConfirmacao] = useState(false);
  const [julgamentoForm, setJulgamentoForm] = useState<JulgamentoForm>({
    relatorId: 0,
    parecer: '',
    resultado: 'IMPROCEDENTE',
    votosJulgadores: [],
    arquivos: []
  });

  // Mock de membros julgadores - em um cenário real viria da API
  const [membrosJulgadores] = useState<MembroJulgador[]>([
    { id: 1, nome: 'Dr. João Silva' },
    { id: 2, nome: 'Dra. Maria Santos' },
    { id: 3, nome: 'Dr. Pedro Costa' },
    { id: 4, nome: 'Dra. Ana Lima' },
    { id: 5, nome: 'Dr. Carlos Oliveira' }
  ]);

  // Queries
  const { data: impugnacao, isLoading } = useQuery({
    queryKey: ['impugnacao', id],
    queryFn: () => impugnacaoService.getImpugnacaoById(Number(id)),
    enabled: !!id
  });

  const { data: julgamentosExistentes = [] } = useQuery({
    queryKey: ['julgamentos', id],
    queryFn: () => impugnacaoService.getJulgamentos(Number(id)),
    enabled: !!id
  });

  // Mutations
  const criarJulgamentoMutation = useMutation({
    mutationFn: (dados: JulgamentoForm) => {
      if (instancia === '1') {
        return impugnacaoService.criarJulgamentoPrimeiraInstancia(Number(id), dados);
      } else {
        // Para segunda instância, precisaríamos do ID do recurso
        // Por simplicidade, usando o mesmo método
        return impugnacaoService.criarJulgamentoPrimeiraInstancia(Number(id), dados);
      }
    },
    onSuccess: () => {
      enqueueSnackbar(
        `Julgamento da ${instancia}ª instância criado com sucesso!`, 
        { variant: 'success' }
      );
      navigate(`/impugnacoes/${id}`);
    },
    onError: (error: any) => {
      enqueueSnackbar(
        error.response?.data?.message || 'Erro ao criar julgamento',
        { variant: 'error' }
      );
    }
  });

  // Handlers
  const handleVotoChange = (membroId: number, voto: 'PROCEDENTE' | 'IMPROCEDENTE' | 'ABSTENCAO') => {
    setJulgamentoForm(prev => ({
      ...prev,
      votosJulgadores: prev.votosJulgadores.filter(v => v.membroId !== membroId).concat({
        membroId,
        voto
      })
    }));
  };

  const handleAdicionarArquivos = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    setJulgamentoForm(prev => ({
      ...prev,
      arquivos: [...prev.arquivos, ...files]
    }));
  };

  const handleRemoverArquivo = (index: number) => {
    setJulgamentoForm(prev => ({
      ...prev,
      arquivos: prev.arquivos.filter((_, i) => i !== index)
    }));
  };

  const validarFormulario = (): boolean => {
    if (!julgamentoForm.relatorId) {
      enqueueSnackbar('Selecione o relator', { variant: 'error' });
      return false;
    }

    if (!julgamentoForm.parecer.trim()) {
      enqueueSnackbar('Parecer é obrigatório', { variant: 'error' });
      return false;
    }

    if (julgamentoForm.votosJulgadores.length < 3) {
      enqueueSnackbar('É necessário pelo menos 3 votos para formar quórum', { variant: 'error' });
      return false;
    }

    return true;
  };

  const handleEnviarJulgamento = () => {
    if (!validarFormulario()) return;
    
    // Calcular resultado baseado nos votos
    const votosProcedentes = julgamentoForm.votosJulgadores.filter(v => v.voto === 'PROCEDENTE').length;
    const votosImprocedentes = julgamentoForm.votosJulgadores.filter(v => v.voto === 'IMPROCEDENTE').length;
    
    const resultado = votosProcedentes > votosImprocedentes ? 'PROCEDENTE' : 'IMPROCEDENTE';
    
    setJulgamentoForm(prev => ({ ...prev, resultado }));
    setShowConfirmacao(true);
  };

  const handleConfirmarEnvio = () => {
    criarJulgamentoMutation.mutate(julgamentoForm);
  };

  const getVotoIcon = (voto: string) => {
    switch (voto) {
      case 'PROCEDENTE':
        return <CheckCircleIcon color="success" />;
      case 'IMPROCEDENTE':
        return <CancelIcon color="error" />;
      default:
        return <HourglassIcon color="warning" />;
    }
  };

  const podeJulgar = () => {
    // Verificar se usuário é membro da comissão julgadora
    // Por simplicidade, assumindo que usuários logados podem julgar
    return !!user;
  };

  if (!user || !podeJulgar()) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Alert severity="error">
          Você não tem permissão para acessar esta página de julgamento.
        </Alert>
      </Container>
    );
  }

  if (isLoading) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
          <CircularProgress size={60} />
        </Box>
      </Container>
    );
  }

  if (!impugnacao) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Alert severity="error">
          Impugnação não encontrada.
        </Alert>
      </Container>
    );
  }

  // Verificar se já existe julgamento para esta instância
  const julgamentoExistente = julgamentosExistentes.find(j => j.instancia === Number(instancia));
  if (julgamentoExistente) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Alert severity="info">
          Esta impugnação já foi julgada na {instancia}ª instância.
          <Button onClick={() => navigate(`/impugnacoes/${id}`)} sx={{ ml: 2 }}>
            Ver Detalhes
          </Button>
        </Alert>
      </Container>
    );
  }

  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      {/* Header */}
      <Box mb={4}>
        <Button
          startIcon={<ArrowBackIcon />}
          onClick={() => navigate(`/impugnacoes/${id}`)}
          sx={{ mb: 2 }}
        >
          Voltar aos Detalhes
        </Button>
        
        <Typography variant="h3" component="h1" gutterBottom fontWeight="bold">
          <GavelIcon sx={{ mr: 2, verticalAlign: 'middle', fontSize: 'inherit' }} />
          Julgamento - {instancia}ª Instância
        </Typography>
        <Typography variant="h6" color="textSecondary">
          Impugnação #{impugnacao.numeroProtocolo}
        </Typography>
      </Box>

      <Grid container spacing={3}>
        {/* Informações da Impugnação */}
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                <PersonIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
                Dados da Impugnação
              </Typography>
              
              <List dense>
                <ListItem>
                  <ListItemText
                    primary="Profissional Impugnado"
                    secondary={impugnacao.membroChapa.profissional.nome}
                  />
                </ListItem>
                
                <ListItem>
                  <ListItemText
                    primary="Chapa"
                    secondary={`${impugnacao.membroChapa.chapaEleicao.nome} - ${impugnacao.membroChapa.chapaEleicao.eleicao.titulo}`}
                  />
                </ListItem>
                
                <ListItem>
                  <ListItemText
                    primary="Tipo de Impugnação"
                    secondary={impugnacao.tipoImpugnacao.descricao}
                  />
                </ListItem>
                
                <ListItem>
                  <ListItemText
                    primary="Status Atual"
                    secondary={
                      <Chip 
                        label={impugnacao.statusImpugnacao.descricao}
                        size="small"
                        color="primary"
                      />
                    }
                  />
                </ListItem>
                
                <ListItem>
                  <ListItemText
                    primary="Data da Impugnação"
                    secondary={format(new Date(impugnacao.dataInclusao), 'dd/MM/yyyy', { locale: ptBR })}
                  />
                </ListItem>
              </List>
            </CardContent>
          </Card>
        </Grid>

        {/* Formulário de Julgamento */}
        <Grid item xs={12} md={8}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              <AssignmentIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
              Dados do Julgamento
            </Typography>
            
            <Grid container spacing={3}>
              {/* Relator */}
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth required>
                  <InputLabel>Relator</InputLabel>
                  <Select
                    value={julgamentoForm.relatorId}
                    label="Relator"
                    onChange={(e) => setJulgamentoForm(prev => ({ 
                      ...prev, 
                      relatorId: Number(e.target.value) 
                    }))}
                  >
                    {membrosJulgadores.map((membro) => (
                      <MenuItem key={membro.id} value={membro.id}>
                        {membro.nome}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>

              {/* Parecer */}
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Parecer do Relator"
                  multiline
                  rows={8}
                  value={julgamentoForm.parecer}
                  onChange={(e) => setJulgamentoForm(prev => ({ 
                    ...prev, 
                    parecer: e.target.value 
                  }))}
                  required
                  placeholder="Descreva o parecer fundamentado sobre a impugnação..."
                  helperText={`${julgamentoForm.parecer.length}/10000 caracteres`}
                  inputProps={{ maxLength: 10000 }}
                />
              </Grid>

              {/* Documentos */}
              <Grid item xs={12}>
                <Box>
                  <Typography variant="subtitle1" gutterBottom>
                    <AttachFileIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
                    Documentos do Julgamento
                  </Typography>
                  
                  <Button
                    variant="outlined"
                    component="label"
                    sx={{ mb: 2 }}
                  >
                    Adicionar Documentos
                    <input
                      type="file"
                      hidden
                      multiple
                      accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                      onChange={handleAdicionarArquivos}
                    />
                  </Button>
                  
                  {julgamentoForm.arquivos.length > 0 && (
                    <List dense>
                      {julgamentoForm.arquivos.map((arquivo, index) => (
                        <ListItem key={index}>
                          <ListItemIcon>
                            <AttachFileIcon />
                          </ListItemIcon>
                          <ListItemText
                            primary={arquivo.name}
                            secondary={`${(arquivo.size / 1024 / 1024).toFixed(2)} MB`}
                          />
                          <Button
                            size="small"
                            color="error"
                            onClick={() => handleRemoverArquivo(index)}
                          >
                            Remover
                          </Button>
                        </ListItem>
                      ))}
                    </List>
                  )}
                </Box>
              </Grid>
            </Grid>
          </Paper>

          {/* Votação */}
          <Paper sx={{ p: 3, mt: 3 }}>
            <Typography variant="h6" gutterBottom>
              Votação dos Membros Julgadores
            </Typography>
            
            <Alert severity="info" sx={{ mb: 3 }}>
              Registre o voto de cada membro julgador. É necessário quórum mínimo de 3 votos.
            </Alert>

            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell><strong>Membro Julgador</strong></TableCell>
                    <TableCell align="center"><strong>Voto</strong></TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {membrosJulgadores.map((membro) => {
                    const votoAtual = julgamentoForm.votosJulgadores.find(v => v.membroId === membro.id)?.voto;
                    
                    return (
                      <TableRow key={membro.id}>
                        <TableCell>{membro.nome}</TableCell>
                        <TableCell align="center">
                          <FormControl component="fieldset">
                            <RadioGroup
                              row
                              value={votoAtual || ''}
                              onChange={(e) => handleVotoChange(
                                membro.id, 
                                e.target.value as 'PROCEDENTE' | 'IMPROCEDENTE' | 'ABSTENCAO'
                              )}
                            >
                              <FormControlLabel
                                value="PROCEDENTE"
                                control={<Radio color="success" />}
                                label={
                                  <Box display="flex" alignItems="center">
                                    <CheckCircleIcon color="success" sx={{ mr: 0.5, fontSize: 16 }} />
                                    Procedente
                                  </Box>
                                }
                              />
                              <FormControlLabel
                                value="IMPROCEDENTE"
                                control={<Radio color="error" />}
                                label={
                                  <Box display="flex" alignItems="center">
                                    <CancelIcon color="error" sx={{ mr: 0.5, fontSize: 16 }} />
                                    Improcedente
                                  </Box>
                                }
                              />
                              <FormControlLabel
                                value="ABSTENCAO"
                                control={<Radio color="warning" />}
                                label={
                                  <Box display="flex" alignItems="center">
                                    <HourglassIcon color="warning" sx={{ mr: 0.5, fontSize: 16 }} />
                                    Abstenção
                                  </Box>
                                }
                              />
                            </RadioGroup>
                          </FormControl>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </TableContainer>

            {/* Resumo dos Votos */}
            {julgamentoForm.votosJulgadores.length > 0 && (
              <Box sx={{ mt: 3, p: 2, bgcolor: 'grey.50', borderRadius: 1 }}>
                <Typography variant="subtitle1" gutterBottom>
                  Resumo da Votação ({julgamentoForm.votosJulgadores.length} votos)
                </Typography>
                
                <Grid container spacing={2}>
                  <Grid item>
                    <Chip
                      icon={<CheckCircleIcon />}
                      label={`Procedentes: ${julgamentoForm.votosJulgadores.filter(v => v.voto === 'PROCEDENTE').length}`}
                      color="success"
                      variant="outlined"
                    />
                  </Grid>
                  <Grid item>
                    <Chip
                      icon={<CancelIcon />}
                      label={`Improcedentes: ${julgamentoForm.votosJulgadores.filter(v => v.voto === 'IMPROCEDENTE').length}`}
                      color="error"
                      variant="outlined"
                    />
                  </Grid>
                  <Grid item>
                    <Chip
                      icon={<HourglassIcon />}
                      label={`Abstenções: ${julgamentoForm.votosJulgadores.filter(v => v.voto === 'ABSTENCAO').length}`}
                      color="warning"
                      variant="outlined"
                    />
                  </Grid>
                </Grid>
              </Box>
            )}
          </Paper>

          {/* Botões de Ação */}
          <Box sx={{ mt: 4, textAlign: 'right' }}>
            <Button
              variant="outlined"
              onClick={() => navigate(`/impugnacoes/${id}`)}
              sx={{ mr: 2 }}
            >
              Cancelar
            </Button>
            <Button
              variant="contained"
              color="primary"
              size="large"
              startIcon={<SendIcon />}
              onClick={handleEnviarJulgamento}
              disabled={criarJulgamentoMutation.isPending}
            >
              Finalizar Julgamento
            </Button>
          </Box>
        </Grid>
      </Grid>

      {/* Modal de Confirmação */}
      <Dialog 
        open={showConfirmacao} 
        onClose={() => setShowConfirmacao(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          <GavelIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
          Confirmar Julgamento
        </DialogTitle>
        <DialogContent>
          <Alert severity="warning" sx={{ mb: 2 }}>
            <Typography variant="body1" gutterBottom>
              <strong>Atenção:</strong> Após confirmar, o julgamento será finalizado e não poderá ser alterado.
            </Typography>
          </Alert>
          
          <Box sx={{ mt: 2 }}>
            <Typography variant="h6" gutterBottom>Resultado do Julgamento</Typography>
            
            <Box display="flex" alignItems="center" mb={2}>
              {getVotoIcon(julgamentoForm.resultado)}
              <Typography variant="h5" sx={{ ml: 1 }}>
                {julgamentoForm.resultado}
              </Typography>
            </Box>
            
            <Typography><strong>Relator:</strong> {
              membrosJulgadores.find(m => m.id === julgamentoForm.relatorId)?.nome
            }</Typography>
            <Typography><strong>Total de Votos:</strong> {julgamentoForm.votosJulgadores.length}</Typography>
            <Typography><strong>Documentos:</strong> {julgamentoForm.arquivos.length} arquivo(s)</Typography>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowConfirmacao(false)}>
            Cancelar
          </Button>
          <Button
            variant="contained"
            onClick={handleConfirmarEnvio}
            disabled={criarJulgamentoMutation.isPending}
            startIcon={criarJulgamentoMutation.isPending && <CircularProgress size={20} />}
          >
            {criarJulgamentoMutation.isPending ? 'Finalizando...' : 'Confirmar Julgamento'}
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};