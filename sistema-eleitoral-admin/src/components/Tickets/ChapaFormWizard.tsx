import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Stepper,
  Step,
  StepLabel,
  Button,
  Grid,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  FormControlLabel,
  Checkbox,
  Alert,
  LinearProgress,
  Chip,
  Avatar,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  ListItemSecondaryAction,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Accordion,
  AccordionSummary,
  AccordionDetails,
} from '@mui/material';
import {
  Add as AddIcon,
  Delete as DeleteIcon,
  Edit as EditIcon,
  Upload as UploadIcon,
  Person as PersonIcon,
  CheckCircle as CheckCircleIcon,
  Warning as WarningIcon,
  ExpandMore as ExpandMoreIcon,
  CloudUpload as CloudUploadIcon,
} from '@mui/icons-material';
import { useForm, Controller, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  useCreateChapaMutation,
  useUpdateChapaMutation,
  useCalcularDiversidadeQuery,
  useValidarChapaMutation,
  useUploadDocumentoMutation,
  useVerificarElegibilidadeMutation,
} from '../../services/chapas.api';
import { Chapa, ChapaMembro, TipoMembro, ChapaCreate } from '../../types/chapas.types';

const chapaSchema = z.object({
  nome: z.string().min(1, 'Nome da chapa é obrigatório'),
  sigla: z.string().min(1, 'Sigla é obrigatória').max(10, 'Sigla deve ter no máximo 10 caracteres'),
  eleicaoId: z.number(),
  lema: z.string().optional(),
  proposta: z.string().min(50, 'Proposta deve ter ao menos 50 caracteres'),
  membros: z.array(z.object({
    nome: z.string().min(1, 'Nome é obrigatório'),
    cpf: z.string().min(11, 'CPF inválido').max(11, 'CPF inválido'),
    email: z.string().email('E-mail inválido'),
    telefone: z.string().min(10, 'Telefone inválido'),
    cargo: z.enum(['PRESIDENTE', 'VICE_PRESIDENTE', 'CONSELHEIRO_TITULAR', 'CONSELHEIRO_SUPLENTE'] as const),
    regiao: z.string().min(1, 'Região é obrigatória'),
    // Dados de diversidade
    genero: z.enum(['MASCULINO', 'FEMININO', 'NAO_BINARIO', 'NAO_INFORMADO'] as const),
    etnia: z.enum(['BRANCO', 'PRETO', 'PARDO', 'AMARELO', 'INDIGENA', 'NAO_INFORMADO'] as const),
    lgbtqi: z.boolean(),
    pcd: z.boolean(),
    // Dados profissionais
    numeroRegistro: z.string().min(1, 'Número de registro é obrigatório'),
    situacaoRegistro: z.string(),
    dataFormatura: z.string(),
    instituicao: z.string().min(1, 'Instituição de formação é obrigatória'),
  })).min(1, 'Pelo menos um membro é obrigatório'),
  documentos: z.array(z.object({
    tipo: z.string(),
    arquivo: z.any().optional(),
    url: z.string().optional(),
  })).optional(),
});

type ChapaFormData = z.infer<typeof chapaSchema>;

const steps = [
  'Informações Básicas',
  'Membros da Chapa',
  'Cálculo de Diversidade',
  'Documentos',
  'Revisão e Submissão'
];

interface ChapaFormWizardProps {
  chapa?: Chapa;
  eleicaoId: number;
  onSubmit: (data: ChapaCreate) => void;
  onCancel: () => void;
}

