import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { eleicoesService } from '../../services/eleicoes.service';
import { Eleicao, CalendarioEleitoral, CreateEleicaoData } from '../types/eleicoes.types';

interface EleicoesState {
  eleicoes: Eleicao[];
  eleicaoAtual: Eleicao | null;
  calendario: CalendarioEleitoral | null;
  isLoading: boolean;
  error: string | null;
  filters: {
    status?: string;
    ano?: number;
    uf?: string;
  };
}

const initialState: EleicoesState = {
  eleicoes: [],
  eleicaoAtual: null,
  calendario: null,
  isLoading: false,
  error: null,
  filters: {},
};

export const fetchEleicoes = createAsyncThunk(
  'eleicoes/fetchEleicoes',
  async (filters?: any, { rejectWithValue }) => {
    try {
      return await eleicoesService.getEleicoes(filters);
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Erro ao buscar eleições');
    }
  }
);

export const fetchEleicaoById = createAsyncThunk(
  'eleicoes/fetchEleicaoById',
  async (id: number, { rejectWithValue }) => {
    try {
      return await eleicoesService.getEleicaoById(id);
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Erro ao buscar eleição');
    }
  }
);

export const createEleicao = createAsyncThunk(
  'eleicoes/createEleicao',
  async (data: CreateEleicaoData, { rejectWithValue }) => {
    try {
      return await eleicoesService.createEleicao(data);
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Erro ao criar eleição');
    }
  }
);

export const updateEleicao = createAsyncThunk(
  'eleicoes/updateEleicao',
  async ({ id, data }: { id: number; data: Partial<CreateEleicaoData> }, { rejectWithValue }) => {
    try {
      return await eleicoesService.updateEleicao(id, data);
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Erro ao atualizar eleição');
    }
  }
);

export const fetchCalendarioEleitoral = createAsyncThunk(
  'eleicoes/fetchCalendarioEleitoral',
  async (eleicaoId: number, { rejectWithValue }) => {
    try {
      return await eleicoesService.getCalendarioEleitoral(eleicaoId);
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Erro ao buscar calendário');
    }
  }
);

const eleicoesSlice = createSlice({
  name: 'eleicoes',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    setFilters: (state, action: PayloadAction<typeof initialState.filters>) => {
      state.filters = action.payload;
    },
    clearEleicaoAtual: (state) => {
      state.eleicaoAtual = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch Eleições
      .addCase(fetchEleicoes.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchEleicoes.fulfilled, (state, action) => {
        state.isLoading = false;
        state.eleicoes = action.payload;
        state.error = null;
      })
      .addCase(fetchEleicoes.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      // Fetch Eleição By ID
      .addCase(fetchEleicaoById.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchEleicaoById.fulfilled, (state, action) => {
        state.isLoading = false;
        state.eleicaoAtual = action.payload;
        state.error = null;
      })
      .addCase(fetchEleicaoById.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      // Create Eleição
      .addCase(createEleicao.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(createEleicao.fulfilled, (state, action) => {
        state.isLoading = false;
        state.eleicoes.push(action.payload);
        state.error = null;
      })
      .addCase(createEleicao.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      // Update Eleição
      .addCase(updateEleicao.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(updateEleicao.fulfilled, (state, action) => {
        state.isLoading = false;
        const index = state.eleicoes.findIndex(e => e.id === action.payload.id);
        if (index !== -1) {
          state.eleicoes[index] = action.payload;
        }
        if (state.eleicaoAtual?.id === action.payload.id) {
          state.eleicaoAtual = action.payload;
        }
        state.error = null;
      })
      .addCase(updateEleicao.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      // Fetch Calendário
      .addCase(fetchCalendarioEleitoral.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchCalendarioEleitoral.fulfilled, (state, action) => {
        state.isLoading = false;
        state.calendario = action.payload;
        state.error = null;
      })
      .addCase(fetchCalendarioEleitoral.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });
  },
});

export const { clearError, setFilters, clearEleicaoAtual } = eleicoesSlice.actions;
export default eleicoesSlice.reducer;