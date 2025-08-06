import React, { useState } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Grid,
  Button,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  FormControlLabel,
  Checkbox,
  Alert,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  IconButton,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Divider,
} from '@mui/material';
import {
  ArrowBack,
  CloudUpload,
  Delete,
  Save,
  AttachFile,
  Description,
  Warning,
  Gavel,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface Attachment {
  id: string;
  nome: string;
  arquivo: File;
  tamanho: number;
  tipo: string;
}

interface ImpugnationFormData {
  tipo: 'Impugnacao de Chapa' | 'Impugnacao de Membro' | 'Impugnacao de Documento' | 'Impugnacao de Resultado';
  assunto: string;
  descricao: string;
  fundamentacaoLegal: string;
  chapaAlvo?: string;
  membroAlvo?: string;
  documentoAlvo?: string;
  eleicaoId: string;
  requerente: {
    nome: string;
    cpf: string;
    email: string;
    telefone: string;
    endereco: string;
    anonimo: boolean;
  };
  pedidos: string;
  urgente: boolean;
  anexos: Attachment[];
  observacoes?: string;
}

const tiposImpugnacao = [
  { value: 'Impugnacao de Chapa', label: 'Impugnação de Chapa' },
  { value: 'Impugnacao de Membro', label: 'Impugnação de Membro' },
  { value: 'Impugnacao de Documento', label: 'Impugnação de Documento' },
  { value: 'Impugnacao de Resultado', label: 'Impugnação de Resultado' },
];

const mockElections = [
  { id: '1', nome: 'Eleições CAU/BR 2024' },
  { id: '2', nome: 'Eleições CAU/SP 2024' },
];

const mockChapas = [
  { id: '1', nome: 'Chapa Renovação CAU', numero: '01' },
  { id: '2', nome: 'Chapa Progresso', numero: '02' },
  { id: '3', nome: 'Chapa União', numero: '03' },
];

const mockMembros = [
  { id: '1', nome: 'João Silva', chapa: 'Chapa Renovação CAU', cargo: 'Presidente' },
  { id: '2', nome: 'Maria Santos', chapa: 'Chapa Renovação CAU', cargo: 'Vice-Presidente' },
  { id: '3', nome: 'Pedro Costa', chapa: 'Chapa Renovação CAU', cargo: 'Secretário' },
  { id: '4', nome: 'Ana Costa', chapa: 'Chapa Progresso', cargo: 'Presidente' },
];

export const NewImpugnation: React.FC = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState<ImpugnationFormData>({
    tipo: 'Impugnacao de Chapa',
    assunto: '',
    descricao: '',
    fundamentacaoLegal: '',
    chapaAlvo: '',
    membroAlvo: '',
    documentoAlvo: '',
    eleicaoId: '',
    requerente: {
      nome: '',
      cpf: '',
      email: '',
      telefone: '',
      endereco: '',
      anonimo: false,
    },
    pedidos: '',
    urgente: false,
    anexos: [],
    observacoes: '',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (files) {
      const newAttachments: Attachment[] = Array.from(files).map((file) => ({
        id: Date.now().toString() + Math.random().toString(),
        nome: file.name,
        arquivo: file,
        tamanho: file.size,
        tipo: file.type,
      }));
      
      setFormData({
        ...formData,
        anexos: [...formData.anexos, ...newAttachments],
      });
    }
  };

  const handleRemoveAttachment = (attachmentId: string) => {
    setFormData({
      ...formData,
      anexos: formData.anexos.filter(a => a.id !== attachmentId),
    });
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.tipo) newErrors.tipo = 'Tipo de impugnação é obrigatório';
    if (!formData.assunto) newErrors.assunto = 'Assunto é obrigatório';
    if (!formData.descricao) newErrors.descricao = 'Descrição é obrigatória';
    if (!formData.fundamentacaoLegal) newErrors.fundamentacaoLegal = 'Fundamentação legal é obrigatória';
    if (!formData.eleicaoId) newErrors.eleicaoId = 'Eleição é obrigatória';
    if (!formData.pedidos) newErrors.pedidos = 'Pedidos são obrigatórios';

    if (!formData.requerente.anonimo) {
      if (!formData.requerente.nome) newErrors['requerente.nome'] = 'Nome é obrigatório';
      if (!formData.requerente.cpf) newErrors['requerente.cpf'] = 'CPF é obrigatório';
      if (!formData.requerente.email) newErrors['requerente.email'] = 'Email é obrigatório';
    }

    // Validar se há alvo da impugnação
    if (formData.tipo === 'Impugnacao de Chapa' && !formData.chapaAlvo) {
      newErrors.chapaAlvo = 'Selecione a chapa a ser impugnada';
    }
    if (formData.tipo === 'Impugnacao de Membro' && !formData.membroAlvo) {
      newErrors.membroAlvo = 'Selecione o membro a ser impugnado';
    }
    if (formData.tipo === 'Impugnacao de Documento' && !formData.documentoAlvo) {
      newErrors.documentoAlvo = 'Especifique o documento a ser impugnado';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = () => {
    if (validateForm()) {
      console.log('Submitting impugnation:', formData);
      // Here you would make the API call to create the impugnation
      navigate('/impugnacoes');
    } else {
      // Scroll to first error
      const firstError = document.querySelector('.Mui-error');
      if (firstError) {
        firstError.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const getTipoColor = (tipo: string) => {
    switch (tipo) {
      case 'Impugnacao de Chapa': return 'error';
      case 'Impugnacao de Membro': return 'warning';
      case 'Impugnacao de Documento': return 'info';
      case 'Impugnacao de Resultado': return 'success';
      default: return 'default';
    }
  };

  const filteredMembros = formData.chapaAlvo 
    ? mockMembros.filter(m => mockChapas.find(c => c.id === formData.chapaAlvo)?.nome === m.chapa)
    : mockMembros;

  return (
    <Box sx={{ p: 3 }}>
      {/* Header */}
      <Box sx={{ mb: 3, display: 'flex', alignItems: 'center', gap: 2 }}>
        <IconButton onClick={() => navigate('/impugnacoes')}>
          <ArrowBack />
        </IconButton>
        <Box sx={{ flex: 1 }}>
          <Typography variant="h4" gutterBottom>
            Nova Impugnação
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Formalize uma impugnação conforme os procedimentos eleitorais
          </Typography>
        </Box>
        <Button
          variant="contained"
          onClick={handleSubmit}
          startIcon={<Save />}
          color="success"
        >
          Protocolar Impugnação
        </Button>
      </Box>

      <Grid container spacing={3}>
        {/* Left Column - Main Form */}
        <Grid item xs={12} md={8}>
          {/* Basic Information */}
          <Card sx={{ mb: 3 }}>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Informações Básicas
              </Typography>
              
              <Grid container spacing={3}>
                <Grid item xs={12} md={6}>
                  <FormControl fullWidth required error={!!errors.tipo}>
                    <InputLabel>Tipo de Impugnação</InputLabel>
                    <Select
                      value={formData.tipo}
                      label="Tipo de Impugnação"
                      onChange={(e) => {
                        setFormData({ 
                          ...formData, 
                          tipo: e.target.value as any,
                          chapaAlvo: '',
                          membroAlvo: '',
                          documentoAlvo: '',
                        });
                        if (errors.tipo) setErrors({ ...errors, tipo: '' });
                      }}
                    >
                      {tiposImpugnacao.map((tipo) => (
                        <MenuItem key={tipo.value} value={tipo.value}>
                          {tipo.label}
                        </MenuItem>
                      ))}
                    </Select>
                    {errors.tipo && (
                      <Typography variant="caption" color="error">
                        {errors.tipo}
                      </Typography>
                    )}
                  </FormControl>
                </Grid>
                
                <Grid item xs={12} md={6}>
                  <FormControl fullWidth required error={!!errors.eleicaoId}>
                    <InputLabel>Eleição</InputLabel>
                    <Select
                      value={formData.eleicaoId}
                      label="Eleição"
                      onChange={(e) => {
                        setFormData({ ...formData, eleicaoId: e.target.value });
                        if (errors.eleicaoId) setErrors({ ...errors, eleicaoId: '' });
                      }}
                    >
                      {mockElections.map((election) => (
                        <MenuItem key={election.id} value={election.id}>
                          {election.nome}
                        </MenuItem>
                      ))}
                    </Select>
                    {errors.eleicaoId && (
                      <Typography variant="caption" color="error">
                        {errors.eleicaoId}
                      </Typography>
                    )}
                  </FormControl>
                </Grid>
                
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Assunto da Impugnação"
                    value={formData.assunto}
                    onChange={(e) => {
                      setFormData({ ...formData, assunto: e.target.value });
                      if (errors.assunto) setErrors({ ...errors, assunto: '' });
                    }}
                    required
                    error={!!errors.assunto}
                    helperText={errors.assunto || 'Resumo claro e objetivo do que está sendo impugnado'}
                    placeholder="Ex: Irregularidades na formação da Chapa 01"
                  />
                </Grid>
                
                {/* Target Selection */}
                {formData.tipo === 'Impugnacao de Chapa' && (
                  <Grid item xs={12} md={6}>
                    <FormControl fullWidth required error={!!errors.chapaAlvo}>
                      <InputLabel>Chapa Impugnada</InputLabel>
                      <Select
                        value={formData.chapaAlvo}
                        label="Chapa Impugnada"
                        onChange={(e) => {
                          setFormData({ ...formData, chapaAlvo: e.target.value });
                          if (errors.chapaAlvo) setErrors({ ...errors, chapaAlvo: '' });
                        }}
                      >
                        {mockChapas.map((chapa) => (
                          <MenuItem key={chapa.id} value={chapa.id}>
                            Chapa {chapa.numero} - {chapa.nome}
                          </MenuItem>
                        ))}
                      </Select>
                      {errors.chapaAlvo && (
                        <Typography variant="caption" color="error">
                          {errors.chapaAlvo}
                        </Typography>
                      )}
                    </FormControl>
                  </Grid>
                )}
                
                {formData.tipo === 'Impugnacao de Membro' && (
                  <>
                    <Grid item xs={12} md={6}>
                      <FormControl fullWidth>
                        <InputLabel>Chapa do Membro</InputLabel>
                        <Select
                          value={formData.chapaAlvo}
                          label="Chapa do Membro"
                          onChange={(e) => {
                            setFormData({ ...formData, chapaAlvo: e.target.value, membroAlvo: '' });
                          }}
                        >
                          {mockChapas.map((chapa) => (
                            <MenuItem key={chapa.id} value={chapa.id}>
                              Chapa {chapa.numero} - {chapa.nome}
                            </MenuItem>
                          ))}
                        </Select>
                      </FormControl>
                    </Grid>
                    
                    <Grid item xs={12} md={6}>
                      <FormControl fullWidth required error={!!errors.membroAlvo}>
                        <InputLabel>Membro Impugnado</InputLabel>
                        <Select
                          value={formData.membroAlvo}
                          label="Membro Impugnado"
                          onChange={(e) => {
                            setFormData({ ...formData, membroAlvo: e.target.value });
                            if (errors.membroAlvo) setErrors({ ...errors, membroAlvo: '' });
                          }}
                          disabled={!formData.chapaAlvo}
                        >
                          {filteredMembros.map((membro) => (
                            <MenuItem key={membro.id} value={membro.id}>
                              {membro.nome} - {membro.cargo}
                            </MenuItem>
                          ))}
                        </Select>
                        {errors.membroAlvo && (
                          <Typography variant="caption" color="error">
                            {errors.membroAlvo}
                          </Typography>
                        )}
                      </FormControl>
                    </Grid>
                  </>
                )}
                
                {formData.tipo === 'Impugnacao de Documento' && (
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      label="Documento Impugnado"
                      value={formData.documentoAlvo}
                      onChange={(e) => {
                        setFormData({ ...formData, documentoAlvo: e.target.value });
                        if (errors.documentoAlvo) setErrors({ ...errors, documentoAlvo: '' });
                      }}
                      required
                      error={!!errors.documentoAlvo}
                      helperText={errors.documentoAlvo || 'Especifique qual documento está sendo impugnado'}
                      placeholder="Ex: Certidão de regularidade do CAU de João Silva"
                    />
                  </Grid>
                )}
              </Grid>
            </CardContent>
          </Card>

          {/* Description and Legal Basis */}
          <Card sx={{ mb: 3 }}>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Fundamentação da Impugnação
              </Typography>
              
              <Grid container spacing={3}>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    multiline
                    rows={6}
                    label="Descrição dos Fatos"
                    value={formData.descricao}
                    onChange={(e) => {
                      setFormData({ ...formData, descricao: e.target.value });
                      if (errors.descricao) setErrors({ ...errors, descricao: '' });
                    }}
                    required
                    error={!!errors.descricao}
                    helperText={errors.descricao || 'Descreva detalhadamente os fatos que fundamentam a impugnação'}
                    placeholder="Relate de forma clara e objetiva os fatos que motivam esta impugnação, incluindo datas, documentos e evidências..."
                  />
                </Grid>
                
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    multiline
                    rows={4}
                    label="Fundamentação Legal"
                    value={formData.fundamentacaoLegal}
                    onChange={(e) => {
                      setFormData({ ...formData, fundamentacaoLegal: e.target.value });
                      if (errors.fundamentacaoLegal) setErrors({ ...errors, fundamentacaoLegal: '' });
                    }}
                    required
                    error={!!errors.fundamentacaoLegal}
                    helperText={errors.fundamentacaoLegal || 'Cite os dispositivos legais e normativos que fundamentam a impugnação'}
                    placeholder="Cite os artigos da lei, regulamento eleitoral ou outras normas que fundamentam juridicamente esta impugnação..."
                  />
                </Grid>
                
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    multiline
                    rows={3}
                    label="Pedidos"
                    value={formData.pedidos}
                    onChange={(e) => {
                      setFormData({ ...formData, pedidos: e.target.value });
                      if (errors.pedidos) setErrors({ ...errors, pedidos: '' });
                    }}
                    required
                    error={!!errors.pedidos}
                    helperText={errors.pedidos || 'Especifique claramente o que está sendo pedido'}
                    placeholder="Ex: Desqualificação da Chapa 01, Substituição do membro irreguflar, etc."
                  />
                </Grid>
              </Grid>
            </CardContent>
          </Card>

          {/* Attachments */}
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Documentos Comprobatórios
              </Typography>
              
              <Alert severity="info" sx={{ mb: 3 }}>
                Anexe todos os documentos que comprovem os fatos relatados na impugnação.
                Formatos aceitos: PDF, DOC, DOCX, JPG, PNG. Tamanho máximo: 10MB por arquivo.
              </Alert>
              
              <Box sx={{ mb: 3 }}>
                <input
                  accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                  style={{ display: 'none' }}
                  id="file-upload"
                  type="file"
                  multiple
                  onChange={handleFileUpload}
                />
                <label htmlFor="file-upload">
                  <Button
                    variant="outlined"
                    component="span"
                    startIcon={<CloudUpload />}
                  >
                    Adicionar Documentos
                  </Button>
                </label>
              </Box>
              
              {formData.anexos.length > 0 ? (
                <TableContainer component={Paper} variant="outlined">
                  <Table size="small">
                    <TableHead>
                      <TableRow>
                        <TableCell>Arquivo</TableCell>
                        <TableCell>Tamanho</TableCell>
                        <TableCell align="center">Ações</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {formData.anexos.map((anexo) => (
                        <TableRow key={anexo.id}>
                          <TableCell>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                              <AttachFile fontSize="small" />
                              {anexo.nome}
                            </Box>
                          </TableCell>
                          <TableCell>{formatFileSize(anexo.tamanho)}</TableCell>
                          <TableCell align="center">
                            <IconButton
                              size="small"
                              color="error"
                              onClick={() => handleRemoveAttachment(anexo.id)}
                            >
                              <Delete fontSize="small" />
                            </IconButton>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              ) : (
                <Box sx={{ textAlign: 'center', py: 3, bgcolor: 'grey.50', borderRadius: 1, border: '1px dashed', borderColor: 'grey.300' }}>
                  <Description sx={{ fontSize: 48, color: 'grey.400', mb: 1 }} />
                  <Typography variant="body2" color="text.secondary">
                    Nenhum documento anexado
                  </Typography>
                </Box>
              )}
              
              <TextField
                fullWidth
                multiline
                rows={2}
                label="Observações sobre os Documentos"
                value={formData.observacoes}
                onChange={(e) => setFormData({ ...formData, observacoes: e.target.value })}
                placeholder="Descreva brevemente os documentos anexados..."
                sx={{ mt: 3 }}
              />
            </CardContent>
          </Card>
        </Grid>

        {/* Right Column - Requerente and Options */}
        <Grid item xs={12} md={4}>
          {/* Options */}
          <Card sx={{ mb: 3 }}>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Opções do Processo
              </Typography>
              
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={formData.urgente}
                      onChange={(e) => setFormData({ ...formData, urgente: e.target.checked })}
                    />
                  }
                  label={
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Warning color="warning" fontSize="small" />
                      <Typography variant="body2">
                        Processo Urgente
                      </Typography>
                    </Box>
                  }
                />
                
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={formData.requerente.anonimo}
                      onChange={(e) => setFormData({ 
                        ...formData, 
                        requerente: { 
                          ...formData.requerente, 
                          anonimo: e.target.checked,
                          nome: e.target.checked ? '' : formData.requerente.nome,
                          cpf: e.target.checked ? '' : formData.requerente.cpf,
                          email: e.target.checked ? '' : formData.requerente.email,
                          telefone: e.target.checked ? '' : formData.requerente.telefone,
                          endereco: e.target.checked ? '' : formData.requerente.endereco,
                        }
                      })}
                    />
                  }
                  label={
                    <Typography variant="body2">
                      Impugnação Anônima
                    </Typography>
                  }
                />
              </Box>
              
              {formData.urgente && (
                <Alert severity="warning" sx={{ mt: 2 }}>
                  Processos urgentes terão prioridade na análise e julgamento.
                </Alert>
              )}
            </CardContent>
          </Card>

          {/* Requerente */}
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Dados do Requerente
              </Typography>
              
              {formData.requerente.anonimo ? (
                <Alert severity="info">
                  Impugnação será protocolada de forma anônima.
                </Alert>
              ) : (
                <Grid container spacing={2}>
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      label="Nome Completo"
                      value={formData.requerente.nome}
                      onChange={(e) => {
                        setFormData({ 
                          ...formData, 
                          requerente: { ...formData.requerente, nome: e.target.value }
                        });
                        if (errors['requerente.nome']) {
                          setErrors({ ...errors, 'requerente.nome': '' });
                        }
                      }}
                      required
                      error={!!errors['requerente.nome']}
                      helperText={errors['requerente.nome']}
                      size="small"
                    />
                  </Grid>
                  
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      label="CPF"
                      value={formData.requerente.cpf}
                      onChange={(e) => {
                        setFormData({ 
                          ...formData, 
                          requerente: { ...formData.requerente, cpf: e.target.value }
                        });
                        if (errors['requerente.cpf']) {
                          setErrors({ ...errors, 'requerente.cpf': '' });
                        }
                      }}
                      required
                      error={!!errors['requerente.cpf']}
                      helperText={errors['requerente.cpf']}
                      size="small"
                    />
                  </Grid>
                  
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      label="Email"
                      type="email"
                      value={formData.requerente.email}
                      onChange={(e) => {
                        setFormData({ 
                          ...formData, 
                          requerente: { ...formData.requerente, email: e.target.value }
                        });
                        if (errors['requerente.email']) {
                          setErrors({ ...errors, 'requerente.email': '' });
                        }
                      }}
                      required
                      error={!!errors['requerente.email']}
                      helperText={errors['requerente.email']}
                      size="small"
                    />
                  </Grid>
                  
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      label="Telefone"
                      value={formData.requerente.telefone}
                      onChange={(e) => 
                        setFormData({ 
                          ...formData, 
                          requerente: { ...formData.requerente, telefone: e.target.value }
                        })
                      }
                      size="small"
                    />
                  </Grid>
                  
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      multiline
                      rows={2}
                      label="Endereço"
                      value={formData.requerente.endereco}
                      onChange={(e) => 
                        setFormData({ 
                          ...formData, 
                          requerente: { ...formData.requerente, endereco: e.target.value }
                        })
                      }
                      size="small"
                    />
                  </Grid>
                </Grid>
              )}
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};

export default NewImpugnation;