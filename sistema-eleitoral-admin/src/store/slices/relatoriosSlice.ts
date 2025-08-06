import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { relatoriosService } from '../../services/relatorios.service';
import { Relatorio, RelatorioConfig, RelatorioFiltros } from '../types/relatorios.types';

interface RelatoriosState {
  relatorios: Relatorio[];
  relatorioAtual: Relatorio | null;
  configs: RelatorioConfig[];
  isLoading: boolean;
  isGenerating: boolean;
  error: string | null;
  filters: RelatorioFiltros;
}

const initialState: RelatoriosState = {
  relatorios: [],
  relatorioAtual: null,
  configs: [],
  isLoading: false,
  isGenerating: false,
  error: null,
  filters: {},
};

export const fetchRelatorios = createAsyncThunk(
  'relatorios/fetchRelatorios',
  async (filters?: RelatorioFiltros, { rejectWithValue }) => {
    try {
      return await relatoriosService.getRelatorios(filters);
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Erro ao buscar relatórios');
    }
  }
);

export const fetchRelatorioById = createAsyncThunk(
  'relatorios/fetchRelatorioById',
  async (id: number, { rejectWithValue }) => {
    try {
      return await relatoriosService.getRelatorioById(id);
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Erro ao buscar relatório');
    }
  }
);

export const gerarRelatorioChapas = createAsyncThunk(
  'relatorios/gerarRelatorioChapas',
  async (eleicaoId: number, { rejectWithValue }) => {
    try {
      return await relatoriosService.gerarRelatorioChapas(eleicaoId);
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Erro ao gerar relatório de chapas');
    }
  }
);

export const gerarRelatorioComissoes = createAsyncThunk(
  'relatorios/gerarRelatorioComissoes',
  async (eleicaoId: number, { rejectWithValue }) => {
    try {
      return await relatoriosService.gerarRelatorioComissoes(eleicaoId);
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Erro ao gerar relatório de comissões');
    }
  }
);

export const gerarRelatorioDenuncias = createAsyncThunk(
  'relatorios/gerarRelatorioDenuncias',
  async (eleicaoId: number, { rejectWithValue }) => {
    try {
      return await relatoriosService.gerarRelatorioDenuncias(eleicaoId);
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Erro ao gerar relatório de denúncias');
    }
  }
);

export const gerarRelatorioImpugnacoes = createAsyncThunk(
  'relatorios/gerarRelatorioImpugnacoes',
  async (eleicaoId: number, { rejectWithValue }) => {
    try {
      return await relatoriosService.gerarRelatorioImpugnacoes(eleicaoId);
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Erro ao gerar relatório de impugnações');
    }
  }
);

export const gerarRelatorioDiversidade = createAsyncThunk(
  'relatorios/gerarRelatorioDiversidade',
  async (eleicaoId: number, { rejectWithValue }) => {
    try {
      return await relatoriosService.gerarRelatorioDiversidade(eleicaoId);
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Erro ao gerar relatório de diversidade');
    }
  }
);

export const gerarRelatorioCustomizado = createAsyncThunk(
  'relatorios/gerarRelatorioCustomizado',
  async (config: RelatorioConfig, { rejectWithValue }) => {
    try {
      return await relatoriosService.gerarRelatorioCustomizado(config);
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Erro ao gerar relatório customizado');
    }
  }
);

export const downloadRelatorio = createAsyncThunk(
  'relatorios/downloadRelatorio',
  async ({ id, formato }: { id: number; formato: 'pdf' | 'excel' | 'csv' }, { rejectWithValue }) => {
    try {
      return await relatoriosService.downloadRelatorio(id, formato);
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Erro ao baixar relatório');
    }
  }
);

export const fetchConfiguracoes = createAsyncThunk(
  'relatorios/fetchConfiguracoes',
  async (_, { rejectWithValue }) => {
    try {
      return await relatoriosService.getConfiguracoes();
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Erro ao buscar configurações');
    }
  }
);

