import React, { useState, useCallback } from 'react';
import {
  Container,
  Paper,
  Typography,
  Box,
  Grid,
  TextField,
  Button,
  Card,
  CardContent,
  Alert,
  Stepper,
  Step,
  StepLabel,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  IconButton,
  Divider,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  CircularProgress,
  Autocomplete,
  FormControlLabel,
  Checkbox,
  Tooltip
} from '@mui/material';
import {
  Person as PersonIcon,
  SwapHoriz as SwapIcon,
  Search as SearchIcon,
  Description as DescriptionIcon,
  AttachFile as AttachFileIcon,
  Save as SaveIcon,
  ArrowBack as ArrowBackIcon,
  ArrowForward as ArrowForwardIcon,
  Check as CheckIcon,
  Warning as WarningIcon,
  Info as InfoIcon,
  CloudUpload as UploadIcon,
  Delete as DeleteIcon
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { useQuery, useMutation } from '@tanstack/react-query';
import { useSnackbar } from 'notistack';
import { 
  substituicaoService, 
  MembroChapa,
  MembroSubstituicaoResponse,
  CriarSubstituicaoRequest
} from '../../services/api/substituicaoService';

const steps = ['Buscar Profissional', 'Selecionar Substitutos', 'Justificativa'];

// Constantes (baseadas no Angular)
const TIPO_PARTICIPACAO_TITULAR = 1;
const TIPO_PARTICIPACAO_SUPLENTE = 2;
const STATUS_SEM_PENDENCIA = 3;
const STATUS_CONFIRMADO = 1;
const TAMANHO_MAXIMO_JUSTIFICATIVA = 5000;
const ARQUIVO_TAMANHO_10_MEGA = 10 * 1024 * 1024;

export const CadastroSubstituicaoPage: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { enqueueSnackbar } = useSnackbar();

  // Estados principais
  const [activeStep, setActiveStep] = useState(0);
  const [membrosSelecionados, setMembrosSelecionados] = useState<MembroSubstituicaoResponse | null>(null);
  const [termoBusca, setTermoBusca] = useState('');
  const [profissionaisEncontrados, setProfissionaisEncontrados] = useState<MembroChapa[]>([]);
  const [buscandoProfissional, setBuscandoProfissional] = useState(false);

  // Estados dos substitutos
  const [substitutoTitular, setSubstitutoTitular] = useState<MembroChapa | null>(null);
  const [substitutoSuplente, setSubstitutoSuplente] = useState<MembroChapa | null>(null);
  const [buscaTitular, setBuscaTitular] = useState('');
  const [buscaSuplente, setBuscaSuplente] = useState('');

  // Estados do formulário
  const [justificativa, setJustificativa] = useState('');
  const [arquivoJustificativa, setArquivoJustificativa] = useState<File | null>(null);
  const [titularResponsavel, setTitularResponsavel] = useState(false);
  const [suplenteResponsavel, setSuplenteResponsavel] = useState(false);

  // Estados de UI
  const [showConfirmacao, setShowConfirmacao] = useState(false);
  const [showPendenciasModal, setShowPendenciasModal] = useState(false);
  const [membroComPendencias, setMembroComPendencias] = useState<MembroChapa | null>(null);

  // Buscar profissionais
  const buscarProfissionais = useCallback(async (termo: string) => {
    if (termo.length < 3) {
      setProfissionaisEncontrados([]);
      return;
    }

    setBuscandoProfissional(true);
    try {
      const resultados = await substituicaoService.buscarProfissionalParaSubstituir(termo);
      setProfissionaisEncontrados(resultados);
    } catch (error) {
      enqueueSnackbar('Erro ao buscar profissionais', { variant: 'error' });
    } finally {
      setBuscandoProfissional(false);
    }
  }, [enqueueSnackbar]);

  // Selecionar profissional para substituir
  const selecionarProfissional = async (profissional: MembroChapa) => {
    try {
      const membros = await substituicaoService.getMembroSubstituicao(profissional.profissional.id);
      setMembrosSelecionados(membros);
      setActiveStep(1);
    } catch (error) {
      enqueueSnackbar('Erro ao obter dados do profissional', { variant: 'error' });
    }
  };

  // Buscar substituto
  const buscarSubstituto = async (termo: string, tipo: 'titular' | 'suplente') => {
    if (!membrosSelecionados || termo.length < 3) return;

    try {
      const resultados = await substituicaoService.buscarProfissionalParaSubstituir(termo);
      
      // Filtrar apenas profissionais elegíveis
      const elegíveis = resultados.filter(r => 
        r.statusValidacaoMembroChapa.id === STATUS_SEM_PENDENCIA &&
        r.profissional.id !== membrosSelecionados.titular?.profissional.id &&
        r.profissional.id !== membrosSelecionados.suplente?.profissional.id
      );

      if (tipo === 'titular') {
        // Atualizar lista de opções para titular
      } else {
        // Atualizar lista de opções para suplente
      }
    } catch (error) {
      enqueueSnackbar('Erro ao buscar substitutos', { variant: 'error' });
    }
  };

  // Validar arquivo
  const validarArquivo = async (file: File): Promise<boolean> => {
    if (file.size > ARQUIVO_TAMANHO_10_MEGA) {
      enqueueSnackbar('Arquivo deve ter no máximo 10MB', { variant: 'error' });
      return false;
    }

    try {
      const valido = await substituicaoService.validarArquivoJustificativa({
        nome: file.name,
        tamanho: file.size,
        tipoValidacao: 1
      });
      return valido;
    } catch (error) {
      enqueueSnackbar('Erro ao validar arquivo', { variant: 'error' });
      return false;
    }
  };

  // Mutation para criar substituição
  const criarSubstituicaoMutation = useMutation({
    mutationFn: (dados: CriarSubstituicaoRequest) => 
      substituicaoService.criarSubstituicao(dados),
    onSuccess: (data) => {
      enqueueSnackbar(
        `Pedido de substituição criado com sucesso! Protocolo: ${data.numeroProtocolo}`, 
        { variant: 'success' }
      );
      navigate(`/substituicoes/${data.id}`);
    },
    onError: (error: any) => {
      enqueueSnackbar(
        error.response?.data?.message || 'Erro ao criar pedido de substituição',
        { variant: 'error' }
      );
    }
  });

  // Handlers
  const handleNext = () => {
    if (activeStep === 0 && !membrosSelecionados) {
      enqueueSnackbar('Selecione um profissional para substituir', { variant: 'error' });
      return;
    }
    
    if (activeStep === 1 && (!substitutoTitular && !substitutoSuplente)) {
      enqueueSnackbar('Selecione pelo menos um substituto', { variant: 'error' });
      return;
    }

    setActiveStep((prevActiveStep) => prevActiveStep + 1);
  };

  const handleBack = () => {
    setActiveStep((prevActiveStep) => prevActiveStep - 1);
  };

  const handleSubmit = async () => {
    if (!justificativa.trim()) {
      enqueueSnackbar('Justificativa é obrigatória', { variant: 'error' });
      return;
    }

    if (!arquivoJustificativa) {
      enqueueSnackbar('Documento comprobatório é obrigatório', { variant: 'error' });
      return;
    }

    if (!membrosSelecionados) return;

    const dados: CriarSubstituicaoRequest = {
      idChapaEleicao: membrosSelecionados.titular?.chapaEleicao.id || 0,
      justificativa,
      nomeArquivo: arquivoJustificativa.name,
      arquivo: arquivoJustificativa,
      tamanho: arquivoJustificativa.size,
      membroSubstitutoTitular: substitutoTitular ? {
        idProfissional: substitutoTitular.profissional.id,
        idTipoMembro: substitutoTitular.tipoMembroChapa.id,
        idTipoParticipacaoChapa: TIPO_PARTICIPACAO_TITULAR,
        numeroOrdem: substitutoTitular.numeroOrdem,
        situacaoResponsavel: titularResponsavel
      } : undefined,
      membroSubstitutoSuplente: substitutoSuplente ? {
        idProfissional: substitutoSuplente.profissional.id,
        idTipoMembro: substitutoSuplente.tipoMembroChapa.id,
        idTipoParticipacaoChapa: TIPO_PARTICIPACAO_SUPLENTE,
        numeroOrdem: substitutoSuplente.numeroOrdem,
        situacaoResponsavel: suplenteResponsavel
      } : undefined
    };

    setShowConfirmacao(true);
  };

  const handleConfirmarEnvio = () => {
    if (!membrosSelecionados || !arquivoJustificativa) return;

    const dados: CriarSubstituicaoRequest = {
      idChapaEleicao: membrosSelecionados.titular?.chapaEleicao.id || 0,
      justificativa,
      nomeArquivo: arquivoJustificativa.name,
      arquivo: arquivoJustificativa,
      tamanho: arquivoJustificativa.size,
      membroSubstitutoTitular: substitutoTitular ? {
        idProfissional: substitutoTitular.profissional.id,
        idTipoMembro: substitutoTitular.tipoMembroChapa.id,
        idTipoParticipacaoChapa: TIPO_PARTICIPACAO_TITULAR,
        numeroOrdem: substitutoTitular.numeroOrdem,
        situacaoResponsavel: titularResponsavel
      } : undefined,
      membroSubstitutoSuplente: substitutoSuplente ? {
        idProfissional: substitutoSuplente.profissional.id,
        idTipoMembro: substitutoSuplente.tipoMembroChapa.id,
        idTipoParticipacaoChapa: TIPO_PARTICIPACAO_SUPLENTE,
        numeroOrdem: substitutoSuplente.numeroOrdem,
        situacaoResponsavel: suplenteResponsavel
      } : undefined
    };

    criarSubstituicaoMutation.mutate(dados);
  };

  const getStatusIcon = (membro: MembroChapa) => {
    if (membro.statusValidacaoMembroChapa.id === STATUS_SEM_PENDENCIA) {
      return <CheckIcon color="success" />;
    }
    return (
      <Tooltip title="Ver pendências">
        <IconButton
          size="small"
          onClick={() => {
            setMembroComPendencias(membro);
            setShowPendenciasModal(true);
          }}
        >
          <WarningIcon color="warning" />
        </IconButton>
      </Tooltip>
    );
  };

  const getStatusParticipacaoChip = (membro: MembroChapa) => {
    const isConfirmado = membro.statusParticipacaoChapa.id === STATUS_CONFIRMADO;
    return (
      <Chip
        label={membro.statusParticipacaoChapa.descricao}
        color={isConfirmado ? 'primary' : 'warning'}
        size="small"
      />
    );
  };

  // Renderização dos steps
  const renderStepContent = (step: number) => {
    switch (step) {
      case 0: // Buscar Profissional
        return (
          <Box>
            <Typography variant="h6" gutterBottom>
              <SearchIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
              Buscar Profissional para Substituir
            </Typography>
            
            <Alert severity="info" sx={{ mb: 3 }}>
              Digite o nome, CPF ou número de registro do profissional que deseja substituir.
              Apenas membros de chapas ativas podem ser substituídos.
            </Alert>

            <TextField
              fullWidth
              label="Nome, CPF ou Registro"
              value={termoBusca}
              onChange={(e) => {
                setTermoBusca(e.target.value);
                buscarProfissionais(e.target.value);
              }}
              placeholder="Digite pelo menos 3 caracteres para buscar..."
              InputProps={{
                endAdornment: buscandoProfissional && <CircularProgress size={20} />
              }}
              sx={{ mb: 3 }}
            />

            {profissionaisEncontrados.length > 0 && (
              <Box>
                <Typography variant="subtitle1" gutterBottom>
                  Profissionais Encontrados ({profissionaisEncontrados.length})
                </Typography>
                
                <Grid container spacing={2}>
                  {profissionaisEncontrados.map((profissional) => (
                    <Grid item xs={12} key={profissional.id}>
                      <Card 
                        sx={{ 
                          cursor: 'pointer',
                          '&:hover': { boxShadow: 4 }
                        }}
                        onClick={() => selecionarProfissional(profissional)}
                      >
                        <CardContent>
                          <Grid container spacing={2} alignItems="center">
                            <Grid item xs={12} sm={4}>
                              <Typography variant="h6">
                                {profissional.profissional.nome}
                              </Typography>
                              <Typography variant="body2" color="textSecondary">
                                Registro: {profissional.profissional.registroNacional}
                              </Typography>
                            </Grid>
                            
                            <Grid item xs={12} sm={4}>
                              <Typography variant="body1">
                                <strong>Chapa:</strong> {profissional.chapaEleicao.nome}
                              </Typography>
                              <Typography variant="body2" color="textSecondary">
                                {profissional.chapaEleicao.eleicao.titulo}
                              </Typography>
                            </Grid>
                            
                            <Grid item xs={12} sm={2}>
                              <Typography variant="body2">
                                {profissional.tipoParticipacaoChapa.descricao}
                              </Typography>
                            </Grid>
                            
                            <Grid item xs={12} sm={2} textAlign="right">
                              <Button variant="contained" size="small">
                                Selecionar
                              </Button>
                            </Grid>
                          </Grid>
                        </CardContent>
                      </Card>
                    </Grid>
                  ))}
                </Grid>
              </Box>
            )}
          </Box>
        );

      case 1: // Selecionar Substitutos
        return (
          <Box>
            <Typography variant="h6" gutterBottom>
              <SwapIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
              Selecionar Substitutos
            </Typography>

            {membrosSelecionados && (
              <>
                {/* Informações Importantes */}
                <Alert severity="warning" sx={{ mb: 3 }}>
                  <Typography variant="body2" fontWeight="bold" gutterBottom>
                    Informações Importantes:
                  </Typography>
                  <Typography variant="body2">
                    Prezado(a) Arquiteto(a) responsável pela chapa eleitoral, solicitamos sua atenção para a 
                    inclusão de um novo membro em substituição ao profissional que desistiu da participação 
                    ou foi desabilitado pela comissão eleitoral.
                  </Typography>
                </Alert>

                {/* Membros Atuais */}
                <Card sx={{ mb: 3 }}>
                  <CardContent>
                    <Typography variant="subtitle1" gutterBottom fontWeight="bold">
                      Membros Atuais da Chapa
                    </Typography>
                    
                    <TableContainer>
                      <Table size="small">
                        <TableHead>
                          <TableRow>
                            <TableCell>Posição</TableCell>
                            <TableCell>Tipo</TableCell>
                            <TableCell>Nome</TableCell>
                            <TableCell>Registro</TableCell>
                            <TableCell>Status Confirmação</TableCell>
                            <TableCell>Status Validação</TableCell>
                            <TableCell>Responsável</TableCell>
                          </TableRow>
                        </TableHead>
                        <TableBody>
                          {[membrosSelecionados.titular, membrosSelecionados.suplente]
                            .filter(Boolean)
                            .map((membro, index) => (
                              <TableRow key={membro!.id}>
                                <TableCell>
                                  {membro!.numeroOrdem > 0 ? membro!.numeroOrdem : '-'}
                                </TableCell>
                                <TableCell>{membro!.tipoParticipacaoChapa.descricao}</TableCell>
                                <TableCell>{membro!.profissional.nome}</TableCell>
                                <TableCell>{membro!.profissional.registroNacional}</TableCell>
                                <TableCell>{getStatusParticipacaoChip(membro!)}</TableCell>
                                <TableCell align="center">{getStatusIcon(membro!)}</TableCell>
                                <TableCell align="center">
                                  {membro!.situacaoResponsavel && <CheckIcon color="primary" />}
                                </TableCell>
                              </TableRow>
                            ))}
                        </TableBody>
                      </Table>
                    </TableContainer>
                  </CardContent>
                </Card>

                {/* Seleção de Substitutos */}
                <Card>
                  <CardContent>
                    <Typography variant="subtitle1" gutterBottom fontWeight="bold">
                      Novos Membros Substitutos
                    </Typography>

                    <Grid container spacing={3}>
                      {/* Titular */}
                      <Grid item xs={12} md={6}>
                        <Autocomplete
                          freeSolo
                          options={[]}
                          value={substitutoTitular}
                          onInputChange={(_, value) => {
                            setBuscaTitular(value);
                            buscarSubstituto(value, 'titular');
                          }}
                          onChange={(_, value) => setSubstitutoTitular(value as MembroChapa)}
                          renderInput={(params) => (
                            <TextField
                              {...params}
                              label="Substituto Titular"
                              placeholder="Digite CPF ou nome do membro titular"
                              fullWidth
                            />
                          )}
                        />
                        
                        {substitutoTitular && (
                          <FormControlLabel
                            control={
                              <Checkbox
                                checked={titularResponsavel}
                                onChange={(e) => setTitularResponsavel(e.target.checked)}
                              />
                            }
                            label="Responsável pela chapa"
                            sx={{ mt: 1 }}
                          />
                        )}
                      </Grid>

                      {/* Suplente */}
                      <Grid item xs={12} md={6}>
                        <Autocomplete
                          freeSolo
                          options={[]}
                          value={substitutoSuplente}
                          onInputChange={(_, value) => {
                            setBuscaSuplente(value);
                            buscarSubstituto(value, 'suplente');
                          }}
                          onChange={(_, value) => setSubstitutoSuplente(value as MembroChapa)}
                          renderInput={(params) => (
                            <TextField
                              {...params}
                              label="Substituto Suplente"
                              placeholder="Digite CPF ou nome do suplente"
                              fullWidth
                            />
                          )}
                        />
                        
                        {substitutoSuplente && (
                          <FormControlLabel
                            control={
                              <Checkbox
                                checked={suplenteResponsavel}
                                onChange={(e) => setSuplenteResponsavel(e.target.checked)}
                              />
                            }
                            label="Responsável pela chapa"
                            sx={{ mt: 1 }}
                          />
                        )}
                      </Grid>
                    </Grid>
                  </CardContent>
                </Card>
              </>
            )}
          </Box>
        );

      case 2: // Justificativa
        return (
          <Box>
            <Typography variant="h6" gutterBottom>
              <DescriptionIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
              Justificativa e Documentos
            </Typography>

            <Grid container spacing={3}>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Justificativa"
                  multiline
                  rows={8}
                  value={justificativa}
                  onChange={(e) => setJustificativa(e.target.value)}
                  required
                  placeholder="Descreva os motivos da substituição..."
                  helperText={`${justificativa.length}/${TAMANHO_MAXIMO_JUSTIFICATIVA} caracteres`}
                  inputProps={{ maxLength: TAMANHO_MAXIMO_JUSTIFICATIVA }}
                />
              </Grid>

              <Grid item xs={12}>
                <Typography variant="subtitle1" gutterBottom>
                  <AttachFileIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
                  Documento Comprobatório
                </Typography>
                
                <Box
                  sx={{
                    border: '2px dashed',
                    borderColor: 'grey.400',
                    borderRadius: 2,
                    p: 3,
                    textAlign: 'center',
                    cursor: 'pointer',
                    '&:hover': {
                      borderColor: 'primary.main',
                      bgcolor: 'grey.50'
                    }
                  }}
                  component="label"
                >
                  <input
                    type="file"
                    hidden
                    accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                    onChange={async (e) => {
                      const file = e.target.files?.[0];
                      if (file) {
                        const valido = await validarArquivo(file);
                        if (valido) {
                          setArquivoJustificativa(file);
                        }
                      }
                    }}
                  />
                  
                  {arquivoJustificativa ? (
                    <Box>
                      <AttachFileIcon sx={{ fontSize: 48, color: 'primary.main', mb: 1 }} />
                      <Typography variant="body1">{arquivoJustificativa.name}</Typography>
                      <Typography variant="body2" color="textSecondary">
                        {(arquivoJustificativa.size / 1024 / 1024).toFixed(2)} MB
                      </Typography>
                      <Button
                        variant="outlined"
                        color="error"
                        size="small"
                        sx={{ mt: 1 }}
                        onClick={(e) => {
                          e.preventDefault();
                          setArquivoJustificativa(null);
                        }}
                        startIcon={<DeleteIcon />}
                      >
                        Remover
                      </Button>
                    </Box>
                  ) : (
                    <>
                      <UploadIcon sx={{ fontSize: 48, color: 'grey.500', mb: 1 }} />
                      <Typography variant="body1" color="textSecondary">
                        Clique para selecionar ou arraste o arquivo aqui
                      </Typography>
                      <Typography variant="body2" color="textSecondary">
                        Formatos aceitos: PDF, DOC, DOCX, JPG, PNG (máx. 10MB)
                      </Typography>
                    </>
                  )}
                </Box>
              </Grid>
            </Grid>
          </Box>
        );

      default:
        return null;
    }
  };

  if (!user) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Alert severity="error">
          Você precisa estar logado para criar um pedido de substituição.
          <Button onClick={() => navigate('/login')} sx={{ ml: 2 }}>
            Fazer Login
          </Button>
        </Alert>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      {/* Header */}
      <Box mb={4}>
        <Button
          startIcon={<ArrowBackIcon />}
          onClick={() => navigate('/dashboard')}
          sx={{ mb: 2 }}
        >
          Voltar ao Dashboard
        </Button>
        
        <Typography variant="h3" component="h1" gutterBottom fontWeight="bold">
          <SwapIcon sx={{ mr: 2, verticalAlign: 'middle', fontSize: 'inherit' }} />
          Pedido de Substituição de Candidatura
        </Typography>
        <Typography variant="h6" color="textSecondary">
          Substitua membros de chapas eleitorais
        </Typography>
      </Box>

      {/* Stepper */}
      <Paper sx={{ p: 4 }}>
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
            startIcon={<ArrowBackIcon />}
          >
            Voltar
          </Button>
          
          <Box>
            {activeStep === steps.length - 1 ? (
              <Button
                variant="contained"
                onClick={handleSubmit}
                startIcon={<SaveIcon />}
                disabled={!justificativa || !arquivoJustificativa}
              >
                Enviar Pedido
              </Button>
            ) : (
              <Button
                variant="contained"
                onClick={handleNext}
                endIcon={<ArrowForwardIcon />}
              >
                Próximo
              </Button>
            )}
          </Box>
        </Box>
      </Paper>

      {/* Modal de Pendências */}
      <Dialog
        open={showPendenciasModal}
        onClose={() => setShowPendenciasModal(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          <WarningIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
          Pendências do Membro
        </DialogTitle>
        <DialogContent>
          {membroComPendencias && membroComPendencias.pendencias && (
            <Box>
              {membroComPendencias.pendencias.map((pendencia, index) => (
                <Alert key={index} severity="warning" sx={{ mb: 1 }}>
                  {pendencia.tipoPendencia.descricao}
                </Alert>
              ))}
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowPendenciasModal(false)}>
            Fechar
          </Button>
        </DialogActions>
      </Dialog>

      {/* Modal de Confirmação */}
      <Dialog
        open={showConfirmacao}
        onClose={() => setShowConfirmacao(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          <InfoIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
          Confirmação de Solicitação de Substituição
        </DialogTitle>
        <DialogContent>
          <Alert severity="warning" sx={{ mb: 2 }}>
            <Typography variant="body1" gutterBottom>
              <strong>Atenção:</strong> Após confirmar, o pedido será enviado para análise da comissão eleitoral.
            </Typography>
          </Alert>
          
          <Box sx={{ mt: 2 }}>
            <Typography variant="h6" gutterBottom>Resumo da Substituição</Typography>
            
            {membrosSelecionados && (
              <>
                <Typography><strong>Chapa:</strong> {membrosSelecionados.titular?.chapaEleicao.nome}</Typography>
                <Typography><strong>Eleição:</strong> {membrosSelecionados.titular?.chapaEleicao.eleicao.titulo}</Typography>
                
                <Divider sx={{ my: 2 }} />
                
                {substitutoTitular && (
                  <Typography>
                    <strong>Substituto Titular:</strong> {substitutoTitular.profissional.nome}
                    {titularResponsavel && ' (Responsável)'}
                  </Typography>
                )}
                
                {substitutoSuplente && (
                  <Typography>
                    <strong>Substituto Suplente:</strong> {substitutoSuplente.profissional.nome}
                    {suplenteResponsavel && ' (Responsável)'}
                  </Typography>
                )}
                
                <Typography><strong>Documento:</strong> {arquivoJustificativa?.name}</Typography>
              </>
            )}
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowConfirmacao(false)}>
            Cancelar
          </Button>
          <Button
            variant="contained"
            onClick={handleConfirmarEnvio}
            disabled={criarSubstituicaoMutation.isPending}
            startIcon={criarSubstituicaoMutation.isPending && <CircularProgress size={20} />}
          >
            {criarSubstituicaoMutation.isPending ? 'Enviando...' : 'Confirmar Envio'}
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};