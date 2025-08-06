import React, { useState, useEffect } from 'react';
import {
  Container,
  Typography,
  Box,
  Card,
  CardContent,
  Grid,
  Button,
  Chip,
  TextField,
  InputAdornment,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  IconButton,
  Tooltip,
  Paper,
  Divider,
  CircularProgress,
  Alert
} from '@mui/material';
import {
  Search as SearchIcon,
  Download as DownloadIcon,
  Description as DocumentIcon,
  PictureAsPdf as PdfIcon,
  Image as ImageIcon,
  Article as ArticleIcon,
  CalendarMonth as CalendarIcon,
  Gavel as GavelIcon,
  Group as GroupIcon,
  FilterList as FilterIcon,
  Clear as ClearIcon,
  Visibility as ViewIcon
} from '@mui/icons-material';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

// Mock data for documents
const mockDocuments = [
  {
    id: 1,
    titulo: 'Edital de Convocação - Eleições 2024',
    descricao: 'Edital oficial para convocação das eleições do CAU 2024',
    tipo: 'edital',
    dataPublicacao: new Date('2024-01-15'),
    tamanho: '2.5 MB',
    formato: 'pdf',
    categoria: 'eleicao',
    tags: ['edital', 'eleições', '2024'],
    url: '/docs/edital-2024.pdf'
  },
  {
    id: 2,
    titulo: 'Calendário Eleitoral 2024',
    descricao: 'Cronograma completo com todas as datas importantes do processo eleitoral',
    tipo: 'calendario',
    dataPublicacao: new Date('2024-01-10'),
    tamanho: '1.2 MB',
    formato: 'pdf',
    categoria: 'eleicao',
    tags: ['calendário', 'prazos', 'datas'],
    url: '/docs/calendario-2024.pdf'
  },
  {
    id: 3,
    titulo: 'Manual do Candidato',
    descricao: 'Guia completo para candidatos com instruções sobre o processo eleitoral',
    tipo: 'manual',
    dataPublicacao: new Date('2024-01-08'),
    tamanho: '5.8 MB',
    formato: 'pdf',
    categoria: 'orientacao',
    tags: ['manual', 'candidato', 'instruções'],
    url: '/docs/manual-candidato.pdf'
  },
  {
    id: 4,
    titulo: 'Formulário de Registro de Chapa',
    descricao: 'Modelo oficial para registro de chapas eleitorais',
    tipo: 'formulario',
    dataPublicacao: new Date('2024-01-05'),
    tamanho: '450 KB',
    formato: 'pdf',
    categoria: 'formulario',
    tags: ['formulário', 'registro', 'chapa'],
    url: '/docs/form-registro-chapa.pdf'
  },
  {
    id: 5,
    titulo: 'Resolução CE nº 001/2024',
    descricao: 'Normas complementares ao processo eleitoral',
    tipo: 'resolucao',
    dataPublicacao: new Date('2024-01-20'),
    tamanho: '890 KB',
    formato: 'pdf',
    categoria: 'normativo',
    tags: ['resolução', 'normas', 'comissão'],
    url: '/docs/resolucao-001-2024.pdf'
  },
  {
    id: 6,
    titulo: 'Modelo de Procuração',
    descricao: 'Modelo para outorga de procuração para representação eleitoral',
    tipo: 'modelo',
    dataPublicacao: new Date('2024-01-12'),
    tamanho: '120 KB',
    formato: 'doc',
    categoria: 'formulario',
    tags: ['procuração', 'modelo', 'representação'],
    url: '/docs/modelo-procuracao.doc'
  },
  {
    id: 7,
    titulo: 'Cartilha sobre Impugnações',
    descricao: 'Orientações sobre o processo de impugnação de candidaturas',
    tipo: 'cartilha',
    dataPublicacao: new Date('2024-01-18'),
    tamanho: '3.2 MB',
    formato: 'pdf',
    categoria: 'orientacao',
    tags: ['impugnação', 'orientações', 'processo'],
    url: '/docs/cartilha-impugnacoes.pdf'
  },
  {
    id: 8,
    titulo: 'Código de Ética Eleitoral',
    descricao: 'Código de conduta para candidatos e eleitores',
    tipo: 'codigo',
    dataPublicacao: new Date('2024-01-02'),
    tamanho: '1.8 MB',
    formato: 'pdf',
    categoria: 'normativo',
    tags: ['ética', 'código', 'conduta'],
    url: '/docs/codigo-etica.pdf'
  }
];

