import React, { useState } from 'react';
import {
  Container,
  Typography,
  Box,
  Paper,
  TextField,
  Button,
  Grid,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Alert,
  Card,
  CardContent,
  FormControlLabel,
  Checkbox,
  Stepper,
  Step,
  StepLabel,
  CircularProgress
} from '@mui/material';
import {
  Report as ReportIcon,
  Send as SendIcon,
  Person as PersonIcon,
  Description as DescriptionIcon,
  Attachment as AttachmentIcon,
  Security as SecurityIcon
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useQuery, useMutation } from '@tanstack/react-query';
import { useSnackbar } from 'notistack';
import { eleicaoService } from '../services/api';
import { 
  denunciaService,
  CriarDenunciaRequest,
  TipoDenuncia,
  TIPOS_DENUNCIA
} from '../services/api/denunciaService';

const steps = ['Identificação', 'Descrição da Denúncia', 'Documentos', 'Confirmação'];

const tiposDenunciaMap = {
  [TIPOS_DENUNCIA.IRREGULARIDADE_CHAPA]: 'Irregularidade em Chapa',
  [TIPOS_DENUNCIA.IRREGULARIDADE_PROCESSO]: 'Irregularidade no Processo',
  [TIPOS_DENUNCIA.CONDUTA_ANTIETICA]: 'Conduta Antiética',
  [TIPOS_DENUNCIA.USO_INDEVIDO_RECURSOS]: 'Uso Indevido de Recursos',
  [TIPOS_DENUNCIA.PROPAGANDA_IRREGULAR]: 'Propaganda Irregular',
  [TIPOS_DENUNCIA.OUTROS]: 'Outros'
};

interface DadosDenuncia {
  // Identificação do denunciante
  denuncianteNome: string;
  denuncianteEmail: string;
  denuncianteCpf: string;
  denuncianteTelefone: string;
  anonima: boolean;
  
  // Dados da denúncia
  tipoId: number;
  eleicaoId: number;
  chapaEnvolvida: string;
  assunto: string;
  descricao: string;
  
  // Documentos
  anexos: File[];
  
  // Confirmação
  aceiteTermos: boolean;
  declaracaoVerdade: boolean;
}

