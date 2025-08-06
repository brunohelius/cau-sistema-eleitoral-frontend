import React from 'react';
import {
  Card,
  CardContent,
  CardActions,
  Button,
  Typography,
  Box,
  Avatar,
  Chip,
  Paper,
  Divider,
  List,
  ListItem,
  ListItemText,
  ListItemIcon
} from '@mui/material';
import {
  Person as PersonIcon,
  School as SchoolIcon,
  Work as WorkIcon,
  HowToVote as VoteIcon,
  Info as InfoIcon
} from '@mui/icons-material';
import { Candidato } from '../../services/api/votacaoService';

interface CandidateCardProps {
  candidato: Candidato;
  isSelected: boolean;
  onSelect: (candidato: Candidato) => void;
  disabled?: boolean;
  showDetails?: boolean;
}

export const CandidateCard: React.FC<CandidateCardProps> = ({
  candidato,
  isSelected,
  onSelect,
  disabled = false,
  showDetails = false
}) => {
  return (
    <Card
      sx={{
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        cursor: disabled ? 'not-allowed' : 'pointer',
        border: isSelected ? 2 : 1,
        borderColor: isSelected ? 'primary.main' : 'grey.300',
        backgroundColor: isSelected ? 'primary.50' : 'background.paper',
        opacity: disabled ? 0.6 : 1,
        transition: 'all 0.3s ease',
        '&:hover': disabled ? {} : {
          borderColor: 'primary.main',
          boxShadow: 4,
          transform: 'translateY(-2px)'
        }
      }}
      onClick={() => !disabled && onSelect(candidato)}
    >
      <CardContent sx={{ flexGrow: 1, p: 3 }}>
        {/* Header com foto e número */}
        <Box display="flex" alignItems="center" mb={2}>
          <Avatar
            src={candidato.foto}
            sx={{ 
              width: 64, 
              height: 64, 
              mr: 2,
              border: 2,
              borderColor: 'primary.main'
            }}
          >
            <PersonIcon sx={{ fontSize: 32 }} />
          </Avatar>
          
          <Box flexGrow={1}>
            <Paper
              elevation={2}
              sx={{
                p: 1,
                backgroundColor: 'primary.main',
                color: 'primary.contrastText',
                textAlign: 'center',
                minWidth: 60,
                borderRadius: 2
              }}
            >
              <Typography variant="h6" fontWeight="bold">
                {candidato.numero}
              </Typography>
            </Paper>
          </Box>
        </Box>

        {/* Nome do candidato */}
        <Typography 
          variant="h5" 
          fontWeight="bold" 
          gutterBottom
          sx={{ 
            color: isSelected ? 'primary.main' : 'text.primary',
            lineHeight: 1.2
          }}
        >
          {candidato.nome}
        </Typography>

        {/* Cargo */}
        <Chip
          label={candidato.cargo}
          color="secondary"
          size="small"
          sx={{ mb: 2 }}
        />

        {/* Informações da chapa */}
        <Paper 
          elevation={1}
          sx={{ 
            p: 2, 
            mb: 2, 
            backgroundColor: 'grey.50',
            border: 1,
            borderColor: 'grey.200'
          }}
        >
          <Typography variant="subtitle2" color="primary.main" gutterBottom>
            CHAPA {candidato.chapa.numero}
          </Typography>
          <Typography variant="body1" fontWeight="bold" gutterBottom>
            {candidato.chapa.nome}
          </Typography>
          <Typography variant="body2" color="textSecondary">
            {candidato.chapa.descricao}
          </Typography>
        </Paper>

        {/* Detalhes expandidos */}
        {showDetails && (
          <Box>
            <Divider sx={{ my: 2 }} />
            
            <List dense>
              {candidato.formacao && (
                <ListItem sx={{ px: 0 }}>
                  <ListItemIcon sx={{ minWidth: 32 }}>
                    <SchoolIcon color="primary" fontSize="small" />
                  </ListItemIcon>
                  <ListItemText
                    primary="Formação"
                    secondary={candidato.formacao}
                    primaryTypographyProps={{ variant: 'body2', fontWeight: 'bold' }}
                    secondaryTypographyProps={{ variant: 'body2' }}
                  />
                </ListItem>
              )}
              
              {candidato.experiencia && (
                <ListItem sx={{ px: 0 }}>
                  <ListItemIcon sx={{ minWidth: 32 }}>
                    <WorkIcon color="primary" fontSize="small" />
                  </ListItemIcon>
                  <ListItemText
                    primary="Experiência"
                    secondary={candidato.experiencia}
                    primaryTypographyProps={{ variant: 'body2', fontWeight: 'bold' }}
                    secondaryTypographyProps={{ variant: 'body2' }}
                  />
                </ListItem>
              )}
              
              {candidato.biografia && (
                <ListItem sx={{ px: 0 }}>
                  <ListItemIcon sx={{ minWidth: 32 }}>
                    <InfoIcon color="primary" fontSize="small" />
                  </ListItemIcon>
                  <ListItemText
                    primary="Biografia"
                    secondary={candidato.biografia}
                    primaryTypographyProps={{ variant: 'body2', fontWeight: 'bold' }}
                    secondaryTypographyProps={{ variant: 'body2' }}
                  />
                </ListItem>
              )}
            </List>
          </Box>
        )}
      </CardContent>

      <CardActions sx={{ p: 2, pt: 0 }}>
        <Button
          variant={isSelected ? 'contained' : 'outlined'}
          color="primary"
          fullWidth
          size="large"
          startIcon={<VoteIcon />}
          disabled={disabled}
          onClick={(e) => {
            e.stopPropagation();
            !disabled && onSelect(candidato);
          }}
          sx={{
            py: 1.5,
            fontWeight: 'bold',
            fontSize: '1rem'
          }}
        >
          {isSelected ? 'SELECIONADO' : 'VOTAR'}
        </Button>
      </CardActions>
    </Card>
  );
};
