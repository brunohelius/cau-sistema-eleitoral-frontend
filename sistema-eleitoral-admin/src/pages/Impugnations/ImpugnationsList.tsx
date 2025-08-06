import React, { FC, useEffect } from 'react';
import { Box, Typography, Card, Alert } from '@mui/material';
import { DataGrid, GridColDef } from '@mui/x-data-grid';
import { useAppSelector, useAppDispatch } from '../../store/hooks';
import { fetchImpugnacoes } from '../../store/slices/impugnacoesSlice';

export const ImpugnationsList: FC = () => {
  const dispatch = useAppDispatch();
  const { impugnacoes, isLoading, error } = useAppSelector((state) => state.impugnacoes);

  useEffect(() => {
    dispatch(fetchImpugnacoes());
  }, [dispatch]);

  const columns: GridColDef[] = [
    { field: 'numero', headerName: 'Número', width: 150 },
    { field: 'tipo', headerName: 'Tipo', width: 120 },
    { field: 'status', headerName: 'Status', width: 150 },
    { field: 'motivo', headerName: 'Motivo', width: 300 },
  ];

  return (
    <Box>
      <Typography variant="h4" component="h1" gutterBottom>
        Impugnações
      </Typography>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      <Card>
        <DataGrid
          rows={impugnacoes}
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