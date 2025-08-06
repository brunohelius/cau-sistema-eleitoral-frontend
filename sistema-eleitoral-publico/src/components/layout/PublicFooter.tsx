import { Box, Container, Typography, Grid, Link } from '@mui/material'

export function PublicFooter() {
  return (
    <Box
      component="footer"
      sx={{
        backgroundColor: '#2c3e50',
        color: 'white',
        py: 4,
        mt: 'auto'
      }}
    >
      <Container maxWidth="xl">
        <Grid container spacing={4}>
          <Grid item xs={12} md={4}>
            <Typography variant="h6" gutterBottom>
              CAU/BR
            </Typography>
            <Typography variant="body2">
              Conselho de Arquitetura e Urbanismo do Brasil
            </Typography>
            <Typography variant="body2" sx={{ mt: 1 }}>
              Sistema Eleitoral Oficial
            </Typography>
          </Grid>

          <Grid item xs={12} md={4}>
            <Typography variant="h6" gutterBottom>
              Links Úteis
            </Typography>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
              <Link href="/eleicoes" color="inherit" underline="hover">
                Eleições Ativas
              </Link>
              <Link href="/chapas" color="inherit" underline="hover">
                Chapas Cadastradas
              </Link>
              <Link href="/resultados" color="inherit" underline="hover">
                Resultados
              </Link>
              <Link href="/documentos" color="inherit" underline="hover">
                Documentos Oficiais
              </Link>
            </Box>
          </Grid>

          <Grid item xs={12} md={4}>
            <Typography variant="h6" gutterBottom>
              Contato
            </Typography>
            <Typography variant="body2">
              Site: www.caubr.gov.br
            </Typography>
            <Typography variant="body2">
              Email: eleitoral@caubr.gov.br
            </Typography>
            <Typography variant="body2">
              Tel: (61) 2102-8200
            </Typography>
          </Grid>
        </Grid>

        <Box
          sx={{
            borderTop: '1px solid rgba(255,255,255,0.1)',
            mt: 4,
            pt: 4,
            textAlign: 'center'
          }}
        >
          <Typography variant="body2">
            © {new Date().getFullYear()} CAU/BR - Conselho de Arquitetura e Urbanismo do Brasil. 
            Todos os direitos reservados.
          </Typography>
        </Box>
      </Container>
    </Box>
  )
}