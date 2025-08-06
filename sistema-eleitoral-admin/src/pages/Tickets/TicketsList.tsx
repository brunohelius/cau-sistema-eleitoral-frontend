import React, { FC, useEffect } from 'react';
import { Box, Typography, Card, Alert } from '@mui/material';
import { DataGrid, GridColDef } from '@mui/x-data-grid';
import { useAppSelector, useAppDispatch } from '../../store/hooks';
import { fetchChapas } from '../../store/slices/chapasSlice';

export const TicketsList: FC = () => {
  const dispatch = useAppDispatch();
  const { chapas, isLoading, error } = useAppSelector((state) => state.chapas);

  useEffect(() => {
    dispatch(fetchChapas());
  }, [dispatch]);

  const columns: GridColDef[] = [
    { field: 'numero', headerName: 'Número', width: 100 },
    { field: 'nome', headerName: 'Nome', width: 250 },
    { field: 'tipo', headerName: 'Tipo', width: 120 },
    { field: 'status', headerName: 'Status', width: 150 },
  ];

  return (
    <Box>
      <Typography variant="h4" component="h1" gutterBottom>
        Chapas
      </Typography>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      <Card>
        <DataGrid
          rows={chapas}
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