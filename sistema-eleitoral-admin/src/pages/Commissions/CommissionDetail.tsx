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
  ListItemSecondaryAction,
  Divider,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Accordion,
  AccordionSummary,
  AccordionDetails,
} from '@mui/material';
import {
  ArrowBack,
  Edit,
  People,
  Assignment,
  Gavel,
  Add,
  Person,
  Email,
  Phone,
  Delete,
  CheckCircle,
  Warning,
  AccessTime,
  ExpandMore,
} from '@mui/icons-material';
import { useParams, useNavigate } from 'react-router-dom';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface CommissionMember {
  id: string;
  nome: string;
  cpf: string;
  email: string;
  telefone: string;
  cargo: 'Presidente' | 'Vice-Presidente' | 'Secretario' | 'Membro Titular' | 'Membro Suplente';
  cauNumero: string;
  dataPosse: Date;
  dataTermino?: Date;
  situacao: 'Ativo' | 'Inativo' | 'Licenciado' | 'Afastado';
  observacoes?: string;
}

interface Process {
  id: string;
  protocolo: string;
  tipo: 'Impugnacao' | 'Denuncia' | 'Recurso' | 'Representacao';
  assunto: string;
  status: 'Em Analise' | 'Em Julgamento' | 'Julgado' | 'Arquivado';
  dataProtocolo: Date;
  prazo?: Date;
  responsavel?: string;
}

interface Meeting {
  id: string;
  data: Date;
  tipo: 'Ordinaria' | 'Extraordinaria' | 'Emergencial';
  assunto: string;
  situacao: 'Agendada' | 'Realizada' | 'Cancelada' | 'Adiada';
  presentes?: string[];
  deliberacoes?: string;
  ata?: string;
}

interface Commission {
  id: string;
  nome: string;
  tipo: 'Eleitoral' | 'Disciplinar' | 'Recursal' | 'Especial';
  descricao: string;
  eleicaoId?: string;
  eleicaoNome?: string;
  uf: string;
  regional: string;
  status: 'Ativa' | 'Inativa' | 'Suspensa' | 'Dissolvida';
  dataConstituicao: Date;
  dataExtincao?: Date;
  mandato: {
    inicio: Date;
    fim: Date;
    duracao: string;
  };
  membros: CommissionMember[];
  processos: Process[];
  reunioes: Meeting[];
  competencias: string[];
  observacoes?: string;
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
      id={`commission-tabpanel-${index}`}
      aria-labelledby={`commission-tab-${index}`}
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

export const CommissionDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [currentTab, setCurrentTab] = useState(0);
  const [commission, setCommission] = useState<Commission | null>(null);
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
  const [loading, setLoading] = useState(true);

