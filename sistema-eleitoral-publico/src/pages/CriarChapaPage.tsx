import React, { useState } from 'react';
import {
  Container,
  Paper,
  Stepper,
  Step,
  StepLabel,
  Box,
  Typography,
  Button,
  Alert,
  Grid,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Card,
  CardContent,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  IconButton,
  Chip,
  Divider
} from '@mui/material';
import {
  Groups as GroupsIcon,
  Add as AddIcon,
  Delete as DeleteIcon,
  Person as PersonIcon,
  Email as EmailIcon,
  Save as SaveIcon,
  Send as SendIcon
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { useQuery } from '@tanstack/react-query';
import { eleicaoService, ufService } from '../services/api';

const steps = [
  'Dados Básicos',
  'Membros da Chapa', 
  'Documentos',
  'Plataforma Eleitoral',
  'Revisão e Envio'
];

interface MembroChapa {
  id?: number;
  nome: string;
  email: string;
  cpf: string;
  telefone: string;
  tipoMembro: string;
  ordem: number;
  curriculo?: string;
}

interface DadosChapa {
  nome: string;
  descricao: string;
  eleicaoId: number;
  membros: MembroChapa[];
  plataforma: string;
  propostas: string;
}

export const CriarChapaPage: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [activeStep, setActiveStep] = useState(0);
  const [chapaData, setChapaData] = useState<DadosChapa>({
    nome: '',
    descricao: '',
    eleicaoId: 0,
    membros: [],
    plataforma: '',
    propostas: ''
  });

  // Queries
  const { data: eleicoes = [] } = useQuery({
    queryKey: ['eleicoes-ativas'],
    queryFn: () => eleicaoService.getAtivas()
  });

  if (!user) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Alert severity="error">
          Você precisa estar logado para criar uma chapa.
          <Button onClick={() => navigate('/login')} sx={{ ml: 2 }}>
            Fazer Login
          </Button>
        </Alert>
      </Container>
    );
  }

  const handleNext = () => {
    setActiveStep(activeStep + 1);
  };

  const handleBack = () => {
    setActiveStep(activeStep - 1);
  };

  const handleFinish = () => {
    // Implementar envio da chapa
    console.log('Enviando chapa:', chapaData);
    navigate('/dashboard');
  };

  const adicionarMembro = () => {
    const novoMembro: MembroChapa = {
      nome: '',
      email: '',
      cpf: '',
      telefone: '',
      tipoMembro: 'Membro',
      ordem: chapaData.membros.length + 1
    };
    
    setChapaData(prev => ({
      ...prev,
      membros: [...prev.membros, novoMembro]
    }));
  };

  const removerMembro = (index: number) => {
    setChapaData(prev => ({
      ...prev,
      membros: prev.membros.filter((_, i) => i !== index)
    }));
  };

  const atualizarMembro = (index: number, campo: keyof MembroChapa, valor: string | number) => {
    setChapaData(prev => ({
      ...prev,
      membros: prev.membros.map((membro, i) => 
        i === index ? { ...membro, [campo]: valor } : membro
      )
    }));
  };

  const renderStepContent = (step: number) => {
    switch (step) {
      case 0:
        return (
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <Typography variant="h6" gutterBottom>
                Informações Básicas da Chapa
              </Typography>
            </Grid>
            
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Nome da Chapa"
                value={chapaData.nome}
                onChange={(e) => setChapaData(prev => ({ ...prev, nome: e.target.value }))}
                placeholder="Ex: Renovação CAU, Unidos pela Arquitetura..."
                required
              />
            </Grid>
            
            <Grid item xs={12}>
              <FormControl fullWidth required>
                <InputLabel>Eleição</InputLabel>
                <Select
                  value={chapaData.eleicaoId}
                  label="Eleição"
                  onChange={(e) => setChapaData(prev => ({ ...prev, eleicaoId: Number(e.target.value) }))}
                >
                  {eleicoes.map((eleicao) => (
                    <MenuItem key={eleicao.id} value={eleicao.id}>
                      {eleicao.titulo} - {eleicao.ano}
                      {eleicao.uf && ` (${eleicao.uf.sigla})`}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Descrição da Chapa"
                value={chapaData.descricao}
                onChange={(e) => setChapaData(prev => ({ ...prev, descricao: e.target.value }))}
                multiline
                rows={4}
                placeholder="Descreva brevemente os objetivos e diferenciais da sua chapa..."
              />
            </Grid>
          </Grid>
        );

      case 1:
        return (
          <Box>
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
              <Typography variant="h6">
                Membros da Chapa
              </Typography>
              <Button
                variant="contained"
                startIcon={<AddIcon />}
                onClick={adicionarMembro}
              >
                Adicionar Membro
              </Button>
            </Box>

            {chapaData.membros.length === 0 ? (
              <Alert severity="info">
                Adicione pelo menos 3 membros à sua chapa para prosseguir.
              </Alert>
            ) : (
              <Grid container spacing={2}>
                {chapaData.membros.map((membro, index) => (
                  <Grid item xs={12} key={index}>
                    <Card variant="outlined">
                      <CardContent>
                        <Box display="flex" justifyContent="between" alignItems="center" mb={2}>
                          <Typography variant="h6" gutterBottom>
                            Membro {index + 1}
                          </Typography>
                          <IconButton 
                            color="error" 
                            onClick={() => removerMembro(index)}
                            size="small"
                          >
                            <DeleteIcon />
                          </IconButton>
                        </Box>
                        
                        <Grid container spacing={2}>
                          <Grid item xs={12} sm={6}>
                            <TextField
                              fullWidth
                              label="Nome Completo"
                              value={membro.nome}
                              onChange={(e) => atualizarMembro(index, 'nome', e.target.value)}
                              required
                            />
                          </Grid>
                          
                          <Grid item xs={12} sm={6}>
                            <TextField
                              fullWidth
                              label="Email"
                              type="email"
                              value={membro.email}
                              onChange={(e) => atualizarMembro(index, 'email', e.target.value)}
                              required
                            />
                          </Grid>
                          
                          <Grid item xs={12} sm={4}>
                            <TextField
                              fullWidth
                              label="CPF"
                              value={membro.cpf}
                              onChange={(e) => atualizarMembro(index, 'cpf', e.target.value)}
                              required
                            />
                          </Grid>
                          
                          <Grid item xs={12} sm={4}>
                            <TextField
                              fullWidth
                              label="Telefone"
                              value={membro.telefone}
                              onChange={(e) => atualizarMembro(index, 'telefone', e.target.value)}
                            />
                          </Grid>
                          
                          <Grid item xs={12} sm={4}>
                            <FormControl fullWidth>
                              <InputLabel>Tipo de Membro</InputLabel>
                              <Select
                                value={membro.tipoMembro}
                                label="Tipo de Membro"
                                onChange={(e) => atualizarMembro(index, 'tipoMembro', e.target.value)}
                              >
                                <MenuItem value="Coordenador">Coordenador(a)</MenuItem>
                                <MenuItem value="Vice">Vice-Coordenador(a)</MenuItem>
                                <MenuItem value="Membro">Membro Efetivo</MenuItem>
                                <MenuItem value="Suplente">Suplente</MenuItem>
                              </Select>
                            </FormControl>
                          </Grid>
                        </Grid>
                      </CardContent>
                    </Card>
                  </Grid>
                ))}
              </Grid>
            )}
          </Box>
        );

      case 2:
        return (
          <Box>
            <Typography variant="h6" gutterBottom>
              Documentos Obrigatórios
            </Typography>
            <Alert severity="info" sx={{ mb: 3 }}>
              Esta seção será implementada para upload de documentos como declarações, 
              comprovantes de regularidade, etc.
            </Alert>
            <Typography variant="body1" color="textSecondary">
              🚧 Em desenvolvimento: Sistema de upload de documentos
            </Typography>
          </Box>
        );

      case 3:
        return (
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <Typography variant="h6" gutterBottom>
                Plataforma Eleitoral
              </Typography>
            </Grid>
            
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Plataforma da Chapa"
                value={chapaData.plataforma}
                onChange={(e) => setChapaData(prev => ({ ...prev, plataforma: e.target.value }))}
                multiline
                rows={6}
                placeholder="Descreva a plataforma eleitoral da sua chapa, principais diretrizes e objetivos..."
              />
            </Grid>
            
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Propostas Específicas"
                value={chapaData.propostas}
                onChange={(e) => setChapaData(prev => ({ ...prev, propostas: e.target.value }))}
                multiline
                rows={6}
                placeholder="Liste as principais propostas e ações que a chapa pretende implementar..."
              />
            </Grid>
          </Grid>
        );

      case 4:
        return (
          <Box>
            <Typography variant="h6" gutterBottom>
              Revisão Final
            </Typography>
            <Alert severity="warning" sx={{ mb: 3 }}>
              Revise cuidadosamente todas as informações antes de enviar. 
              Após o envio, a chapa será submetida à análise da comissão eleitoral.
            </Alert>
            
            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <Card>
                  <CardContent>
                    <Typography variant="h6" gutterBottom>Dados da Chapa</Typography>
                    <Typography><strong>Nome:</strong> {chapaData.nome}</Typography>
                    <Typography><strong>Eleição:</strong> {
                      eleicoes.find(e => e.id === chapaData.eleicaoId)?.titulo
                    }</Typography>
                    <Typography><strong>Descrição:</strong> {chapaData.descricao}</Typography>
                  </CardContent>
                </Card>
              </Grid>
              
              <Grid item xs={12} md={6}>
                <Card>
                  <CardContent>
                    <Typography variant="h6" gutterBottom>
                      Membros ({chapaData.membros.length})
                    </Typography>
                    <List dense>
                      {chapaData.membros.slice(0, 3).map((membro, index) => (
                        <ListItem key={index} disablePadding>
                          <ListItemText
                            primary={membro.nome}
                            secondary={membro.tipoMembro}
                          />
                        </ListItem>
                      ))}
                      {chapaData.membros.length > 3 && (
                        <ListItem disablePadding>
                          <ListItemText
                            primary={`+${chapaData.membros.length - 3} outros membros`}
                            secondary="Ver lista completa acima"
                          />
                        </ListItem>
                      )}
                    </List>
                  </CardContent>
                </Card>
              </Grid>
            </Grid>
          </Box>
        );

      default:
        return 'Etapa desconhecida';
    }
  };

  const isStepValid = (step: number) => {
    switch (step) {
      case 0:
        return chapaData.nome && chapaData.eleicaoId > 0;
      case 1:
        return chapaData.membros.length >= 3;
      case 2:
        return true; // Documentos são opcionais por enquanto
      case 3:
        return true; // Plataforma é opcional
      case 4:
        return true;
      default:
        return false;
    }
  };

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      {/* Header */}
      <Box mb={4} textAlign="center">
        <Box
          sx={{
            backgroundColor: 'primary.main',
            borderRadius: '50%',
            p: 2,
            mb: 2,
            display: 'inline-flex'
          }}
        >
          <GroupsIcon sx={{ fontSize: 40, color: 'white' }} />
        </Box>
        <Typography component="h1" variant="h4" fontWeight="bold">
          Criar Nova Chapa
        </Typography>
        <Typography variant="h6" color="textSecondary">
          Processo de criação de chapa eleitoral
        </Typography>
      </Box>

      <Paper sx={{ p: 4 }}>
        {/* Stepper */}
        <Stepper activeStep={activeStep} sx={{ mb: 4 }}>
          {steps.map((label) => (
            <Step key={label}>
              <StepLabel>{label}</StepLabel>
            </Step>
          ))}
        </Stepper>

        {/* Content */}
        <Box sx={{ minHeight: 400 }}>
          {renderStepContent(activeStep)}
        </Box>

        {/* Navigation */}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 4 }}>
          <Button
            disabled={activeStep === 0}
            onClick={handleBack}
          >
            Voltar
          </Button>
          
          <Box>
            {activeStep < steps.length - 1 ? (
              <Button
                variant="contained"
                onClick={handleNext}
                disabled={!isStepValid(activeStep)}
              >
                Próximo
              </Button>
            ) : (
              <Button
                variant="contained"
                color="success"
                startIcon={<SendIcon />}
                onClick={handleFinish}
                disabled={!isStepValid(activeStep)}
              >
                Enviar Chapa
              </Button>
            )}
          </Box>
        </Box>
      </Paper>
    </Container>
  );
};