const relatoriosSlice = createSlice({
  name: 'relatorios',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    setFilters: (state, action: PayloadAction<RelatorioFiltros>) => {
      state.filters = action.payload;
    },
    clearRelatorioAtual: (state) => {
      state.relatorioAtual = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch Relatórios
      .addCase(fetchRelatorios.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchRelatorios.fulfilled, (state, action) => {
        state.isLoading = false;
        state.relatorios = action.payload;
        state.error = null;
      })
      .addCase(fetchRelatorios.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      // Fetch Relatório By ID
      .addCase(fetchRelatorioById.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchRelatorioById.fulfilled, (state, action) => {
        state.isLoading = false;
        state.relatorioAtual = action.payload;
        state.error = null;
      })
      .addCase(fetchRelatorioById.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      // Gerar Relatórios
      .addCase(gerarRelatorioChapas.pending, (state) => {
        state.isGenerating = true;
        state.error = null;
      })
      .addCase(gerarRelatorioChapas.fulfilled, (state, action) => {
        state.isGenerating = false;
        state.relatorios.unshift(action.payload);
        state.error = null;
      })
      .addCase(gerarRelatorioChapas.rejected, (state, action) => {
        state.isGenerating = false;
        state.error = action.payload as string;
      })
      .addCase(gerarRelatorioComissoes.pending, (state) => {
        state.isGenerating = true;
        state.error = null;
      })
      .addCase(gerarRelatorioComissoes.fulfilled, (state, action) => {
        state.isGenerating = false;
        state.relatorios.unshift(action.payload);
        state.error = null;
      })
      .addCase(gerarRelatorioComissoes.rejected, (state, action) => {
        state.isGenerating = false;
        state.error = action.payload as string;
      })
      .addCase(gerarRelatorioDenuncias.pending, (state) => {
        state.isGenerating = true;
        state.error = null;
      })
      .addCase(gerarRelatorioDenuncias.fulfilled, (state, action) => {
        state.isGenerating = false;
        state.relatorios.unshift(action.payload);
        state.error = null;
      })
      .addCase(gerarRelatorioDenuncias.rejected, (state, action) => {
        state.isGenerating = false;
        state.error = action.payload as string;
      })
      .addCase(gerarRelatorioImpugnacoes.pending, (state) => {
        state.isGenerating = true;
        state.error = null;
      })
      .addCase(gerarRelatorioImpugnacoes.fulfilled, (state, action) => {
        state.isGenerating = false;
        state.relatorios.unshift(action.payload);
        state.error = null;
      })
      .addCase(gerarRelatorioImpugnacoes.rejected, (state, action) => {
        state.isGenerating = false;
        state.error = action.payload as string;
      })
      .addCase(gerarRelatorioDiversidade.pending, (state) => {
        state.isGenerating = true;
        state.error = null;
      })
      .addCase(gerarRelatorioDiversidade.fulfilled, (state, action) => {
        state.isGenerating = false;
        state.relatorios.unshift(action.payload);
        state.error = null;
      })
      .addCase(gerarRelatorioDiversidade.rejected, (state, action) => {
        state.isGenerating = false;
        state.error = action.payload as string;
      })
      .addCase(gerarRelatorioCustomizado.pending, (state) => {
        state.isGenerating = true;
        state.error = null;
      })
      .addCase(gerarRelatorioCustomizado.fulfilled, (state, action) => {
        state.isGenerating = false;
        state.relatorios.unshift(action.payload);
        state.error = null;
      })
      .addCase(gerarRelatorioCustomizado.rejected, (state, action) => {
        state.isGenerating = false;
        state.error = action.payload as string;
      })
      // Fetch Configurações
      .addCase(fetchConfiguracoes.fulfilled, (state, action) => {
        state.configs = action.payload;
      });
  },
});

export const { clearError, setFilters, clearRelatorioAtual } = relatoriosSlice.actions;
export default relatoriosSlice.reducer;