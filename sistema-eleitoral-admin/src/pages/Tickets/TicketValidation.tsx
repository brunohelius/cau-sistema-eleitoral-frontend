import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Grid,
  Chip,
  Button,
  Tab,
  Tabs,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  IconButton,
  Avatar,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  Divider,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControlLabel,
  Checkbox,
  AccordionSummary,
  AccordionDetails,
  Accordion,
} from '@mui/material';
import {
  ArrowBack,
  CheckCircle,
  Warning,
  Person,
  Upload,
  GetApp,
  Visibility,
  Check,
  Close,
  ExpandMore,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';

interface Document {
  id: string;
  nome: string;
  tipo: 'RG' | 'CPF' | 'Comprovante_CAU' | 'Foto' | 'Curriculo' | 'Outros';
  arquivo: string;
  status: 'Aprovado' | 'Pendente' | 'Rejeitado';
  observacoes?: string;
}

interface Member {
  id: string;
  nome: string;
  cpf: string;
  email: string;
  cargo: 'Presidente' | 'Vice-Presidente' | 'Secretario' | 'Tesoureiro' | 'Conselheiro';
  situacao: 'Aprovado' | 'Pendente' | 'Rejeitado';
  documentos: Document[];
  observacoes?: string;
}

interface Ticket {
  id: string;
  nome: string;
  numero: string;
  slogan: string;
  eleicaoId: string;
  eleicaoNome: string;
  status: 'Registrada' | 'Aprovada' | 'Rejeitada' | 'Em Analise';
  dataRegistro: Date;
  responsavel: string;
  membros: Member[];
  observacoesGerais?: string;
}

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`validation-tabpanel-${index}`}
      aria-labelledby={`validation-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box sx={{ p: 3 }}>
          {children}
        </Box>
      )}
    </div>
  );
}

export const TicketValidation: React.FC = () => {
  const navigate = useNavigate();
  const [currentTab, setCurrentTab] = useState(0);
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null);
  const [selectedMember, setSelectedMember] = useState<Member | null>(null);
  const [openValidationDialog, setOpenValidationDialog] = useState(false);
  const [validationAction, setValidationAction] = useState<'approve' | 'reject'>('approve');
  const [validationObservations, setValidationObservations] = useState('');
  const [loading, setLoading] = useState(true);

  // Mock data - replace with API call
  useEffect(() => {
    const mockTickets: Ticket[] = [
      {
        id: '1',
        nome: 'Chapa Renovação CAU',
        numero: '01',
        slogan: 'Inovação e Transparência para o CAU',
        eleicaoId: '1',
        eleicaoNome: 'Eleições CAU/BR 2024',
        status: 'Em Analise',
        dataRegistro: new Date('2024-02-01'),
        responsavel: 'João Silva',
        membros: [
          {
            id: '1',
            nome: 'João Silva',
            cpf: '123.456.789-00',
            email: 'joao@email.com',
            cargo: 'Presidente',
            situacao: 'Pendente',
            documentos: [
              {
                id: '1',
                nome: 'RG João Silva',
                tipo: 'RG',
                arquivo: 'rg_joao.pdf',
                status: 'Pendente',
              },
              {
                id: '2',
                nome: 'CPF João Silva',
                tipo: 'CPF',
                arquivo: 'cpf_joao.pdf',
                status: 'Aprovado',
              },
              {
                id: '3',
                nome: 'Comprovante CAU',
                tipo: 'Comprovante_CAU',
                arquivo: 'cau_joao.pdf',
                status: 'Pendente',
              },
            ],
          },
          {
            id: '2',
            nome: 'Maria Santos',
            cpf: '987.654.321-00',
            email: 'maria@email.com',
            cargo: 'Vice-Presidente',
            situacao: 'Aprovado',
            documentos: [
              {
                id: '4',
                nome: 'RG Maria Santos',
                tipo: 'RG',
                arquivo: 'rg_maria.pdf',
                status: 'Aprovado',
              },
              {
                id: '5',
                nome: 'CPF Maria Santos',
                tipo: 'CPF',
                arquivo: 'cpf_maria.pdf',
                status: 'Aprovado',
              },
              {
                id: '6',
                nome: 'Comprovante CAU',
                tipo: 'Comprovante_CAU',
                arquivo: 'cau_maria.pdf',
                status: 'Aprovado',
              },
            ],
          },
          {
            id: '3',
            nome: 'Pedro Costa',
            cpf: '456.789.123-00',
            email: 'pedro@email.com',
            cargo: 'Secretario',
            situacao: 'Rejeitado',
            observacoes: 'Documentação incompleta - faltando comprovante CAU válido',
            documentos: [
              {
                id: '7',
                nome: 'RG Pedro Costa',
                tipo: 'RG',
                arquivo: 'rg_pedro.pdf',
                status: 'Aprovado',
              },
              {
                id: '8',
                nome: 'CPF Pedro Costa',
                tipo: 'CPF',
                arquivo: 'cpf_pedro.pdf',
                status: 'Rejeitado',
                observacoes: 'Documento ilegível',
              },
            ],
          },
        ],
      },
      {
        id: '2',
        nome: 'Chapa Progresso',
        numero: '02',
        slogan: 'Juntos pelo futuro da Arquitetura',
        eleicaoId: '1',
        eleicaoNome: 'Eleições CAU/BR 2024',
        status: 'Registrada',
        dataRegistro: new Date('2024-02-05'),
        responsavel: 'Ana Costa',
        membros: [
          {
            id: '4',
            nome: 'Ana Costa',
            cpf: '111.222.333-44',
            email: 'ana@email.com',
            cargo: 'Presidente',
            situacao: 'Pendente',
            documentos: [
              {
                id: '9',
                nome: 'RG Ana Costa',
                tipo: 'RG',
                arquivo: 'rg_ana.pdf',
                status: 'Pendente',
              },
            ],
          },
        ],
      },
    ];
    setTickets(mockTickets);
    setSelectedTicket(mockTickets[0]);
    setLoading(false);
  }, []);

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setCurrentTab(newValue);
  };

  const handleValidateMember = (member: Member, action: 'approve' | 'reject') => {
    setSelectedMember(member);
    setValidationAction(action);
    setValidationObservations('');
    setOpenValidationDialog(true);
  };

  const handleConfirmValidation = () => {
    if (selectedMember && selectedTicket) {
      const updatedMembers = selectedTicket.membros.map(m => 
        m.id === selectedMember.id 
          ? { 
              ...m, 
              situacao: validationAction === 'approve' ? 'Aprovado' as const : 'Rejeitado' as const,
              observacoes: validationObservations || undefined
            }
          : m
      );
      
      const updatedTicket = { ...selectedTicket, membros: updatedMembers };
      setSelectedTicket(updatedTicket);
      
      // Update tickets array
      setTickets(tickets.map(t => t.id === selectedTicket.id ? updatedTicket : t));
    }
    setOpenValidationDialog(false);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Aprovado': return 'success';
      case 'Pendente': return 'warning';
      case 'Rejeitado': return 'error';
      default: return 'default';
    }
  };

  const getDocumentTypeLabel = (tipo: string) => {
    switch (tipo) {
      case 'RG': return 'RG';
      case 'CPF': return 'CPF';
      case 'Comprovante_CAU': return 'Comprovante CAU';
      case 'Foto': return 'Foto';
      case 'Curriculo': return 'Currículo';
      case 'Outros': return 'Outros';
      default: return tipo;
    }
  };

  if (loading) {
    return (
      <Box sx={{ p: 3 }}>
        <Typography>Carregando...</Typography>
      </Box>
    );
  }

  const pendingTickets = tickets.filter(t => t.status === 'Em Analise' || t.status === 'Registrada');
  const totalPendingMembers = pendingTickets.reduce((acc, ticket) => 
    acc + ticket.membros.filter(m => m.situacao === 'Pendente').length, 0
  );

  return (
    <Box sx={{ p: 3 }}>
      {/* Header */}
      <Box sx={{ mb: 3, display: 'flex', alignItems: 'center', gap: 2 }}>
        <IconButton onClick={() => navigate('/chapas')}>
          <ArrowBack />
        </IconButton>
        <Box sx={{ flex: 1 }}>
          <Typography variant="h4" gutterBottom>
            Validação de Chapas
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Análise e validação de membros e documentos das chapas eleitorais
          </Typography>
        </Box>
      </Box>

      {/* Summary Cards */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12} md={3}>
          <Card>
            <CardContent>
              <Typography color="text.secondary" gutterBottom>
                Chapas Pendentes
              </Typography>
              <Typography variant="h4" color="warning.main">
                {pendingTickets.length}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={3}>
          <Card>
            <CardContent>
              <Typography color="text.secondary" gutterBottom>
                Membros Pendentes
              </Typography>
              <Typography variant="h4" color="warning.main">
                {totalPendingMembers}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={3}>
          <Card>
            <CardContent>
              <Typography color="text.secondary" gutterBottom>
                Total de Chapas
              </Typography>
              <Typography variant="h4">
                {tickets.length}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={3}>
          <Card>
            <CardContent>
              <Typography color="text.secondary" gutterBottom>
                Validações Hoje
              </Typography>
              <Typography variant="h4" color="success.main">
                12
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Main Content */}
      <Grid container spacing={3}>
        {/* Tickets List */}
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Chapas para Validação
              </Typography>
              <List>
                {tickets.map((ticket, index) => {
                  const pendingMembers = ticket.membros.filter(m => m.situacao === 'Pendente').length;
                  return (
                    <React.Fragment key={ticket.id}>
                      <ListItem
                        button
                        selected={selectedTicket?.id === ticket.id}
                        onClick={() => setSelectedTicket(ticket)}
                      >
                        <ListItemText
                          primary={
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                              <Typography variant="subtitle1">
                                Chapa {ticket.numero}
                              </Typography>
                              <Chip
                                label={ticket.status}
                                size="small"
                                color={getStatusColor(ticket.status) as any}
                              />
                            </Box>
                          }
                          secondary={
                            <Box>
                              <Typography variant="body2">
                                {ticket.nome}
                              </Typography>
                              {pendingMembers > 0 && (
                                <Typography variant="body2" color="warning.main">
                                  {pendingMembers} membro(s) pendente(s)
                                </Typography>
                              )}
                            </Box>
                          }
                        />
                      </ListItem>
                      {index < tickets.length - 1 && <Divider />}
                    </React.Fragment>
                  );
                })}
              </List>
            </CardContent>
          </Card>
        </Grid>

        {/* Validation Details */}
        <Grid item xs={12} md={8}>
          {selectedTicket ? (
            <Paper sx={{ width: '100%' }}>
              <Tabs
                value={currentTab}
                onChange={handleTabChange}
                aria-label="validation-tabs"
                variant="scrollable"
                scrollButtons="auto"
              >
                <Tab label="Membros" />
                <Tab label="Documentos" />
                <Tab label="Observações" />
              </Tabs>

              <TabPanel value={currentTab} index={0}>
                <Typography variant="h6" gutterBottom>
                  Validação de Membros - {selectedTicket.nome}
                </Typography>
                
                {selectedTicket.membros.map((member) => (
                  <Accordion key={member.id} sx={{ mb: 2 }}>
                    <AccordionSummary expandIcon={<ExpandMore />}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, width: '100%' }}>
                        <Avatar sx={{ bgcolor: 'primary.main' }}>
                          {member.nome.charAt(0)}
                        </Avatar>
                        <Box sx={{ flex: 1 }}>
                          <Typography variant="h6">{member.nome}</Typography>
                          <Typography variant="body2" color="text.secondary">
                            {member.cargo} • CPF: {member.cpf}
                          </Typography>
                        </Box>
                        <Chip
                          label={member.situacao}
                          color={getStatusColor(member.situacao) as any}
                          size="small"
                        />
                      </Box>
                    </AccordionSummary>
                    <AccordionDetails>
                      <Grid container spacing={2}>
                        <Grid item xs={12}>
                          <Typography variant="subtitle2" gutterBottom>
                            Informações do Membro:
                          </Typography>
                          <Typography variant="body2">Email: {member.email}</Typography>
                          <Typography variant="body2">Cargo: {member.cargo}</Typography>
                          {member.observacoes && (
                            <Alert severity="info" sx={{ mt: 1 }}>
                              {member.observacoes}
                            </Alert>
                          )}
                        </Grid>
                        
                        <Grid item xs={12}>
                          <Typography variant="subtitle2" gutterBottom>
                            Documentos ({member.documentos.length}):
                          </Typography>
                          <List dense>
                            {member.documentos.map((doc) => (
                              <ListItem key={doc.id}>
                                <ListItemText
                                  primary={getDocumentTypeLabel(doc.tipo)}
                                  secondary={doc.arquivo}
                                />
                                <Chip
                                  label={doc.status}
                                  color={getStatusColor(doc.status) as any}
                                  size="small"
                                  sx={{ mr: 1 }}
                                />
                                <IconButton size="small">
                                  <Visibility fontSize="small" />
                                </IconButton>
                                <IconButton size="small">
                                  <GetApp fontSize="small" />
                                </IconButton>
                              </ListItem>
                            ))}
                          </List>
                        </Grid>
                        
                        {member.situacao === 'Pendente' && (
                          <Grid item xs={12}>
                            <Box sx={{ display: 'flex', gap: 1, mt: 2 }}>
                              <Button
                                variant="contained"
                                color="success"
                                startIcon={<Check />}
                                onClick={() => handleValidateMember(member, 'approve')}
                              >
                                Aprovar Membro
                              </Button>
                              <Button
                                variant="contained"
                                color="error"
                                startIcon={<Close />}
                                onClick={() => handleValidateMember(member, 'reject')}
                              >
                                Rejeitar Membro
                              </Button>
                            </Box>
                          </Grid>
                        )}
                      </Grid>
                    </AccordionDetails>
                  </Accordion>
                ))}
              </TabPanel>

              <TabPanel value={currentTab} index={1}>
                <Typography variant="h6" gutterBottom>
                  Documentos da Chapa - {selectedTicket.nome}
                </Typography>
                
                <TableContainer component={Paper}>
                  <Table>
                    <TableHead>
                      <TableRow>
                        <TableCell>Membro</TableCell>
                        <TableCell>Documento</TableCell>
                        <TableCell>Tipo</TableCell>
                        <TableCell>Status</TableCell>
                        <TableCell>Ações</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {selectedTicket.membros.flatMap(member => 
                        member.documentos.map(doc => (
                          <TableRow key={`${member.id}-${doc.id}`}>
                            <TableCell>{member.nome}</TableCell>
                            <TableCell>{doc.nome}</TableCell>
                            <TableCell>{getDocumentTypeLabel(doc.tipo)}</TableCell>
                            <TableCell>
                              <Chip
                                label={doc.status}
                                color={getStatusColor(doc.status) as any}
                                size="small"
                              />
                            </TableCell>
                            <TableCell>
                              <IconButton size="small">
                                <Visibility fontSize="small" />
                              </IconButton>
                              <IconButton size="small">
                                <GetApp fontSize="small" />
                              </IconButton>
                            </TableCell>
                          </TableRow>
                        ))
                      )}
                    </TableBody>
                  </Table>
                </TableContainer>
              </TabPanel>

              <TabPanel value={currentTab} index={2}>
                <Typography variant="h6" gutterBottom>
                  Observações Gerais - {selectedTicket.nome}
                </Typography>
                
                <TextField
                  fullWidth
                  multiline
                  rows={4}
                  label="Observações da Validação"
                  placeholder="Digite observações gerais sobre a validação desta chapa..."
                  value={selectedTicket.observacoesGerais || ''}
                  onChange={(e) => {
                    const updatedTicket = { ...selectedTicket, observacoesGerais: e.target.value };
                    setSelectedTicket(updatedTicket);
                    setTickets(tickets.map(t => t.id === selectedTicket.id ? updatedTicket : t));
                  }}
                  sx={{ mb: 3 }}
                />
                
                <Box sx={{ display: 'flex', gap: 2 }}>
                  <Button variant="contained" color="success">
                    Aprovar Chapa Completa
                  </Button>
                  <Button variant="contained" color="error">
                    Rejeitar Chapa
                  </Button>
                  <Button variant="outlined">
                    Solicitar Correções
                  </Button>
                </Box>
              </TabPanel>
            </Paper>
          ) : (
            <Card>
              <CardContent>
                <Typography variant="h6" align="center" color="text.secondary">
                  Selecione uma chapa para validação
                </Typography>
              </CardContent>
            </Card>
          )}
        </Grid>
      </Grid>

      {/* Validation Dialog */}
      <Dialog open={openValidationDialog} onClose={() => setOpenValidationDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>
          {validationAction === 'approve' ? 'Aprovar Membro' : 'Rejeitar Membro'}
        </DialogTitle>
        <DialogContent>
          <Typography variant="body1" gutterBottom>
            Confirma a {validationAction === 'approve' ? 'aprovação' : 'rejeição'} do membro <strong>{selectedMember?.nome}</strong>?
          </Typography>
          <TextField
            fullWidth
            multiline
            rows={3}
            label="Observações"
            placeholder={validationAction === 'approve' 
              ? 'Observações sobre a aprovação (opcional)'
              : 'Motivo da rejeição (obrigatório)'
            }
            value={validationObservations}
            onChange={(e) => setValidationObservations(e.target.value)}
            required={validationAction === 'reject'}
            sx={{ mt: 2 }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenValidationDialog(false)}>Cancelar</Button>
          <Button 
            onClick={handleConfirmValidation} 
            variant="contained"
            color={validationAction === 'approve' ? 'success' : 'error'}
            disabled={validationAction === 'reject' && !validationObservations.trim()}
          >
            {validationAction === 'approve' ? 'Aprovar' : 'Rejeitar'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default TicketValidation;