import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { chapasService } from '../../services/chapas.service';
import { Chapa, ChapaFormData, MembroChapa } from '../types/chapas.types';

interface ChapasState {
  chapas: Chapa[];
  chapaAtual: Chapa | null;
  membros: MembroChapa[];
  isLoading: boolean;
  error: string | null;
  filters: {
    eleicaoId?: number;
    status?: string;
    uf?: string;
  };
}

const initialState: ChapasState = {
  chapas: [],
  chapaAtual: null,
  membros: [],
  isLoading: false,
  error: null,
  filters: {},
};

export const fetchChapas = createAsyncThunk(
  'chapas/fetchChapas',
  async (filters?: any, { rejectWithValue }) => {
    try {
      return await chapasService.getChapas(filters);
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Erro ao buscar chapas');
    }
  }
);

export const fetchChapaById = createAsyncThunk(
  'chapas/fetchChapaById',
  async (id: number, { rejectWithValue }) => {
    try {
      return await chapasService.getChapaById(id);
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Erro ao buscar chapa');
    }
  }
);

export const createChapa = createAsyncThunk(
  'chapas/createChapa',
  async (data: ChapaFormData, { rejectWithValue }) => {
    try {
      return await chapasService.createChapa(data);
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Erro ao criar chapa');
    }
  }
);

export const updateChapa = createAsyncThunk(
  'chapas/updateChapa',
  async ({ id, data }: { id: number; data: Partial<ChapaFormData> }, { rejectWithValue }) => {
    try {
      return await chapasService.updateChapa(id, data);
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Erro ao atualizar chapa');
    }
  }
);

export const fetchMembrosByChapa = createAsyncThunk(
  'chapas/fetchMembrosByChapa',
  async (chapaId: number, { rejectWithValue }) => {
    try {
      return await chapasService.getMembrosByChapa(chapaId);
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Erro ao buscar membros');
    }
  }
);

export const addMembroChapa = createAsyncThunk(
  'chapas/addMembroChapa',
  async ({ chapaId, membro }: { chapaId: number; membro: Omit<MembroChapa, 'id'> }, { rejectWithValue }) => {
    try {
      return await chapasService.addMembroChapa(chapaId, membro);
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Erro ao adicionar membro');
    }
  }
);

export const removeMembroChapa = createAsyncThunk(
  'chapas/removeMembroChapa',
  async ({ chapaId, membroId }: { chapaId: number; membroId: number }, { rejectWithValue }) => {
    try {
      await chapasService.removeMembroChapa(chapaId, membroId);
      return membroId;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Erro ao remover membro');
    }
  }
);

export const confirmChapa = createAsyncThunk(
  'chapas/confirmChapa',
  async (chapaId: number, { rejectWithValue }) => {
    try {
      return await chapasService.confirmChapa(chapaId);
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Erro ao confirmar chapa');
    }
  }
);

const chapasSlice = createSlice({
  name: 'chapas',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    setFilters: (state, action: PayloadAction<typeof initialState.filters>) => {
      state.filters = action.payload;
    },
    clearChapaAtual: (state) => {
      state.chapaAtual = null;
      state.membros = [];
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch Chapas
      .addCase(fetchChapas.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchChapas.fulfilled, (state, action) => {
        state.isLoading = false;
        state.chapas = action.payload;
        state.error = null;
      })
      .addCase(fetchChapas.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      // Fetch Chapa By ID
      .addCase(fetchChapaById.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchChapaById.fulfilled, (state, action) => {
        state.isLoading = false;
        state.chapaAtual = action.payload;
        state.error = null;
      })
      .addCase(fetchChapaById.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      // Create Chapa
      .addCase(createChapa.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(createChapa.fulfilled, (state, action) => {
        state.isLoading = false;
        state.chapas.push(action.payload);
        state.error = null;
      })
      .addCase(createChapa.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      // Update Chapa
      .addCase(updateChapa.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(updateChapa.fulfilled, (state, action) => {
        state.isLoading = false;
        const index = state.chapas.findIndex(c => c.id === action.payload.id);
        if (index !== -1) {
          state.chapas[index] = action.payload;
        }
        if (state.chapaAtual?.id === action.payload.id) {
          state.chapaAtual = action.payload;
        }
        state.error = null;
      })
      .addCase(updateChapa.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      // Fetch Membros
      .addCase(fetchMembrosByChapa.fulfilled, (state, action) => {
        state.membros = action.payload;
      })
      // Add Membro
      .addCase(addMembroChapa.fulfilled, (state, action) => {
        state.membros.push(action.payload);
      })
      // Remove Membro
      .addCase(removeMembroChapa.fulfilled, (state, action) => {
        state.membros = state.membros.filter(m => m.id !== action.payload);
      })
      // Confirm Chapa
      .addCase(confirmChapa.fulfilled, (state, action) => {
        const index = state.chapas.findIndex(c => c.id === action.payload.id);
        if (index !== -1) {
          state.chapas[index] = action.payload;
        }
        if (state.chapaAtual?.id === action.payload.id) {
          state.chapaAtual = action.payload;
        }
      });
  },
});

export const { clearError, setFilters, clearChapaAtual } = chapasSlice.actions;
export default chapasSlice.reducer;