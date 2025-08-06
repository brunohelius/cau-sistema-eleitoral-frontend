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
  IconButton,
  Stepper,
  Step,
  StepLabel,
  Switch,
  FormControlLabel,
} from '@mui/material';
import {
  ArrowBack,
  Save,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';

interface ElectionFormData {
  nome: string;
  descricao: string;
  tipoEleicao: 'Ordinaria' | 'Extraordinaria';
  dataInicio: Date | null;
  dataFim: Date | null;
  eleitoresAptos: number;
  observacoes: string;
  permitirVotoEletronico: boolean;
  publicarResultados: boolean;
}

const steps = ['Informações Básicas', 'Configurações', 'Confirmação'];

export const NewElection: React.FC = () => {
  const navigate = useNavigate();
  const [activeStep, setActiveStep] = useState(0);
  const [formData, setFormData] = useState<ElectionFormData>({
    nome: '',
    descricao: '',
    tipoEleicao: 'Ordinaria',
    dataInicio: null,
    dataFim: null,
    eleitoresAptos: 0,
    observacoes: '',
    permitirVotoEletronico: true,
    publicarResultados: false,
  });

  const handleNext = () => {
    setActiveStep((prevActiveStep) => prevActiveStep + 1);
  };

  const handleBack = () => {
    setActiveStep((prevActiveStep) => prevActiveStep - 1);
  };

  const handleSubmit = () => {
    console.log('Creating election:', formData);
    // Here you would make the API call to create the election
    navigate('/eleicoes');
  };

  const canProceed = (step: number) => {
    switch (step) {
      case 0:
        return formData.nome && formData.dataInicio && formData.dataFim;
      case 1:
        return true;
      default:
        return true;
    }
  };

  return (
    <Box sx={{ p: 3 }}>
      {/* Header */}
      <Box sx={{ mb: 3, display: 'flex', alignItems: 'center', gap: 2 }}>
        <IconButton onClick={() => navigate('/eleicoes')}>
          <ArrowBack />
        </IconButton>
        <Typography variant="h4">
          Nova Eleição
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
                  Informações Básicas da Eleição
                </Typography>
              </Grid>
              
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Nome da Eleição"
                  value={formData.nome}
                  onChange={(e) => setFormData({ ...formData, nome: e.target.value })}
                  required
                  placeholder="Ex: Eleições CAU/BR 2024"
                />
              </Grid>
              
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Descrição"
                  multiline
                  rows={3}
                  value={formData.descricao}
                  onChange={(e) => setFormData({ ...formData, descricao: e.target.value })}
                  placeholder="Descreva o propósito e contexto desta eleição"
                />
              </Grid>
              
              <Grid item xs={12} md={6}>
                <FormControl fullWidth required>
                  <InputLabel>Tipo de Eleição</InputLabel>
                  <Select
                    value={formData.tipoEleicao}
                    label="Tipo de Eleição"
                    onChange={(e) => setFormData({ ...formData, tipoEleicao: e.target.value as any })}
                  >
                    <MenuItem value="Ordinaria">Ordinária</MenuItem>
                    <MenuItem value="Extraordinaria">Extraordinária</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Número de Eleitores Aptos"
                  type="number"
                  value={formData.eleitoresAptos}
                  onChange={(e) => setFormData({ ...formData, eleitoresAptos: parseInt(e.target.value) || 0 })}
                  InputProps={{ inputProps: { min: 0 } }}
                />
              </Grid>
              
              <Grid item xs={12} md={6}>
                <DatePicker
                  label="Data de Início"
                  value={formData.dataInicio}
                  onChange={(date) => setFormData({ ...formData, dataInicio: date })}
                  slotProps={{ textField: { fullWidth: true, required: true } }}
                />
              </Grid>
              
              <Grid item xs={12} md={6}>
                <DatePicker
                  label="Data de Término"
                  value={formData.dataFim}
                  onChange={(date) => setFormData({ ...formData, dataFim: date })}
                  slotProps={{ textField: { fullWidth: true, required: true } }}
                />
              </Grid>
            </Grid>
          )}

          {activeStep === 1 && (
            <Grid container spacing={3}>
              <Grid item xs={12}>
                <Typography variant="h6" gutterBottom>
                  Configurações da Eleição
                </Typography>
              </Grid>
              
              <Grid item xs={12}>
                <FormControlLabel
                  control={
                    <Switch
                      checked={formData.permitirVotoEletronico}
                      onChange={(e) => setFormData({ ...formData, permitirVotoEletronico: e.target.checked })}
                    />
                  }
                  label="Permitir Voto Eletrônico"
                />
                <Typography variant="body2" color="text.secondary">
                  Os eleitores poderão votar através do sistema online
                </Typography>
              </Grid>
              
              <Grid item xs={12}>
                <FormControlLabel
                  control={
                    <Switch
                      checked={formData.publicarResultados}
                      onChange={(e) => setFormData({ ...formData, publicarResultados: e.target.checked })}
                    />
                  }
                  label="Publicar Resultados Automaticamente"
                />
                <Typography variant="body2" color="text.secondary">
                  Os resultados serão publicados automaticamente após o término da votação
                </Typography>
              </Grid>
              
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Observações"
                  multiline
                  rows={4}
                  value={formData.observacoes}
                  onChange={(e) => setFormData({ ...formData, observacoes: e.target.value })}
                  placeholder="Informações adicionais sobre esta eleição"
                />
              </Grid>
            </Grid>
          )}

          {activeStep === 2 && (
            <Grid container spacing={3}>
              <Grid item xs={12}>
                <Typography variant="h6" gutterBottom>
                  Confirmação dos Dados
                </Typography>
              </Grid>
              
              <Grid item xs={12} md={6}>
                <Card variant="outlined">
                  <CardContent>
                    <Typography variant="h6" gutterBottom>
                      Informações Básicas
                    </Typography>
                    <Typography><strong>Nome:</strong> {formData.nome}</Typography>
                    <Typography><strong>Tipo:</strong> {formData.tipoEleicao}</Typography>
                    <Typography><strong>Eleitores Aptos:</strong> {formData.eleitoresAptos.toLocaleString()}</Typography>
                    <Typography>
                      <strong>Período:</strong> {' '}
                      {formData.dataInicio?.toLocaleDateString('pt-BR')} até {' '}
                      {formData.dataFim?.toLocaleDateString('pt-BR')}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
              
              <Grid item xs={12} md={6}>
                <Card variant="outlined">
                  <CardContent>
                    <Typography variant="h6" gutterBottom>
                      Configurações
                    </Typography>
                    <Typography>
                      <strong>Voto Eletrônico:</strong> {formData.permitirVotoEletronico ? 'Sim' : 'Não'}
                    </Typography>
                    <Typography>
                      <strong>Publicação Automática:</strong> {formData.publicarResultados ? 'Sim' : 'Não'}
                    </Typography>
                    {formData.observacoes && (
                      <Box sx={{ mt: 1 }}>
                        <Typography variant="body2" color="text.secondary">
                          <strong>Observações:</strong>
                        </Typography>
                        <Typography variant="body2">
                          {formData.observacoes}
                        </Typography>
                      </Box>
                    )}
                  </CardContent>
                </Card>
              </Grid>
              
              {formData.descricao && (
                <Grid item xs={12}>
                  <Card variant="outlined">
                    <CardContent>
                      <Typography variant="h6" gutterBottom>
                        Descrição
                      </Typography>
                      <Typography variant="body1">
                        {formData.descricao}
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>
              )}
            </Grid>
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
            >
              Criar Eleição
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

export default NewElection;