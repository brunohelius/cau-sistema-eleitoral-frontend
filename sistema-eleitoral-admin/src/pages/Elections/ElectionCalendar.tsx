import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Button,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Grid,
  Chip,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  MenuItem,
  FormControl,
  InputLabel,
  Select,
} from '@mui/material';
import {
  ArrowBack,
  Add,
  Edit,
  Delete,
  Event,
  Schedule,
} from '@mui/icons-material';
import { useParams, useNavigate } from 'react-router-dom';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface CalendarEvent {
  id: string;
  titulo: string;
  descricao: string;
  dataInicio: Date;
  dataFim: Date;
  tipo: 'Prazo' | 'Evento' | 'Atividade';
  status: 'Pendente' | 'Em Andamento' | 'Concluido';
  responsavel: string;
}

export const ElectionCalendar: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [openDialog, setOpenDialog] = useState(false);
  const [editingEvent, setEditingEvent] = useState<CalendarEvent | null>(null);
  const [formData, setFormData] = useState({
    titulo: '',
    descricao: '',
    dataInicio: new Date(),
    dataFim: new Date(),
    tipo: 'Evento' as 'Prazo' | 'Evento' | 'Atividade',
    responsavel: '',
  });

  // Mock data
  useEffect(() => {
    const mockEvents: CalendarEvent[] = [
      {
        id: '1',
        titulo: 'Início do Registro de Chapas',
        descricao: 'Período para registro de chapas eleitorais',
        dataInicio: new Date('2024-02-01'),
        dataFim: new Date('2024-02-15'),
        tipo: 'Prazo',
        status: 'Concluido',
        responsavel: 'Comissão Eleitoral',
      },
      {
        id: '2',
        titulo: 'Validação de Candidatos',
        descricao: 'Processo de validação dos candidatos registrados',
        dataInicio: new Date('2024-02-16'),
        dataFim: new Date('2024-02-28'),
        tipo: 'Atividade',
        status: 'Em Andamento',
        responsavel: 'Comissão Eleitoral',
      },
      {
        id: '3',
        titulo: 'Início da Votação',
        descricao: 'Abertura oficial do processo de votação',
        dataInicio: new Date('2024-03-15'),
        dataFim: new Date('2024-03-15'),
        tipo: 'Evento',
        status: 'Pendente',
        responsavel: 'Sistema',
      },
    ];
    setEvents(mockEvents);
  }, []);

  const handleOpenDialog = (event?: CalendarEvent) => {
    if (event) {
      setEditingEvent(event);
      setFormData({
        titulo: event.titulo,
        descricao: event.descricao,
        dataInicio: event.dataInicio,
        dataFim: event.dataFim,
        tipo: event.tipo,
        responsavel: event.responsavel,
      });
    } else {
      setEditingEvent(null);
      setFormData({
        titulo: '',
        descricao: '',
        dataInicio: new Date(),
        dataFim: new Date(),
        tipo: 'Evento',
        responsavel: '',
      });
    }
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setEditingEvent(null);
  };

  const handleSubmit = () => {
    if (editingEvent) {
      // Update existing event
      setEvents(events.map(event => 
        event.id === editingEvent.id 
          ? { ...event, ...formData, id: event.id, status: event.status }
          : event
      ));
    } else {
      // Add new event
      const newEvent: CalendarEvent = {
        id: Date.now().toString(),
        ...formData,
        status: 'Pendente',
      };
      setEvents([...events, newEvent]);
    }
    handleCloseDialog();
  };

  const handleDeleteEvent = (eventId: string) => {
    setEvents(events.filter(event => event.id !== eventId));
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Concluido': return 'success';
      case 'Em Andamento': return 'warning';
      case 'Pendente': return 'default';
      default: return 'default';
    }
  };

  const getTipoColor = (tipo: string) => {
    switch (tipo) {
      case 'Prazo': return 'error';
      case 'Evento': return 'primary';
      case 'Atividade': return 'secondary';
      default: return 'default';
    }
  };

  return (
    <Box sx={{ p: 3 }}>
      {/* Header */}
      <Box sx={{ mb: 3, display: 'flex', alignItems: 'center', gap: 2 }}>
        <IconButton onClick={() => navigate(`/eleicoes/${id}`)}>
          <ArrowBack />
        </IconButton>
        <Box sx={{ flex: 1 }}>
          <Typography variant="h4" gutterBottom>
            Calendário Eleitoral
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Cronograma e prazos da eleição
          </Typography>
        </Box>
        <Button
          startIcon={<Add />}
          variant="contained"
          onClick={() => handleOpenDialog()}
        >
          Novo Evento
        </Button>
      </Box>

      {/* Calendar Events Table */}
      <Paper>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Título</TableCell>
                <TableCell>Tipo</TableCell>
                <TableCell>Data Início</TableCell>
                <TableCell>Data Fim</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Responsável</TableCell>
                <TableCell align="center">Ações</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {events.map((event) => (
                <TableRow key={event.id}>
                  <TableCell>
                    <Box>
                      <Typography variant="body1" fontWeight={500}>
                        {event.titulo}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {event.descricao}
                      </Typography>
                    </Box>
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={event.tipo}
                      color={getTipoColor(event.tipo) as any}
                      size="small"
                    />
                  </TableCell>
                  <TableCell>
                    {format(event.dataInicio, 'dd/MM/yyyy', { locale: ptBR })}
                  </TableCell>
                  <TableCell>
                    {format(event.dataFim, 'dd/MM/yyyy', { locale: ptBR })}
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={event.status}
                      color={getStatusColor(event.status) as any}
                      size="small"
                    />
                  </TableCell>
                  <TableCell>{event.responsavel}</TableCell>
                  <TableCell align="center">
                    <IconButton
                      size="small"
                      onClick={() => handleOpenDialog(event)}
                    >
                      <Edit fontSize="small" />
                    </IconButton>
                    <IconButton
                      size="small"
                      color="error"
                      onClick={() => handleDeleteEvent(event.id)}
                    >
                      <Delete fontSize="small" />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>

      {/* Add/Edit Event Dialog */}
      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="md" fullWidth>
        <DialogTitle>
          {editingEvent ? 'Editar Evento' : 'Novo Evento'}
        </DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Título"
                value={formData.titulo}
                onChange={(e) => setFormData({ ...formData, titulo: e.target.value })}
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
              />
            </Grid>
            <Grid item xs={12} md={4}>
              <FormControl fullWidth>
                <InputLabel>Tipo</InputLabel>
                <Select
                  value={formData.tipo}
                  label="Tipo"
                  onChange={(e) => setFormData({ ...formData, tipo: e.target.value as any })}
                >
                  <MenuItem value="Evento">Evento</MenuItem>
                  <MenuItem value="Prazo">Prazo</MenuItem>
                  <MenuItem value="Atividade">Atividade</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={4}>
              <DatePicker
                label="Data Início"
                value={formData.dataInicio}
                onChange={(date) => date && setFormData({ ...formData, dataInicio: date })}
                slotProps={{ textField: { fullWidth: true } }}
              />
            </Grid>
            <Grid item xs={12} md={4}>
              <DatePicker
                label="Data Fim"
                value={formData.dataFim}
                onChange={(date) => date && setFormData({ ...formData, dataFim: date })}
                slotProps={{ textField: { fullWidth: true } }}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Responsável"
                value={formData.responsavel}
                onChange={(e) => setFormData({ ...formData, responsavel: e.target.value })}
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Cancelar</Button>
          <Button onClick={handleSubmit} variant="contained">
            {editingEvent ? 'Atualizar' : 'Criar'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default ElectionCalendar;