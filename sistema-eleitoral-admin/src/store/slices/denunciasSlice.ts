import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { denunciasService } from '../../services/denuncias.service';
import { Denuncia, DenunciaFormData, ProcessoJudicial } from '../types/denuncias.types';

interface DenunciasState {
  denuncias: Denuncia[];
  denunciaAtual: Denuncia | null;
  processoJudicial: ProcessoJudicial | null;
  isLoading: boolean;
  error: string | null;
  filters: {
    status?: string;
    tipo?: string;
    eleicaoId?: number;
  };
}

const initialState: DenunciasState = {
  denuncias: [],
  denunciaAtual: null,
  processoJudicial: null,
  isLoading: false,
  error: null,
  filters: {},
};

export const fetchDenuncias = createAsyncThunk(
  'denuncias/fetchDenuncias',
  async (filters?: any, { rejectWithValue }) => {
    try {
      return await denunciasService.getDenuncias(filters);
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Erro ao buscar denúncias');
    }
  }
);

export const fetchDenunciaById = createAsyncThunk(
  'denuncias/fetchDenunciaById',
  async (id: number, { rejectWithValue }) => {
    try {
      return await denunciasService.getDenunciaById(id);
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Erro ao buscar denúncia');
    }
  }
);

export const createDenuncia = createAsyncThunk(
  'denuncias/createDenuncia',
  async (data: DenunciaFormData, { rejectWithValue }) => {
    try {
      return await denunciasService.createDenuncia(data);
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Erro ao criar denúncia');
    }
  }
);

export const updateDenuncia = createAsyncThunk(
  'denuncias/updateDenuncia',
  async ({ id, data }: { id: number; data: Partial<DenunciaFormData> }, { rejectWithValue }) => {
    try {
      return await denunciasService.updateDenuncia(id, data);
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Erro ao atualizar denúncia');
    }
  }
);

export const analisarAdmissibilidade = createAsyncThunk(
  'denuncias/analisarAdmissibilidade',
  async ({ id, decisao, justificativa }: { id: number; decisao: boolean; justificativa: string }, { rejectWithValue }) => {
    try {
      return await denunciasService.analisarAdmissibilidade(id, decisao, justificativa);
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Erro ao analisar admissibilidade');
    }
  }
);

export const apresentarDefesa = createAsyncThunk(
  'denuncias/apresentarDefesa',
  async ({ id, defesa }: { id: number; defesa: string }, { rejectWithValue }) => {
    try {
      return await denunciasService.apresentarDefesa(id, defesa);
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Erro ao apresentar defesa');
    }
  }
);

export const produzirProvas = createAsyncThunk(
  'denuncias/produzirProvas',
  async ({ id, provas }: { id: number; provas: string }, { rejectWithValue }) => {
    try {
      return await denunciasService.produzirProvas(id, provas);
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Erro ao produzir provas');
    }
  }
);

export const realizarAudiencia = createAsyncThunk(
  'denuncias/realizarAudiencia',
  async ({ id, ata }: { id: number; ata: string }, { rejectWithValue }) => {
    try {
      return await denunciasService.realizarAudiencia(id, ata);
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Erro ao realizar audiência');
    }
  }
);

export const apresentarAlegacoes = createAsyncThunk(
  'denuncias/apresentarAlegacoes',
  async ({ id, alegacoes }: { id: number; alegacoes: string }, { rejectWithValue }) => {
    try {
      return await denunciasService.apresentarAlegacoes(id, alegacoes);
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Erro ao apresentar alegações');
    }
  }
);

export const julgarPrimeiraInstancia = createAsyncThunk(
  'denuncias/julgarPrimeiraInstancia',
  async ({ id, decisao, fundamentacao }: { id: number; decisao: string; fundamentacao: string }, { rejectWithValue }) => {
    try {
      return await denunciasService.julgarPrimeiraInstancia(id, decisao, fundamentacao);
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Erro ao julgar primeira instância');
    }
  }
);

export const julgarSegundaInstancia = createAsyncThunk(
  'denuncias/julgarSegundaInstancia',
  async ({ id, decisao, fundamentacao }: { id: number; decisao: string; fundamentacao: string }, { rejectWithValue }) => {
    try {
      return await denunciasService.julgarSegundaInstancia(id, decisao, fundamentacao);
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Erro ao julgar segunda instância');
    }
  }
);

