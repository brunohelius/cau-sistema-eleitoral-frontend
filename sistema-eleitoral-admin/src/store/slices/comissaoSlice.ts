import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { comissaoService } from '../../services/comissao.service';
import { ComissaoEleitoral, MembroComissao, CreateComissaoData } from '../types/comissao.types';

interface ComissaoState {
  comissoes: ComissaoEleitoral[];
  comissaoAtual: ComissaoEleitoral | null;
  membros: MembroComissao[];
  isLoading: boolean;
  error: string | null;
  filters: {
    eleicaoId?: number;
    tipo?: string;
    uf?: string;
  };
}

const initialState: ComissaoState = {
  comissoes: [],
  comissaoAtual: null,
  membros: [],
  isLoading: false,
  error: null,
  filters: {},
};

export const fetchComissoes = createAsyncThunk(
  'comissao/fetchComissoes',
  async (filters?: any, { rejectWithValue }) => {
    try {
      return await comissaoService.getComissoes(filters);
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Erro ao buscar comissões');
    }
  }
);

export const fetchComissaoById = createAsyncThunk(
  'comissao/fetchComissaoById',
  async (id: number, { rejectWithValue }) => {
    try {
      return await comissaoService.getComissaoById(id);
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Erro ao buscar comissão');
    }
  }
);

export const createComissao = createAsyncThunk(
  'comissao/createComissao',
  async (data: CreateComissaoData, { rejectWithValue }) => {
    try {
      return await comissaoService.createComissao(data);
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Erro ao criar comissão');
    }
  }
);

export const updateComissao = createAsyncThunk(
  'comissao/updateComissao',
  async ({ id, data }: { id: number; data: Partial<CreateComissaoData> }, { rejectWithValue }) => {
    try {
      return await comissaoService.updateComissao(id, data);
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Erro ao atualizar comissão');
    }
  }
);

export const fetchMembrosByComissao = createAsyncThunk(
  'comissao/fetchMembrosByComissao',
  async (comissaoId: number, { rejectWithValue }) => {
    try {
      return await comissaoService.getMembrosByComissao(comissaoId);
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Erro ao buscar membros');
    }
  }
);

export const addMembroComissao = createAsyncThunk(
  'comissao/addMembroComissao',
  async ({ comissaoId, membro }: { comissaoId: number; membro: Omit<MembroComissao, 'id'> }, { rejectWithValue }) => {
    try {
      return await comissaoService.addMembroComissao(comissaoId, membro);
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Erro ao adicionar membro');
    }
  }
);

export const removeMembroComissao = createAsyncThunk(
  'comissao/removeMembroComissao',
  async ({ comissaoId, membroId }: { comissaoId: number; membroId: number }, { rejectWithValue }) => {
    try {
      await comissaoService.removeMembroComissao(comissaoId, membroId);
      return membroId;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Erro ao remover membro');
    }
  }
);

export const gerarComissoesAutomaticamente = createAsyncThunk(
  'comissao/gerarComissoesAutomaticamente',
  async (eleicaoId: number, { rejectWithValue }) => {
    try {
      return await comissaoService.gerarComissoesAutomaticamente(eleicaoId);
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Erro ao gerar comissões');
    }
  }
);

const comissaoSlice = createSlice({
  name: 'comissao',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    setFilters: (state, action: PayloadAction<typeof initialState.filters>) => {
      state.filters = action.payload;
    },
    clearComissaoAtual: (state) => {
      state.comissaoAtual = null;
      state.membros = [];
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch Comissões
      .addCase(fetchComissoes.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchComissoes.fulfilled, (state, action) => {
        state.isLoading = false;
        state.comissoes = action.payload;
        state.error = null;
      })
      .addCase(fetchComissoes.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      // Fetch Comissão By ID
      .addCase(fetchComissaoById.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchComissaoById.fulfilled, (state, action) => {
        state.isLoading = false;
        state.comissaoAtual = action.payload;
        state.error = null;
      })
      .addCase(fetchComissaoById.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      // Create Comissão
      .addCase(createComissao.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(createComissao.fulfilled, (state, action) => {
        state.isLoading = false;
        state.comissoes.push(action.payload);
        state.error = null;
      })
      .addCase(createComissao.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      // Update Comissão
      .addCase(updateComissao.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(updateComissao.fulfilled, (state, action) => {
        state.isLoading = false;
        const index = state.comissoes.findIndex(c => c.id === action.payload.id);
        if (index !== -1) {
          state.comissoes[index] = action.payload;
        }
        if (state.comissaoAtual?.id === action.payload.id) {
          state.comissaoAtual = action.payload;
        }
        state.error = null;
      })
      .addCase(updateComissao.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      // Fetch Membros
      .addCase(fetchMembrosByComissao.fulfilled, (state, action) => {
        state.membros = action.payload;
      })
      // Add Membro
      .addCase(addMembroComissao.fulfilled, (state, action) => {
        state.membros.push(action.payload);
      })
      // Remove Membro
      .addCase(removeMembroComissao.fulfilled, (state, action) => {
        state.membros = state.membros.filter(m => m.id !== action.payload);
      })
      // Gerar Comissões Automaticamente
      .addCase(gerarComissoesAutomaticamente.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(gerarComissoesAutomaticamente.fulfilled, (state, action) => {
        state.isLoading = false;
        state.comissoes = [...state.comissoes, ...action.payload];
        state.error = null;
      })
      .addCase(gerarComissoesAutomaticamente.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });
  },
});

export const { clearError, setFilters, clearComissaoAtual } = comissaoSlice.actions;
export default comissaoSlice.reducer;