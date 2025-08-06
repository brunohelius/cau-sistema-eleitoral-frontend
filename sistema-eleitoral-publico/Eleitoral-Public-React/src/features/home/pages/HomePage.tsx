import { 
  Container, 
  Box, 
  Typography, 
  Grid, 
  Card, 
  CardContent,
  Button,
  CardActions,
  Chip
} from '@mui/material'
import { 
  HowToVote, 
  Groups, 
  Assessment, 
  Description,
  ArrowForward 
} from '@mui/icons-material'
import { useNavigate } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'

const features = [
  {
    icon: <HowToVote fontSize="large" />,
    title: 'Eleições Ativas',
    description: 'Consulte as eleições em andamento e participe do processo democrático.',
    path: '/eleicoes',
    color: '#1976d2'
  },
  {
    icon: <Groups fontSize="large" />,
    title: 'Chapas Candidatas',
    description: 'Conheça as chapas cadastradas e suas propostas.',
    path: '/chapas',
    color: '#2e7d32'
  },
  {
    icon: <Assessment fontSize="large" />,
    title: 'Resultados',
    description: 'Acompanhe os resultados das eleições realizadas.',
    path: '/resultados',
    color: '#7b1fa2'
  },
  {
    icon: <Description fontSize="large" />,
    title: 'Calendários',
    description: 'Acesse cronogramas e prazos eleitorais.',
    path: '/calendarios',
    color: '#1565c0'
  }
]

export function HomePage() {
  const navigate = useNavigate()

  const { data: stats } = useQuery({
    queryKey: ['public-stats'],
    queryFn: async () => ({
      eleicoesAtivas: 3,
      chapasCadastradas: 15,
      proximaEleicao: new Date('2025-03-15')
    })
  })

  return (
    <Container maxWidth="xl">
      {/* Hero Section */}
      <Box
        sx={{
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          borderRadius: 2,
          p: 6,
          mb: 6,
          color: 'white',
          textAlign: 'center'
        }}
      >
        <Typography variant="h2" component="h1" gutterBottom fontWeight="bold">
          Sistema Eleitoral CAU
        </Typography>
        <Typography variant="h5" sx={{ mb: 4, opacity: 0.9 }}>
          Portal oficial das eleições do Conselho de Arquitetura e Urbanismo
        </Typography>
        <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center', flexWrap: 'wrap' }}>
          <Chip
            label={`${stats?.eleicoesAtivas || 0} Eleições Ativas`}
            sx={{ backgroundColor: 'rgba(255,255,255,0.2)', color: 'white', fontWeight: 500 }}
          />
          <Chip
            label={`${stats?.chapasCadastradas || 0} Chapas Cadastradas`}
            sx={{ backgroundColor: 'rgba(255,255,255,0.2)', color: 'white', fontWeight: 500 }}
          />
          {stats?.proximaEleicao && (
            <Chip
              label={`Próxima: ${format(stats.proximaEleicao, 'dd/MM/yyyy', { locale: ptBR })}`}
              sx={{ backgroundColor: 'rgba(255,255,255,0.2)', color: 'white', fontWeight: 500 }}
            />
          )}
        </Box>
      </Box>

      {/* Features Grid */}
      <Grid container spacing={3} sx={{ mb: 6 }}>
        {features.map((feature, index) => (
          <Grid item xs={12} sm={6} md={3} key={index}>
            <Card 
              sx={{ 
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
                cursor: 'pointer',
                transition: 'transform 0.2s, box-shadow 0.2s',
                '&:hover': {
                  transform: 'translateY(-4px)',
                  boxShadow: 4
                }
              }}
              onClick={() => navigate(feature.path)}
            >
              <CardContent sx={{ flexGrow: 1, textAlign: 'center' }}>
                <Box
                  sx={{
                    backgroundColor: feature.color,
                    color: 'white',
                    borderRadius: '50%',
                    width: 80,
                    height: 80,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    margin: '0 auto 16px auto'
                  }}
                >
                  {feature.icon}
                </Box>
                <Typography variant="h6" component="h2" gutterBottom>
                  {feature.title}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {feature.description}
                </Typography>
              </CardContent>
              <CardActions sx={{ justifyContent: 'center', pb: 2 }}>
                <Button 
                  size="small" 
                  endIcon={<ArrowForward />}
                  sx={{ color: feature.color }}
                >
                  Acessar
                </Button>
              </CardActions>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* Information Section */}
      <Grid container spacing={4}>
        <Grid item xs={12} md={8}>
          <Card>
            <CardContent>
              <Typography variant="h5" gutterBottom>
                Sobre o Sistema Eleitoral
              </Typography>
              <Typography variant="body1" paragraph>
                O Sistema Eleitoral do CAU é a plataforma oficial para condução de todos os 
                processos eleitorais dos Conselhos de Arquitetura e Urbanismo do Brasil.
              </Typography>
              <Typography variant="body1" paragraph>
                Aqui você pode acompanhar eleições em andamento, conhecer as chapas candidatas, 
                consultar resultados e acessar documentos oficiais do processo eleitoral.
              </Typography>
              <Typography variant="body1">
                O sistema garante transparência, segurança e facilita a participação de todos 
                os profissionais no processo democrático do CAU.
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Próximas Atividades
              </Typography>
              <Box sx={{ py: 2 }}>
                <Typography variant="body2" color="text.secondary" align="center">
                  Consulte o calendário eleitoral para acompanhar prazos e datas importantes.
                </Typography>
              </Box>
              <Button 
                fullWidth 
                variant="outlined" 
                onClick={() => navigate('/calendarios')}
              >
                Ver Calendário
              </Button>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Container>
  )
}