const denunciasSlice = createSlice({
  name: 'denuncias',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    setFilters: (state, action: PayloadAction<typeof initialState.filters>) => {
      state.filters = action.payload;
    },
    clearDenunciaAtual: (state) => {
      state.denunciaAtual = null;
      state.processoJudicial = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch Denúncias
      .addCase(fetchDenuncias.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchDenuncias.fulfilled, (state, action) => {
        state.isLoading = false;
        state.denuncias = action.payload;
        state.error = null;
      })
      .addCase(fetchDenuncias.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      // Fetch Denúncia By ID
      .addCase(fetchDenunciaById.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchDenunciaById.fulfilled, (state, action) => {
        state.isLoading = false;
        state.denunciaAtual = action.payload;
        state.error = null;
      })
      .addCase(fetchDenunciaById.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      // Create Denúncia
      .addCase(createDenuncia.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(createDenuncia.fulfilled, (state, action) => {
        state.isLoading = false;
        state.denuncias.push(action.payload);
        state.error = null;
      })
      .addCase(createDenuncia.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      // Update Denúncia
      .addCase(updateDenuncia.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(updateDenuncia.fulfilled, (state, action) => {
        state.isLoading = false;
        const index = state.denuncias.findIndex(d => d.id === action.payload.id);
        if (index !== -1) {
          state.denuncias[index] = action.payload;
        }
        if (state.denunciaAtual?.id === action.payload.id) {
          state.denunciaAtual = action.payload;
        }
        state.error = null;
      })
      .addCase(updateDenuncia.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      // Workflow actions - all update the current denuncia
      .addCase(analisarAdmissibilidade.fulfilled, (state, action) => {
        const index = state.denuncias.findIndex(d => d.id === action.payload.id);
        if (index !== -1) {
          state.denuncias[index] = action.payload;
        }
        if (state.denunciaAtual?.id === action.payload.id) {
          state.denunciaAtual = action.payload;
        }
      })
      .addCase(apresentarDefesa.fulfilled, (state, action) => {
        const index = state.denuncias.findIndex(d => d.id === action.payload.id);
        if (index !== -1) {
          state.denuncias[index] = action.payload;
        }
        if (state.denunciaAtual?.id === action.payload.id) {
          state.denunciaAtual = action.payload;
        }
      })
      .addCase(produzirProvas.fulfilled, (state, action) => {
        const index = state.denuncias.findIndex(d => d.id === action.payload.id);
        if (index !== -1) {
          state.denuncias[index] = action.payload;
        }
        if (state.denunciaAtual?.id === action.payload.id) {
          state.denunciaAtual = action.payload;
        }
      })
      .addCase(realizarAudiencia.fulfilled, (state, action) => {
        const index = state.denuncias.findIndex(d => d.id === action.payload.id);
        if (index !== -1) {
          state.denuncias[index] = action.payload;
        }
        if (state.denunciaAtual?.id === action.payload.id) {
          state.denunciaAtual = action.payload;
        }
      })
      .addCase(apresentarAlegacoes.fulfilled, (state, action) => {
        const index = state.denuncias.findIndex(d => d.id === action.payload.id);
        if (index !== -1) {
          state.denuncias[index] = action.payload;
        }
        if (state.denunciaAtual?.id === action.payload.id) {
          state.denunciaAtual = action.payload;
        }
      })
      .addCase(julgarPrimeiraInstancia.fulfilled, (state, action) => {
        const index = state.denuncias.findIndex(d => d.id === action.payload.id);
        if (index !== -1) {
          state.denuncias[index] = action.payload;
        }
        if (state.denunciaAtual?.id === action.payload.id) {
          state.denunciaAtual = action.payload;
        }
      })
      .addCase(julgarSegundaInstancia.fulfilled, (state, action) => {
        const index = state.denuncias.findIndex(d => d.id === action.payload.id);
        if (index !== -1) {
          state.denuncias[index] = action.payload;
        }
        if (state.denunciaAtual?.id === action.payload.id) {
          state.denunciaAtual = action.payload;
        }
      });
  },
});

export const { clearError, setFilters, clearDenunciaAtual } = denunciasSlice.actions;
export default denunciasSlice.reducer;