export const ChapaFormWizard: React.FC<ChapaFormWizardProps> = ({
  chapa,
  eleicaoId,
  onSubmit,
  onCancel,
}) => {
  const [activeStep, setActiveStep] = useState(0);
  const [memberDialogOpen, setMemberDialogOpen] = useState(false);
  const [selectedMemberIndex, setSelectedMemberIndex] = useState<number | null>(null);
  const [elegibilityChecking, setElegibilityChecking] = useState(false);

  const [createChapa, { isLoading: creating }] = useCreateChapaMutation();
  const [updateChapa, { isLoading: updating }] = useUpdateChapaMutation();
  const [validarChapa] = useValidarChapaMutation();
  const [uploadDocumento] = useUploadDocumentoMutation();
  const [verificarElegibilidade] = useVerificarElegibilidadeMutation();

  const {
    control,
    handleSubmit,
    watch,
    setValue,
    trigger,
    formState: { errors, isValid },
  } = useForm<ChapaFormData>({
    resolver: zodResolver(chapaSchema),
    defaultValues: {
      eleicaoId,
      membros: [],
      documentos: [],
      ...chapa,
    },
    mode: 'onChange',
  });

  const { fields: membros, append: addMembro, remove: removeMembro, update: updateMembro } = useFieldArray({
    control,
    name: 'membros',
  });

  const watchedMembros = watch('membros');
  
  const { data: diversidade, isLoading: calculandoDiversidade } = useCalcularDiversidadeQuery(
    chapa?.id || 0,
    { skip: !chapa?.id || watchedMembros.length === 0 }
  );

  const handleNext = async () => {
    const fieldsToValidate = getFieldsForStep(activeStep);
    const isStepValid = await trigger(fieldsToValidate);
    
    if (isStepValid) {
      setActiveStep((prevActiveStep) => prevActiveStep + 1);
    }
  };

  const handleBack = () => {
    setActiveStep((prevActiveStep) => prevActiveStep - 1);
  };

  const getFieldsForStep = (step: number): (keyof ChapaFormData)[] => {
    switch (step) {
      case 0: return ['nome', 'sigla', 'lema', 'proposta'];
      case 1: return ['membros'];
      case 2: return []; // Validação automática
      case 3: return ['documentos'];
      case 4: return []; // Revisão final
      default: return [];
    }
  };

  const handleAddMember = () => {
    setSelectedMemberIndex(null);
    setMemberDialogOpen(true);
  };

  const handleEditMember = (index: number) => {
    setSelectedMemberIndex(index);
    setMemberDialogOpen(true);
  };

  const handleSaveMember = (memberData: Partial<ChapaMembro>) => {
    if (selectedMemberIndex !== null) {
      updateMembro(selectedMemberIndex, memberData);
    } else {
      addMembro(memberData);
    }
    setMemberDialogOpen(false);
  };

  const checkElegibility = async (cpf: string) => {
    setElegibilityChecking(true);
    try {
      const result = await verificarElegibilidade({ cpf, eleicaoId }).unwrap();
      return result;
    } catch (error) {
      console.error('Erro ao verificar elegibilidade:', error);
      return { elegivel: false, motivos: ['Erro ao verificar elegibilidade'] };
    } finally {
      setElegibilityChecking(false);
    }
  };

  const handleFileUpload = async (file: File, tipo: string) => {
    try {
      const result = await uploadDocumento({
        chapaId: chapa?.id || 0,
        tipoDocumento: tipo,
        file,
      }).unwrap();
      
      // Atualizar documentos no formulário
      const currentDocs = watch('documentos') || [];
      setValue('documentos', [
        ...currentDocs,
        { tipo, url: result.url, arquivo: file.name },
      ]);
    } catch (error) {
      console.error('Erro ao fazer upload:', error);
    }
  };

  const renderStepContent = (step: number) => {
    switch (step) {
      case 0:
        return <InformacoesBασicasStep control={control} errors={errors} />;
      case 1:
        return (
          <MembrosStep
            membros={membros}
            onAdd={handleAddMember}
            onEdit={handleEditMember}
            onRemove={removeMembro}
            errors={errors.membros}
          />
        );
      case 2:
        return (
          <DiversidadeStep
            membros={watchedMembros}
            diversidade={diversidade}
            loading={calculandoDiversidade}
          />
        );
      case 3:
        return (
          <DocumentosStep
            onUpload={handleFileUpload}
            documentos={watch('documentos') || []}
          />
        );
      case 4:
        return (
          <RevisaoStep
            data={watch()}
            diversidade={diversidade}
          />
        );
      default:
        return null;
    }
  };

  const handleFormSubmit = async (data: ChapaFormData) => {
    try {
      if (chapa?.id) {
        await updateChapa({ id: chapa.id, data }).unwrap();
      } else {
        await createChapa(data).unwrap();
      }
      onSubmit(data);
    } catch (error) {
      console.error('Erro ao salvar chapa:', error);
    }
  };

  return (
    <Card>
      <CardContent>
        <Box sx={{ mb: 4 }}>
          <Typography variant="h5" gutterBottom>
            {chapa ? 'Editar Chapa' : 'Nova Chapa'}
          </Typography>
          <Stepper activeStep={activeStep} alternativeLabel>
            {steps.map((label) => (
              <Step key={label}>
                <StepLabel>{label}</StepLabel>
              </Step>
            ))}
          </Stepper>
        </Box>

        <form onSubmit={handleSubmit(handleFormSubmit)}>
          {renderStepContent(activeStep)}
          
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 4 }}>
            <Button
              onClick={activeStep === 0 ? onCancel : handleBack}
              variant="outlined"
            >
              {activeStep === 0 ? 'Cancelar' : 'Voltar'}
            </Button>
            
            <Button
              onClick={activeStep === steps.length - 1 ? handleSubmit(handleFormSubmit) : handleNext}
              variant="contained"
              disabled={creating || updating}
            >
              {creating || updating ? (
                <LinearProgress />
              ) : activeStep === steps.length - 1 ? (
                'Finalizar'
              ) : (
                'Próximo'
              )}
            </Button>
          </Box>
        </form>

        {/* Dialog para adicionar/editar membro */}
        <MemberDialog
          open={memberDialogOpen}
          member={selectedMemberIndex !== null ? watchedMembros[selectedMemberIndex] : undefined}
          onSave={handleSaveMember}
          onCancel={() => setMemberDialogOpen(false)}
          onCheckElegibility={checkElegibility}
          elegibilityChecking={elegibilityChecking}
        />
      </CardContent>
    </Card>
  );
};

