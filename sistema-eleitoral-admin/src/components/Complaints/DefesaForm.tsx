import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  TextField,
  Button,
  Stepper,
  Step,
  StepLabel,
  Grid,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Chip,
  FormControlLabel,
  Checkbox,
  LinearProgress,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  IconButton,
  Divider
} from '@mui/material';
import {
  CloudUpload,
  Delete,
  Visibility,
  Download,
  Send,
  Save,
  AccessTime,
  Warning,
  CheckCircle
} from '@mui/icons-material';
import { useParams, useNavigate } from 'react-router-dom';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { RichTextEditor } from '../Common/RichTextEditor';
import { FileUpload } from '../Common/FileUpload';

interface DefesaFormProps {
  denunciaId: number;
  readonly?: boolean;
}

interface DefesaData {
  id?: number;
  denunciaId: number;
  textoDefesa: string;
  fundamentosLegais: string;
  pedidoPrincipal: string;
  pedidoSubsidiario?: string;
  solicitouProducaoProvas: boolean;
  rolTestemunhas?: string;
  prazoApresentacao: Date;
  status: string;
  anexos: DefesaAnexo[];
  apresentacaoExtemporanea?: boolean;
  motivoExtemporanea?: string;
  observacoesValidacao?: string;
}

interface DefesaAnexo {
  id?: number;
  nomeArquivo: string;
  caminhoArquivo: string;
  tipoArquivo: string;
  tamanhoArquivo: number;
  descricao?: string;
  arquivo?: File;
}

const steps = [
  'Informações Básicas',
  'Fundamentação Legal',
  'Pedidos',
  'Provas e Testemunhas',
  'Anexos',
  'Revisão'
];

