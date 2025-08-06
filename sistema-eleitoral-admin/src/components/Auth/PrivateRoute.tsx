import React, { FC, useEffect } from 'react';
import { Navigate } from 'react-router-dom';
import { Box, CircularProgress } from '@mui/material';
import { useAppSelector, useAppDispatch } from '../../store/hooks';
import { getCurrentUser } from '../../store/slices/authSlice';

interface PrivateRouteProps {
  children: React.ReactNode;
}

export const PrivateRoute: FC<PrivateRouteProps> = ({ children }) => {
  const dispatch = useAppDispatch();
  const { isAuthenticated, isLoading, user, token } = useAppSelector((state) => state.auth);

  useEffect(() => {
    // Se tem token mas não tem usuário, buscar dados do usuário
    if (token && !user && !isLoading) {
      dispatch(getCurrentUser());
    }
  }, [dispatch, token, user, isLoading]);

  // Se não está autenticado, redirecionar para login
  if (!isAuthenticated || !token) {
    return <Navigate to="/login" replace />;
  }

  // Se está carregando dados do usuário, mostrar loading
  if (isLoading || (token && !user)) {
    return (
      <Box
        display="flex"
        justifyContent="center"
        alignItems="center"
        minHeight="100vh"
      >
        <CircularProgress />
      </Box>
    );
  }

  // Se tudo ok, renderizar children
  return <>{children}</>;
};