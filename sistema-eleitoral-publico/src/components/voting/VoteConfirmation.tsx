import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Box,
  Avatar,
  Paper,
  Divider,
  Alert,
  Checkbox,
  FormControlLabel,
  CircularProgress
} from '@mui/material';
import {
  Person as PersonIcon,
  Warning as WarningIcon,
  CheckCircle as CheckCircleIcon,
  HowToVote as VoteIcon
} from '@mui/icons-material';
import { Candidato } from '../../services/api/votacaoService';

interface VoteConfirmationProps {
  open: boolean;
  candidato: Candidato | null;
  eleicaoTitulo: string;
  onConfirm: () => void;
  onCancel: () => void;
  isLoading?: boolean;
}

export const VoteConfirmation: React.FC<VoteConfirmationProps> = ({
  open,
  candidato,
  eleicaoTitulo,
  onConfirm,
  onCancel,
  isLoading = false
}) => {
  const [confirmChecked, setConfirmChecked] = useState(false);

  const handleClose = () => {
    setConfirmChecked(false);
    onCancel();
  };

  const handleConfirm = () => {
    if (confirmChecked && candidato) {
      onConfirm();
    }
  };

  if (!candidato) return null;

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      maxWidth="sm"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: 3,
          overflow: 'visible'
        }
      }}
    >
      <DialogTitle sx={{ textAlign: 'center', pb: 1 }}>
        <Box display="flex" alignItems="center" justifyContent="center" mb={1}>
          <VoteIcon sx={{ fontSize: 32, color: 'primary.main', mr: 1 }} />
          <Typography variant="h5" fontWeight="bold" color="primary.main">
            Confirmar Voto
          </Typography>
        </Box>
        <Typography variant="body2" color="textSecondary">
          {eleicaoTitulo}
        </Typography>
      </DialogTitle>

      <DialogContent sx={{ px: 3, py: 2 }}>
        {/* Alerta de confirmação */}
        <Alert 
          severity="warning" 
          icon={<WarningIcon />}
          sx={{ mb: 3 }}
        >
          <Typography variant="body2" fontWeight="bold">
            ATENÇÃO: Seu voto será registrado de forma definitiva!
          </Typography>
          <Typography variant="body2">
            Após a confirmação, não será possível alterar sua escolha.
          </Typography>
        </Alert>

        {/* Dados do candidato selecionado */}
        <Paper
          elevation={2}
          sx={{
            p: 3,
            border: 2,
            borderColor: 'primary.main',
            backgroundColor: 'primary.50'
          }}
        >
          <Typography variant="h6" color="primary.main" gutterBottom fontWeight="bold">
            SEU VOTO
          </Typography>
          
          <Box display="flex" alignItems="center" mb={2}>
            <Avatar
              src={candidato.foto}
              sx={{ 
                width: 56, 
                height: 56, 
                mr: 2,
                border: 2,
                borderColor: 'primary.main'
              }}
            >
              <PersonIcon sx={{ fontSize: 28 }} />
            </Avatar>
            
            <Box flexGrow={1}>
              <Typography variant="h5" fontWeight="bold" color="text.primary">
                {candidato.nome}
              </Typography>
              <Typography variant="body1" color="text.secondary">
                {candidato.cargo}
              </Typography>
            </Box>

            <Paper
              elevation={2}
              sx={{
                p: 1,
                backgroundColor: 'primary.main',
                color: 'primary.contrastText',
                textAlign: 'center',
                minWidth: 50,
                borderRadius: 2
              }}
            >
              <Typography variant="h5" fontWeight="bold">
                {candidato.numero}
              </Typography>
            </Paper>
          </Box>

          <Divider sx={{ my: 2 }} />

          <Box>
            <Typography variant="subtitle2" color="primary.main" gutterBottom>
              CHAPA {candidato.chapa.numero}
            </Typography>
            <Typography variant="body1" fontWeight="bold" gutterBottom>
              {candidato.chapa.nome}
            </Typography>
            <Typography variant="body2" color="textSecondary">
              {candidato.chapa.descricao}
            </Typography>
          </Box>
        </Paper>

        {/* Checkbox de confirmação */}
        <Box mt={3}>
          <FormControlLabel
            control={
              <Checkbox
                checked={confirmChecked}
                onChange={(e) => setConfirmChecked(e.target.checked)}
                color="primary"
                disabled={isLoading}
              />
            }
            label={
              <Typography variant="body2">
                Confirmo que li e verifico todas as informações acima e desejo
                <strong> VOTAR NO CANDIDATO SELECIONADO</strong>.
                Estou ciente de que este voto é <strong>DEFINITIVO</strong>.
              </Typography>
            }
          />
        </Box>

        {/* Status de carregamento */}
        {isLoading && (
          <Alert 
            severity="info" 
            icon={<CircularProgress size={20} />}
            sx={{ mt: 2 }}
          >
            Processando seu voto... Por favor, aguarde.
          </Alert>
        )}
      </DialogContent>

      <DialogActions sx={{ px: 3, pb: 3, gap: 2 }}>
        <Button
          onClick={handleClose}
          variant="outlined"
          size="large"
          disabled={isLoading}
          sx={{ flex: 1 }}
        >
          Cancelar
        </Button>
        
        <Button
          onClick={handleConfirm}
          variant="contained"
          size="large"
          disabled={!confirmChecked || isLoading}
          startIcon={isLoading ? <CircularProgress size={20} /> : <CheckCircleIcon />}
          sx={{ 
            flex: 1,
            fontWeight: 'bold',
            py: 1.5
          }}
        >
          {isLoading ? 'Votando...' : 'CONFIRMAR VOTO'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};
