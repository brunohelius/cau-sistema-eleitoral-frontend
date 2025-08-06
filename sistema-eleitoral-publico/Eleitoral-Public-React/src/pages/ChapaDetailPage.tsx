import React, { useState } from 'react';
import {
  Container,
  Typography,
  Box,
  Card,
  CardContent,
  Chip,
  Grid,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  Avatar,
  Divider,
  Paper,
  Button,
  Alert,
  Breadcrumbs,
  Link,
  Tabs,
  Tab,
  CardMedia,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  IconButton,
  Tooltip,
  ListItemIcon
} from '@mui/material';
import {
  Timeline,
  TimelineItem,
  TimelineSeparator,
  TimelineConnector,
  TimelineContent,
  TimelineDot
} from '@mui/lab';
import {
  Person as PersonIcon,
  CalendarMonth as CalendarIcon,
  LocationOn as LocationIcon,
  ArrowBack as ArrowBackIcon,
  Groups as GroupsIcon,
  Email as EmailIcon,
  Badge as BadgeIcon,
  Description as DescriptionIcon,
  Phone as PhoneIcon,
  Work as WorkIcon,
  School as SchoolIcon,
  Star as StarIcon,
  Timeline as TimelineIcon,
  Assignment as AssignmentIcon,
  ExpandMore as ExpandMoreIcon,
  Download as DownloadIcon,
  Share as ShareIcon,
  Print as PrintIcon,
  Visibility as VisibilityIcon,
  HowToVote as VoteIcon,
  CheckCircle as CheckCircleIcon,
  Warning as WarningIcon,
  History as HistoryIcon
} from '@mui/icons-material';
import { useParams, useNavigate } from 'react-router-dom';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

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
      id={`chapa-tabpanel-${index}`}
      aria-labelledby={`chapa-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ py: 3 }}>{children}</Box>}
    </div>
  );
}

// Mock enhanced data for comprehensive chapa details
const mockChapaEnhanced = {
  id: 1,
  nome: 'Renovação CAU',
  numero: 1,
  slogan: 'Construindo o Futuro da Arquitetura',
  status: 'Aprovada',
  eleicao: {
    id: 1,
    titulo: 'Eleições CAU Nacional 2024',
    tipo: 'Nacional',
    dataInicio: new Date('2024-06-01'),
    dataFim: new Date('2024-06-07')
  },
  logo: '/chapas/logo-renovacao.png',
  banner: '/chapas/banner-renovacao.jpg',
  cor: '#4CAF50',
  
  // Detailed proposals
  propostas: {
    resumo: 'Nossa chapa propõe uma renovação completa na gestão do CAU, focando na transparência, modernização dos serviços e valorização profissional.',
    eixos: [
      {
        titulo: 'Transparência e Gestão',
        itens: [
          'Implementação de portal de transparência com dados em tempo real',
          'Criação de canal direto de comunicação com profissionais',
          'Realização de assembleias regionais trimestrais',
          'Publicação mensal de relatórios de atividades'
        ]
      },
      {
        titulo: 'Modernização Tecnológica',
        itens: [
          'Digitalização completa dos serviços do CAU',
          'Aplicativo móvel para emissão de RRT',
          'Sistema integrado de fiscalização',
          'Plataforma online para educação continuada'
        ]
      },
      {
        titulo: 'Valorização Profissional',
        itens: [
          'Campanha nacional de valorização da profissão',
          'Programa de mentoria para recém-formados',
          'Convênios com instituições de ensino',
          'Criação de prêmios de reconhecimento profissional'
        ]
      },
      {
        titulo: 'Sustentabilidade e Inovação',
        itens: [
          'Promoção de arquitetura sustentável',
          'Incentivo a tecnologias construtivas inovadoras',
          'Parcerias com startups do setor',
          'Programa de eficiência energética'
        ]
      }
    ]
  },
  
  // Enhanced member details
  membros: [
    {
      id: 1,
      nome: 'Dr. Roberto Silva Santos',
      cargo: 'Coordenador',
      tipoCargo: 'Presidente',
      foto: '/membros/roberto.jpg',
      cau: 'A123456-7',
      cpf: '123.456.789-00',
      email: 'roberto@renovacaocau.org',
      telefone: '(11) 99999-0001',
      curriculo: {
        formacao: 'Doutor em Arquitetura pela USP',
        experiencia: '25 anos de experiência profissional',
        especializacoes: ['Arquitetura Hospitalar', 'Sustentabilidade', 'Gestão de Projetos'],
        obras_relevantes: [
          'Hospital das Clínicas - Ala Norte (2019)',
          'Centro Cultural de São Paulo (2020)',
          'Complexo Residencial EcoVille (2021)'
        ],
        premios: [
          'Prêmio IAB de Arquitetura (2020)',
          'Reconhecimento CREA-SP (2019)'
        ]
      },
      plataforma: 'Minha visão é transformar o CAU numa instituição mais próxima dos profissionais, utilizando tecnologia para simplificar processos e valorizando o trabalho do arquiteto e urbanista no desenvolvimento sustentável das cidades.'
    },
    {
      id: 2,
      nome: 'Arq. Maria Santos Lima',
      cargo: 'Vice',
      tipoCargo: 'Vice-Presidente',
      foto: '/membros/maria.jpg',
      cau: 'A789012-3',
      cpf: '987.654.321-00',
      email: 'maria@renovacaocau.org',
      telefone: '(11) 88888-0002',
      curriculo: {
        formacao: 'Mestre em Urbanismo pela UFRJ',
        experiencia: '18 anos em projetos urbanos',
        especializacoes: ['Planejamento Urbano', 'Mobilidade Urbana', 'Habitação Social'],
        obras_relevantes: [
          'Plano Diretor de Guarulhos (2018)',
          'Projeto de Revitalização Centro SP (2020)'
        ],
        premios: [
          'Menção Honrosa Concurso Operação Urbana (2019)'
        ]
      },
      plataforma: 'Acredito numa arquitetura que sirva à sociedade, priorizando projetos de habitação social e planejamento urbano sustentável.'
    },
    {
      id: 3,
      nome: 'Eng. Carlos Oliveira Costa',
      cargo: 'Membro',
      tipoCargo: 'Conselheiro Titular',
      foto: '/membros/carlos.jpg',
      cau: 'A345678-9',
      cpf: '456.789.123-00',
      email: 'carlos@renovacaocau.org',
      telefone: '(11) 77777-0003',
      curriculo: {
        formacao: 'Especialista em Estruturas pela PUC-SP',
        experiencia: '22 anos em projetos estruturais',
        especializacoes: ['Estruturas Metálicas', 'Pontes', 'Grandes Vãos'],
        obras_relevantes: [
          'Estádio Arena Paulista (2017)',
          'Ponte Estaiada Santos (2019)'
        ]
      },
      plataforma: 'Meu foco é na segurança estrutural e inovação tecnológica na construção civil.'
    }
  ],
  
  // Process timeline
  timeline: [
    {
      data: new Date('2024-01-15'),
      evento: 'Registro da Chapa',
      status: 'concluido',
      descricao: 'Chapa registrada com sucesso no sistema'
    },
    {
      data: new Date('2024-01-20'),
      evento: 'Análise de Documentação',
      status: 'concluido',
      descricao: 'Documentação analisada e aprovada'
    },
    {
      data: new Date('2024-02-01'),
      evento: 'Homologação',
      status: 'concluido',
      descricao: 'Chapa homologada pela Comissão Eleitoral'
    },
    {
      data: new Date('2024-05-01'),
      evento: 'Início da Campanha',
      status: 'concluido',
      descricao: 'Início oficial do período de campanha'
    },
    {
      data: new Date('2024-06-01'),
      evento: 'Período de Votação',
      status: 'concluido',
      descricao: 'Chapa participou do processo eleitoral'
    },
    {
      data: new Date('2024-06-08'),
      evento: 'Resultado Final',
      status: 'concluido',
      descricao: 'Chapa eleita com 45.9% dos votos'
    }
  ],
  
  // Documents
  documentos: [
    {
      id: 1,
      nome: 'Programa de Gestão',
      tipo: 'programa',
      tamanho: '2.5 MB',
      dataUpload: new Date('2024-01-15'),
      url: '/documentos/programa-gestao.pdf'
    },
    {
      id: 2,
      nome: 'Declaração de Elegibilidade',
      tipo: 'declaracao',
      tamanho: '1.2 MB',
      dataUpload: new Date('2024-01-15'),
      url: '/documentos/declaracao-elegibilidade.pdf'
    },
    {
      id: 3,
      nome: 'Currículo dos Candidatos',
      tipo: 'curriculo',
      tamanho: '3.8 MB',
      dataUpload: new Date('2024-01-16'),
      url: '/documentos/curriculos.pdf'
    }
  ],
  
  // Statistics
  estatisticas: {
    votos: 4521,
    percentual: 45.9,
    posicao: 1,
    totalChapas: 3,
    situacao: 'Eleita'
  }
};

export const ChapaDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const chapaId = parseInt(id || '0');
  const [activeTab, setActiveTab] = useState(0);
  const [selectedMembro, setSelectedMembro] = useState<any>(null);
  const [membroDialog, setMembroDialog] = useState(false);

  // Using mock data for comprehensive display
  const chapa = mockChapaEnhanced;
  const isLoading = false;
  const error = null;

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setActiveTab(newValue);
  };

  const handleViewMembro = (membro: any) => {
    setSelectedMembro(membro);
    setMembroDialog(true);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Aprovada':
        return 'success';
      case 'EmAnalise':
        return 'warning';
      case 'Rejeitada':
        return 'error';
      case 'Rascunho':
        return 'default';
      default:
        return 'default';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'Aprovada':
        return 'Aprovada';
      case 'EmAnalise':
        return 'Em Análise';
      case 'Rejeitada':
        return 'Rejeitada';
      case 'Rascunho':
        return 'Rascunho';
      default:
        return status;
    }
  };

  const getTimelineIcon = (status: string) => {
    switch (status) {
      case 'concluido':
        return <CheckCircleIcon />;
      case 'em_andamento':
        return <WarningIcon />;
      default:
        return <HistoryIcon />;
    }
  };

  const getTimelineColor = (status: string) => {
    switch (status) {
      case 'concluido':
        return 'success';
      case 'em_andamento':
        return 'warning';
      default:
        return 'grey';
    }
  };

  if (isLoading) {
    return (
      <Container maxWidth="xl" sx={{ py: 4 }}>
        <Box textAlign="center" py={8}>
          <Typography>Carregando detalhes da chapa...</Typography>
        </Box>
      </Container>
    );
  }

  if (error || !chapa) {
    return (
      <Container maxWidth="xl" sx={{ py: 4 }}>
        <Alert severity="error">
          <Typography>
            Erro ao carregar os detalhes da chapa. Tente novamente mais tarde.
          </Typography>
        </Alert>
      </Container>
    );
  }

  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      {/* Header */}
      <Box mb={4}>
        <Button 
          startIcon={<ArrowBackIcon />}
          onClick={() => navigate('/chapas')}
          sx={{ mb: 2 }}
        >
          Voltar às Chapas
        </Button>

        {/* Banner */}
        <Card sx={{ mb: 3 }}>
          <CardMedia
            component="div"
            sx={{
              height: 300,
              background: `linear-gradient(135deg, ${chapa.cor}22 0%, ${chapa.cor}44 100%)`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              position: 'relative'
            }}
          >
            <Box textAlign="center" color="white">
              <Box 
                sx={{
                  width: 120,
                  height: 120,
                  borderRadius: '50%',
                  bgcolor: chapa.cor,
                  color: 'white',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '3rem',
                  fontWeight: 'bold',
                  mx: 'auto',
                  mb: 2,
                  border: '4px solid white'
                }}
              >
                {chapa.numero}
              </Box>
              <Typography variant="h3" fontWeight="bold" gutterBottom>
                {chapa.nome}
              </Typography>
              <Typography variant="h6" sx={{ opacity: 0.9 }}>
                {chapa.slogan}
              </Typography>
            </Box>
            
            <Box position="absolute" top={16} right={16}>
              <Chip
                icon={chapa.estatisticas.situacao === 'Eleita' ? <VoteIcon /> : undefined}
                label={chapa.estatisticas.situacao}
                color={chapa.estatisticas.situacao === 'Eleita' ? 'success' : 'default'}
                sx={{ fontWeight: 'bold' }}
              />
            </Box>
          </CardMedia>
        </Card>

        {/* Quick Stats */}
        {chapa.estatisticas && (
          <Grid container spacing={2} sx={{ mb: 3 }}>
            <Grid item xs={12} sm={3}>
              <Card>
                <CardContent sx={{ textAlign: 'center' }}>
                  <VoteIcon sx={{ fontSize: 40, color: 'primary.main', mb: 1 }} />
                  <Typography variant="h4" fontWeight="bold" color="primary.main">
                    {chapa.estatisticas.votos.toLocaleString()}
                  </Typography>
                  <Typography variant="body2" color="textSecondary">
                    Votos Recebidos
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} sm={3}>
              <Card>
                <CardContent sx={{ textAlign: 'center' }}>
                  <StarIcon sx={{ fontSize: 40, color: 'warning.main', mb: 1 }} />
                  <Typography variant="h4" fontWeight="bold" color="warning.main">
                    {chapa.estatisticas.percentual}%
                  </Typography>
                  <Typography variant="body2" color="textSecondary">
                    Percentual
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} sm={3}>
              <Card>
                <CardContent sx={{ textAlign: 'center' }}>
                  <GroupsIcon sx={{ fontSize: 40, color: 'info.main', mb: 1 }} />
                  <Typography variant="h4" fontWeight="bold" color="info.main">
                    {chapa.membros.length}
                  </Typography>
                  <Typography variant="body2" color="textSecondary">
                    Membros
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} sm={3}>
              <Card>
                <CardContent sx={{ textAlign: 'center' }}>
                  <AssignmentIcon sx={{ fontSize: 40, color: 'success.main', mb: 1 }} />
                  <Typography variant="h4" fontWeight="bold" color="success.main">
                    {chapa.estatisticas.posicao}º
                  </Typography>
                  <Typography variant="body2" color="textSecondary">
                    Posição
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        )}

        {/* Action Buttons */}
        <Box display="flex" gap={2} mb={3}>
          <Button
            variant="outlined"
            startIcon={<PrintIcon />}
            onClick={() => window.print()}
          >
            Imprimir
          </Button>
          <Button
            variant="outlined"
            startIcon={<ShareIcon />}
          >
            Compartilhar
          </Button>
          <Button
            variant="outlined"
            startIcon={<DownloadIcon />}
          >
            Baixar Programa
          </Button>
        </Box>
      </Box>

      {/* Tabs */}
      <Paper sx={{ mb: 2 }}>
        <Tabs value={activeTab} onChange={handleTabChange}>
          <Tab icon={<GroupsIcon />} label="Membros" />
          <Tab icon={<DescriptionIcon />} label="Propostas" />
          <Tab icon={<TimelineIcon />} label="Histórico" />
          <Tab icon={<AssignmentIcon />} label="Documentos" />
          <Tab icon={<VoteIcon />} label="Estatísticas" />
        </Tabs>
      </Paper>

      {/* Tab Panels */}
      <Paper>
        {/* Members Tab */}
        <TabPanel value={activeTab} index={0}>
          <Typography variant="h6" gutterBottom fontWeight="bold">
            Membros da Chapa
          </Typography>
          
          <Grid container spacing={3}>
            {chapa.membros.map((membro) => (
              <Grid item xs={12} md={6} key={membro.id}>
                <Card>
                  <CardContent>
                    <Box display="flex" alignItems="center" gap={2} mb={2}>
                      <Avatar 
                        src={membro.foto}
                        sx={{ width: 80, height: 80 }}
                      >
                        {membro.nome.split(' ').map(n => n[0]).join('').substring(0, 2)}
                      </Avatar>
                      <Box>
                        <Typography variant="h6" fontWeight="bold">
                          {membro.nome}
                        </Typography>
                        <Typography variant="body2" color="textSecondary">
                          {membro.tipoCargo}
                        </Typography>
                        <Typography variant="caption" color="textSecondary">
                          CAU: {membro.cau}
                        </Typography>
                      </Box>
                    </Box>

                    <Box mb={2}>
                      <Typography variant="body2" fontWeight="bold" gutterBottom>
                        Contato:
                      </Typography>
                      <Box display="flex" alignItems="center" gap={1} mb={1}>
                        <EmailIcon sx={{ fontSize: 16, color: 'text.secondary' }} />
                        <Typography variant="body2">
                          {membro.email}
                        </Typography>
                      </Box>
                      <Box display="flex" alignItems="center" gap={1}>
                        <PhoneIcon sx={{ fontSize: 16, color: 'text.secondary' }} />
                        <Typography variant="body2">
                          {membro.telefone}
                        </Typography>
                      </Box>
                    </Box>

                    <Typography variant="body2" paragraph>
                      {membro.plataforma}
                    </Typography>

                    <Button
                      variant="outlined"
                      startIcon={<VisibilityIcon />}
                      onClick={() => handleViewMembro(membro)}
                      fullWidth
                    >
                      Ver Currículo Completo
                    </Button>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        </TabPanel>

        {/* Proposals Tab */}
        <TabPanel value={activeTab} index={1}>
          <Typography variant="h6" gutterBottom fontWeight="bold">
            Programa de Gestão
          </Typography>
          
          <Alert severity="info" sx={{ mb: 3 }}>
            <Typography variant="body2">
              {chapa.propostas.resumo}
            </Typography>
          </Alert>

          {chapa.propostas.eixos.map((eixo, index) => (
            <Accordion key={index} defaultExpanded={index === 0}>
              <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                <Typography variant="h6" fontWeight="bold">
                  {eixo.titulo}
                </Typography>
              </AccordionSummary>
              <AccordionDetails>
                <List>
                  {eixo.itens.map((item, itemIndex) => (
                    <ListItem key={itemIndex}>
                      <ListItemText
                        primary={item}
                        sx={{ pl: 2 }}
                      />
                    </ListItem>
                  ))}
                </List>
              </AccordionDetails>
            </Accordion>
          ))}
        </TabPanel>

        {/* Timeline Tab */}
        <TabPanel value={activeTab} index={2}>
          <Typography variant="h6" gutterBottom fontWeight="bold">
            Histórico do Processo
          </Typography>
          
          <Timeline>
            {chapa.timeline.map((evento, index) => (
              <TimelineItem key={index}>
                <TimelineSeparator>
                  <TimelineDot color={getTimelineColor(evento.status) as any}>
                    {getTimelineIcon(evento.status)}
                  </TimelineDot>
                  {index < chapa.timeline.length - 1 && <TimelineConnector />}
                </TimelineSeparator>
                <TimelineContent>
                  <Paper sx={{ p: 2, mb: 2 }}>
                    <Typography variant="subtitle1" fontWeight="bold">
                      {evento.evento}
                    </Typography>
                    <Typography variant="body2" color="textSecondary" gutterBottom>
                      {format(evento.data, 'dd/MM/yyyy', { locale: ptBR })}
                    </Typography>
                    <Typography variant="body2">
                      {evento.descricao}
                    </Typography>
                  </Paper>
                </TimelineContent>
              </TimelineItem>
            ))}
          </Timeline>
        </TabPanel>

        {/* Documents Tab */}
        <TabPanel value={activeTab} index={3}>
          <Typography variant="h6" gutterBottom fontWeight="bold">
            Documentos da Chapa
          </Typography>
          
          <TableContainer component={Paper} variant="outlined">
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell><strong>Documento</strong></TableCell>
                  <TableCell><strong>Tipo</strong></TableCell>
                  <TableCell><strong>Tamanho</strong></TableCell>
                  <TableCell><strong>Data</strong></TableCell>
                  <TableCell><strong>Ações</strong></TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {chapa.documentos.map((doc) => (
                  <TableRow key={doc.id}>
                    <TableCell>
                      <Box display="flex" alignItems="center" gap={1}>
                        <DescriptionIcon />
                        {doc.nome}
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Chip label={doc.tipo} size="small" variant="outlined" />
                    </TableCell>
                    <TableCell>{doc.tamanho}</TableCell>
                    <TableCell>
                      {format(doc.dataUpload, 'dd/MM/yyyy', { locale: ptBR })}
                    </TableCell>
                    <TableCell>
                      <IconButton size="small" disabled>
                        <DownloadIcon />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </TabPanel>

        {/* Statistics Tab */}
        <TabPanel value={activeTab} index={4}>
          <Typography variant="h6" gutterBottom fontWeight="bold">
            Estatísticas da Chapa
          </Typography>
          
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    Resultado da Eleição
                  </Typography>
                  <List>
                    <ListItem>
                      <ListItemText
                        primary="Situação"
                        secondary={chapa.estatisticas.situacao}
                      />
                    </ListItem>
                    <ListItem>
                      <ListItemText
                        primary="Votos Recebidos"
                        secondary={`${chapa.estatisticas.votos.toLocaleString()} votos`}
                      />
                    </ListItem>
                    <ListItem>
                      <ListItemText
                        primary="Percentual"
                        secondary={`${chapa.estatisticas.percentual}% dos votos válidos`}
                      />
                    </ListItem>
                    <ListItem>
                      <ListItemText
                        primary="Posição"
                        secondary={`${chapa.estatisticas.posicao}º lugar de ${chapa.estatisticas.totalChapas} chapas`}
                      />
                    </ListItem>
                  </List>
                </CardContent>
              </Card>
            </Grid>
            
            <Grid item xs={12} md={6}>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    Informações da Eleição
                  </Typography>
                  <List>
                    <ListItem>
                      <ListItemText
                        primary="Eleição"
                        secondary={chapa.eleicao.titulo}
                      />
                    </ListItem>
                    <ListItem>
                      <ListItemText
                        primary="Tipo"
                        secondary={chapa.eleicao.tipo}
                      />
                    </ListItem>
                    <ListItem>
                      <ListItemText
                        primary="Período de Votação"
                        secondary={`${format(chapa.eleicao.dataInicio, 'dd/MM/yyyy', { locale: ptBR })} - ${format(chapa.eleicao.dataFim, 'dd/MM/yyyy', { locale: ptBR })}`}
                      />
                    </ListItem>
                    <ListItem>
                      <ListItemText
                        primary="Status"
                        secondary={getStatusLabel(chapa.status)}
                      />
                    </ListItem>
                  </List>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </TabPanel>
      </Paper>

      {/* Member Details Dialog */}
      <Dialog
        open={membroDialog}
        onClose={() => setMembroDialog(false)}
        maxWidth="md"
        fullWidth
      >
        {selectedMembro && (
          <>
            <DialogTitle>
              <Box display="flex" alignItems="center" gap={2}>
                <Avatar 
                  src={selectedMembro.foto}
                  sx={{ width: 60, height: 60 }}
                >
                  {selectedMembro.nome.split(' ').map((n: string) => n[0]).join('').substring(0, 2)}
                </Avatar>
                <Box>
                  <Typography variant="h6" fontWeight="bold">
                    {selectedMembro.nome}
                  </Typography>
                  <Typography variant="body2" color="textSecondary">
                    {selectedMembro.tipoCargo}
                  </Typography>
                </Box>
              </Box>
            </DialogTitle>
            <DialogContent>
              <Grid container spacing={3}>
                <Grid item xs={12} md={6}>
                  <Typography variant="h6" gutterBottom>
                    Informações Profissionais
                  </Typography>
                  <List dense>
                    <ListItem>
                      <ListItemIcon><SchoolIcon /></ListItemIcon>
                      <ListItemText
                        primary="Formação"
                        secondary={selectedMembro.curriculo.formacao}
                      />
                    </ListItem>
                    <ListItem>
                      <ListItemIcon><WorkIcon /></ListItemIcon>
                      <ListItemText
                        primary="Experiência"
                        secondary={selectedMembro.curriculo.experiencia}
                      />
                    </ListItem>
                    <ListItem>
                      <ListItemIcon><BadgeIcon /></ListItemIcon>
                      <ListItemText
                        primary="CAU"
                        secondary={selectedMembro.cau}
                      />
                    </ListItem>
                  </List>
                </Grid>
                
                <Grid item xs={12} md={6}>
                  <Typography variant="h6" gutterBottom>
                    Contato
                  </Typography>
                  <List dense>
                    <ListItem>
                      <ListItemIcon><EmailIcon /></ListItemIcon>
                      <ListItemText
                        primary="Email"
                        secondary={selectedMembro.email}
                      />
                    </ListItem>
                    <ListItem>
                      <ListItemIcon><PhoneIcon /></ListItemIcon>
                      <ListItemText
                        primary="Telefone"
                        secondary={selectedMembro.telefone}
                      />
                    </ListItem>
                  </List>
                </Grid>

                {selectedMembro.curriculo.especializacoes && (
                  <Grid item xs={12}>
                    <Typography variant="h6" gutterBottom>
                      Especializações
                    </Typography>
                    <Box display="flex" gap={1} flexWrap="wrap">
                      {selectedMembro.curriculo.especializacoes.map((esp: string, index: number) => (
                        <Chip key={index} label={esp} variant="outlined" />
                      ))}
                    </Box>
                  </Grid>
                )}

                {selectedMembro.curriculo.obras_relevantes && (
                  <Grid item xs={12}>
                    <Typography variant="h6" gutterBottom>
                      Obras Relevantes
                    </Typography>
                    <List dense>
                      {selectedMembro.curriculo.obras_relevantes.map((obra: string, index: number) => (
                        <ListItem key={index}>
                          <ListItemText primary={obra} />
                        </ListItem>
                      ))}
                    </List>
                  </Grid>
                )}

                {selectedMembro.curriculo.premios && (
                  <Grid item xs={12}>
                    <Typography variant="h6" gutterBottom>
                      Prêmios e Reconhecimentos
                    </Typography>
                    <List dense>
                      {selectedMembro.curriculo.premios.map((premio: string, index: number) => (
                        <ListItem key={index}>
                          <ListItemIcon><StarIcon color="warning" /></ListItemIcon>
                          <ListItemText primary={premio} />
                        </ListItem>
                      ))}
                    </List>
                  </Grid>
                )}

                <Grid item xs={12}>
                  <Typography variant="h6" gutterBottom>
                    Plataforma Pessoal
                  </Typography>
                  <Typography variant="body2">
                    {selectedMembro.plataforma}
                  </Typography>
                </Grid>
              </Grid>
            </DialogContent>
            <DialogActions>
              <Button onClick={() => setMembroDialog(false)}>
                Fechar
              </Button>
            </DialogActions>
          </>
        )}
      </Dialog>
    </Container>
  );
};