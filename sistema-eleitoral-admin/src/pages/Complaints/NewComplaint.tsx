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
  Stepper,
  Step,
  StepLabel,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  IconButton,
  Chip,
  Alert,
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

interface ComplaintFormData {
  tipo: 'Denuncia' | 'Impugnacao' | 'Recurso' | 'Representacao';
  assunto: string;
  descricao: string;
  chapaAlvo?: string;
  membroAlvo?: string;
  eleicaoId: string;
  denunciante: string;
  cpfDenunciante: string;
  emailDenunciante: string;
  telefoneDenunciante: string;
  anonima: boolean;
  urgente: boolean;
  anexos: Attachment[];
  observacoes?: string;
}

const steps = ['Informações Básicas', 'Detalhes da Denúncia', 'Anexos', 'Confirmação'];

const tiposComplaint = [
  { value: 'Denuncia', label: 'Denúncia' },
  { value: 'Impugnacao', label: 'Impugnação' },
  { value: 'Recurso', label: 'Recurso' },
  { value: 'Representacao', label: 'Representação' },
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

export const NewComplaint: React.FC = () => {
  const navigate = useNavigate();
  const [activeStep, setActiveStep] = useState(0);
  const [formData, setFormData] = useState<ComplaintFormData>({
    tipo: 'Denuncia',
    assunto: '',
    descricao: '',
    chapaAlvo: '',
    membroAlvo: '',
    eleicaoId: '',
    denunciante: '',
    cpfDenunciante: '',
    emailDenunciante: '',
    telefoneDenunciante: '',
    anonima: false,
    urgente: false,
    anexos: [],
    observacoes: '',
  });

  const handleNext = () => {
    setActiveStep((prevActiveStep) => prevActiveStep + 1);
  };

  const handleBack = () => {
    setActiveStep((prevActiveStep) => prevActiveStep - 1);
  };

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

  const handleSubmit = () => {
    console.log('Submitting complaint:', formData);
    // Here you would make the API call to create the complaint
    navigate('/denuncias');
  };

  const canProceed = (step: number) => {
    switch (step) {
      case 0:
        return formData.tipo && formData.eleicaoId && formData.assunto;
      case 1:
        return formData.descricao && (formData.anonima || formData.denunciante);
      case 2:
        return true; // Anexos são opcionais
      default:
        return true;
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
      case 'Denuncia': return 'error';
      case 'Impugnacao': return 'warning';
      case 'Recurso': return 'info';
      case 'Representacao': return 'success';
      default: return 'default';
    }
  };

  return (
    <Box sx={{ p: 3 }}>
      {/* Header */}
      <Box sx={{ mb: 3, display: 'flex', alignItems: 'center', gap: 2 }}>
        <IconButton onClick={() => navigate('/denuncias')}>
          <ArrowBack />
        </IconButton>
        <Typography variant="h4">
          Nova Denúncia/Impugnação
        </Typography>
      </Box>

      {/* Stepper */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Stepper activeStep={activeStep}>
            {steps.map((label, index) => (
              <Step key={label}>
                <StepLabel>{label}</StepLabel>
              </Step>
            ))}
          </Stepper>
        </CardContent>
      </Card>

      {/* Step Content */}
      <Card>
        <CardContent>
          {activeStep === 0 && (
            <Grid container spacing={3}>
              <Grid item xs={12}>
                <Typography variant="h6" gutterBottom>
                  Informações Básicas
                </Typography>
              </Grid>
              
              <Grid item xs={12} md={6}>
                <FormControl fullWidth required>
                  <InputLabel>Tipo de Processo</InputLabel>
                  <Select
                    value={formData.tipo}
                    label="Tipo de Processo"
                    onChange={(e) => setFormData({ ...formData, tipo: e.target.value as any })}
                  >
                    {tiposComplaint.map((tipo) => (
                      <MenuItem key={tipo.value} value={tipo.value}>
                        {tipo.label}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              
              <Grid item xs={12} md={6}>
                <FormControl fullWidth required>
                  <InputLabel>Eleição</InputLabel>
                  <Select
                    value={formData.eleicaoId}
                    label="Eleição"
                    onChange={(e) => setFormData({ ...formData, eleicaoId: e.target.value })}
                  >
                    {mockElections.map((election) => (
                      <MenuItem key={election.id} value={election.id}>
                        {election.nome}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Assunto"
                  value={formData.assunto}
                  onChange={(e) => setFormData({ ...formData, assunto: e.target.value })}
                  required
                  placeholder="Resumo do problema ou irregularidade"
                />
              </Grid>
              
              <Grid item xs={12} md={6}>
                <FormControl fullWidth>
                  <InputLabel>Chapa Alvo (opcional)</InputLabel>
                  <Select
                    value={formData.chapaAlvo}
                    label="Chapa Alvo (opcional)"
                    onChange={(e) => setFormData({ ...formData, chapaAlvo: e.target.value })}
                  >
                    <MenuItem value="">
                      <em>Selecione uma chapa (opcional)</em>
                    </MenuItem>
                    {mockChapas.map((chapa) => (
                      <MenuItem key={chapa.id} value={chapa.id}>
                        Chapa {chapa.numero} - {chapa.nome}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Membro Específico (opcional)"
                  value={formData.membroAlvo}
                  onChange={(e) => setFormData({ ...formData, membroAlvo: e.target.value })}
                  placeholder="Nome do membro envolvido (se aplicável)"
                />
              </Grid>
            </Grid>
          )}

          {activeStep === 1 && (
            <Grid container spacing={3}>
              <Grid item xs={12}>
                <Typography variant="h6" gutterBottom>
                  Detalhes da {formData.tipo === 'Denuncia' ? 'Denúncia' : 'Impugnação'}
                </Typography>
              </Grid>
              
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  multiline
                  rows={6}
                  label="Descrição Detalhada"
                  value={formData.descricao}
                  onChange={(e) => setFormData({ ...formData, descricao: e.target.value })}
                  required
                  placeholder="Descreva detalhadamente os fatos, datas, locais e pessoas envolvidas..."
                />
              </Grid>
              
              <Grid item xs={12}>
                <Alert severity="info">
                  Seja específico e objetivo. Inclua datas, horários, locais e nomes de pessoas envolvidas.
                  Quanto mais detalhes, melhor será a análise do caso.
                </Alert>
              </Grid>
              
              <Grid item xs={12}>
                <Typography variant="h6" gutterBottom sx={{ mt: 2 }}>
                  Dados do Denunciante
                </Typography>
              </Grid>
              
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Nome Completo"
                  value={formData.denunciante}
                  onChange={(e) => setFormData({ ...formData, denunciante: e.target.value })}
                  required={!formData.anonima}
                  disabled={formData.anonima}
                />
              </Grid>
              
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="CPF"
                  value={formData.cpfDenunciante}
                  onChange={(e) => setFormData({ ...formData, cpfDenunciante: e.target.value })}
                  required={!formData.anonima}
                  disabled={formData.anonima}
                />
              </Grid>
              
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Email"
                  type="email"
                  value={formData.emailDenunciante}
                  onChange={(e) => setFormData({ ...formData, emailDenunciante: e.target.value })}
                  required={!formData.anonima}
                  disabled={formData.anonima}
                />
              </Grid>
              
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Telefone"
                  value={formData.telefoneDenunciante}
                  onChange={(e) => setFormData({ ...formData, telefoneDenunciante: e.target.value })}
                  disabled={formData.anonima}
                />
              </Grid>
              
              <Grid item xs={12}>
                <Box sx={{ display: 'flex', gap: 2, mt: 2 }}>
                  <Button
                    variant={formData.anonima ? 'contained' : 'outlined'}
                    onClick={() => setFormData({ 
                      ...formData, 
                      anonima: !formData.anonima,
                      denunciante: formData.anonima ? formData.denunciante : '',
                      cpfDenunciante: formData.anonima ? formData.cpfDenunciante : '',
                      emailDenunciante: formData.anonima ? formData.emailDenunciante : '',
                      telefoneDenunciante: formData.anonima ? formData.telefoneDenunciante : '',
                    })}
                  >
                    Denúncia Anônima
                  </Button>
                  
                  <Button
                    variant={formData.urgente ? 'contained' : 'outlined'}
                    color="warning"
                    onClick={() => setFormData({ ...formData, urgente: !formData.urgente })}
                    startIcon={<Warning />}
                  >
                    Processo Urgente
                  </Button>
                </Box>
              </Grid>
            </Grid>
          )}

          {activeStep === 2 && (
            <Box>
              <Typography variant="h6" gutterBottom>
                Documentos e Anexos
              </Typography>
              
              <Alert severity="info" sx={{ mb: 3 }}>
                Anexe documentos que comprovem os fatos relatados (fotos, prints, emails, etc.).
                Formatos aceitos: PDF, DOC, DOCX, JPG, PNG, GIF. Tamanho máximo: 10MB por arquivo.
              </Alert>
              
              <Box sx={{ mb: 3 }}>
                <input
                  accept=".pdf,.doc,.docx,.jpg,.jpeg,.png,.gif"
                  style={{ display: 'none' }}
                  id="file-upload"
                  type="file"
                  multiple
                  onChange={handleFileUpload}
                />
                <label htmlFor="file-upload">
                  <Button
                    variant="contained"
                    component="span"
                    startIcon={<CloudUpload />}
                  >
                    Adicionar Documentos
                  </Button>
                </label>
              </Box>
              
              {formData.anexos.length > 0 ? (
                <TableContainer component={Paper}>
                  <Table>
                    <TableHead>
                      <TableRow>
                        <TableCell>Nome do Arquivo</TableCell>
                        <TableCell>Tamanho</TableCell>
                        <TableCell>Tipo</TableCell>
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
                          <TableCell>{anexo.tipo || 'Desconhecido'}</TableCell>
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
                <Box sx={{ textAlign: 'center', py: 4, bgcolor: 'grey.50', borderRadius: 1 }}>
                  <Description sx={{ fontSize: 48, color: 'grey.400', mb: 2 }} />
                  <Typography variant="body1" color="text.secondary">
                    Nenhum documento anexado ainda.
                  </Typography>
                </Box>
              )}
              
              <TextField
                fullWidth
                multiline
                rows={3}
                label="Observações sobre os Anexos"
                value={formData.observacoes}
                onChange={(e) => setFormData({ ...formData, observacoes: e.target.value })}
                placeholder="Descreva brevemente os documentos anexados..."
                sx={{ mt: 3 }}
              />
            </Box>
          )}

          {activeStep === 3 && (
            <Box>
              <Typography variant="h6" gutterBottom>
                Confirmação dos Dados
              </Typography>
              
              <Grid container spacing={3}>
                <Grid item xs={12} md={6}>
                  <Card variant="outlined">
                    <CardContent>
                      <Typography variant="h6" gutterBottom>
                        Informações Básicas
                      </Typography>
                      <List dense>
                        <ListItem>
                          <ListItemIcon>
                            <Chip 
                              label={formData.tipo} 
                              color={getTipoColor(formData.tipo) as any} 
                              size="small" 
                            />
                          </ListItemIcon>
                          <ListItemText primary={tiposComplaint.find(t => t.value === formData.tipo)?.label} />
                        </ListItem>
                        <Divider />
                        <ListItem>
                          <ListItemText 
                            primary="Assunto" 
                            secondary={formData.assunto}
                          />
                        </ListItem>
                        <Divider />
                        <ListItem>
                          <ListItemText 
                            primary="Eleição" 
                            secondary={mockElections.find(e => e.id === formData.eleicaoId)?.nome}
                          />
                        </ListItem>
                        {formData.chapaAlvo && (
                          <>
                            <Divider />
                            <ListItem>
                              <ListItemText 
                                primary="Chapa Alvo" 
                                secondary={mockChapas.find(c => c.id === formData.chapaAlvo)?.nome}
                              />
                            </ListItem>
                          </>
                        )}
                      </List>
                    </CardContent>
                  </Card>
                </Grid>
                
                <Grid item xs={12} md={6}>
                  <Card variant="outlined">
                    <CardContent>
                      <Typography variant="h6" gutterBottom>
                        Denunciante
                      </Typography>
                      {formData.anonima ? (
                        <Alert severity="warning">
                          Denúncia Anônima
                        </Alert>
                      ) : (
                        <List dense>
                          <ListItem>
                            <ListItemText 
                              primary="Nome" 
                              secondary={formData.denunciante}
                            />
                          </ListItem>
                          <Divider />
                          <ListItem>
                            <ListItemText 
                              primary="CPF" 
                              secondary={formData.cpfDenunciante}
                            />
                          </ListItem>
                          <Divider />
                          <ListItem>
                            <ListItemText 
                              primary="Email" 
                              secondary={formData.emailDenunciante}
                            />
                          </ListItem>
                        </List>
                      )}
                      
                      {formData.urgente && (
                        <Alert severity="warning" sx={{ mt: 2 }}>
                          Processo marcado como URGENTE
                        </Alert>
                      )}
                    </CardContent>
                  </Card>
                </Grid>
                
                <Grid item xs={12}>
                  <Card variant="outlined">
                    <CardContent>
                      <Typography variant="h6" gutterBottom>
                        Resumo
                      </Typography>
                      <Typography variant="body2" paragraph>
                        <strong>Descrição:</strong> {formData.descricao.substring(0, 200)}
                        {formData.descricao.length > 200 && '...'}
                      </Typography>
                      <Typography variant="body2">
                        <strong>Documentos anexados:</strong> {formData.anexos.length} arquivo(s)
                      </Typography>
                      <Typography variant="body2">
                        <strong>Data de criação:</strong> {format(new Date(), 'dd/MM/yyyy HH:mm', { locale: ptBR })}
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>
              </Grid>
            </Box>
          )}
        </CardContent>
        
        {/* Navigation Buttons */}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', p: 2 }}>
          <Button
            onClick={handleBack}
            disabled={activeStep === 0}
          >
            Voltar
          </Button>
          
          {activeStep === steps.length - 1 ? (
            <Button
              variant="contained"
              onClick={handleSubmit}
              startIcon={<Save />}
              color="success"
            >
              Criar {formData.tipo === 'Denuncia' ? 'Denúncia' : 'Impugnação'}
            </Button>
          ) : (
            <Button
              variant="contained"
              onClick={handleNext}
              disabled={!canProceed(activeStep)}
            >
              Próximo
            </Button>
          )}
        </Box>
      </Card>
    </Box>
  );
};

export default NewComplaint;