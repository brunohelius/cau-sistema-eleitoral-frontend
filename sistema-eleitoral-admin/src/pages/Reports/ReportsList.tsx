import React, { FC, useEffect } from 'react';
import { Box, Typography, Card, Alert } from '@mui/material';
import { DataGrid, GridColDef } from '@mui/x-data-grid';
import { useAppSelector, useAppDispatch } from '../../store/hooks';
import { fetchRelatorios } from '../../store/slices/relatoriosSlice';

export const ReportsList: FC = () => {
  const dispatch = useAppDispatch();
  const { relatorios, isLoading, error } = useAppSelector((state) => state.relatorios);

  useEffect(() => {
    dispatch(fetchRelatorios());
  }, [dispatch]);

  const columns: GridColDef[] = [
    { field: 'nome', headerName: 'Nome', width: 250 },
    { field: 'tipo', headerName: 'Tipo', width: 150 },
    { field: 'formato', headerName: 'Formato', width: 100 },
    { field: 'status', headerName: 'Status', width: 150 },
    { field: 'geradoEm', headerName: 'Gerado em', width: 180 },
  ];

  return (
    <Box>
      <Typography variant="h4" component="h1" gutterBottom>
        Relatórios
      </Typography>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      <Card>
        <DataGrid
          rows={relatorios}
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