export const DenunciasPage: React.FC = () => {
  const navigate = useNavigate();
  const { enqueueSnackbar } = useSnackbar();
  const [activeStep, setActiveStep] = useState(0);
  const [denunciaData, setDenunciaData] = useState<DadosDenuncia>({
    denuncianteNome: '',
    denuncianteEmail: '',
    denuncianteTelefone: '',
    denuncianteCpf: '',
    anonima: false,
    tipoId: 0,
    eleicaoId: 0,
    chapaEnvolvida: '',
    assunto: '',
    descricao: '',
    anexos: [],
    aceiteTermos: false,
    declaracaoVerdade: false
  });

  // Queries
  const { data: eleicoes = [] } = useQuery({
    queryKey: ['eleicoes-ativas'],
    queryFn: () => eleicaoService.getAtivas()
  });

  const { data: tiposDenuncia = [] } = useQuery({
    queryKey: ['tipos-denuncia'],
    queryFn: denunciaService.getTiposDenuncia
  });

  // Mutations
  const criarDenunciaMutation = useMutation({
    mutationFn: (dados: CriarDenunciaRequest) => denunciaService.criarDenuncia(dados),
    onSuccess: (denuncia) => {
      enqueueSnackbar(
        `Denúncia registrada com sucesso! Protocolo: ${denuncia.numeroProtocolo}`,
        { variant: 'success' }
      );
      navigate('/denuncias');
    },
    onError: () => {
      enqueueSnackbar('Erro ao registrar denúncia. Tente novamente.', { variant: 'error' });
    }
  });

  const handleNext = () => {
    setActiveStep(activeStep + 1);
  };

  const handleBack = () => {
    setActiveStep(activeStep - 1);
  };

  const handleSubmit = async () => {
    try {
      const dadosEnvio: CriarDenunciaRequest = {
        denuncianteNome: denunciaData.anonima ? undefined : denunciaData.denuncianteNome,
        denuncianteEmail: denunciaData.anonima ? undefined : denunciaData.denuncianteEmail,
        denuncianteCpf: denunciaData.anonima ? undefined : denunciaData.denuncianteCpf,
        denuncianteTelefone: denunciaData.anonima ? undefined : denunciaData.denuncianteTelefone,
        anonima: denunciaData.anonima,
        tipoId: denunciaData.tipoId,
        eleicaoId: denunciaData.eleicaoId || undefined,
        chapaEnvolvida: denunciaData.chapaEnvolvida || undefined,
        assunto: denunciaData.assunto,
        descricao: denunciaData.descricao,
        anexos: denunciaData.anexos,
        declaracaoVerdade: denunciaData.declaracaoVerdade,
        aceiteTermos: denunciaData.aceiteTermos
      };

      criarDenunciaMutation.mutate(dadosEnvio);
    } catch (error) {
      enqueueSnackbar('Erro ao processar denúncia', { variant: 'error' });
    }
  };

  const updateField = (field: keyof DadosDenuncia, value: any) => {
    setDenunciaData(prev => ({ ...prev, [field]: value }));
  };

  const renderStepContent = (step: number) => {
    switch (step) {
      case 0:
        return (
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <Typography variant="h6" gutterBottom>
                Identificação do Denunciante
              </Typography>
              <FormControlLabel
                control={
                  <Checkbox
                    checked={denunciaData.anonima}
                    onChange={(e) => updateField('anonima', e.target.checked)}
                  />
                }
                label="Denúncia anônima (não fornecer dados pessoais)"
              />
            </Grid>
            
            {!denunciaData.anonima && (
              <>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Nome Completo"
                    value={denunciaData.denuncianteNome}
                    onChange={(e) => updateField('denuncianteNome', e.target.value)}
                    required
                  />
                </Grid>
                
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Email"
                    type="email"
                    value={denunciaData.denuncianteEmail}
                    onChange={(e) => updateField('denuncianteEmail', e.target.value)}
                    required
                  />
                </Grid>
                
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="CPF"
                    value={denunciaData.denuncianteCpf}
                    onChange={(e) => updateField('denuncianteCpf', e.target.value)}
                    required
                  />
                </Grid>
                
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Telefone"
                    value={denunciaData.denuncianteTelefone}
                    onChange={(e) => updateField('denuncianteTelefone', e.target.value)}
                  />
                </Grid>
              </>
            )}
            
            {denunciaData.anonima && (
              <Grid item xs={12}>
                <Alert severity="info">
                  <Typography variant="body2">
                    <strong>Denúncia Anônima</strong>
                    <br />
                    Sua identidade será mantida em sigilo absoluto. Para acompanhar o processo,
                    um código de protocolo será gerado e deve ser guardado com segurança.
                  </Typography>
                </Alert>
              </Grid>
            )}
          </Grid>
        );

      case 1:
        return (
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <Typography variant="h6" gutterBottom>
                Descrição da Denúncia
              </Typography>
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth required>
                <InputLabel>Tipo de Denúncia</InputLabel>
                <Select
                  value={denunciaData.tipoId}
                  label="Tipo de Denúncia"
                  onChange={(e) => updateField('tipoId', e.target.value)}
                >
                  {tiposDenuncia.map((tipo) => (
                    <MenuItem key={tipo.id} value={tipo.id}>
                      {tipo.descricao}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth>
                <InputLabel>Eleição Relacionada</InputLabel>
                <Select
                  value={denunciaData.eleicaoId}
                  label="Eleição Relacionada"
                  onChange={(e) => updateField('eleicaoId', Number(e.target.value))}
                >
                  <MenuItem value={0}>Não se aplica</MenuItem>
                  {eleicoes.map((eleicao) => (
                    <MenuItem key={eleicao.id} value={eleicao.id}>
                      {eleicao.titulo} - {eleicao.ano}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Chapa ou Profissional Envolvido"
                value={denunciaData.chapaEnvolvida}
                onChange={(e) => updateField('chapaEnvolvida', e.target.value)}
                placeholder="Nome da chapa, profissional ou entidade envolvida"
              />
            </Grid>
            
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Assunto da Denúncia"
                value={denunciaData.assunto}
                onChange={(e) => updateField('assunto', e.target.value)}
                placeholder="Resumo em uma linha do que está sendo denunciado"
                required
              />
            </Grid>
            
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Descrição Detalhada"
                value={denunciaData.descricao}
                onChange={(e) => updateField('descricao', e.target.value)}
                multiline
                rows={6}
                placeholder="Descreva detalhadamente os fatos, incluindo datas, locais, pessoas envolvidas e qualquer informação relevante..."
                required
              />
            </Grid>
          </Grid>
        );

      case 2:
        return (
          <Box>
            <Typography variant="h6" gutterBottom>
              Documentos Comprobatórios
            </Typography>
            
            <Alert severity="info" sx={{ mb: 3 }}>
              <Typography variant="body2">
                <strong>Documentos Aceitos:</strong>
                <br />• PDFs, imagens (JPG, PNG)
                <br />• Tamanho máximo: 10MB por arquivo
                <br />• Máximo: 5 arquivos
              </Typography>
            </Alert>
            
            <Box sx={{ mb: 3 }}>
              <Button
                variant="outlined"
                startIcon={<AttachmentIcon />}
                component="label"
                disabled
              >
                Adicionar Documentos
                <input type="file" hidden multiple accept=".pdf,.jpg,.jpeg,.png" />
              </Button>
            </Box>
            
            <Typography variant="body2" color="textSecondary">
              🚧 Em desenvolvimento: Sistema de upload de documentos comprobatórios
            </Typography>
          </Box>
        );

      case 3:
        return (
          <Box>
            <Typography variant="h6" gutterBottom>
              Confirmação e Envio
            </Typography>
            
            <Alert severity="warning" sx={{ mb: 3 }}>
              <Typography variant="body2">
                <strong>Atenção:</strong> Denúncias falsas constituem crime e podem resultar 
                em responsabilização civil e criminal. Certifique-se de que todas as informações 
                fornecidas são verdadeiras.
              </Typography>
            </Alert>
            
            <Card variant="outlined" sx={{ mb: 3 }}>
              <CardContent>
                <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
                  Resumo da Denúncia
                </Typography>
                <Typography><strong>Tipo:</strong> {
                  tiposDenuncia.find(t => t.id === denunciaData.tipoId)?.descricao
                }</Typography>
                <Typography><strong>Assunto:</strong> {denunciaData.assunto}</Typography>
                <Typography><strong>Denunciante:</strong> {
                  denunciaData.anonima ? 'Anônimo' : denunciaData.denuncianteNome
                }</Typography>
                {denunciaData.chapaEnvolvida && (
                  <Typography><strong>Envolvido:</strong> {denunciaData.chapaEnvolvida}</Typography>
                )}
              </CardContent>
            </Card>
            
            <Box sx={{ mb: 2 }}>
              <FormControlLabel
                control={
                  <Checkbox
                    checked={denunciaData.declaracaoVerdade}
                    onChange={(e) => updateField('declaracaoVerdade', e.target.checked)}
                  />
                }
                label="Declaro que as informações fornecidas são verdadeiras"
              />
            </Box>
            
            <Box sx={{ mb: 2 }}>
              <FormControlLabel
                control={
                  <Checkbox
                    checked={denunciaData.aceiteTermos}
                    onChange={(e) => updateField('aceiteTermos', e.target.checked)}
                  />
                }
                label="Aceito os termos de uso e política de privacidade"
              />
            </Box>
          </Box>
        );

      default:
        return 'Etapa desconhecida';
    }
  };

  const isStepValid = (step: number) => {
    switch (step) {
      case 0:
        return denunciaData.anonima || 
               (denunciaData.denuncianteNome && denunciaData.denuncianteEmail);
      case 1:
        return denunciaData.tipoId && denunciaData.assunto && denunciaData.descricao;
      case 2:
        return true; // Documentos são opcionais
      case 3:
        return denunciaData.declaracaoVerdade && denunciaData.aceiteTermos;
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
            backgroundColor: 'error.main',
            borderRadius: '50%',
            p: 2,
            mb: 2,
            display: 'inline-flex'
          }}
        >
          <ReportIcon sx={{ fontSize: 40, color: 'white' }} />
        </Box>
        <Typography component="h1" variant="h4" fontWeight="bold">
          Sistema de Denúncias
        </Typography>
        <Typography variant="h6" color="textSecondary">
          Canal oficial para denúncias relacionadas aos processos eleitorais do CAU
        </Typography>
      </Box>

      {/* Informações Importantes */}
      <Alert severity="info" sx={{ mb: 4 }}>
        <Typography variant="body1" gutterBottom>
          <strong>Importante:</strong>
        </Typography>
        <Typography variant="body2">
          • Este canal é destinado exclusivamente a denúncias relacionadas aos processos eleitorais
          <br />• Todas as denúncias são analisadas pela Comissão Eleitoral
          <br />• O sigilo do denunciante é garantido quando solicitado
          <br />• Denúncias falsas podem resultar em responsabilização legal
        </Typography>
      </Alert>

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
                color="error"
                startIcon={criarDenunciaMutation.isLoading ? <CircularProgress size={20} color="inherit" /> : <SendIcon />}
                onClick={handleSubmit}
                disabled={!isStepValid(activeStep) || criarDenunciaMutation.isLoading}
              >
                {criarDenunciaMutation.isLoading ? 'Enviando...' : 'Enviar Denúncia'}
              </Button>
            )}
          </Box>
        </Box>
      </Paper>

      {/* Footer Informativo */}
      <Box sx={{ mt: 4 }}>
        <Paper sx={{ p: 3, bgcolor: 'grey.50' }}>
          <Box display="flex" alignItems="center" mb={2}>
            <SecurityIcon sx={{ mr: 1, color: 'primary.main' }} />
            <Typography variant="h6" fontWeight="bold">
              Segurança e Privacidade
            </Typography>
          </Box>
          <Typography variant="body2" color="textSecondary">
            O CAU garante total sigilo e segurança no processamento de denúncias. 
            Todas as informações são tratadas de acordo com a LGPD e regulamentos internos. 
            Para dúvidas sobre o processo, entre em contato com a Comissão Eleitoral.
          </Typography>
        </Paper>
      </Box>
    </Container>
  );
};