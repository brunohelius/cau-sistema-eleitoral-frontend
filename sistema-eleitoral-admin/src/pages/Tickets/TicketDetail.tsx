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
} from '@mui/material';
import {
  ArrowBack,
  Edit,
  People,
  Assignment,
  Gavel,
  CheckCircle,
  Warning,
  Person,
} from '@mui/icons-material';
import { useParams, useNavigate } from 'react-router-dom';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface Member {
  id: string;
  nome: string;
  cpf: string;
  email: string;
  cargo: 'Presidente' | 'Vice-Presidente' | 'Secretario' | 'Tesoureiro' | 'Conselheiro';
  situacao: 'Aprovado' | 'Pendente' | 'Rejeitado';
  documentos: string[];
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
  totalVotos?: number;
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
      id={`ticket-tabpanel-${index}`}
      aria-labelledby={`ticket-tab-${index}`}
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

export const TicketDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [currentTab, setCurrentTab] = useState(0);
  const [ticket, setTicket] = useState<Ticket | null>(null);
  const [loading, setLoading] = useState(true);

  // Mock data - replace with API call
  useEffect(() => {
    const mockTicket: Ticket = {
      id: id || '1',
      nome: 'Chapa Renovação CAU',
      numero: '01',
      slogan: 'Inovação e Transparência para o CAU',
      eleicaoId: '1',
      eleicaoNome: 'Eleições CAU/BR 2024',
      status: 'Aprovada',
      dataRegistro: new Date('2024-02-01'),
      responsavel: 'João Silva',
      totalVotos: 450,
      membros: [
        {
          id: '1',
          nome: 'João Silva',
          cpf: '123.456.789-00',
          email: 'joao@email.com',
          cargo: 'Presidente',
          situacao: 'Aprovado',
          documentos: ['RG', 'CPF', 'Comprovante CAU'],
        },
        {
          id: '2',
          nome: 'Maria Santos',
          cpf: '987.654.321-00',
          email: 'maria@email.com',
          cargo: 'Vice-Presidente',
          situacao: 'Aprovado',
          documentos: ['RG', 'CPF', 'Comprovante CAU'],
        },
        {
          id: '3',
          nome: 'Pedro Costa',
          cpf: '456.789.123-00',
          email: 'pedro@email.com',
          cargo: 'Secretario',
          situacao: 'Pendente',
          documentos: ['RG', 'CPF'],
        },
      ],
    };
    setTicket(mockTicket);
    setLoading(false);
  }, [id]);

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setCurrentTab(newValue);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Aprovada': return 'success';
      case 'Em Analise': return 'warning';
      case 'Registrada': return 'info';
      case 'Rejeitada': return 'error';
      default: return 'default';
    }
  };

  const getSituacaoColor = (situacao: string) => {
    switch (situacao) {
      case 'Aprovado': return 'success';
      case 'Pendente': return 'warning';
      case 'Rejeitado': return 'error';
      default: return 'default';
    }
  };

  const getSituacaoIcon = (situacao: string) => {
    switch (situacao) {
      case 'Aprovado': return <CheckCircle color="success" />;
      case 'Pendente': return <Warning color="warning" />;
      case 'Rejeitado': return <Warning color="error" />;
      default: return <Person />;
    }
  };

  if (loading || !ticket) {
    return (
      <Box sx={{ p: 3 }}>
        <Typography>Carregando...</Typography>
      </Box>
    );
  }

  const approvedMembers = ticket.membros.filter(m => m.situacao === 'Aprovado').length;
  const pendingMembers = ticket.membros.filter(m => m.situacao === 'Pendente').length;
  const rejectedMembers = ticket.membros.filter(m => m.situacao === 'Rejeitado').length;

  return (
    <Box sx={{ p: 3 }}>
      {/* Header */}
      <Box sx={{ mb: 3, display: 'flex', alignItems: 'center', gap: 2 }}>
        <IconButton onClick={() => navigate('/chapas')}>
          <ArrowBack />
        </IconButton>
        <Box sx={{ flex: 1 }}>
          <Typography variant="h4" gutterBottom>
            Chapa {ticket.numero} - {ticket.nome}
          </Typography>
          <Typography variant="body1" color="text.secondary">
            {ticket.slogan}
          </Typography>
        </Box>
        <Chip
          label={ticket.status}
          color={getStatusColor(ticket.status) as any}
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
                Total de Membros
              </Typography>
              <Typography variant="h4">
                {ticket.membros.length}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={3}>
          <Card>
            <CardContent>
              <Typography color="text.secondary" gutterBottom>
                Membros Aprovados
              </Typography>
              <Typography variant="h4" color="success.main">
                {approvedMembers}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={3}>
          <Card>
            <CardContent>
              <Typography color="text.secondary" gutterBottom>
                Pendentes
              </Typography>
              <Typography variant="h4" color="warning.main">
                {pendingMembers}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={3}>
          <Card>
            <CardContent>
              <Typography color="text.secondary" gutterBottom>
                Total de Votos
              </Typography>
              <Typography variant="h4">
                {ticket.totalVotos || 0}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Status Alert */}
      {pendingMembers > 0 && (
        <Alert severity="warning" sx={{ mb: 3 }}>
          Existem {pendingMembers} membro(s) com situação pendente que precisam de análise.
        </Alert>
      )}

      {/* Tabs */}
      <Paper sx={{ width: '100%' }}>
        <Tabs
          value={currentTab}
          onChange={handleTabChange}
          aria-label="ticket-tabs"
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
        </Tabs>

        <TabPanel value={currentTab} index={0}>
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    Detalhes da Chapa
                  </Typography>
                  <Box sx={{ mt: 2 }}>
                    <Typography variant="body2" color="text.secondary">
                      Eleição
                    </Typography>
                    <Typography variant="body1" sx={{ mb: 2 }}>
                      {ticket.eleicaoNome}
                    </Typography>
                    
                    <Typography variant="body2" color="text.secondary">
                      Data de Registro
                    </Typography>
                    <Typography variant="body1" sx={{ mb: 2 }}>
                      {format(ticket.dataRegistro, 'dd/MM/yyyy', { locale: ptBR })}
                    </Typography>
                    
                    <Typography variant="body2" color="text.secondary">
                      Responsável
                    </Typography>
                    <Typography variant="body1">
                      {ticket.responsavel}
                    </Typography>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
            
            <Grid item xs={12} md={6}>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    Composição
                  </Typography>
                  <Box sx={{ mt: 2 }}>
                    <Typography variant="body2" color="text.secondary">
                      Status da Chapa
                    </Typography>
                    <Chip
                      label={ticket.status}
                      color={getStatusColor(ticket.status) as any}
                      sx={{ mb: 2 }}
                    />
                    
                    <Typography variant="body2" color="text.secondary">
                      Progresso da Validação
                    </Typography>
                    <Typography variant="h6">
                      {approvedMembers} de {ticket.membros.length} membros aprovados
                    </Typography>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </TabPanel>

        <TabPanel value={currentTab} index={1}>
          <Typography variant="h6" gutterBottom>
            Membros da Chapa
          </Typography>
          <List>
            {ticket.membros.map((member, index) => (
              <React.Fragment key={member.id}>
                <ListItem alignItems="flex-start">
                  <ListItemAvatar>
                    <Avatar sx={{ bgcolor: 'primary.main' }}>
                      {member.nome.charAt(0)}
                    </Avatar>
                  </ListItemAvatar>
                  <ListItemText
                    primary={
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Typography variant="h6">
                          {member.nome}
                        </Typography>
                        <Chip
                          label={member.cargo}
                          size="small"
                          color="primary"
                        />
                        <Chip
                          label={member.situacao}
                          size="small"
                          color={getSituacaoColor(member.situacao) as any}
                          icon={getSituacaoIcon(member.situacao)}
                        />
                      </Box>
                    }
                    secondary={
                      <Box>
                        <Typography variant="body2" color="text.secondary">
                          CPF: {member.cpf} • Email: {member.email}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          Documentos: {member.documentos.join(', ')}
                        </Typography>
                      </Box>
                    }
                  />
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                    <Button size="small" variant="outlined">
                      Ver Detalhes
                    </Button>
                    {member.situacao === 'Pendente' && (
                      <Button size="small" variant="contained" color="success">
                        Aprovar
                      </Button>
                    )}
                  </Box>
                </ListItem>
                {index < ticket.membros.length - 1 && <Divider variant="inset" component="li" />}
              </React.Fragment>
            ))}
          </List>
        </TabPanel>

        <TabPanel value={currentTab} index={2}>
          <Typography variant="h6" gutterBottom>
            Processos Relacionados
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Impugnações, denúncias e outros processos relacionados a esta chapa.
          </Typography>
        </TabPanel>
      </Paper>
    </Box>
  );
};

export default TicketDetail;