export const DefesaForm: React.FC<DefesaFormProps> = ({ denunciaId, readonly = false }) => {
  const { id } = useParams();
  const navigate = useNavigate();
  
  const [activeStep, setActiveStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [defesa, setDefesa] = useState<DefesaData>({
    denunciaId,
    textoDefesa: '',
    fundamentosLegais: '',
    pedidoPrincipal: '',
    pedidoSubsidiario: '',
    solicitouProducaoProvas: false,
    rolTestemunhas: '',
    prazoApresentacao: new Date(),
    status: 'RASCUNHO',
    anexos: []
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [confirmDialog, setConfirmDialog] = useState(false);
  const [prazoInfo, setPrazoInfo] = useState<{
    diasRestantes: number;
    vencido: boolean;
    dataLimite: Date;
  } | null>(null);

  useEffect(() => {
    if (id) {
      loadDefesa(parseInt(id));
    } else {
      loadPrazoInfo();
    }
  }, [id]);

  const loadDefesa = async (defesaId: number) => {
    setLoading(true);
    try {
      const response = await fetch(`/api/defesa/denuncia/${denunciaId}`);
      if (response.ok) {
        const data = await response.json();
        setDefesa(data.data);
        calculatePrazoInfo(data.data.prazoApresentacao);
      }
    } catch (error) {
      console.error('Erro ao carregar defesa:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadPrazoInfo = async () => {
    try {
      const response = await fetch(`/api/denuncias/${denunciaId}`);
      if (response.ok) {
        const data = await response.json();
        // Aqui assumimos que a API retorna informações sobre prazos
        const prazoDefesa = new Date(data.data.prazoDefesa);
        calculatePrazoInfo(prazoDefesa);
        setDefesa(prev => ({ ...prev, prazoApresentacao: prazoDefesa }));
      }
    } catch (error) {
      console.error('Erro ao carregar prazo:', error);
    }
  };

  const calculatePrazoInfo = (prazoApresentacao: Date) => {
    const agora = new Date();
    const prazo = new Date(prazoApresentacao);
    const diffTime = prazo.getTime() - agora.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    setPrazoInfo({
      diasRestantes: diffDays > 0 ? diffDays : 0,
      vencido: diffDays < 0,
      dataLimite: prazo
    });
  };

  const handleNext = () => {
    if (validateCurrentStep()) {
      setActiveStep((prevActiveStep) => prevActiveStep + 1);
    }
  };

  const handleBack = () => {
    setActiveStep((prevActiveStep) => prevActiveStep - 1);
  };

  const validateCurrentStep = (): boolean => {
    const newErrors: Record<string, string> = {};

    switch (activeStep) {
      case 0: // Informações Básicas
        if (!defesa.textoDefesa.trim()) {
          newErrors.textoDefesa = 'Texto da defesa é obrigatório';
        }
        break;
      case 1: // Fundamentação Legal
        if (!defesa.fundamentosLegais.trim()) {
          newErrors.fundamentosLegais = 'Fundamentos legais são obrigatórios';
        }
        break;
      case 2: // Pedidos
        if (!defesa.pedidoPrincipal.trim()) {
          newErrors.pedidoPrincipal = 'Pedido principal é obrigatório';
        }
        break;
      case 3: // Provas e Testemunhas
        if (defesa.solicitouProducaoProvas && !defesa.rolTestemunhas?.trim()) {
          newErrors.rolTestemunhas = 'Role de testemunhas é obrigatório quando solicitada produção de provas';
        }
        break;
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSaveDraft = async () => {
    setSaving(true);
    try {
      const endpoint = defesa.id ? `/api/defesa/${defesa.id}` : `/api/defesa`;
      const method = defesa.id ? 'PUT' : 'POST';
      
      const response = await fetch(endpoint, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ ...defesa, status: 'RASCUNHO' })
      });

      if (response.ok) {
        const result = await response.json();
        setDefesa(prev => ({ ...prev, id: result.data?.id || prev.id }));
        // Show success message
      }
    } catch (error) {
      console.error('Erro ao salvar rascunho:', error);
    } finally {
      setSaving(false);
    }
  };

  const handleSubmit = async () => {
    if (!validateAllSteps()) return;

    setConfirmDialog(false);
    setLoading(true);

    try {
      const formData = new FormData();
      
      // Append defesa data
      Object.entries(defesa).forEach(([key, value]) => {
        if (key !== 'anexos' && value !== null && value !== undefined) {
          formData.append(key, typeof value === 'boolean' ? value.toString() : value as string);
        }
      });

      // Append files
      defesa.anexos.forEach((anexo, index) => {
        if (anexo.arquivo) {
          formData.append(`anexos[${index}].arquivo`, anexo.arquivo);
          formData.append(`anexos[${index}].descricao`, anexo.descricao || '');
        }
      });

      const response = await fetch(`/api/defesa/${denunciaId}/apresentar`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: formData
      });

      if (response.ok) {
        // Show success message and redirect
        navigate(`/denuncias/${denunciaId}`);
      }
    } catch (error) {
      console.error('Erro ao apresentar defesa:', error);
    } finally {
      setLoading(false);
    }
  };

  const validateAllSteps = (): boolean => {
    // Validate all required fields across all steps
    return defesa.textoDefesa.trim() !== '' && 
           defesa.fundamentosLegais.trim() !== '' && 
           defesa.pedidoPrincipal.trim() !== '';
  };

  const handleFileUpload = (files: FileList) => {
    const newAnexos: DefesaAnexo[] = [];
    
    Array.from(files).forEach(file => {
      newAnexos.push({
        nomeArquivo: file.name,
        caminhoArquivo: '', // Will be set after upload
        tipoArquivo: file.type,
        tamanhoArquivo: file.size,
        arquivo: file
      });
    });

    setDefesa(prev => ({
      ...prev,
      anexos: [...prev.anexos, ...newAnexos]
    }));
  };

  const removeAnexo = (index: number) => {
    setDefesa(prev => ({
      ...prev,
      anexos: prev.anexos.filter((_, i) => i !== index)
    }));
  };

  const renderStepContent = (step: number) => {
    switch (step) {
      case 0:
        return (
          <Box>
            <Typography variant="h6" gutterBottom>
              Informações Básicas da Defesa
            </Typography>
            
            {prazoInfo && (
              <Alert 
                severity={prazoInfo.vencido ? 'error' : prazoInfo.diasRestantes <= 3 ? 'warning' : 'info'}
                sx={{ mb: 2 }}
                icon={prazoInfo.vencido ? <Warning /> : <AccessTime />}
              >
                {prazoInfo.vencido 
                  ? `Prazo vencido em ${Math.abs(prazoInfo.diasRestantes)} dias`
                  : `${prazoInfo.diasRestantes} dias restantes para apresentação`
                }
                <br />
                Data limite: {prazoInfo.dataLimite.toLocaleDateString('pt-BR')}
              </Alert>
            )}

            <RichTextEditor
              value={defesa.textoDefesa}
              onChange={(value) => setDefesa(prev => ({ ...prev, textoDefesa: value }))}
              label="Texto da Defesa"
              error={!!errors.textoDefesa}
              helperText={errors.textoDefesa || "Descreva detalhadamente os fatos e argumentos da defesa"}
              placeholder="Apresente aqui os argumentos de defesa, contestando as alegações da denúncia..."
              minHeight={300}
              readOnly={readonly}
            />
          </Box>
        );

      case 1:
        return (
          <Box>
            <Typography variant="h6" gutterBottom>
              Fundamentação Legal
            </Typography>
            
            <RichTextEditor
              value={defesa.fundamentosLegais}
              onChange={(value) => setDefesa(prev => ({ ...prev, fundamentosLegais: value }))}
              label="Fundamentos Legais"
              error={!!errors.fundamentosLegais}
              helperText={errors.fundamentosLegais || "Cite a legislação, jurisprudência e doutrina aplicáveis"}
              placeholder="Art. X da Lei nº..., Súmula..., Precedente..."
              minHeight={250}
              readOnly={readonly}
            />
          </Box>
        );

      case 2:
        return (
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <Typography variant="h6" gutterBottom>
                Pedidos
              </Typography>
            </Grid>
            
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Pedido Principal"
                multiline
                rows={4}
                value={defesa.pedidoPrincipal}
                onChange={(e) => setDefesa(prev => ({ ...prev, pedidoPrincipal: e.target.value }))}
                error={!!errors.pedidoPrincipal}
                helperText={errors.pedidoPrincipal || "Ex: Absolvição, Arquivamento, etc."}
                disabled={readonly}
              />
            </Grid>
            
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Pedido Subsidiário (Opcional)"
                multiline
                rows={3}
                value={defesa.pedidoSubsidiario}
                onChange={(e) => setDefesa(prev => ({ ...prev, pedidoSubsidiario: e.target.value }))}
                helperText="Pedido alternativo caso o principal não seja acolhido"
                disabled={readonly}
              />
            </Grid>
          </Grid>
        );

      case 3:
        return (
          <Box>
            <Typography variant="h6" gutterBottom>
              Provas e Testemunhas
            </Typography>
            
            <FormControlLabel
              control={
                <Checkbox
                  checked={defesa.solicitouProducaoProvas}
                  onChange={(e) => setDefesa(prev => ({ 
                    ...prev, 
                    solicitouProducaoProvas: e.target.checked 
                  }))}
                  disabled={readonly}
                />
              }
              label="Solicitar produção de provas"
            />
            
            {defesa.solicitouProducaoProvas && (
              <TextField
                fullWidth
                label="Rol de Testemunhas"
                multiline
                rows={6}
                value={defesa.rolTestemunhas}
                onChange={(e) => setDefesa(prev => ({ ...prev, rolTestemunhas: e.target.value }))}
                error={!!errors.rolTestemunhas}
                helperText={errors.rolTestemunhas || "Liste as testemunhas com nome, qualificação e objeto do depoimento"}
                placeholder="1. Nome completo, CPF, profissão, endereço - Objeto do depoimento"
                sx={{ mt: 2 }}
                disabled={readonly}
              />
            )}
          </Box>
        );

      case 4:
        return (
          <Box>
            <Typography variant="h6" gutterBottom>
              Documentos Anexos
            </Typography>
            
            {!readonly && (
              <FileUpload
                onFileUpload={handleFileUpload}
                accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                multiple
                maxSize={10 * 1024 * 1024} // 10MB
              />
            )}
            
            {defesa.anexos.length > 0 && (
              <List sx={{ mt: 2 }}>
                {defesa.anexos.map((anexo, index) => (
                  <React.Fragment key={index}>
                    <ListItem>
                      <ListItemText
                        primary={anexo.nomeArquivo}
                        secondary={`${(anexo.tamanhoArquivo / 1024 / 1024).toFixed(2)} MB${
                          anexo.descricao ? ` - ${anexo.descricao}` : ''
                        }`}
                      />
                      <ListItemSecondaryAction>
                        {anexo.caminhoArquivo && (
                          <>
                            <IconButton onClick={() => window.open(anexo.caminhoArquivo)}>
                              <Visibility />
                            </IconButton>
                            <IconButton onClick={() => window.open(anexo.caminhoArquivo)}>
                              <Download />
                            </IconButton>
                          </>
                        )}
                        {!readonly && (
                          <IconButton onClick={() => removeAnexo(index)} color="error">
                            <Delete />
                          </IconButton>
                        )}
                      </ListItemSecondaryAction>
                    </ListItem>
                    {index < defesa.anexos.length - 1 && <Divider />}
                  </React.Fragment>
                ))}
              </List>
            )}
          </Box>
        );

      case 5:
        return (
          <Box>
            <Typography variant="h6" gutterBottom>
              Revisão da Defesa
            </Typography>
            
            <Alert severity="info" sx={{ mb: 3 }}>
              Revise cuidadosamente todos os dados antes de apresentar a defesa. 
              Após a apresentação, não será possível fazer alterações.
            </Alert>

            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <Card variant="outlined">
                  <CardContent>
                    <Typography variant="subtitle2" color="primary">
                      Status do Prazo
                    </Typography>
                    <Chip 
                      label={prazoInfo?.vencido ? 'Vencido' : 'No Prazo'}
                      color={prazoInfo?.vencido ? 'error' : 'success'}
                      icon={prazoInfo?.vencido ? <Warning /> : <CheckCircle />}
                    />
                  </CardContent>
                </Card>
              </Grid>
              
              <Grid item xs={12} sm={6}>
                <Card variant="outlined">
                  <CardContent>
                    <Typography variant="subtitle2" color="primary">
                      Anexos
                    </Typography>
                    <Typography variant="body2">
                      {defesa.anexos.length} documento(s) anexado(s)
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
              
              <Grid item xs={12}>
                <Card variant="outlined">
                  <CardContent>
                    <Typography variant="subtitle2" color="primary">
                      Produção de Provas
                    </Typography>
                    <Typography variant="body2">
                      {defesa.solicitouProducaoProvas ? 'Solicitada' : 'Não solicitada'}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
            </Grid>
          </Box>
        );

      default:
        return null;
    }
  };

  if (loading) {
    return <LinearProgress />;
  }

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        {readonly ? 'Visualizar Defesa' : defesa.id ? 'Editar Defesa' : 'Apresentar Defesa'}
      </Typography>

      <Stepper activeStep={activeStep} sx={{ mb: 4 }}>
        {steps.map((label) => (
          <Step key={label}>
            <StepLabel>{label}</StepLabel>
          </Step>
        ))}
      </Stepper>

      <Card>
        <CardContent>
          {renderStepContent(activeStep)}
        </CardContent>
      </Card>

      <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 3 }}>
        <Button
          disabled={activeStep === 0}
          onClick={handleBack}
        >
          Voltar
        </Button>
        
        <Box>
          {!readonly && (
            <Button
              variant="outlined"
              onClick={handleSaveDraft}
              disabled={saving}
              startIcon={<Save />}
              sx={{ mr: 1 }}
            >
              {saving ? 'Salvando...' : 'Salvar Rascunho'}
            </Button>
          )}
          
          {activeStep === steps.length - 1 ? (
            !readonly && (
              <Button
                variant="contained"
                onClick={() => setConfirmDialog(true)}
                disabled={loading || !validateAllSteps()}
                startIcon={<Send />}
              >
                Apresentar Defesa
              </Button>
            )
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

      {/* Confirmation Dialog */}
      <Dialog open={confirmDialog} onClose={() => setConfirmDialog(false)}>
        <DialogTitle>Confirmar Apresentação</DialogTitle>
        <DialogContent>
          <Typography>
            Tem certeza que deseja apresentar esta defesa? Após a apresentação, 
            não será possível fazer alterações.
          </Typography>
          {prazoInfo?.vencido && (
            <Alert severity="warning" sx={{ mt: 2 }}>
              Atenção: Esta defesa será apresentada após o prazo limite.
            </Alert>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setConfirmDialog(false)}>
            Cancelar
          </Button>
          <Button 
            onClick={handleSubmit}
            variant="contained"
            disabled={loading}
          >
            Confirmar Apresentação
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};