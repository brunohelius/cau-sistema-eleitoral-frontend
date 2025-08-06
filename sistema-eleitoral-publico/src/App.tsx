import { ThemeProvider, CssBaseline } from '@mui/material'
import { Routes, Route } from 'react-router-dom'
import { theme } from '@styles/theme'
import { PublicLayout } from '@components/layout/PublicLayout'

// Pages
import { HomePage } from './pages/HomePage'
import { ChapasPage } from './pages/ChapasPage'
import { ChapaDetailPage } from './pages/ChapaDetailPage'
import { EleicoesPage } from './pages/EleicoesPage'
import { EleicaoDetailPage } from './pages/EleicaoDetailPage'
import { CalendariosPage } from './pages/CalendariosPage'
import { ResultadosPage } from './pages/ResultadosPage'
import { LoginPage } from './pages/LoginPage'
import { RegisterPage } from './pages/RegisterPage'
import { DashboardPage } from './pages/DashboardPage'
import { CriarChapaPage } from './pages/CriarChapaPage'
import { DenunciasPage } from './pages/DenunciasPage'
import { DenunciasListPage } from './pages/denuncias/DenunciasListPage'
import { DenunciaDetailPage } from './pages/denuncias/DenunciaDetailPage'
import { CadastroImpugnacaoPage } from './pages/impugnacoes/CadastroImpugnacaoPage'
import { ImpugnacoesPage } from './pages/impugnacoes/ImpugnacoesPage'
import { ImpugnacaoDetailPage } from './pages/impugnacoes/ImpugnacaoDetailPage'
import { JulgamentoPage } from './pages/impugnacoes/JulgamentoPage'
import { CadastroSubstituicaoPage } from './pages/substituicoes/CadastroSubstituicaoPage'
import { SubstituicoesPage } from './pages/substituicoes/SubstituicoesPage'
import { SubstituicaoDetailPage } from './pages/substituicoes/SubstituicaoDetailPage'
import { DocumentosPage } from './pages/DocumentosPage'
import { MeusProcessosPage } from './pages/MeusProcessosPage'
import { ProfilePage } from './pages/ProfilePage'
import { ComissaoEleitoralPage } from './pages/ComissaoEleitoralPage'
import { ResultadosDetailPage } from './pages/ResultadosDetailPage'
import { VotingPage } from './pages/VotingPage'
import { VotingStatusPage } from './pages/VotingStatusPage'
import { ProtectedRoute } from './components/auth/ProtectedRoute'

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Routes>
        <Route element={<PublicLayout />}>
          <Route path="/" element={<HomePage />} />
          <Route path="/chapas" element={<ChapasPage />} />
          <Route path="/chapas/:id" element={<ChapaDetailPage />} />
          <Route path="/eleicoes" element={<EleicoesPage />} />
          <Route path="/eleicoes/:id" element={<EleicaoDetailPage />} />
          <Route path="/calendarios" element={<CalendariosPage />} />
          <Route path="/resultados" element={<ResultadosPage />} />
          <Route path="/resultados/:id" element={<ResultadosDetailPage />} />
          <Route path="/documentos" element={<DocumentosPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/dashboard" element={
            <ProtectedRoute>
              <DashboardPage />
            </ProtectedRoute>
          } />
          <Route path="/meus-processos" element={
            <ProtectedRoute>
              <MeusProcessosPage />
            </ProtectedRoute>
          } />
          <Route path="/perfil" element={
            <ProtectedRoute>
              <ProfilePage />
            </ProtectedRoute>
          } />
          <Route path="/criar-chapa" element={
            <ProtectedRoute>
              <CriarChapaPage />
            </ProtectedRoute>
          } />
          <Route path="/denuncias" element={<DenunciasListPage />} />
          <Route path="/denuncias/nova" element={
            <ProtectedRoute>
              <DenunciasPage />
            </ProtectedRoute>
          } />
          <Route path="/denuncias/:id" element={<DenunciaDetailPage />} />
          <Route path="/impugnacoes" element={<ImpugnacoesPage />} />
          <Route path="/impugnacoes/cadastro" element={
            <ProtectedRoute>
              <CadastroImpugnacaoPage />
            </ProtectedRoute>
          } />
          <Route path="/impugnacoes/:id" element={<ImpugnacaoDetailPage />} />
          <Route path="/impugnacoes/:id/julgamento/:instancia" element={<JulgamentoPage />} />
          <Route path="/substituicoes" element={<SubstituicoesPage />} />
          <Route path="/substituicoes/cadastro" element={
            <ProtectedRoute>
              <CadastroSubstituicaoPage />
            </ProtectedRoute>
          } />
          <Route path="/substituicoes/:id" element={<SubstituicaoDetailPage />} />
          <Route path="/comissao-eleitoral" element={
            <ProtectedRoute requiredRoles={['COMISSAO']}>
              <ComissaoEleitoralPage />
            </ProtectedRoute>
          } />
          <Route path="/voting/:id" element={
            <ProtectedRoute>
              <VotingPage />
            </ProtectedRoute>
          } />
          <Route path="/voting-status" element={
            <ProtectedRoute>
              <VotingStatusPage />
            </ProtectedRoute>
          } />
        </Route>
      </Routes>
    </ThemeProvider>
  )
}

export default App