const documentTypes = [
  { value: 'all', label: 'Todos os tipos' },
  { value: 'edital', label: 'Editais', icon: <GavelIcon /> },
  { value: 'calendario', label: 'Calendários', icon: <CalendarIcon /> },
  { value: 'manual', label: 'Manuais', icon: <ArticleIcon /> },
  { value: 'formulario', label: 'Formulários', icon: <DocumentIcon /> },
  { value: 'resolucao', label: 'Resoluções', icon: <GavelIcon /> },
  { value: 'modelo', label: 'Modelos', icon: <DocumentIcon /> },
  { value: 'cartilha', label: 'Cartilhas', icon: <ArticleIcon /> },
  { value: 'codigo', label: 'Códigos', icon: <GavelIcon /> }
];

const categories = [
  { value: 'all', label: 'Todas as categorias' },
  { value: 'eleicao', label: 'Eleições' },
  { value: 'orientacao', label: 'Orientações' },
  { value: 'formulario', label: 'Formulários' },
  { value: 'normativo', label: 'Normativos' }
];

export const DocumentosPage: React.FC = () => {
  const [documents, setDocuments] = useState(mockDocuments);
  const [filteredDocuments, setFilteredDocuments] = useState(mockDocuments);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedType, setSelectedType] = useState('all');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    filterDocuments();
  }, [searchTerm, selectedType, selectedCategory]);

  const filterDocuments = () => {
    let filtered = [...documents];

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(doc =>
        doc.titulo.toLowerCase().includes(searchTerm.toLowerCase()) ||
        doc.descricao.toLowerCase().includes(searchTerm.toLowerCase()) ||
        doc.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }

    // Filter by type
    if (selectedType !== 'all') {
      filtered = filtered.filter(doc => doc.tipo === selectedType);
    }

    // Filter by category
    if (selectedCategory !== 'all') {
      filtered = filtered.filter(doc => doc.categoria === selectedCategory);
    }

    setFilteredDocuments(filtered);
  };

  const handleClearFilters = () => {
    setSearchTerm('');
    setSelectedType('all');
    setSelectedCategory('all');
  };

  const getDocumentIcon = (formato: string) => {
    switch (formato) {
      case 'pdf':
        return <PdfIcon color="error" />;
      case 'doc':
      case 'docx':
        return <DocumentIcon color="primary" />;
      case 'jpg':
      case 'png':
        return <ImageIcon color="success" />;
      default:
        return <ArticleIcon color="action" />;
    }
  };

  const getTypeColor = (tipo: string) => {
    const colors: { [key: string]: any } = {
      edital: 'primary',
      calendario: 'secondary',
      manual: 'info',
      formulario: 'success',
      resolucao: 'warning',
      modelo: 'default',
      cartilha: 'info',
      codigo: 'error'
    };
    return colors[tipo] || 'default';
  };

  const handleDownload = (doc: any) => {
    // Simulação de download
    console.log('Downloading:', doc.titulo);
    // Em produção, isso iniciaria o download real do arquivo
  };

  const handleView = (doc: any) => {
    // Simulação de visualização
    console.log('Viewing:', doc.titulo);
    // Em produção, isso abriria o documento em uma nova aba ou modal
  };

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      {/* Header */}
      <Box mb={4}>
        <Typography variant="h3" component="h1" gutterBottom fontWeight="bold">
          Documentos
        </Typography>
        <Typography variant="h6" color="textSecondary">
          Acesse editais, formulários, manuais e outros documentos importantes do processo eleitoral
        </Typography>
      </Box>

      {/* Filters */}
      <Paper sx={{ p: 3, mb: 4 }}>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} md={4}>
            <TextField
              fullWidth
              placeholder="Buscar documentos..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon />
                  </InputAdornment>
                ),
                endAdornment: searchTerm && (
                  <InputAdornment position="end">
                    <IconButton
                      size="small"
                      onClick={() => setSearchTerm('')}
                    >
                      <ClearIcon />
                    </IconButton>
                  </InputAdornment>
                )
              }}
            />
          </Grid>
          
          <Grid item xs={12} sm={6} md={3}>
            <FormControl fullWidth>
              <InputLabel>Tipo de Documento</InputLabel>
              <Select
                value={selectedType}
                onChange={(e) => setSelectedType(e.target.value)}
                label="Tipo de Documento"
              >
                {documentTypes.map(type => (
                  <MenuItem key={type.value} value={type.value}>
                    <Box display="flex" alignItems="center" gap={1}>
                      {type.icon}
                      {type.label}
                    </Box>
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          
          <Grid item xs={12} sm={6} md={3}>
            <FormControl fullWidth>
              <InputLabel>Categoria</InputLabel>
              <Select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                label="Categoria"
              >
                {categories.map(cat => (
                  <MenuItem key={cat.value} value={cat.value}>
                    {cat.label}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          
          <Grid item xs={12} md={2}>
            <Button
              fullWidth
              variant="outlined"
              startIcon={<FilterIcon />}
              onClick={handleClearFilters}
              disabled={!searchTerm && selectedType === 'all' && selectedCategory === 'all'}
            >
              Limpar
            </Button>
          </Grid>
        </Grid>

        {/* Results count */}
        <Box mt={2}>
          <Typography variant="body2" color="textSecondary">
            {filteredDocuments.length} documento{filteredDocuments.length !== 1 ? 's' : ''} encontrado{filteredDocuments.length !== 1 ? 's' : ''}
          </Typography>
        </Box>
      </Paper>

      {/* Documents Grid */}
      {isLoading ? (
        <Box display="flex" justifyContent="center" py={8}>
          <CircularProgress />
        </Box>
      ) : filteredDocuments.length === 0 ? (
        <Alert severity="info">
          Nenhum documento encontrado com os filtros selecionados.
        </Alert>
      ) : (
        <Grid container spacing={3}>
          {filteredDocuments.map((doc) => (
            <Grid item xs={12} sm={6} md={4} key={doc.id}>
              <Card 
                sx={{ 
                  height: '100%',
                  display: 'flex',
                  flexDirection: 'column',
                  transition: 'all 0.3s',
                  '&:hover': {
                    transform: 'translateY(-4px)',
                    boxShadow: 4
                  }
                }}
              >
                <CardContent sx={{ flexGrow: 1 }}>
                  {/* Document Type and Icon */}
                  <Box display="flex" justifyContent="space-between" alignItems="flex-start" mb={2}>
                    <Chip
                      label={documentTypes.find(t => t.value === doc.tipo)?.label}
                      size="small"
                      color={getTypeColor(doc.tipo)}
                    />
                    {getDocumentIcon(doc.formato)}
                  </Box>

                  {/* Title */}
                  <Typography variant="h6" gutterBottom fontWeight="bold">
                    {doc.titulo}
                  </Typography>

                  {/* Description */}
                  <Typography 
                    variant="body2" 
                    color="textSecondary" 
                    paragraph
                    sx={{ 
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      display: '-webkit-box',
                      WebkitLineClamp: 3,
                      WebkitBoxOrient: 'vertical'
                    }}
                  >
                    {doc.descricao}
                  </Typography>

                  {/* Metadata */}
                  <Box mt={2}>
                    <Typography variant="caption" color="textSecondary" display="block">
                      Publicado em {format(doc.dataPublicacao, 'dd/MM/yyyy', { locale: ptBR })}
                    </Typography>
                    <Typography variant="caption" color="textSecondary">
                      Tamanho: {doc.tamanho}
                    </Typography>
                  </Box>

                  {/* Tags */}
                  <Box mt={2} display="flex" gap={0.5} flexWrap="wrap">
                    {doc.tags.slice(0, 3).map((tag, index) => (
                      <Chip
                        key={index}
                        label={tag}
                        size="small"
                        variant="outlined"
                        sx={{ fontSize: '0.75rem' }}
                      />
                    ))}
                  </Box>
                </CardContent>

                <Divider />

                {/* Actions */}
                <Box p={2} display="flex" gap={1}>
                  <Tooltip title="Visualizar">
                    <IconButton
                      color="primary"
                      onClick={() => handleView(doc)}
                    >
                      <ViewIcon />
                    </IconButton>
                  </Tooltip>
                  <Tooltip title="Baixar">
                    <IconButton
                      color="primary"
                      onClick={() => handleDownload(doc)}
                    >
                      <DownloadIcon />
                    </IconButton>
                  </Tooltip>
                  <Box flexGrow={1} />
                  <Chip
                    label={doc.formato.toUpperCase()}
                    size="small"
                    variant="outlined"
                  />
                </Box>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}

      {/* Information Box */}
      <Box mt={6}>
        <Alert severity="info">
          <Typography variant="body2">
            <strong>Precisa de ajuda?</strong> Se você não encontrar o documento que procura, 
            entre em contato com a Comissão Eleitoral através do email: eleicoes@cau.gov.br
          </Typography>
        </Alert>
      </Box>
    </Container>
  );
};