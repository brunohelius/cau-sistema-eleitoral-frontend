import { useState } from 'react';
import {
  Box,
  Button,
  Card,
  CardContent,
  Stepper,
  Step,
  StepLabel,
  Typography,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Grid,
  Alert,
  Chip,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  Avatar,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormControlLabel,
  Checkbox,
  LinearProgress,
  CircularProgress,
  Paper
} from '@mui/material';
import {
  Groups as GroupsIcon,
  Person as PersonIcon,
  Add as AddIcon,
  Delete as DeleteIcon,
  Upload as UploadIcon,
  Save as SaveIcon,
  Send as SendIcon
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useSnackbar } from 'notistack';
import { useQuery } from '@tanstack/react-query';

interface MembroChapa {
  id?: number;
  nome: string;
  email: string;
  telefone?: string;
  registroProfissional: string;
  cargo: 'COORDENADOR' | 'VICE_COORDENADOR' | 'MEMBRO';
  biografia?: string;
  genero?: string;
  etnia?: string;
  lgbtqia?: boolean;
  pcd?: boolean;
  curriculo?: File;
  foto?: File;
}

interface NovaChapa {
  nome: string;
  numero?: number;
  slogan?: string;
  proposta: string;
  eleicaoId: number;
  membros: MembroChapa[];
  documentos: File[];
}

const steps = [
  'Informações Básicas',
  'Membros da Chapa',
  'Proposta Eleitoral',
  'Documentos',
  'Revisão e Envio'
];

const CARGOS = [
  { valor: 'COORDENADOR', label: 'Coordenador(a)' },
  { valor: 'VICE_COORDENADOR', label: 'Vice-Coordenador(a)' },
  { valor: 'MEMBRO', label: 'Membro' }
];

const GENEROS = [
  { valor: 'MASCULINO', label: 'Masculino' },
  { valor: 'FEMININO', label: 'Feminino' },
  { valor: 'NAO_BINARIO', label: 'Não-binário' },
  { valor: 'OUTRO', label: 'Outro' },
  { valor: 'NAO_INFORMAR', label: 'Prefiro não informar' }
];

const ETNIAS = [
  { valor: 'BRANCA', label: 'Branca' },
  { valor: 'PRETA', label: 'Preta' },
  { valor: 'PARDA', label: 'Parda' },
  { valor: 'AMARELA', label: 'Amarela' },
  { valor: 'INDIGENA', label: 'Indígena' },
  { valor: 'NAO_INFORMAR', label: 'Prefiro não informar' }
];

// Mock service
const eleicaoService = {
  async getAbertas() {
    return Promise.resolve([
      {
        id: 1,
        nome: 'Eleição CAU/BR 2024',
        prazoInscricao: '2024-03-31',
        status: 'INSCRICOES_ABERTAS'
      }
    ]);
  }
};