// Componentes auxiliares para cada step
const InformacoesBασicasStep: React.FC<{
  control: any;
  errors: any;
}> = ({ control, errors }) => (
  <Grid container spacing={3}>
    <Grid item xs={12} md={6}>
      <Controller
        name="nome"
        control={control}
        render={({ field }) => (
          <TextField
            {...field}
            label="Nome da Chapa"
            fullWidth
            error={!!errors.nome}
            helperText={errors.nome?.message}
          />
        )}
      />
    </Grid>
    <Grid item xs={12} md={6}>
      <Controller
        name="sigla"
        control={control}
        render={({ field }) => (
          <TextField
            {...field}
            label="Sigla"
            fullWidth
            error={!!errors.sigla}
            helperText={errors.sigla?.message}
          />
        )}
      />
    </Grid>
    <Grid item xs={12}>
      <Controller
        name="lema"
        control={control}
        render={({ field }) => (
          <TextField
            {...field}
            label="Lema (Opcional)"
            fullWidth
          />
        )}
      />
    </Grid>
    <Grid item xs={12}>
      <Controller
        name="proposta"
        control={control}
        render={({ field }) => (
          <TextField
            {...field}
            label="Proposta de Trabalho"
            fullWidth
            multiline
            rows={6}
            error={!!errors.proposta}
            helperText={errors.proposta?.message}
          />
        )}
      />
    </Grid>
  </Grid>
);

