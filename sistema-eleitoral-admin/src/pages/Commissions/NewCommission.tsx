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
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Chip,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Checkbox,
  FormControlLabel,
  Divider,
  Alert,
} from '@mui/material';
import {
  ArrowBack,
  Add,
  Delete,
  Save,
  Person,
  CheckCircle,
  Edit,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';

interface CommissionMember {
  id: string;
  nome: string;
  cpf: string;
  email: string;
  telefone: string;
  cargo: 'Presidente' | 'Vice-Presidente' | 'Secretario' | 'Membro Titular' | 'Membro Suplente';
  cauNumero: string;
  observacoes?: string;
}

interface CommissionFormData {
  nome: string;
  tipo: 'Eleitoral' | 'Disciplinar' | 'Recursal' | 'Especial';
  descricao: string;
  eleicaoId?: string;
  uf: string;
  regional: string;
  dataConstituicao: Date | null;
  mandato: {
    inicio: Date | null;
    fim: Date | null;
    duracao: string;
  };
  competencias: string[];
  membros: CommissionMember[];
  observacoes?: string;
}

const steps = ['Informações Básicas', 'Competências', 'Membros', 'Confirmação'];

const tiposComissao = [
  { value: 'Eleitoral', label: 'Comissão Eleitoral' },
  { value: 'Disciplinar', label: 'Comissão Disciplinar' },
  { value: 'Recursal', label: 'Comissão Recursal' },
  { value: 'Especial', label: 'Comissão Especial' },
];

const ufs = [
  'AC', 'AL', 'AP', 'AM', 'BA', 'CE', 'DF', 'ES', 'GO', 'MA',
  'MT', 'MS', 'MG', 'PA', 'PB', 'PR', 'PE', 'PI', 'RJ', 'RN',
  'RS', 'RO', 'RR', 'SC', 'SP', 'SE', 'TO'
];

const regionais = [
  'Nacional',
  'Regional Norte',
  'Regional Nordeste',
  'Regional Centro-Oeste',
  'Regional Sudeste',
  'Regional Sul',
];

const mockElections = [
  { id: '1', nome: 'Eleições CAU/BR 2024' },
  { id: '2', nome: 'Eleições CAU/SP 2024' },
];

const competenciasPadrao = {
  Eleitoral: [
    'Organizar e supervisionar o processo eleitoral',
    'Analisar e validar registros de chapas',
    'Julgar impugnações em primeira instância',
    'Garantir a regularidade do processo eleitoral',
    'Elaborar relatórios de atividades',
    'Promover a transparência do processo',
  ],
  Disciplinar: [
    'Apurar infrações éticas e disciplinares',
    'Instaurar processos disciplinares',
    'Aplicar sanções disciplinares',
    'Acompanhar cumprimento de penas',
    'Analisar recursos em primeira instância',
  ],
  Recursal: [
    'Analisar recursos de decisões disciplinares',
    'Revisar decisões de primeira instância',
    'Julgar recursos eleitorais',
    'Garantir devido processo legal',
    'Emitir pareceres técnicos',
  ],
  Especial: [
    'Executar atividades específicas conforme ato de constituição',
    'Analisar questões técnicas especializadas',
    'Elaborar estudos e propostas',
    'Assessorar a Presidência em temas específicos',
  ],
};

const cargos = [
  'Presidente',
  'Vice-Presidente',
  'Secretario',
  'Membro Titular',
  'Membro Suplente',
];

export const NewCommission: React.FC = () => {
  const navigate = useNavigate();
  const [activeStep, setActiveStep] = useState(0);
  const [openMemberDialog, setOpenMemberDialog] = useState(false);
  const [editingMember, setEditingMember] = useState<CommissionMember | null>(null);
  const [memberForm, setMemberForm] = useState({
    nome: '',
    cpf: '',
    email: '',
    telefone: '',
    cargo: 'Membro Titular' as CommissionMember['cargo'],
    cauNumero: '',
    observacoes: '',
  });

  const [formData, setFormData] = useState<CommissionFormData>({
    nome: '',
    tipo: 'Eleitoral',
    descricao: '',
    eleicaoId: '',
    uf: 'DF',
    regional: 'Nacional',
    dataConstituicao: new Date(),
    mandato: {
      inicio: new Date(),
      fim: null,
      duracao: '1 ano',
    },
    competencias: [],
    membros: [],
    observacoes: '',
  });

  const [selectedCompetencias, setSelectedCompetencias] = useState<string[]>([]);

  // Update competencias when tipo changes
  React.useEffect(() => {
    const defaultCompetencias = competenciasPadrao[formData.tipo] || [];
    setSelectedCompetencias(defaultCompetencias);
    setFormData({ ...formData, competencias: defaultCompetencias });
  }, [formData.tipo]);

  const handleNext = () => {
    setActiveStep((prevActiveStep) => prevActiveStep + 1);
  };

  const handleBack = () => {
    setActiveStep((prevActiveStep) => prevActiveStep - 1);
  };

  const handleOpenMemberDialog = (member?: CommissionMember) => {
    if (member) {
      setEditingMember(member);
      setMemberForm({
        nome: member.nome,
        cpf: member.cpf,
        email: member.email,
        telefone: member.telefone,
        cargo: member.cargo,
        cauNumero: member.cauNumero,
        observacoes: member.observacoes || '',
      });
    } else {
      setEditingMember(null);
      setMemberForm({
        nome: '',
        cpf: '',
        email: '',
        telefone: '',
        cargo: 'Membro Titular',
        cauNumero: '',
        observacoes: '',
      });
    }
    setOpenMemberDialog(true);
  };

  const handleCloseMemberDialog = () => {
    setOpenMemberDialog(false);
    setEditingMember(null);
  };

  const handleSaveMember = () => {
    if (editingMember) {
      // Update existing member
      setFormData({
        ...formData,
        membros: formData.membros.map(m => 
          m.id === editingMember.id 
            ? { ...memberForm, id: m.id }
            : m
        ),
      });
    } else {
      // Add new member
      const newMember: CommissionMember = {
        ...memberForm,
        id: Date.now().toString(),
      };
      setFormData({
        ...formData,
        membros: [...formData.membros, newMember],
      });
    }
    handleCloseMemberDialog();
  };

  const handleRemoveMember = (memberId: string) => {
    setFormData({
      ...formData,
      membros: formData.membros.filter(m => m.id !== memberId),
    });
  };

  const handleToggleCompetencia = (competencia: string) => {
    const newCompetencias = selectedCompetencias.includes(competencia)
      ? selectedCompetencias.filter(c => c !== competencia)
      : [...selectedCompetencias, competencia];
    
    setSelectedCompetencias(newCompetencias);
    setFormData({ ...formData, competencias: newCompetencias });
  };

  const handleSubmit = () => {
    console.log('Submitting commission:', formData);
    // Here you would make the API call to create the commission
    navigate('/comissoes');
  };

  const canProceed = (step: number) => {
    switch (step) {
      case 0:
        return formData.nome && formData.tipo && formData.descricao && formData.dataConstituicao;
      case 1:
        return formData.competencias.length > 0;
      case 2:
        return formData.membros.length >= 3; // Mínimo 3 membros
      default:
        return true;
    }
  };

  const getCargoColor = (cargo: string) => {
    switch (cargo) {
      case 'Presidente': return 'error';
      case 'Vice-Presidente': return 'warning';
      case 'Secretario': return 'info';
      case 'Membro Titular': return 'primary';
      case 'Membro Suplente': return 'secondary';
      default: return 'default';
    }
  };

  const getTipoColor = (tipo: string) => {
    switch (tipo) {
      case 'Eleitoral': return 'primary';
      case 'Disciplinar': return 'error';
      case 'Recursal': return 'warning';
      case 'Especial': return 'info';
      default: return 'default';
    }
  };

  // Calcular duração do mandato
  React.useEffect(() => {
    if (formData.mandato.inicio && formData.mandato.fim) {
      const diffTime = formData.mandato.fim.getTime() - formData.mandato.inicio.getTime();
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      const years = Math.floor(diffDays / 365);
      const months = Math.floor((diffDays % 365) / 30);
      const days = diffDays % 30;
      
      let duracao = '';
      if (years > 0) duracao += `${years} ano${years > 1 ? 's' : ''}`;
      if (months > 0) duracao += `${duracao ? ' e ' : ''}${months} mês${months > 1 ? 'es' : ''}`;
      if (days > 0 && !years) duracao += `${duracao ? ' e ' : ''}${days} dia${days > 1 ? 's' : ''}`;
      
      setFormData({ ...formData, mandato: { ...formData.mandato, duracao: duracao || '0 dias' } });
    }
  }, [formData.mandato.inicio, formData.mandato.fim]);

  return (
    <Box sx={{ p: 3 }}>
      {/* Header */}
      <Box sx={{ mb: 3, display: 'flex', alignItems: 'center', gap: 2 }}>
        <IconButton onClick={() => navigate('/comissoes')}>
          <ArrowBack />
        </IconButton>
        <Typography variant="h4">
          Nova Comissão
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
                  Informações Básicas da Comissão
                </Typography>
              </Grid>
              
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Nome da Comissão"
                  value={formData.nome}
                  onChange={(e) => setFormData({ ...formData, nome: e.target.value })}
                  required
                  placeholder="Ex: Comissão Eleitoral Central"
                />
              </Grid>
              
              <Grid item xs={12} md={6}>
                <FormControl fullWidth required>
                  <InputLabel>Tipo de Comissão</InputLabel>
                  <Select
                    value={formData.tipo}
                    label="Tipo de Comissão"
                    onChange={(e) => setFormData({ ...formData, tipo: e.target.value as any })}
                  >
                    {tiposComissao.map((tipo) => (
                      <MenuItem key={tipo.value} value={tipo.value}>
                        {tipo.label}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  multiline
                  rows={4}
                  label="Descrição"
                  value={formData.descricao}
                  onChange={(e) => setFormData({ ...formData, descricao: e.target.value })}
                  required
                  placeholder="Descreva os objetivos e finalidade desta comissão..."
                />
              </Grid>
              
              <Grid item xs={12} md={4}>
                <FormControl fullWidth>
                  <InputLabel>UF</InputLabel>
                  <Select
                    value={formData.uf}
                    label="UF"
                    onChange={(e) => setFormData({ ...formData, uf: e.target.value })}
                  >
                    {ufs.map((uf) => (
                      <MenuItem key={uf} value={uf}>
                        {uf}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              
              <Grid item xs={12} md={4}>
                <FormControl fullWidth>
                  <InputLabel>Regional</InputLabel>
                  <Select
                    value={formData.regional}
                    label="Regional"
                    onChange={(e) => setFormData({ ...formData, regional: e.target.value })}
                  >
                    {regionais.map((regional) => (
                      <MenuItem key={regional} value={regional}>
                        {regional}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              
              {formData.tipo === 'Eleitoral' && (
                <Grid item xs={12} md={4}>
                  <FormControl fullWidth>
                    <InputLabel>Eleição (opcional)</InputLabel>
                    <Select
                      value={formData.eleicaoId}
                      label="Eleição (opcional)"
                      onChange={(e) => setFormData({ ...formData, eleicaoId: e.target.value })}
                    >
                      <MenuItem value="">
                        <em>Selecione uma eleição</em>
                      </MenuItem>
                      {mockElections.map((election) => (
                        <MenuItem key={election.id} value={election.id}>
                          {election.nome}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>
              )}
              
              <Grid item xs={12}>
                <Typography variant="h6" gutterBottom sx={{ mt: 2 }}>
                  Período do Mandato
                </Typography>
              </Grid>
              
              <Grid item xs={12} md={4}>
                <DatePicker
                  label="Data de Constituição"
                  value={formData.dataConstituicao}
                  onChange={(newValue) => {
                    setFormData({ 
                      ...formData, 
                      dataConstituicao: newValue,
                      mandato: { ...formData.mandato, inicio: newValue }
                    });
                  }}
                  slotProps={{ textField: { fullWidth: true, required: true } }}
                />
              </Grid>
              
              <Grid item xs={12} md={4}>
                <DatePicker
                  label="Início do Mandato"
                  value={formData.mandato.inicio}
                  onChange={(newValue) => setFormData({ 
                    ...formData, 
                    mandato: { ...formData.mandato, inicio: newValue }
                  })}
                  slotProps={{ textField: { fullWidth: true } }}
                />
              </Grid>
              
              <Grid item xs={12} md={4}>
                <DatePicker
                  label="Fim do Mandato"
                  value={formData.mandato.fim}
                  onChange={(newValue) => setFormData({ 
                    ...formData, 
                    mandato: { ...formData.mandato, fim: newValue }
                  })}
                  slotProps={{ textField: { fullWidth: true } }}
                  minDate={formData.mandato.inicio || undefined}
                />
              </Grid>
              
              {formData.mandato.duracao && (
                <Grid item xs={12}>
                  <Alert severity="info">
                    <strong>Duração do mandato:</strong> {formData.mandato.duracao}
                  </Alert>
                </Grid>
              )}
            </Grid>
          )}

          {activeStep === 1 && (
            <Box>
              <Typography variant="h6" gutterBottom>
                Competências da Comissão
              </Typography>
              
              <Typography variant="body2" color="text.secondary" paragraph>
                Selecione as competências que esta comissão terá. As competências padrão para {tiposComissao.find(t => t.value === formData.tipo)?.label.toLowerCase()} já estão selecionadas.
              </Typography>
              
              <List>
                {competenciasPadrao[formData.tipo]?.map((competencia, index) => (
                  <ListItem key={index}>
                    <ListItemIcon>
                      <FormControlLabel
                        control={
                          <Checkbox
                            checked={selectedCompetencias.includes(competencia)}
                            onChange={() => handleToggleCompetencia(competencia)}
                          />
                        }
                        label=""
                      />
                    </ListItemIcon>
                    <ListItemText 
                      primary={competencia}
                      secondary={`Competência ${index + 1}`}
                    />
                  </ListItem>
                ))}
              </List>
              
              <Divider sx={{ my: 3 }} />
              
              <Typography variant="subtitle1" gutterBottom>
                Competências Adicionais
              </Typography>
              
              <TextField
                fullWidth
                multiline
                rows={3}
                label="Outras Competências (opcional)"
                placeholder="Digite outras competências específicas, uma por linha..."
                helperText="Digite competências adicionais que não estão listadas acima"
              />
              
              <Alert severity="success" sx={{ mt: 2 }}>
                <strong>{selectedCompetencias.length} competência(s) selecionada(s)</strong>
              </Alert>
            </Box>
          )}

          {activeStep === 2 && (
            <Box>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                <Typography variant="h6">
                  Membros da Comissão
                </Typography>
                <Button
                  startIcon={<Add />}
                  variant="contained"
                  onClick={() => handleOpenMemberDialog()}
                >
                  Adicionar Membro
                </Button>
              </Box>
              
              <Alert severity="info" sx={{ mb: 3 }}>
                Uma comissão deve ter no mínimo 3 membros: Presidente, Vice-Presidente e Secretário.
              </Alert>

              {formData.membros.length > 0 ? (
                <TableContainer component={Paper}>
                  <Table>
                    <TableHead>
                      <TableRow>
                        <TableCell>Nome</TableCell>
                        <TableCell>Cargo</TableCell>
                        <TableCell>CAU</TableCell>
                        <TableCell>CPF</TableCell>
                        <TableCell>Email</TableCell>
                        <TableCell align="center">Ações</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {formData.membros.map((member) => (
                        <TableRow key={member.id}>
                          <TableCell>{member.nome}</TableCell>
                          <TableCell>
                            <Chip
                              label={member.cargo}
                              color={getCargoColor(member.cargo) as any}
                              size="small"
                            />
                          </TableCell>
                          <TableCell>{member.cauNumero}</TableCell>
                          <TableCell>{member.cpf}</TableCell>
                          <TableCell>{member.email}</TableCell>
                          <TableCell align="center">
                            <IconButton
                              size="small"
                              onClick={() => handleOpenMemberDialog(member)}
                            >
                              <Edit fontSize="small" />
                            </IconButton>
                            <IconButton
                              size="small"
                              color="error"
                              onClick={() => handleRemoveMember(member.id)}
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
                <Box sx={{ textAlign: 'center', py: 4 }}>
                  <Person sx={{ fontSize: 48, color: 'grey.400', mb: 2 }} />
                  <Typography variant="body1" color="text.secondary">
                    Nenhum membro adicionado ainda.
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Clique em "Adicionar Membro" para começar.
                  </Typography>
                </Box>
              )}
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
                        Informações da Comissão
                      </Typography>
                      <List dense>
                        <ListItem>
                          <ListItemText 
                            primary="Nome" 
                            secondary={formData.nome}
                          />
                        </ListItem>
                        <Divider />
                        <ListItem>
                          <ListItemText 
                            primary="Tipo" 
                            secondary={
                              <Chip
                                label={tiposComissao.find(t => t.value === formData.tipo)?.label}
                                color={getTipoColor(formData.tipo) as any}
                                size="small"
                              />
                            }
                          />
                        </ListItem>
                        <Divider />
                        <ListItem>
                          <ListItemText 
                            primary="Localização" 
                            secondary={`${formData.regional} - ${formData.uf}`}
                          />
                        </ListItem>
                        <Divider />
                        <ListItem>
                          <ListItemText 
                            primary="Período do Mandato" 
                            secondary={formData.mandato.duracao}
                          />
                        </ListItem>
                      </List>
                    </CardContent>
                  </Card>
                </Grid>
                
                <Grid item xs={12} md={6}>
                  <Card variant="outlined">
                    <CardContent>
                      <Typography variant="h6" gutterBottom>
                        Resumo da Composição
                      </Typography>
                      <List dense>
                        <ListItem>
                          <ListItemText 
                            primary="Total de Membros" 
                            secondary={formData.membros.length}
                          />
                        </ListItem>
                        <Divider />
                        <ListItem>
                          <ListItemText 
                            primary="Competências" 
                            secondary={`${formData.competencias.length} definidas`}
                          />
                        </ListItem>
                        <Divider />
                        <ListItem>
                          <ListItemText 
                            primary="Presidente" 
                            secondary={
                              formData.membros.find(m => m.cargo === 'Presidente')?.nome || 'Não definido'
                            }
                          />
                        </ListItem>
                        <Divider />
                        <ListItem>
                          <ListItemText 
                            primary="Vice-Presidente" 
                            secondary={
                              formData.membros.find(m => m.cargo === 'Vice-Presidente')?.nome || 'Não definido'
                            }
                          />
                        </ListItem>
                      </List>
                    </CardContent>
                  </Card>
                </Grid>
                
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
                
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    multiline
                    rows={3}
                    label="Observações Finais (opcional)"
                    value={formData.observacoes}
                    onChange={(e) => setFormData({ ...formData, observacoes: e.target.value })}
                    placeholder="Digite observações adicionais sobre esta comissão..."
                  />
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
              Criar Comissão
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

      {/* Member Dialog */}
      <Dialog open={openMemberDialog} onClose={handleCloseMemberDialog} maxWidth="sm" fullWidth>
        <DialogTitle>
          {editingMember ? 'Editar Membro' : 'Novo Membro'}
        </DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Nome Completo"
                value={memberForm.nome}
                onChange={(e) => setMemberForm({ ...memberForm, nome: e.target.value })}
                required
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="CPF"
                value={memberForm.cpf}
                onChange={(e) => setMemberForm({ ...memberForm, cpf: e.target.value })}
                required
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Número CAU"
                value={memberForm.cauNumero}
                onChange={(e) => setMemberForm({ ...memberForm, cauNumero: e.target.value })}
                required
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Email"
                type="email"
                value={memberForm.email}
                onChange={(e) => setMemberForm({ ...memberForm, email: e.target.value })}
                required
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Telefone"
                value={memberForm.telefone}
                onChange={(e) => setMemberForm({ ...memberForm, telefone: e.target.value })}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <FormControl fullWidth>
                <InputLabel>Cargo</InputLabel>
                <Select
                  value={memberForm.cargo}
                  label="Cargo"
                  onChange={(e) => setMemberForm({ ...memberForm, cargo: e.target.value as any })}
                >
                  {cargos.map((cargo) => (
                    <MenuItem key={cargo} value={cargo}>
                      {cargo}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                multiline
                rows={2}
                label="Observações"
                value={memberForm.observacoes}
                onChange={(e) => setMemberForm({ ...memberForm, observacoes: e.target.value })}
                placeholder="Observações sobre o membro..."
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseMemberDialog}>Cancelar</Button>
          <Button 
            onClick={handleSaveMember} 
            variant="contained"
            disabled={!memberForm.nome || !memberForm.cpf || !memberForm.email || !memberForm.cauNumero}
          >
            {editingMember ? 'Atualizar' : 'Adicionar'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default NewCommission;