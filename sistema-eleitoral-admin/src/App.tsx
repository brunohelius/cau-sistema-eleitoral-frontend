import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider, CssBaseline } from '@mui/material';
import { LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { ptBR } from 'date-fns/locale';
import { Provider } from 'react-redux';
import { store } from "./store/store";
import { createCAUTheme } from './theme/theme';
import { Layout } from './components/Layout/Layout';
import { PrivateRoute } from './components/Auth/PrivateRoute';
import { LoginPage } from './pages/Auth/LoginPage';
import { Dashboard } from './pages/Dashboard/Dashboard';
import { ElectionsList } from './pages/Elections/ElectionsList';
import { ElectionDetail } from './pages/Elections/ElectionDetail';
import { ElectionCalendar } from './pages/Elections/ElectionCalendar';
import { NewElection } from './pages/Elections/NewElection';
import { TicketsList } from './pages/Tickets/TicketsList';
import { TicketDetail } from './pages/Tickets/TicketDetail';
import { NewTicket } from './pages/Tickets/NewTicket';
import { TicketValidation } from './pages/Tickets/TicketValidation';
import { ComplaintsList } from './pages/Complaints/ComplaintsList';
import { ComplaintDetail } from './pages/Complaints/ComplaintDetail';
import { NewComplaint } from './pages/Complaints/NewComplaint';
import { ImpugnationsList } from './pages/Impugnations/ImpugnationsList';
import { ImpugnationDetail } from './pages/Impugnations/ImpugnationDetail';
import { NewImpugnation } from './pages/Impugnations/NewImpugnation';
import { CommissionsList } from './pages/Commissions/CommissionsList';
import { CommissionDetail } from './pages/Commissions/CommissionDetail';
import { NewCommission } from './pages/Commissions/NewCommission';
import { ReportsList } from './pages/Reports/ReportsList';
import { ReportDetail } from './pages/Reports/ReportDetail';
import { Settings } from './pages/Settings/Settings';
import { Profile } from './pages/Profile/Profile';

function App() {
  const [darkMode, setDarkMode] = useState(false);
  const theme = createCAUTheme(darkMode ? 'dark' : 'light');

  const handleToggleTheme = () => {
    setDarkMode(!darkMode);
  };

  return (
    <Provider store={store}>
      <ThemeProvider theme={theme}>
        <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={ptBR}>
          <CssBaseline />
          <Router>
            <Routes>
              {/* Auth Routes */}
              <Route path="/login" element={<LoginPage />} />
              
              {/* Protected Routes */}
              <Route
                path="/*"
                element={
                  <PrivateRoute>
                    <Layout onToggleTheme={handleToggleTheme} darkMode={darkMode}>
                      <Routes>
                        <Route path="/" element={<Navigate to="/dashboard" replace />} />
                        <Route path="/dashboard" element={<Dashboard />} />
                        
                        {/* Elections */}
                        <Route path="/eleicoes" element={<ElectionsList />} />
                        <Route path="/eleicoes/:id" element={<ElectionDetail />} />
                        <Route path="/eleicoes/:id/calendario" element={<ElectionCalendar />} />
                        <Route path="/eleicoes/nova" element={<NewElection />} />
                        
                        {/* Tickets */}
                        <Route path="/chapas" element={<TicketsList />} />
                        <Route path="/chapas/:id" element={<TicketDetail />} />
                        <Route path="/chapas/nova" element={<NewTicket />} />
                        <Route path="/chapas/validacao" element={<TicketValidation />} />
                        
                        {/* Commissions */}
                        <Route path="/comissoes" element={<CommissionsList />} />
                        <Route path="/comissoes/:id" element={<CommissionDetail />} />
                        <Route path="/comissoes/nova" element={<NewCommission />} />
                        
                        {/* Complaints */}
                        <Route path="/denuncias" element={<ComplaintsList />} />
                        <Route path="/denuncias/:id" element={<ComplaintDetail />} />
                        <Route path="/denuncias/nova" element={<NewComplaint />} />
                        
                        {/* Impugnations */}
                        <Route path="/impugnacoes" element={<ImpugnationsList />} />
                        <Route path="/impugnacoes/:id" element={<ImpugnationDetail />} />
                        <Route path="/impugnacoes/nova" element={<NewImpugnation />} />
                        
                        {/* Reports */}
                        <Route path="/relatorios" element={<ReportsList />} />
                        <Route path="/relatorios/:id" element={<ReportDetail />} />
                        
                        {/* Settings */}
                        <Route path="/configuracoes" element={<Settings />} />
                        <Route path="/perfil" element={<Profile />} />
                        
                        {/* Catch all */}
                        <Route path="*" element={<Navigate to="/dashboard" replace />} />
                      </Routes>
                    </Layout>
                  </PrivateRoute>
                }
              />
            </Routes>
          </Router>
        </LocalizationProvider>
      </ThemeProvider>
    </Provider>
  );
}

export default App;