export function CadastrarChapaPage() {
  const navigate = useNavigate();
  const { enqueueSnackbar } = useSnackbar();
  
  const [activeStep, setActiveStep] = useState(0);
  const [chapa, setChapa] = useState<NovaChapa>({
    nome: '',
    slogan: '',
    proposta: '',
    eleicaoId: 0,
    membros: [],
    documentos: []
  });
  
  const [novoMembroDialog, setNovoMembroDialog] = useState(false);
  const [membroEditando, setMembroEditando] = useState<MembroChapa | null>(null);
  const [loading, setLoading] = useState(false);

  const { data: eleicoes = [] } = useQuery({
    queryKey: ['eleicoes-abertas'],
    queryFn: eleicaoService.getAbertas
  });

  const [novoMembro, setNovoMembro] = useState<MembroChapa>({
    nome: '',
    email: '',
    telefone: '',
    registroProfissional: '',
    cargo: 'MEMBRO',
    biografia: '',
    genero: '',
    etnia: '',
    lgbtqia: false,
    pcd: false
  });

  const handleNext = () => {
    if (activeStep === 0 && (!chapa.nome || !chapa.eleicaoId)) {
      enqueueSnackbar('Preencha todos os campos obrigatórios', { variant: 'warning' });
      return;
    }
    
    if (activeStep === 1 && chapa.membros.length < 3) {
      enqueueSnackbar('A chapa deve ter pelo menos 3 membros', { variant: 'warning' });
      return;
    }
    
    if (activeStep === 2 && !chapa.proposta.trim()) {
      enqueueSnackbar('A proposta eleitoral é obrigatória', { variant: 'warning' });
      return;
    }

    setActiveStep(prevStep => prevStep + 1);
  };

  const handleBack = () => {
    setActiveStep(prevStep => prevStep - 1);
  };

  const handleAdicionarMembro = () => {
    if (!novoMembro.nome || !novoMembro.email || !novoMembro.registroProfissional) {
      enqueueSnackbar('Preencha todos os campos obrigatórios do membro', { variant: 'warning' });
      return;
    }

    // Verificar se já existe coordenador
    if (novoMembro.cargo === 'COORDENADOR') {
      const jaCoordenador = chapa.membros.some(m => m.cargo === 'COORDENADOR');
      if (jaCoordenador && !membroEditando) {
        enqueueSnackbar('Já existe um coordenador na chapa', { variant: 'error' });
        return;
      }
    }

    if (membroEditando) {
      setChapa(prev => ({
        ...prev,
        membros: prev.membros.map(m => 
          m.id === membroEditando.id ? { ...novoMembro, id: membroEditando.id } : m
        )
      }));
    } else {
      setChapa(prev => ({
        ...prev,
        membros: [...prev.membros, { ...novoMembro, id: Date.now() }]
      }));
    }

    resetMembro();
  };

  const resetMembro = () => {
    setNovoMembro({
      nome: '',
      email: '',
      telefone: '',
      registroProfissional: '',
      cargo: 'MEMBRO',
      biografia: '',
      genero: '',
      etnia: '',
      lgbtqia: false,
      pcd: false
    });
    setMembroEditando(null);
    setNovoMembroDialog(false);
  };

  const handleEditarMembro = (membro: MembroChapa) => {
    setNovoMembro(membro);
    setMembroEditando(membro);
    setNovoMembroDialog(true);
  };

  const handleRemoverMembro = (membroId: number) => {
    setChapa(prev => ({
      ...prev,
      membros: prev.membros.filter(m => m.id !== membroId)
    }));
    enqueueSnackbar('Membro removido da chapa', { variant: 'info' });
  };

  const handleSubmit = async () => {
    setLoading(true);
    try {
      // Simular envio da chapa
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      enqueueSnackbar('Chapa cadastrada com sucesso! Aguarde a análise da Comissão Eleitoral.', { 
        variant: 'success',
        autoHideDuration: 6000
      });
      
      navigate('/minhas-chapas');
    } catch (error) {
      enqueueSnackbar('Erro ao cadastrar chapa. Tente novamente.', { variant: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const getCargoColor = (cargo: string) => {
    switch (cargo) {
      case 'COORDENADOR': return 'primary';
      case 'VICE_COORDENADOR': return 'secondary';
      case 'MEMBRO': return 'default';
      default: return 'default';
    }
  };

  const renderStepContent = (step: number) => {
    switch (step) {
      case 0:
        return (
          <Box>
            <Typography variant="h6" gutterBottom color="primary">
              Informações Básicas da Chapa
            </Typography>
            
            <Grid container spacing={3}>
              <Grid item xs={12}>
                <FormControl fullWidth required>
                  <InputLabel>Eleição</InputLabel>
                  <Select
                    value={chapa.eleicaoId}
                    onChange={(e) => setChapa(prev => ({ ...prev, eleicaoId: Number(e.target.value) }))}
                    label="Eleição"
                  >
                    <MenuItem value={0}>
                      <em>Selecione uma eleição</em>
                    </MenuItem>
                    {eleicoes.map((eleicao) => (
                      <MenuItem key={eleicao.id} value={eleicao.id}>
                        {eleicao.nome} - Prazo: {new Date(eleicao.prazoInscricao).toLocaleDateString('pt-BR')}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              
              <Grid item xs={12} sm={8}>
                <TextField
                  label="Nome da Chapa"
                  placeholder="Ex: Chapa Renovar CAU"
                  fullWidth
                  required
                  value={chapa.nome}
                  onChange={(e) => setChapa(prev => ({ ...prev, nome: e.target.value }))}
                  helperText="Escolha um nome que represente seus ideais"
                />
              </Grid>
              
              <Grid item xs={12} sm={4}>
                <TextField
                  label="Número da Chapa"
                  type="number"
                  fullWidth
                  value={chapa.numero || ''}
                  onChange={(e) => setChapa(prev => ({ ...prev, numero: Number(e.target.value) || undefined }))}
                  helperText="Será definido automaticamente se não informado"
                />
              </Grid>
              
              <Grid item xs={12}>
                <TextField
                  label="Slogan da Chapa"
                  placeholder="Ex: Juntos por um CAU mais forte"
                  fullWidth
                  value={chapa.slogan}
                  onChange={(e) => setChapa(prev => ({ ...prev, slogan: e.target.value }))}
                  helperText="Frase que resume o propósito da chapa (opcional)"
                />
              </Grid>
            </Grid>
            
            <Alert severity="info" sx={{ mt: 3 }}>
              <Typography variant="body2">
                <strong>Importante:</strong> Após o cadastro, a chapa passará por análise da Comissão Eleitoral.
                Certifique-se de que todas as informações estão corretas.
              </Typography>
            </Alert>
          </Box>
        );

      case 1:
        return (
          <Box>
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
              <Typography variant="h6" color="primary">
                Membros da Chapa ({chapa.membros.length})
              </Typography>
              <Button
                variant="contained"
                startIcon={<AddIcon />}
                onClick={() => setNovoMembroDialog(true)}
              >
                Adicionar Membro
              </Button>
            </Box>

            <Alert severity="warning" sx={{ mb: 3 }}>
              <Typography variant="body2">
                <strong>Requisitos mínimos:</strong> 1 Coordenador(a), 1 Vice-Coordenador(a) e pelo menos 1 Membro.
                Recomenda-se diversidade de gênero, etnia e representação.
              </Typography>
            </Alert>

            {chapa.membros.length === 0 ? (
              <Paper sx={{ p: 4, textAlign: 'center', bgcolor: 'grey.50' }}>
                <GroupsIcon sx={{ fontSize: 64, color: 'grey.400', mb: 2 }} />
                <Typography variant="h6" color="textSecondary" gutterBottom>
                  Nenhum membro adicionado ainda
                </Typography>
                <Typography variant="body2" color="textSecondary">
                  Clique em "Adicionar Membro" para começar a formar sua chapa
                </Typography>
              </Paper>
            ) : (
              <List>
                {chapa.membros.map((membro) => (
                  <ListItem key={membro.id} divider>
                    <ListItemAvatar>
                      <Avatar sx={{ bgcolor: getCargoColor(membro.cargo) + '.main' }}>
                        {membro.nome.charAt(0)}
                      </Avatar>
                    </ListItemAvatar>
                    <ListItemText
                      primary={
                        <Box display="flex" alignItems="center" gap={1}>
                          <Typography variant="body1" fontWeight="bold">
                            {membro.nome}
                          </Typography>
                          <Chip
                            label={CARGOS.find(c => c.valor === membro.cargo)?.label}
                            color={getCargoColor(membro.cargo) as any}
                            size="small"
                          />
                          {membro.pcd && (
                            <Chip label="PcD" color="info" size="small" variant="outlined" />
                          )}
                          {membro.lgbtqia && (
                            <Chip label="LGBTQIA+" color="secondary" size="small" variant="outlined" />
                          )}
                        </Box>
                      }
                      secondary={
                        <Box>
                          <Typography variant="body2">
                            {membro.email} | {membro.registroProfissional}
                          </Typography>
                          {membro.biografia && (
                            <Typography variant="caption" color="textSecondary">
                              {membro.biografia.substring(0, 100)}...
                            </Typography>
                          )}
                        </Box>
                      }
                    />
                    <Box display="flex" gap={1}>
                      <IconButton
                        size="small"
                        onClick={() => handleEditarMembro(membro)}
                      >
                        <PersonIcon />
                      </IconButton>
                      <IconButton
                        size="small"
                        color="error"
                        onClick={() => handleRemoverMembro(membro.id!)}
                      >
                        <DeleteIcon />
                      </IconButton>
                    </Box>
                  </ListItem>
                ))}
              </List>
            )}
          </Box>
        );

      case 2:
        return (
          <Box>
            <Typography variant="h6" gutterBottom color="primary">
              Proposta Eleitoral
            </Typography>
            
            <Alert severity="info" sx={{ mb: 3 }}>
              <Typography variant="body2">
                Descreva as principais propostas e ideias da sua chapa para o CAU.
                Esta será a seção mais importante para os eleitores conhecerem seu trabalho.
              </Typography>
            </Alert>
            
            <TextField
              label="Proposta Eleitoral"
              placeholder="Descreva detalhadamente as propostas da chapa, objetivos, metas e como pretendem contribuir para o fortalecimento do CAU..."
              multiline
              rows={12}
              fullWidth
              required
              value={chapa.proposta}
              onChange={(e) => setChapa(prev => ({ ...prev, proposta: e.target.value }))}
              helperText={`${chapa.proposta.length}/5000 caracteres`}
              inputProps={{ maxLength: 5000 }}
            />
          </Box>
        );

      case 3:
        return (
          <Box>
            <Typography variant="h6" gutterBottom color="primary">
              Documentos da Chapa
            </Typography>
            
            <Alert severity="warning" sx={{ mb: 3 }}>
              <Typography variant="body2">
                <strong>Documentos obrigatórios:</strong>
                <br />• Currículo de cada membro
                <br />• Certidão de regularidade profissional de cada membro
                <br />• Termo de aceitação assinado por cada membro
                <br />• Proposta eleitoral completa (pode ser enviada separadamente)
              </Typography>
            </Alert>
            
            <Paper sx={{ p: 3, textAlign: 'center', border: '2px dashed', borderColor: 'grey.300' }}>
              <UploadIcon sx={{ fontSize: 48, color: 'grey.400', mb: 2 }} />
              <Typography variant="h6" gutterBottom>
                Envie os Documentos
              </Typography>
              <Typography variant="body2" color="textSecondary" gutterBottom>
                Arraste e solte os arquivos aqui ou clique para selecionar
              </Typography>
              <Button variant="outlined" startIcon={<UploadIcon />} sx={{ mt: 2 }}>
                Selecionar Arquivos
              </Button>
            </Paper>
            
            {chapa.documentos.length > 0 && (
              <Box mt={3}>
                <Typography variant="subtitle1" gutterBottom>
                  Documentos Anexados ({chapa.documentos.length})
                </Typography>
                <List>
                  {chapa.documentos.map((doc, index) => (
                    <ListItem key={index} divider>
                      <ListItemText
                        primary={doc.name}
                        secondary={`${(doc.size / 1024 / 1024).toFixed(2)} MB`}
                      />
                      <IconButton color="error">
                        <DeleteIcon />
                      </IconButton>
                    </ListItem>
                  ))}
                </List>
              </Box>
            )}
          </Box>
        );

      case 4:
        return (
          <Box>
            <Typography variant="h6" gutterBottom color="primary">
              Revisão e Envio
            </Typography>
            
            <Alert severity="success" sx={{ mb: 3 }}>
              <Typography variant="body2">
                Revise todos os dados antes de enviar. Após o envio, algumas alterações podem não ser possíveis.
              </Typography>
            </Alert>
            
            {/* Resumo da Chapa */}
            <Card sx={{ mb: 3 }}>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  {chapa.nome} {chapa.numero && `- Número ${chapa.numero}`}
                </Typography>
                {chapa.slogan && (
                  <Typography variant="body2" color="textSecondary" gutterBottom>
                    "{chapa.slogan}"
                  </Typography>
                )}
                <Typography variant="body2">
                  <strong>Membros:</strong> {chapa.membros.length}
                </Typography>
                <Typography variant="body2">
                  <strong>Documentos:</strong> {chapa.documentos.length} arquivo(s)
                </Typography>
              </CardContent>
            </Card>
            
            <FormControlLabel
              control={<Checkbox required />}
              label={
                <Typography variant="body2">
                  Declaro que todas as informações fornecidas são verdadeiras e que aceito os termos do processo eleitoral.
                </Typography>
              }
            />
          </Box>
        );

      default:
        return 'Etapa desconhecida';
    }
  };

  return (
    <Box sx={{ maxWidth: 1200, mx: 'auto', p: 3 }}>
      {/* Header */}
      <Box mb={4}>
        <Typography variant="h4" component="h1" gutterBottom>
          Cadastrar Nova Chapa
        </Typography>
        <Typography variant="body1" color="textSecondary">
          Siga os passos abaixo para cadastrar sua chapa eleitoral
        </Typography>
      </Box>

      {/* Stepper */}
      <Card sx={{ mb: 4 }}>
        <CardContent>
          <Stepper activeStep={activeStep} alternativeLabel>
            {steps.map((label) => (
              <Step key={label}>
                <StepLabel>{label}</StepLabel>
              </Step>
            ))}
          </Stepper>
        </CardContent>
      </Card>

      {/* Content */}
      <Card>
        <CardContent sx={{ minHeight: 500 }}>
          {renderStepContent(activeStep)}
        </CardContent>
        
        {/* Actions */}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', p: 3 }}>
          <Button
            disabled={activeStep === 0}
            onClick={handleBack}
          >
            Voltar
          </Button>
          
          <Box display="flex" gap={2}>
            <Button
              variant="outlined"
              startIcon={<SaveIcon />}
            >
              Salvar Rascunho
            </Button>
            
            {activeStep === steps.length - 1 ? (
              <Button
                variant="contained"
                onClick={handleSubmit}
                disabled={loading}
                startIcon={loading ? <CircularProgress size={20} /> : <SendIcon />}
                size="large"
              >
                {loading ? 'Enviando...' : 'Enviar Chapa'} 
              </Button>
            ) : (
              <Button
                variant="contained"
                onClick={handleNext}
              >
                Próximo
              </Button>
            )}
          </Box>
        </Box>
      </Card>

      {/* Dialog Novo Membro */}
      <Dialog
        open={novoMembroDialog}
        onClose={resetMembro}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          <Box display="flex" alignItems="center" gap={1}>
            <PersonIcon color="primary" />
            {membroEditando ? 'Editar Membro' : 'Novo Membro da Chapa'}
          </Box>
        </DialogTitle>
        
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12} sm={8}>
              <TextField
                label="Nome Completo"
                fullWidth
                required
                value={novoMembro.nome}
                onChange={(e) => setNovoMembro(prev => ({ ...prev, nome: e.target.value }))}
              />
            </Grid>
            
            <Grid item xs={12} sm={4}>
              <FormControl fullWidth required>
                <InputLabel>Cargo</InputLabel>
                <Select
                  value={novoMembro.cargo}
                  onChange={(e) => setNovoMembro(prev => ({ ...prev, cargo: e.target.value as any }))}
                  label="Cargo"
                >
                  {CARGOS.map((cargo) => (
                    <MenuItem key={cargo.valor} value={cargo.valor}>
                      {cargo.label}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <TextField
                label="E-mail"
                type="email"
                fullWidth
                required
                value={novoMembro.email}
                onChange={(e) => setNovoMembro(prev => ({ ...prev, email: e.target.value }))}
              />
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <TextField
                label="Telefone"
                fullWidth
                value={novoMembro.telefone}
                onChange={(e) => setNovoMembro(prev => ({ ...prev, telefone: e.target.value }))}
              />
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <TextField
                label="Registro Profissional"
                fullWidth
                required
                value={novoMembro.registroProfissional}
                onChange={(e) => setNovoMembro(prev => ({ ...prev, registroProfissional: e.target.value }))}
                placeholder="A12345-6"
              />
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth>
                <InputLabel>Gênero</InputLabel>
                <Select
                  value={novoMembro.genero}
                  onChange={(e) => setNovoMembro(prev => ({ ...prev, genero: e.target.value }))}
                  label="Gênero"
                >
                  {GENEROS.map((genero) => (
                    <MenuItem key={genero.valor} value={genero.valor}>
                      {genero.label}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth>
                <InputLabel>Etnia</InputLabel>
                <Select
                  value={novoMembro.etnia}
                  onChange={(e) => setNovoMembro(prev => ({ ...prev, etnia: e.target.value }))}
                  label="Etnia"
                >
                  {ETNIAS.map((etnia) => (
                    <MenuItem key={etnia.valor} value={etnia.valor}>
                      {etnia.label}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <Box>
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={novoMembro.lgbtqia}
                      onChange={(e) => setNovoMembro(prev => ({ ...prev, lgbtqia: e.target.checked }))}
                    />
                  }
                  label="LGBTQIA+"
                />
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={novoMembro.pcd}
                      onChange={(e) => setNovoMembro(prev => ({ ...prev, pcd: e.target.checked }))}
                    />
                  }
                  label="Pessoa com Deficiência"
                />
              </Box>
            </Grid>
            
            <Grid item xs={12}>
              <TextField
                label="Biografia / Apresentação"
                placeholder="Descreva a trajetória profissional e acadêmica do membro..."
                multiline
                rows={4}
                fullWidth
                value={novoMembro.biografia}
                onChange={(e) => setNovoMembro(prev => ({ ...prev, biografia: e.target.value }))}
                helperText="Esta informação será exibida no material eleitoral"
              />
            </Grid>
          </Grid>
        </DialogContent>
        
        <DialogActions sx={{ p: 3, gap: 1 }}>
          <Button onClick={resetMembro}>
            Cancelar
          </Button>
          <Button
            onClick={handleAdicionarMembro}
            variant="contained"
            disabled={!novoMembro.nome || !novoMembro.email || !novoMembro.registroProfissional}
          >
            {membroEditando ? 'Salvar Alterações' : 'Adicionar Membro'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}