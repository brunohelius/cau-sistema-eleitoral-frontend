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
} from '@mui/material';
import {
  ArrowBack,
  Add,
  Delete,
  Save,
  Person,
  CheckCircle,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';

interface Member {
  id: string;
  nome: string;
  cpf: string;
  email: string;
  telefone: string;
  cargo: 'Presidente' | 'Vice-Presidente' | 'Secretario' | 'Tesoureiro' | 'Conselheiro';
  cauNumero: string;
}

interface TicketFormData {
  nome: string;
  slogan: string;
  eleicaoId: string;
  numero: string;
  responsavel: string;
  telefoneResponsavel: string;
  emailResponsavel: string;
  membros: Member[];
}

const steps = ['Informações Básicas', 'Membros da Chapa', 'Confirmação'];

const cargos = [
  'Presidente',
  'Vice-Presidente',
  'Secretario',
  'Tesoureiro',
  'Conselheiro',
];

const mockElections = [
  { id: '1', nome: 'Eleições CAU/BR 2024' },
  { id: '2', nome: 'Eleições CAU/SP 2024' },
];

export const NewTicket: React.FC = () => {
  const navigate = useNavigate();
  const [activeStep, setActiveStep] = useState(0);
  const [openMemberDialog, setOpenMemberDialog] = useState(false);
  const [editingMember, setEditingMember] = useState<Member | null>(null);
  const [memberForm, setMemberForm] = useState({
    nome: '',
    cpf: '',
    email: '',
    telefone: '',
    cargo: 'Conselheiro' as Member['cargo'],
    cauNumero: '',
  });

  const [formData, setFormData] = useState<TicketFormData>({
    nome: '',
    slogan: '',
    eleicaoId: '',
    numero: '',
    responsavel: '',
    telefoneResponsavel: '',
    emailResponsavel: '',
    membros: [],
  });

  const handleNext = () => {
    setActiveStep((prevActiveStep) => prevActiveStep + 1);
  };

  const handleBack = () => {
    setActiveStep((prevActiveStep) => prevActiveStep - 1);
  };

  const handleOpenMemberDialog = (member?: Member) => {
    if (member) {
      setEditingMember(member);
      setMemberForm({
        nome: member.nome,
        cpf: member.cpf,
        email: member.email,
        telefone: member.telefone,
        cargo: member.cargo,
        cauNumero: member.cauNumero,
      });
    } else {
      setEditingMember(null);
      setMemberForm({
        nome: '',
        cpf: '',
        email: '',
        telefone: '',
        cargo: 'Conselheiro',
        cauNumero: '',
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
      const newMember: Member = {
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

  const handleSubmit = () => {
    console.log('Submitting ticket:', formData);
    // Here you would make the API call to create the ticket
    navigate('/chapas');
  };

  const canProceed = (step: number) => {
    switch (step) {
      case 0:
        return formData.nome && formData.eleicaoId && formData.responsavel;
      case 1:
        return formData.membros.length > 0;
      default:
        return true;
    }
  };

  const getCargoColor = (cargo: string) => {
    switch (cargo) {
      case 'Presidente': return 'error';
      case 'Vice-Presidente': return 'warning';
      case 'Secretario': return 'info';
      case 'Tesoureiro': return 'success';
      default: return 'default';
    }
  };

  return (
    <Box sx={{ p: 3 }}>
      {/* Header */}
      <Box sx={{ mb: 3, display: 'flex', alignItems: 'center', gap: 2 }}>
        <IconButton onClick={() => navigate('/chapas')}>
          <ArrowBack />
        </IconButton>
        <Typography variant="h4">
          Nova Chapa
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
                  Informações Básicas da Chapa
                </Typography>
              </Grid>
              
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Nome da Chapa"
                  value={formData.nome}
                  onChange={(e) => setFormData({ ...formData, nome: e.target.value })}
                  required
                />
              </Grid>
              
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Número"
                  value={formData.numero}
                  onChange={(e) => setFormData({ ...formData, numero: e.target.value })}
                />
              </Grid>
              
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Slogan"
                  multiline
                  rows={2}
                  value={formData.slogan}
                  onChange={(e) => setFormData({ ...formData, slogan: e.target.value })}
                />
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
                <Typography variant="h6" gutterBottom sx={{ mt: 2 }}>
                  Responsável pela Chapa
                </Typography>
              </Grid>
              
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Nome do Responsável"
                  value={formData.responsavel}
                  onChange={(e) => setFormData({ ...formData, responsavel: e.target.value })}
                  required
                />
              </Grid>
              
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Telefone"
                  value={formData.telefoneResponsavel}
                  onChange={(e) => setFormData({ ...formData, telefoneResponsavel: e.target.value })}
                />
              </Grid>
              
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Email"
                  type="email"
                  value={formData.emailResponsavel}
                  onChange={(e) => setFormData({ ...formData, emailResponsavel: e.target.value })}
                />
              </Grid>
            </Grid>
          )}

          {activeStep === 1 && (
            <Box>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                <Typography variant="h6">
                  Membros da Chapa
                </Typography>
                <Button
                  startIcon={<Add />}
                  variant="contained"
                  onClick={() => handleOpenMemberDialog()}
                >
                  Adicionar Membro
                </Button>
              </Box>

              {formData.membros.length > 0 ? (
                <TableContainer component={Paper}>
                  <Table>
                    <TableHead>
                      <TableRow>
                        <TableCell>Nome</TableCell>
                        <TableCell>Cargo</TableCell>
                        <TableCell>CPF</TableCell>
                        <TableCell>Email</TableCell>
                        <TableCell>CAU</TableCell>
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
                          <TableCell>{member.cpf}</TableCell>
                          <TableCell>{member.email}</TableCell>
                          <TableCell>{member.cauNumero}</TableCell>
                          <TableCell align="center">
                            <IconButton
                              size="small"
                              onClick={() => handleOpenMemberDialog(member)}
                            >
                              <Person fontSize="small" />
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
                  <Typography variant="body1" color="text.secondary">
                    Nenhum membro adicionado ainda.
                  </Typography>
                </Box>
              )}
            </Box>
          )}

          {activeStep === 2 && (
            <Box>
              <Typography variant="h6" gutterBottom>
                Confirmação dos Dados
              </Typography>
              
              <Grid container spacing={3}>
                <Grid item xs={12} md={6}>
                  <Card variant="outlined">
                    <CardContent>
                      <Typography variant="h6" gutterBottom>
                        Informações da Chapa
                      </Typography>
                      <Typography><strong>Nome:</strong> {formData.nome}</Typography>
                      <Typography><strong>Slogan:</strong> {formData.slogan}</Typography>
                      <Typography><strong>Número:</strong> {formData.numero}</Typography>
                      <Typography><strong>Responsável:</strong> {formData.responsavel}</Typography>
                    </CardContent>
                  </Card>
                </Grid>
                
                <Grid item xs={12} md={6}>
                  <Card variant="outlined">
                    <CardContent>
                      <Typography variant="h6" gutterBottom>
                        Resumo dos Membros
                      </Typography>
                      <Typography><strong>Total de Membros:</strong> {formData.membros.length}</Typography>
                      <Typography><strong>Presidente:</strong> {formData.membros.filter(m => m.cargo === 'Presidente').length}</Typography>
                      <Typography><strong>Vice-Presidente:</strong> {formData.membros.filter(m => m.cargo === 'Vice-Presidente').length}</Typography>
                      <Typography><strong>Outros Cargos:</strong> {formData.membros.filter(m => !['Presidente', 'Vice-Presidente'].includes(m.cargo)).length}</Typography>
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
            >
              Criar Chapa
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
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseMemberDialog}>Cancelar</Button>
          <Button onClick={handleSaveMember} variant="contained">
            {editingMember ? 'Atualizar' : 'Adicionar'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default NewTicket;