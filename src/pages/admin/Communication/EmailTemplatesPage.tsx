import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  MenuItem,
  Switch,
  FormControlLabel,
  Alert,
  Tooltip,
  Tabs,
  Tab
} from '@mui/material';
import {
  Add,
  Edit,
  Delete,
  Preview,
  Send,
  Code,
  Visibility
} from '@mui/icons-material';
import { communicationApi, EmailTemplate } from '../../../services/api/communicationApi';
import { LoadingButton } from '@mui/lab';

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel({ children, value, index, ...other }: TabPanelProps) {
  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`template-tabpanel-${index}`}
      aria-labelledby={`template-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
    </div>
  );
}

export const EmailTemplatesPage: React.FC = () => {
  const [templates, setTemplates] = useState<EmailTemplate[]>([]);
  const [filteredTemplates, setFilteredTemplates] = useState<EmailTemplate[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [tabValue, setTabValue] = useState(0);

  // Dialog states
  const [editDialog, setEditDialog] = useState(false);
  const [previewDialog, setPreviewDialog] = useState(false);
  const [deleteDialog, setDeleteDialog] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState<EmailTemplate | null>(null);

  // Form states
  const [formData, setFormData] = useState<Partial<EmailTemplate>>({
    name: '',
    displayName: '',
    subject: '',
    htmlBody: '',
    textBody: '',
    category: 'Geral',
    isActive: true,
    description: ''
  });

  // Preview states
  const [previewModel, setPreviewModel] = useState<string>('{}');
  const [previewResult, setPreviewResult] = useState<any>(null);

  const categories = communicationApi.getTemplateCategories();

  useEffect(() => {
    loadTemplates();
  }, []);

  useEffect(() => {
    filterTemplates();
  }, [templates, selectedCategory]);

  const loadTemplates = async () => {
    try {
      setLoading(true);
      const data = await communicationApi.getTemplates();
      setTemplates(data);
    } catch (error) {
      console.error('Erro ao carregar templates:', error);
    } finally {
      setLoading(false);
    }
  };

  const filterTemplates = () => {
    if (selectedCategory === 'all') {
      setFilteredTemplates(templates);
    } else {
      setFilteredTemplates(templates.filter(t => t.category === selectedCategory));
    }
  };

  const handleEditTemplate = (template: EmailTemplate | null = null) => {
    if (template) {
      setFormData(template);
      setSelectedTemplate(template);
    } else {
      setFormData({
        name: '',
        displayName: '',
        subject: '',
        htmlBody: '',
        textBody: '',
        category: 'Geral',
        isActive: true,
        description: ''
      });
      setSelectedTemplate(null);
    }
    setEditDialog(true);
  };

  const handleSaveTemplate = async () => {
    try {
      setLoading(true);
      if (selectedTemplate) {
        await communicationApi.updateTemplate(selectedTemplate.id, formData as EmailTemplate);
      } else {
        await communicationApi.createTemplate(formData as Omit<EmailTemplate, 'id'>);
      }
      
      await loadTemplates();
      setEditDialog(false);
    } catch (error) {
      console.error('Erro ao salvar template:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteTemplate = async () => {
    if (!selectedTemplate) return;

    try {
      setLoading(true);
      await communicationApi.deleteTemplate(selectedTemplate.id);
      await loadTemplates();
      setDeleteDialog(false);
    } catch (error) {
      console.error('Erro ao deletar template:', error);
    } finally {
      setLoading(false);
    }
  };

  const handlePreviewTemplate = async (template: EmailTemplate) => {
    setSelectedTemplate(template);
    setPreviewModel('{}');
    setPreviewResult(null);
    setPreviewDialog(true);
  };

  const generatePreview = async () => {
    if (!selectedTemplate) return;

    try {
      setLoading(true);
      const model = JSON.parse(previewModel);
      const result = await communicationApi.previewTemplate(selectedTemplate.name, model);
      setPreviewResult(result);
    } catch (error) {
      console.error('Erro ao gerar preview:', error);
    } finally {
      setLoading(false);
    }
  };

  const getCategoryColor = (category: string): 'default' | 'primary' | 'secondary' | 'error' | 'warning' | 'info' | 'success' => {
    const colorMap: Record<string, any> = {
      'Chapa': 'primary',
      'Julgamento': 'error', 
      'Relatório': 'info',
      'Denúncia': 'warning',
      'Impugnação': 'secondary',
      'Sistema': 'success',
      'Geral': 'default'
    };
    return colorMap[category] || 'default';
  };

  return (
    <Box sx={{ p: 3 }}>
      <Card>
        <CardContent>
          <Box sx={{ display: 'flex', justifyContent: 'between', alignItems: 'center', mb: 3 }}>
            <Typography variant="h5" component="h1">
              Templates de Email
            </Typography>
            <Button
              variant="contained"
              startIcon={<Add />}
              onClick={() => handleEditTemplate()}
            >
              Novo Template
            </Button>
          </Box>

          <Tabs value={tabValue} onChange={(e, newValue) => setTabValue(newValue)} sx={{ mb: 3 }}>
            <Tab label="Lista de Templates" />
            <Tab label="Estatísticas" />
          </Tabs>

          <TabPanel value={tabValue} index={0}>
            <Box sx={{ mb: 2 }}>
              <TextField
                select
                label="Filtrar por Categoria"
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                sx={{ minWidth: 200 }}
              >
                <MenuItem value="all">Todas as Categorias</MenuItem>
                {categories.map((category) => (
                  <MenuItem key={category} value={category}>
                    {category}
                  </MenuItem>
                ))}
              </TextField>
            </Box>

            <TableContainer component={Paper}>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Nome</TableCell>
                    <TableCell>Categoria</TableCell>
                    <TableCell>Status</TableCell>
                    <TableCell>Assunto</TableCell>
                    <TableCell>Ações</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {filteredTemplates.map((template) => (
                    <TableRow key={template.id}>
                      <TableCell>
                        <Typography variant="subtitle2">{template.displayName}</Typography>
                        <Typography variant="caption" color="textSecondary">
                          {template.name}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Chip 
                          label={template.category} 
                          size="small" 
                          color={getCategoryColor(template.category)}
                        />
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={template.isActive ? 'Ativo' : 'Inativo'}
                          size="small"
                          color={template.isActive ? 'success' : 'default'}
                        />
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2" noWrap sx={{ maxWidth: 300 }}>
                          {template.subject}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Tooltip title="Visualizar">
                          <IconButton 
                            size="small" 
                            onClick={() => handlePreviewTemplate(template)}
                          >
                            <Visibility />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Editar">
                          <IconButton 
                            size="small" 
                            onClick={() => handleEditTemplate(template)}
                          >
                            <Edit />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Deletar">
                          <IconButton 
                            size="small" 
                            onClick={() => {
                              setSelectedTemplate(template);
                              setDeleteDialog(true);
                            }}
                          >
                            <Delete />
                          </IconButton>
                        </Tooltip>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </TabPanel>

          <TabPanel value={tabValue} index={1}>
            <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 2 }}>
              <Card>
                <CardContent>
                  <Typography variant="h4">{templates.length}</Typography>
                  <Typography color="textSecondary">Total de Templates</Typography>
                </CardContent>
              </Card>
              <Card>
                <CardContent>
                  <Typography variant="h4">
                    {templates.filter(t => t.isActive).length}
                  </Typography>
                  <Typography color="textSecondary">Templates Ativos</Typography>
                </CardContent>
              </Card>
              {categories.map(category => {
                const count = templates.filter(t => t.category === category).length;
                return (
                  <Card key={category}>
                    <CardContent>
                      <Typography variant="h4">{count}</Typography>
                      <Typography color="textSecondary">{category}</Typography>
                    </CardContent>
                  </Card>
                );
              })}
            </Box>
          </TabPanel>
        </CardContent>
      </Card>

      {/* Dialog de Edição */}
      <Dialog open={editDialog} onClose={() => setEditDialog(false)} maxWidth="md" fullWidth>
        <DialogTitle>
          {selectedTemplate ? 'Editar Template' : 'Novo Template'}
        </DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'grid', gap: 2, mt: 1 }}>
            <TextField
              label="Nome do Template"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              required
              disabled={!!selectedTemplate} // Nome não pode ser alterado
            />
            <TextField
              label="Nome de Exibição"
              value={formData.displayName}
              onChange={(e) => setFormData({ ...formData, displayName: e.target.value })}
              required
            />
            <TextField
              select
              label="Categoria"
              value={formData.category}
              onChange={(e) => setFormData({ ...formData, category: e.target.value })}
              required
            >
              {categories.map((category) => (
                <MenuItem key={category} value={category}>
                  {category}
                </MenuItem>
              ))}
            </TextField>
            <TextField
              label="Assunto"
              value={formData.subject}
              onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
              required
              multiline
              rows={2}
            />
            <TextField
              label="Corpo HTML"
              value={formData.htmlBody}
              onChange={(e) => setFormData({ ...formData, htmlBody: e.target.value })}
              required
              multiline
              rows={8}
              sx={{ fontFamily: 'monospace' }}
            />
            <TextField
              label="Corpo Texto (Opcional)"
              value={formData.textBody}
              onChange={(e) => setFormData({ ...formData, textBody: e.target.value })}
              multiline
              rows={4}
            />
            <TextField
              label="Descrição"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              multiline
              rows={2}
            />
            <FormControlLabel
              control={
                <Switch
                  checked={formData.isActive}
                  onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                />
              }
              label="Template Ativo"
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setEditDialog(false)}>
            Cancelar
          </Button>
          <LoadingButton
            onClick={handleSaveTemplate}
            loading={loading}
            variant="contained"
          >
            {selectedTemplate ? 'Atualizar' : 'Criar'}
          </LoadingButton>
        </DialogActions>
      </Dialog>

      {/* Dialog de Preview */}
      <Dialog open={previewDialog} onClose={() => setPreviewDialog(false)} maxWidth="lg" fullWidth>
        <DialogTitle>Preview do Template: {selectedTemplate?.displayName}</DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2, height: '70vh' }}>
            <Box>
              <Typography variant="h6" gutterBottom>Modelo de Dados (JSON)</Typography>
              <TextField
                multiline
                rows={15}
                fullWidth
                value={previewModel}
                onChange={(e) => setPreviewModel(e.target.value)}
                placeholder={'{\n  "nome": "João Silva",\n  "data": "2024-01-01"\n}'}
                sx={{ fontFamily: 'monospace' }}
              />
              <Box sx={{ mt: 2 }}>
                <LoadingButton
                  onClick={generatePreview}
                  loading={loading}
                  variant="contained"
                  startIcon={<Preview />}
                >
                  Gerar Preview
                </LoadingButton>
              </Box>
            </Box>
            <Box>
              <Typography variant="h6" gutterBottom>Resultado</Typography>
              {previewResult && (
                <Box sx={{ height: '100%', overflow: 'auto', border: 1, borderColor: 'divider', p: 2 }}>
                  <Typography variant="subtitle2" gutterBottom>Assunto:</Typography>
                  <Typography variant="body2" sx={{ mb: 2, p: 1, bgcolor: 'grey.100' }}>
                    {previewResult.subject}
                  </Typography>
                  <Typography variant="subtitle2" gutterBottom>Corpo:</Typography>
                  <Box 
                    sx={{ border: 1, borderColor: 'divider', p: 1 }}
                    dangerouslySetInnerHTML={{ __html: previewResult.htmlBody }}
                  />
                </Box>
              )}
            </Box>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setPreviewDialog(false)}>
            Fechar
          </Button>
        </DialogActions>
      </Dialog>

      {/* Dialog de Confirmação de Exclusão */}
      <Dialog open={deleteDialog} onClose={() => setDeleteDialog(false)}>
        <DialogTitle>Confirmar Exclusão</DialogTitle>
        <DialogContent>
          <Typography>
            Tem certeza que deseja deletar o template "{selectedTemplate?.displayName}"?
          </Typography>
          <Alert severity="warning" sx={{ mt: 2 }}>
            Esta ação não pode ser desfeita!
          </Alert>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialog(false)}>
            Cancelar
          </Button>
          <LoadingButton
            onClick={handleDeleteTemplate}
            loading={loading}
            color="error"
            variant="contained"
          >
            Deletar
          </LoadingButton>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default EmailTemplatesPage;