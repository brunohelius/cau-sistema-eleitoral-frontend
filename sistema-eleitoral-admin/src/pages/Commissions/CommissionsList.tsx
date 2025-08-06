import React, { FC, useEffect } from 'react';
import { Box, Typography, Card, Alert } from '@mui/material';
import { DataGrid, GridColDef } from '@mui/x-data-grid';
import { useAppSelector, useAppDispatch } from '../../store/hooks';
import { fetchComissoes } from '../../store/slices/comissaoSlice';

export const CommissionsList: FC = () => {
  const dispatch = useAppDispatch();
  const { comissoes, isLoading, error } = useAppSelector((state) => state.comissao);

  useEffect(() => {
    dispatch(fetchComissoes());
  }, [dispatch]);

  const columns: GridColDef[] = [
    { field: 'nome', headerName: 'Nome', width: 250 },
    { field: 'tipo', headerName: 'Tipo', width: 120 },
    { field: 'uf', headerName: 'UF', width: 80 },
    { field: 'status', headerName: 'Status', width: 150 },
  ];

  return (
    <Box>
      <Typography variant="h4" component="h1" gutterBottom>
        Comissões Eleitorais
      </Typography>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      <Card>
        <DataGrid
          rows={comissoes}
          columns={columns}
          loading={isLoading}
          pageSizeOptions={[10, 25, 50]}
          initialState={{
            pagination: { paginationModel: { pageSize: 10 } },
          }}
          sx={{ minHeight: 400 }}
        />
      </Card>
    </Box>
  );
};