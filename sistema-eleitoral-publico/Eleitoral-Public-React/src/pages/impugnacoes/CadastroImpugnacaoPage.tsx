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
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Alert,
  Autocomplete,
  Chip,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  FormControlLabel,
  Checkbox,
  Divider,
  CircularProgress,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions
} from '@mui/material';
import {
  Person as PersonIcon,
  Search as SearchIcon,
  Description as DescriptionIcon,
  AttachFile as AttachFileIcon,
  CheckBox as CheckBoxIcon,
  Save as SaveIcon,
  ArrowBack as ArrowBackIcon,
  Info as InfoIcon,
  Delete as DeleteIcon,
  CloudUpload as UploadIcon
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { useQuery, useMutation } from '@tanstack/react-query';
import { useSnackbar } from 'notistack';
import { 
  impugnacaoService, 
  MembroChapaImpugnacao, 
  DeclaracaoAtividade,
  RespostaDeclaracao,
  TipoImpugnacao
} from '../../services/api/impugnacaoService';

interface ArquivoSelecionado {
  file: File;
  nome: string;
  tamanho: string;
}

export const CadastroImpugnacaoPage: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { enqueueSnackbar } = useSnackbar();

  // Estados principais
  const [etapaAtual, setEtapaAtual] = useState<'busca' | 'formulario'>('busca');
  const [profissionalSelecionado, setProfissionalSelecionado] = useState<MembroChapaImpugnacao | null>(null);
  const [termoBusca, setTermoBusca] = useState('');
  const [profissionaisEncontrados, setProfissionaisEncontrados] = useState<MembroChapaImpugnacao[]>([]);
  const [buscandoProfissional, setBuscandoProfissional] = useState(false);

  // Estados do formulário
  const [tipoImpugnacaoId, setTipoImpugnacaoId] = useState<number | ''>('');
  const [descricao, setDescricao] = useState('');
  const [arquivos, setArquivos] = useState<ArquivoSelecionado[]>([]);
  const [respostasDeclaracao, setRespostasDeclaracao] = useState<RespostaDeclaracao[]>([]);
  
  // Estados da UI
  const [showConfirmacao, setShowConfirmacao] = useState(false);
  const [enviandoImpugnacao, setEnviandoImpugnacao] = useState(false);

  // Queries
  const { data: tiposImpugnacao = [] } = useQuery({
    queryKey: ['tipos-impugnacao'],
    queryFn: impugnacaoService.getTiposImpugnacao
  });

  const { data: declaracoes = [] } = useQuery({
    queryKey: ['declaracoes-atividade', profissionalSelecionado?.chapaEleicao?.eleicao?.id],
    queryFn: () => impugnacaoService.getDeclaracoesAtividade(profissionalSelecionado?.chapaEleicao?.eleicao?.id || 0),
    enabled: !!profissionalSelecionado?.chapaEleicao?.eleicao?.id
  });

  // Buscar profissionais
  const buscarProfissionais = useCallback(async (termo: string) => {
    if (termo.length < 3) {
      setProfissionaisEncontrados([]);
      return;
    }

    setBuscandoProfissional(true);
    try {
      const resultados = await impugnacaoService.buscarProfissionalParaImpugnar(termo);
      setProfissionaisEncontrados(resultados);
    } catch (error) {
      enqueueSnackbar('Erro ao buscar profissionais', { variant: 'error' });
    } finally {
      setBuscandoProfissional(false);
    }
  }, [enqueueSnackbar]);

  // Selecionar profissional
  const selecionarProfissional = async (profissional: MembroChapaImpugnacao) => {
    try {
      const profissionalCompleto = await impugnacaoService.getProfissionalImpugnado(profissional.profissional.id);
      setProfissionalSelecionado(profissionalCompleto);
      setEtapaAtual('formulario');
      
      // Inicializar respostas das declarações
      if (declaracoes.length > 0) {
        inicializarRespostasDeclaracao(declaracoes);
      }
    } catch (error) {
      enqueueSnackbar('Erro ao obter dados do profissional', { variant: 'error' });
    }
  };

  // Inicializar respostas das declarações
  const inicializarRespostasDeclaracao = (declaracoesAtividade: DeclaracaoAtividade[]) => {
    const respostas: RespostaDeclaracao[] = declaracoesAtividade.map(declaracao => ({
      idDeclaracao: declaracao.id,
      itensRespostaDeclaracao: declaracao.itensDeclaracao.map(item => ({
        idItemDeclaracao: item.id,
        situacaoResposta: false
      }))
    }));
    setRespostasDeclaracao(respostas);
  };

  // Alterar resposta da declaração
  const alterarRespostaDeclaracao = (declaracaoId: number, itemId: number, declaracao: DeclaracaoAtividade) => {
    setRespostasDeclaracao(prev => prev.map(resposta => {
      if (resposta.idDeclaracao === declaracaoId) {
        return {
          ...resposta,
          itensRespostaDeclaracao: resposta.itensRespostaDeclaracao.map(itemResposta => {
            if (itemResposta.idItemDeclaracao === itemId) {
              return { ...itemResposta, situacaoResposta: !itemResposta.situacaoResposta };
            } else if (declaracao.tipoResposta === 1) { // Resposta única
              return { ...itemResposta, situacaoResposta: false };
            }
            return itemResposta;
          })
        };
      }
      return resposta;
    }));
  };

  // Adicionar arquivos
  const adicionarArquivos = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    const novosArquivos: ArquivoSelecionado[] = files.map(file => ({
      file,
      nome: file.name,
      tamanho: formatarTamanhoArquivo(file.size)
    }));
    
    setArquivos(prev => [...prev, ...novosArquivos]);
  };

  // Remover arquivo
  const removerArquivo = (index: number) => {
    setArquivos(prev => prev.filter((_, i) => i !== index));
  };

  // Formatar tamanho do arquivo
  const formatarTamanhoArquivo = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  // Validar formulário
  const validarFormulario = (): boolean => {
    if (!tipoImpugnacaoId) {
      enqueueSnackbar('Selecione o tipo de impugnação', { variant: 'error' });
      return false;
    }
    
    if (!descricao.trim()) {
      enqueueSnackbar('Descrição é obrigatória', { variant: 'error' });
      return false;
    }
    
    if (arquivos.length === 0) {
      enqueueSnackbar('Adicione pelo menos um documento comprobatório', { variant: 'error' });
      return false;
    }
    
    // Verificar se ao menos uma resposta foi marcada
    const temRespostaMarcada = respostasDeclaracao.some(resposta =>
      resposta.itensRespostaDeclaracao.some(item => item.situacaoResposta)
    );
    
    if (declaracoes.length > 0 && !temRespostaMarcada) {
      enqueueSnackbar('Responda pelo menos um item das declarações', { variant: 'error' });
      return false;
    }
    
    return true;
  };

  // Submeter impugnação
  const submeterImpugnacao = async () => {
    if (!validarFormulario() || !profissionalSelecionado) return;

    setEnviandoImpugnacao(true);
    try {
      const dados = {
        descricao,
        membroChapa: { id: profissionalSelecionado.id },
        tipoImpugnacao: { id: tipoImpugnacaoId as number },
        arquivosPedidoImpugnacao: arquivos.map(a => a.file),
        respostasDeclaracao
      };

      const impugnacaoCriada = await impugnacaoService.criarImpugnacao(dados);
      
      enqueueSnackbar(
        `Impugnação criada com sucesso! Protocolo: ${impugnacaoCriada.numeroProtocolo}`, 
        { variant: 'success' }
      );
      
      navigate('/dashboard');
    } catch (error: any) {
      enqueueSnackbar(
        error.response?.data?.message || 'Erro ao criar impugnação', 
        { variant: 'error' }
      );
    } finally {
      setEnviandoImpugnacao(false);
      setShowConfirmacao(false);
    }
  };

  // Verificar se usuário está logado
  if (!user) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Alert severity="error">
          Você precisa estar logado para criar uma impugnação.
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
          onClick={() => etapaAtual === 'busca' ? navigate('/dashboard') : setEtapaAtual('busca')}
          sx={{ mb: 2 }}
        >
          {etapaAtual === 'busca' ? 'Voltar ao Dashboard' : 'Voltar à Busca'}
        </Button>
        
        <Typography variant="h3" component="h1" gutterBottom fontWeight="bold">
          Pedido de Impugnação
        </Typography>
        <Typography variant="h6" color="textSecondary">
          {etapaAtual === 'busca' ? 
            'Busque o profissional que deseja impugnar' : 
            'Preencha os dados da impugnação'
          }
        </Typography>
      </Box>

      {/* Etapa 1: Busca de Profissional */}
      {etapaAtual === 'busca' && (
        <Paper sx={{ p: 4 }}>
          <Typography variant="h6" gutterBottom>
            <SearchIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
            Buscar Profissional para Impugnar
          </Typography>
          
          <Alert severity="info" sx={{ mb: 3 }}>
            Digite o nome, CPF ou número de registro do profissional que deseja impugnar.
            O sistema mostrará apenas profissionais que participam de chapas ativas.
          </Alert>

          <Grid container spacing={3}>
            <Grid item xs={12}>
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
              />
            </Grid>
          </Grid>

          {/* Resultados da busca */}
          {profissionaisEncontrados.length > 0 && (
            <Box sx={{ mt: 3 }}>
              <Typography variant="h6" gutterBottom>
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
                          <Grid item xs={12} sm={3}>
                            <Typography variant="h6" fontWeight="bold">
                              {profissional.profissional.nome}
                            </Typography>
                            <Typography variant="body2" color="textSecondary">
                              Registro: {profissional.profissional.registroNacional}
                            </Typography>
                          </Grid>
                          
                          <Grid item xs={12} sm={3}>
                            <Typography variant="body1">
                              <strong>Chapa:</strong> {profissional.chapaEleicao.nome}
                            </Typography>
                            <Typography variant="body2" color="textSecondary">
                              Número: {profissional.chapaEleicao.numeroChapa || 'N/A'}
                            </Typography>
                          </Grid>
                          
                          <Grid item xs={12} sm={2}>
                            <Typography variant="body2">
                              <strong>Tipo:</strong> {profissional.tipoParticipacaoChapa.descricao}
                            </Typography>
                          </Grid>
                          
                          <Grid item xs={12} sm={2}>
                            <Typography variant="body2">
                              <strong>Posição:</strong> {profissional.posicao || '-'}
                            </Typography>
                          </Grid>
                          
                          <Grid item xs={12} sm={2}>
                            <Box textAlign="right">
                              <Button variant="contained" size="small">
                                Selecionar
                              </Button>
                            </Box>
                          </Grid>
                        </Grid>
                      </CardContent>
                    </Card>
                  </Grid>
                ))}
              </Grid>
            </Box>
          )}

          {termoBusca.length >= 3 && profissionaisEncontrados.length === 0 && !buscandoProfissional && (
            <Alert severity="info" sx={{ mt: 2 }}>
              Nenhum profissional encontrado com esse termo de busca.
            </Alert>
          )}
        </Paper>
      )}

      {/* Etapa 2: Formulário de Impugnação */}
      {etapaAtual === 'formulario' && profissionalSelecionado && (
        <Paper sx={{ p: 4 }}>
          {/* Informações do Profissional Selecionado */}
          <Card sx={{ mb: 4, bgcolor: 'primary.light', color: 'primary.contrastText' }}>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                <PersonIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
                Profissional Selecionado para Impugnação
              </Typography>
              
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <Typography><strong>Nome:</strong> {profissionalSelecionado.profissional.nome}</Typography>
                  <Typography><strong>Registro:</strong> {profissionalSelecionado.profissional.registroNacional}</Typography>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Typography><strong>Chapa:</strong> {profissionalSelecionado.chapaEleicao.nome}</Typography>
                  <Typography><strong>Eleição:</strong> {profissionalSelecionado.chapaEleicao.eleicao.titulo}</Typography>
                </Grid>
              </Grid>
            </CardContent>
          </Card>

          <Grid container spacing={4}>
            {/* Dados da Impugnação */}
            <Grid item xs={12} md={8}>
              <Typography variant="h6" gutterBottom>
                <DescriptionIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
                Dados da Impugnação
              </Typography>
              
              <Grid container spacing={3}>
                <Grid item xs={12}>
                  <FormControl fullWidth required>
                    <InputLabel>Tipo de Impugnação</InputLabel>
                    <Select
                      value={tipoImpugnacaoId}
                      label="Tipo de Impugnação"
                      onChange={(e) => setTipoImpugnacaoId(e.target.value)}
                    >
                      {tiposImpugnacao.map((tipo) => (
                        <MenuItem key={tipo.id} value={tipo.id}>
                          {tipo.descricao}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>
                
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Justificativa da Impugnação"
                    value={descricao}
                    onChange={(e) => setDescricao(e.target.value)}
                    multiline
                    rows={6}
                    required
                    placeholder="Descreva detalhadamente os motivos da impugnação, incluindo fatos, datas e argumentos..."
                    helperText={`${descricao.length}/5000 caracteres`}
                    inputProps={{ maxLength: 5000 }}
                  />
                </Grid>
              </Grid>

              {/* Documentos Comprobatórios */}
              <Box sx={{ mt: 4 }}>
                <Typography variant="h6" gutterBottom>
                  <AttachFileIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
                  Documentos Comprobatórios
                </Typography>
                
                <Alert severity="info" sx={{ mb: 2 }}>
                  Anexe documentos que comprovem os fatos alegados na impugnação.
                  Formatos aceitos: PDF, DOC, DOCX, JPG, PNG. Tamanho máximo: 10MB por arquivo.
                </Alert>
                
                <Box sx={{ mb: 2 }}>
                  <Button
                    variant="outlined"
                    component="label"
                    startIcon={<UploadIcon />}
                  >
                    Adicionar Documentos
                    <input
                      type="file"
                      hidden
                      multiple
                      accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                      onChange={adicionarArquivos}
                    />
                  </Button>
                </Box>
                
                {arquivos.length > 0 && (
                  <List>
                    {arquivos.map((arquivo, index) => (
                      <ListItem key={index}>
                        <ListItemIcon>
                          <AttachFileIcon />
                        </ListItemIcon>
                        <ListItemText
                          primary={arquivo.nome}
                          secondary={arquivo.tamanho}
                        />
                        <IconButton
                          edge="end"
                          onClick={() => removerArquivo(index)}
                          color="error"
                        >
                          <DeleteIcon />
                        </IconButton>
                      </ListItem>
                    ))}
                  </List>
                )}
              </Box>
            </Grid>

            {/* Declarações */}
            <Grid item xs={12} md={4}>
              {declaracoes.length > 0 && (
                <Box>
                  <Typography variant="h6" gutterBottom>
                    <CheckBoxIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
                    Declarações Obrigatórias
                  </Typography>
                  
                  <Alert severity="warning" sx={{ mb: 2 }}>
                    Marque as opções que se aplicam ao caso da impugnação.
                  </Alert>
                  
                  {declaracoes.map((declaracao) => (
                    <Card key={declaracao.id} sx={{ mb: 2 }}>
                      <CardContent>
                        <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
                          {declaracao.titulo}
                        </Typography>
                        <Typography variant="body2" color="textSecondary" sx={{ mb: 2 }}>
                          {declaracao.descricao}
                        </Typography>
                        
                        {declaracao.itensDeclaracao.map((item) => {
                          const resposta = respostasDeclaracao
                            .find(r => r.idDeclaracao === declaracao.id)
                            ?.itensRespostaDeclaracao
                            .find(ir => ir.idItemDeclaracao === item.id);
                          
                          return (
                            <FormControlLabel
                              key={item.id}
                              control={
                                <Checkbox
                                  checked={resposta?.situacaoResposta || false}
                                  onChange={() => alterarRespostaDeclaracao(declaracao.id, item.id, declaracao)}
                                />
                              }
                              label={item.descricao}
                              sx={{ display: 'block', mb: 1 }}
                            />
                          );
                        })}
                      </CardContent>
                    </Card>
                  ))}
                </Box>
              )}
            </Grid>
          </Grid>

          {/* Botões de Ação */}
          <Box sx={{ mt: 4, textAlign: 'right' }}>
            <Button
              variant="contained"
              color="primary"
              size="large"
              startIcon={<SaveIcon />}
              onClick={() => setShowConfirmacao(true)}
              disabled={enviandoImpugnacao}
            >
              Enviar Impugnação
            </Button>
          </Box>
        </Paper>
      )}

      {/* Modal de Confirmação */}
      <Dialog open={showConfirmacao} onClose={() => setShowConfirmacao(false)} maxWidth="md">
        <DialogTitle>
          <InfoIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
          Confirmar Envio da Impugnação
        </DialogTitle>
        <DialogContent>
          <Alert severity="warning" sx={{ mb: 2 }}>
            <Typography variant="body1" gutterBottom>
              <strong>Atenção:</strong> Após enviar a impugnação, não será possível editar os dados.
            </Typography>
            <Typography variant="body2">
              Verifique se todas as informações estão corretas antes de confirmar.
            </Typography>
          </Alert>
          
          {profissionalSelecionado && (
            <Box sx={{ mt: 2 }}>
              <Typography variant="h6" gutterBottom>Resumo da Impugnação</Typography>
              <Typography><strong>Profissional:</strong> {profissionalSelecionado.profissional.nome}</Typography>
              <Typography><strong>Chapa:</strong> {profissionalSelecionado.chapaEleicao.nome}</Typography>
              <Typography><strong>Tipo:</strong> {tiposImpugnacao.find(t => t.id === tipoImpugnacaoId)?.descricao}</Typography>
              <Typography><strong>Documentos:</strong> {arquivos.length} arquivo(s)</Typography>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowConfirmacao(false)}>
            Cancelar
          </Button>
          <Button
            variant="contained"
            onClick={submeterImpugnacao}
            disabled={enviandoImpugnacao}
            startIcon={enviandoImpugnacao && <CircularProgress size={20} />}
          >
            {enviandoImpugnacao ? 'Enviando...' : 'Confirmar Envio'}
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};