const MembrosStep: React.FC<{
  membros: any[];
  onAdd: () => void;
  onEdit: (index: number) => void;
  onRemove: (index: number) => void;
  errors?: any;
}> = ({ membros, onAdd, onEdit, onRemove, errors }) => (
  <Box>
    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
      <Typography variant="h6">Membros da Chapa</Typography>
      <Button
        startIcon={<AddIcon />}
        onClick={onAdd}
        variant="contained"
      >
        Adicionar Membro
      </Button>
    </Box>

    {errors && (
      <Alert severity="error" sx={{ mb: 2 }}>
        {errors.message || 'Erro nos dados dos membros'}
      </Alert>
    )}

    <TableContainer component={Paper}>
      <Table>
        <TableHead>
          <TableRow>
            <TableCell>Nome</TableCell>
            <TableCell>Cargo</TableCell>
            <TableCell>CPF</TableCell>
            <TableCell>Região</TableCell>
            <TableCell align="right">Ações</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {membros.map((membro, index) => (
            <TableRow key={index}>
              <TableCell>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Avatar>
                    <PersonIcon />
                  </Avatar>
                  <Box>
                    <Typography variant="body2">{membro.nome}</Typography>
                    <Typography variant="caption" color="text.secondary">
                      {membro.email}
                    </Typography>
                  </Box>
                </Box>
              </TableCell>
              <TableCell>{membro.cargo}</TableCell>
              <TableCell>{membro.cpf}</TableCell>
              <TableCell>{membro.regiao}</TableCell>
              <TableCell align="right">
                <IconButton onClick={() => onEdit(index)}>
                  <EditIcon />
                </IconButton>
                <IconButton onClick={() => onRemove(index)} color="error">
                  <DeleteIcon />
                </IconButton>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>

    {membros.length === 0 && (
      <Alert severity="info" sx={{ mt: 2 }}>
        Nenhum membro adicionado. Clique em "Adicionar Membro" para começar.
      </Alert>
    )}
  </Box>
);

const DiversidadeStep: React.FC<{
  membros: any[];
  diversidade: any;
  loading: boolean;
}> = ({ membros, diversidade, loading }) => (
  <Box>
    <Typography variant="h6" gutterBottom>
      Cálculo de Diversidade
    </Typography>
    
    {loading ? (
      <LinearProgress />
    ) : (
      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="subtitle1" gutterBottom>
                Distribuição por Gênero
              </Typography>
              {/* Implementar gráfico ou lista */}
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="subtitle1" gutterBottom>
                Distribuição por Etnia
              </Typography>
              {/* Implementar gráfico ou lista */}
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    )}
  </Box>
);

const DocumentosStep: React.FC<{
  onUpload: (file: File, tipo: string) => void;
  documentos: any[];
}> = ({ onUpload, documentos }) => (
  <Box>
    <Typography variant="h6" gutterBottom>
      Documentos Obrigatórios
    </Typography>
    {/* Implementar upload de documentos */}
  </Box>
);

const RevisaoStep: React.FC<{
  data: any;
  diversidade: any;
}> = ({ data, diversidade }) => (
  <Box>
    <Typography variant="h6" gutterBottom>
      Revisão Final
    </Typography>
    {/* Implementar revisão completa */}
  </Box>
);

const MemberDialog: React.FC<{
  open: boolean;
  member?: any;
  onSave: (data: any) => void;
  onCancel: () => void;
  onCheckElegibility: (cpf: string) => Promise<any>;
  elegibilityChecking: boolean;
}> = ({ open, member, onSave, onCancel, onCheckElegibility, elegibilityChecking }) => (
  <Dialog open={open} onClose={onCancel} maxWidth="md" fullWidth>
    <DialogTitle>
      {member ? 'Editar Membro' : 'Adicionar Membro'}
    </DialogTitle>
    <DialogContent>
      {/* Implementar formulário do membro */}
    </DialogContent>
    <DialogActions>
      <Button onClick={onCancel}>Cancelar</Button>
      <Button variant="contained">Salvar</Button>
    </DialogActions>
  </Dialog>
);