  // Mock data - replace with API call
  useEffect(() => {
    const mockCommission: Commission = {
      id: id || '1',
      nome: 'Comissão Eleitoral Central',
      tipo: 'Eleitoral',
      descricao: 'Comissão responsável pela condução do processo eleitoral do CAU/BR 2024, incluindo registro de chapas, validação de candidatos, julgamento de impugnações e demais atividades relacionadas ao pleito eleitoral.',
      eleicaoId: '1',
      eleicaoNome: 'Eleições CAU/BR 2024',
      uf: 'DF',
      regional: 'Nacional',
      status: 'Ativa',
      dataConstituicao: new Date('2024-01-15'),
      mandato: {
        inicio: new Date('2024-01-15'),
        fim: new Date('2024-12-31'),
        duracao: '1 ano',
      },
      competencias: [
        'Organizar e supervisionar o processo eleitoral',
        'Analisar e validar registros de chapas',
        'Julgar impugnações em primeira instância',
        'Garantir a regularidade do processo eleitoral',
        'Elaborar relatórios de atividades',
        'Promover a transparência do processo',
      ],
      membros: [
        {
          id: '1',
          nome: 'Dr. Carlos Eduardo Mendes',
          cpf: '123.456.789-00',
          email: 'carlos.mendes@cau.gov.br',
          telefone: '(61) 99999-1111',
          cargo: 'Presidente',
          cauNumero: 'A12345-6',
          dataPosse: new Date('2024-01-15'),
          situacao: 'Ativo',
        },
        {
          id: '2',
          nome: 'Arq. Ana Paula Santos',
          cpf: '987.654.321-00',
          email: 'ana.santos@cau.gov.br',
          telefone: '(61) 99999-2222',
          cargo: 'Vice-Presidente',
          cauNumero: 'A67890-1',
          dataPosse: new Date('2024-01-15'),
          situacao: 'Ativo',
        },
        {
          id: '3',
          nome: 'Urb. Roberto Silva',
          cpf: '456.789.123-00',
          email: 'roberto.silva@cau.gov.br',
          telefone: '(61) 99999-3333',
          cargo: 'Secretario',
          cauNumero: 'A11111-2',
          dataPosse: new Date('2024-01-15'),
          situacao: 'Ativo',
        },
        {
          id: '4',
          nome: 'Arq. Mariana Costa',
          cpf: '789.123.456-00',
          email: 'mariana.costa@cau.gov.br',
          telefone: '(61) 99999-4444',
          cargo: 'Membro Titular',
          cauNumero: 'A22222-3',
          dataPosse: new Date('2024-01-15'),
          situacao: 'Licenciado',
          observacoes: 'Licença médica até 15/03/2024',
        },
        {
          id: '5',
          nome: 'Urb. Pedro Oliveira',
          cpf: '321.654.987-00',
          email: 'pedro.oliveira@cau.gov.br',
          telefone: '(61) 99999-5555',
          cargo: 'Membro Suplente',
          cauNumero: 'A33333-4',
          dataPosse: new Date('2024-02-01'),
          situacao: 'Ativo',
          observacoes: 'Assumiu devido à licença de Mariana Costa',
        },
      ],
      processos: [
        {
          id: '1',
          protocolo: 'IMP-001-2024',
          tipo: 'Impugnacao',
          assunto: 'Impugnação da Chapa 01',
          status: 'Em Julgamento',
          dataProtocolo: new Date('2024-02-10'),
          prazo: new Date('2024-03-10'),
          responsavel: 'Dr. Carlos Eduardo Mendes',
        },
        {
          id: '2',
          protocolo: 'DEN-002-2024',
          tipo: 'Denuncia',
          assunto: 'Denúncia sobre irregularidades eleitorais',
          status: 'Em Analise',
          dataProtocolo: new Date('2024-02-15'),
          prazo: new Date('2024-03-15'),
          responsavel: 'Arq. Ana Paula Santos',
        },
        {
          id: '3',
          protocolo: 'REC-003-2024',
          tipo: 'Recurso',
          assunto: 'Recurso contra decisão de indeferimento',
          status: 'Julgado',
          dataProtocolo: new Date('2024-01-20'),
          responsavel: 'Urb. Roberto Silva',
        },
      ],
      reunioes: [
        {
          id: '1',
          data: new Date('2024-03-01'),
          tipo: 'Ordinaria',
          assunto: 'Reunião mensal - Análise de processos pendentes',
          situacao: 'Realizada',
          presentes: ['Carlos Eduardo Mendes', 'Ana Paula Santos', 'Roberto Silva', 'Pedro Oliveira'],
          deliberacoes: 'Aprovado julgamento da IMP-001-2024; Distribuídos novos processos; Definida agenda para o mês',
          ata: 'ata_reuniao_001_2024.pdf',
        },
        {
          id: '2',
          data: new Date('2024-03-15'),
          tipo: 'Extraordinaria',
          assunto: 'Julgamento urgente de impugnação',
          situacao: 'Agendada',
          presentes: [],
        },
        {
          id: '3',
          data: new Date('2024-04-01'),
          tipo: 'Ordinaria',
          assunto: 'Reunião mensal de abril',
          situacao: 'Agendada',
          presentes: [],
        },
      ],
      observacoes: 'Comissão em funcionamento regular. Todos os prazos estão sendo cumpridos adequadamente.',
    };
    setCommission(mockCommission);
    setLoading(false);
  }, [id]);

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setCurrentTab(newValue);
  };

  const handleAddMember = () => {
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
    setOpenMemberDialog(true);
  };

  const handleEditMember = (member: CommissionMember) => {
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
    setOpenMemberDialog(true);
  };

  const handleSaveMember = () => {
    if (commission) {
      if (editingMember) {
        // Update existing member
        const updatedMembers = commission.membros.map(m => 
          m.id === editingMember.id 
            ? { ...m, ...memberForm }
            : m
        );
        setCommission({ ...commission, membros: updatedMembers });
      } else {
        // Add new member
        const newMember: CommissionMember = {
          id: Date.now().toString(),
          ...memberForm,
          dataPosse: new Date(),
          situacao: 'Ativo',
        };
        setCommission({ 
          ...commission, 
          membros: [...commission.membros, newMember]
        });
      }
    }
    setOpenMemberDialog(false);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Ativa': case 'Ativo': case 'Realizada': case 'Julgado': return 'success';
      case 'Em Analise': case 'Em Julgamento': case 'Agendada': return 'warning';
      case 'Licenciado': case 'Afastado': case 'Cancelada': case 'Adiada': return 'info';
      case 'Inativa': case 'Inativo': case 'Suspensa': case 'Dissolvida': case 'Arquivado': return 'error';
      default: return 'default';
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

  const getTipoProcessoColor = (tipo: string) => {
    switch (tipo) {
      case 'Impugnacao': return 'error';
      case 'Denuncia': return 'warning';
      case 'Recurso': return 'info';
      case 'Representacao': return 'success';
      default: return 'default';
    }
  };

  if (loading || !commission) {
    return (
      <Box sx={{ p: 3 }}>
        <Typography>Carregando...</Typography>
      </Box>
    );
  }

  const activeMembers = commission.membros.filter(m => m.situacao === 'Ativo').length;
  const pendingProcesses = commission.processos.filter(p => 
    p.status === 'Em Analise' || p.status === 'Em Julgamento'
  ).length;
  const upcomingMeetings = commission.reunioes.filter(r => 
    r.situacao === 'Agendada' && r.data > new Date()
  ).length;

  return (
    <Box sx={{ p: 3 }}>
      {/* Header */}
      <Box sx={{ mb: 3, display: 'flex', alignItems: 'center', gap: 2 }}>
        <IconButton onClick={() => navigate('/comissoes')}>
          <ArrowBack />
        </IconButton>
        <Box sx={{ flex: 1 }}>
          <Typography variant="h4" gutterBottom>
            {commission.nome}
          </Typography>
          <Typography variant="body1" color="text.secondary">
            {commission.tipo} • {commission.regional} • {commission.uf}
            {commission.eleicaoNome && ` • ${commission.eleicaoNome}`}
          </Typography>
        </Box>
        <Chip
          label={commission.status}
          color={getStatusColor(commission.status) as any}
          variant="filled"
        />
        <Button
          startIcon={<Edit />}
          variant="outlined"
        >
          Editar
        </Button>
      </Box>

      {/* Summary Cards */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12} md={3}>
          <Card>
            <CardContent>
              <Typography color="text.secondary" gutterBottom>
                Membros Ativos
              </Typography>
              <Typography variant="h4" color="success.main">
                {activeMembers} / {commission.membros.length}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={3}>
          <Card>
            <CardContent>
              <Typography color="text.secondary" gutterBottom>
                Processos Pendentes
              </Typography>
              <Typography variant="h4" color={pendingProcesses > 0 ? 'warning.main' : 'success.main'}>
                {pendingProcesses}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={3}>
          <Card>
            <CardContent>
              <Typography color="text.secondary" gutterBottom>
                Próximas Reuniões
              </Typography>
              <Typography variant="h4">
                {upcomingMeetings}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={3}>
          <Card>
            <CardContent>
              <Typography color="text.secondary" gutterBottom>
                Dias de Mandato
              </Typography>
              <Typography variant="h4">
                {Math.ceil((commission.mandato.fim.getTime() - new Date().getTime()) / (1000 * 3600 * 24))}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Tabs */}
      <Paper sx={{ width: '100%' }}>
        <Tabs
          value={currentTab}
          onChange={handleTabChange}
          aria-label="commission-tabs"
          variant="scrollable"
          scrollButtons="auto"
        >
          <Tab
            label="Informações Gerais"
            icon={<Assignment />}
            iconPosition="start"
          />
          <Tab
            label="Membros"
            icon={<People />}
            iconPosition="start"
          />
          <Tab
            label="Processos"
            icon={<Gavel />}
            iconPosition="start"
          />
          <Tab
            label="Reuniões"
            icon={<AccessTime />}
            iconPosition="start"
          />
        </Tabs>

        <TabPanel value={currentTab} index={0}>
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <Card variant="outlined">
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    Informações da Comissão
                  </Typography>
                  <List>
                    <ListItem>
                      <ListItemText primary="Nome" secondary={commission.nome} />
                    </ListItem>
                    <Divider />
                    <ListItem>
                      <ListItemText primary="Tipo" secondary={commission.tipo} />
                    </ListItem>
                    <Divider />
                    <ListItem>
                      <ListItemText primary="Regional" secondary={commission.regional} />
                    </ListItem>
                    <Divider />
                    <ListItem>
                      <ListItemText primary="UF" secondary={commission.uf} />
                    </ListItem>
                    <Divider />
                    <ListItem>
                      <ListItemText 
                        primary="Data de Constituição" 
                        secondary={format(commission.dataConstituicao, 'dd/MM/yyyy', { locale: ptBR })}
                      />
                    </ListItem>
                    {commission.eleicaoNome && (
                      <>
                        <Divider />
                        <ListItem>
                          <ListItemText primary="Eleição" secondary={commission.eleicaoNome} />
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
                    Período do Mandato
                  </Typography>
                  <List>
                    <ListItem>
                      <ListItemText 
                        primary="Início do Mandato" 
                        secondary={format(commission.mandato.inicio, 'dd/MM/yyyy', { locale: ptBR })}
                      />
                    </ListItem>
                    <Divider />
                    <ListItem>
                      <ListItemText 
                        primary="Término do Mandato" 
                        secondary={format(commission.mandato.fim, 'dd/MM/yyyy', { locale: ptBR })}
                      />
                    </ListItem>
                    <Divider />
                    <ListItem>
                      <ListItemText 
                        primary="Duração" 
                        secondary={commission.mandato.duracao}
                      />
                    </ListItem>
                    <Divider />
                    <ListItem>
                      <ListItemText 
                        primary="Status" 
                        secondary={
                          <Chip
                            label={commission.status}
                            color={getStatusColor(commission.status) as any}
                            size="small"
                          />
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
                  <Typography variant="body1" paragraph>
                    {commission.descricao}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            
            <Grid item xs={12}>
              <Card variant="outlined">
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    Competências
                  </Typography>
                  <List>
                    {commission.competencias.map((competencia, index) => (
                      <ListItem key={index}>
                        <ListItemIcon>
                          <CheckCircle color="success" fontSize="small" />
                        </ListItemIcon>
                        <ListItemText primary={competencia} />
                      </ListItem>
                    ))}
                  </List>
                </CardContent>
              </Card>
            </Grid>
            
            {commission.observacoes && (
              <Grid item xs={12}>
                <Alert severity="info">
                  <Typography variant="subtitle2" gutterBottom>
                    Observações:
                  </Typography>
                  {commission.observacoes}
                </Alert>
              </Grid>
            )}
          </Grid>
        </TabPanel>

        <TabPanel value={currentTab} index={1}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
            <Typography variant="h6">
              Membros da Comissão ({commission.membros.length})
            </Typography>
            <Button
              startIcon={<Add />}
              variant="contained"
              onClick={handleAddMember}
            >
              Adicionar Membro
            </Button>
          </Box>
          
          <Grid container spacing={3}>
            {commission.membros.map((member) => (
              <Grid item xs={12} md={6} key={member.id}>
                <Card variant="outlined">
                  <CardContent>
                    <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 2 }}>
                      <Avatar sx={{ bgcolor: 'primary.main' }}>
                        {member.nome.charAt(0)}
                      </Avatar>
                      <Box sx={{ flex: 1 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                          <Typography variant="h6">
                            {member.nome}
                          </Typography>
                          <Chip
                            label={member.cargo}
                            color={getCargoColor(member.cargo) as any}
                            size="small"
                          />
                        </Box>
                        
                        <Typography variant="body2" color="text.secondary" gutterBottom>
                          CAU: {member.cauNumero} • CPF: {member.cpf}
                        </Typography>
                        
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 1 }}>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                            <Email fontSize="small" color="action" />
                            <Typography variant="body2">{member.email}</Typography>
                          </Box>
                        </Box>
                        
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                            <Phone fontSize="small" color="action" />
                            <Typography variant="body2">{member.telefone}</Typography>
                          </Box>
                        </Box>
                        
                        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                          <Box>
                            <Typography variant="body2" color="text.secondary">
                              Posse: {format(member.dataPosse, 'dd/MM/yyyy', { locale: ptBR })}
                            </Typography>
                            <Chip
                              label={member.situacao}
                              color={getStatusColor(member.situacao) as any}
                              size="small"
                            />
                          </Box>
                          <IconButton
                            size="small"
                            onClick={() => handleEditMember(member)}
                          >
                            <Edit fontSize="small" />
                          </IconButton>
                        </Box>
                        
                        {member.observacoes && (
                          <Alert severity="info" sx={{ mt: 2 }}>
                            <Typography variant="body2">
                              {member.observacoes}
                            </Typography>
                          </Alert>
                        )}
                      </Box>
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        </TabPanel>

        <TabPanel value={currentTab} index={2}>
          <Typography variant="h6" gutterBottom>
            Processos da Comissão ({commission.processos.length})
          </Typography>
          
          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Protocolo</TableCell>
                  <TableCell>Tipo</TableCell>
                  <TableCell>Assunto</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Data</TableCell>
                  <TableCell>Prazo</TableCell>
                  <TableCell>Responsável</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {commission.processos.map((processo) => (
                  <TableRow key={processo.id}>
                    <TableCell>
                      <Typography variant="body2" fontWeight="bold">
                        {processo.protocolo}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={processo.tipo}
                        color={getTipoProcessoColor(processo.tipo) as any}
                        size="small"
                      />
                    </TableCell>
                    <TableCell>{processo.assunto}</TableCell>
                    <TableCell>
                      <Chip
                        label={processo.status}
                        color={getStatusColor(processo.status) as any}
                        size="small"
                      />
                    </TableCell>
                    <TableCell>
                      {format(processo.dataProtocolo, 'dd/MM/yyyy', { locale: ptBR })}
                    </TableCell>
                    <TableCell>
                      {processo.prazo 
                        ? format(processo.prazo, 'dd/MM/yyyy', { locale: ptBR })
                        : '-'
                      }
                    </TableCell>
                    <TableCell>{processo.responsavel || '-'}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </TabPanel>

        <TabPanel value={currentTab} index={3}>
          <Typography variant="h6" gutterBottom>
            Reuniões da Comissão ({commission.reunioes.length})
          </Typography>
          
          {commission.reunioes.map((reuniao) => (
            <Accordion key={reuniao.id}>
              <AccordionSummary expandIcon={<ExpandMore />}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, width: '100%' }}>
                  <Box sx={{ flex: 1 }}>
                    <Typography variant="h6">
                      {reuniao.assunto}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {format(reuniao.data, "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })} • {reuniao.tipo}
                    </Typography>
                  </Box>
                  <Chip
                    label={reuniao.situacao}
                    color={getStatusColor(reuniao.situacao) as any}
                    size="small"
                  />
                </Box>
              </AccordionSummary>
              <AccordionDetails>
                <Grid container spacing={3}>
                  <Grid item xs={12} md={6}>
                    <Typography variant="subtitle2" gutterBottom>
                      Informações da Reunião:
                    </Typography>
                    <Typography variant="body2">
                      <strong>Data:</strong> {format(reuniao.data, "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}
                    </Typography>
                    <Typography variant="body2">
                      <strong>Tipo:</strong> {reuniao.tipo}
                    </Typography>
                    <Typography variant="body2">
                      <strong>Situação:</strong> {reuniao.situacao}
                    </Typography>
                  </Grid>
                  
                  {reuniao.presentes && reuniao.presentes.length > 0 && (
                    <Grid item xs={12} md={6}>
                      <Typography variant="subtitle2" gutterBottom>
                        Presentes ({reuniao.presentes.length}):
                      </Typography>
                      <List dense>
                        {reuniao.presentes.map((presente, index) => (
                          <ListItem key={index}>
                            <ListItemIcon>
                              <Person fontSize="small" />
                            </ListItemIcon>
                            <ListItemText primary={presente} />
                          </ListItem>
                        ))}
                      </List>
                    </Grid>
                  )}
                  
                  {reuniao.deliberacoes && (
                    <Grid item xs={12}>
                      <Typography variant="subtitle2" gutterBottom>
                        Deliberações:
                      </Typography>
                      <Typography variant="body2">
                        {reuniao.deliberacoes}
                      </Typography>
                    </Grid>
                  )}
                  
                  {reuniao.ata && (
                    <Grid item xs={12}>
                      <Button
                        startIcon={<Assignment />}
                        variant="outlined"
                        size="small"
                      >
                        Download da Ata
                      </Button>
                    </Grid>
                  )}
                </Grid>
              </AccordionDetails>
            </Accordion>
          ))}
        </TabPanel>
      </Paper>

      {/* Member Dialog */}
      <Dialog open={openMemberDialog} onClose={() => setOpenMemberDialog(false)} maxWidth="sm" fullWidth>
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
                  <MenuItem value="Presidente">Presidente</MenuItem>
                  <MenuItem value="Vice-Presidente">Vice-Presidente</MenuItem>
                  <MenuItem value="Secretario">Secretário</MenuItem>
                  <MenuItem value="Membro Titular">Membro Titular</MenuItem>
                  <MenuItem value="Membro Suplente">Membro Suplente</MenuItem>
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
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenMemberDialog(false)}>Cancelar</Button>
          <Button onClick={handleSaveMember} variant="contained">
            {editingMember ? 'Atualizar' : 'Adicionar'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default CommissionDetail;