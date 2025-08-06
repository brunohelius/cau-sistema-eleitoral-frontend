import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { impugnacoesService } from '../../services/impugnacoes.service';
import { Impugnacao, ImpugnacaoFormData } from '../types/impugnacoes.types';

interface ImpugnacoesState {
  impugnacoes: Impugnacao[];
  impugnacaoAtual: Impugnacao | null;
  isLoading: boolean;
  error: string | null;
  filters: {
    status?: string;
    tipo?: string;
    eleicaoId?: number;
  };
}

const initialState: ImpugnacoesState = {
  impugnacoes: [],
  impugnacaoAtual: null,
  isLoading: false,
  error: null,
  filters: {},
};

export const fetchImpugnacoes = createAsyncThunk(
  'impugnacoes/fetchImpugnacoes',
  async (filters?: any, { rejectWithValue }) => {
    try {
      return await impugnacoesService.getImpugnacoes(filters);
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Erro ao buscar impugnações');
    }
  }
);

export const fetchImpugnacaoById = createAsyncThunk(
  'impugnacoes/fetchImpugnacaoById',
  async (id: number, { rejectWithValue }) => {
    try {
      return await impugnacoesService.getImpugnacaoById(id);
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Erro ao buscar impugnação');
    }
  }
);

export const createImpugnacao = createAsyncThunk(
  'impugnacoes/createImpugnacao',
  async (data: ImpugnacaoFormData, { rejectWithValue }) => {
    try {
      return await impugnacoesService.createImpugnacao(data);
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Erro ao criar impugnação');
    }
  }
);

export const apresentarDefesaImpugnacao = createAsyncThunk(
  'impugnacoes/apresentarDefesa',
  async ({ id, defesa }: { id: number; defesa: string }, { rejectWithValue }) => {
    try {
      return await impugnacoesService.apresentarDefesa(id, defesa);
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Erro ao apresentar defesa');
    }
  }
);

export const julgarImpugnacao = createAsyncThunk(
  'impugnacoes/julgarImpugnacao',
  async ({ id, decisao, fundamentacao }: { id: number; decisao: string; fundamentacao: string }, { rejectWithValue }) => {
    try {
      return await impugnacoesService.julgarImpugnacao(id, decisao, fundamentacao);
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Erro ao julgar impugnação');
    }
  }
);

const impugnacoesSlice = createSlice({
  name: 'impugnacoes',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    setFilters: (state, action: PayloadAction<typeof initialState.filters>) => {
      state.filters = action.payload;
    },
    clearImpugnacaoAtual: (state) => {
      state.impugnacaoAtual = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch Impugnações
      .addCase(fetchImpugnacoes.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchImpugnacoes.fulfilled, (state, action) => {
        state.isLoading = false;
        state.impugnacoes = action.payload;
        state.error = null;
      })
      .addCase(fetchImpugnacoes.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      // Fetch Impugnação By ID
      .addCase(fetchImpugnacaoById.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchImpugnacaoById.fulfilled, (state, action) => {
        state.isLoading = false;
        state.impugnacaoAtual = action.payload;
        state.error = null;
      })
      .addCase(fetchImpugnacaoById.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      // Create Impugnação
      .addCase(createImpugnacao.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(createImpugnacao.fulfilled, (state, action) => {
        state.isLoading = false;
        state.impugnacoes.push(action.payload);
        state.error = null;
      })
      .addCase(createImpugnacao.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      // Apresentar Defesa
      .addCase(apresentarDefesaImpugnacao.fulfilled, (state, action) => {
        const index = state.impugnacoes.findIndex(i => i.id === action.payload.id);
        if (index !== -1) {
          state.impugnacoes[index] = action.payload;
        }
        if (state.impugnacaoAtual?.id === action.payload.id) {
          state.impugnacaoAtual = action.payload;
        }
      })
      // Julgar Impugnação
      .addCase(julgarImpugnacao.fulfilled, (state, action) => {
        const index = state.impugnacoes.findIndex(i => i.id === action.payload.id);
        if (index !== -1) {
          state.impugnacoes[index] = action.payload;
        }
        if (state.impugnacaoAtual?.id === action.payload.id) {
          state.impugnacaoAtual = action.payload;
        }
      });
  },
});

export const { clearError, setFilters, clearImpugnacaoAtual } = impugnacoesSlice.actions;
export default impugnacoesSlice.reducer;