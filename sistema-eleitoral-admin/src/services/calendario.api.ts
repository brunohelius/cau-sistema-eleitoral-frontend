import { api } from './api';
import type { Calendario, PeriodoEleitoral, StatusPeriodo } from '../types/calendario.types';

export const calendarioApi = api.injectEndpoints({
  endpoints: (builder) => ({
    // Listar todos os calendários eleitorais
    getCalendarios: builder.query<Calendario[], void>({
      query: () => '/calendario',
      providesTags: ['Calendario'],
    }),

    // Obter calendário específico por ID
    getCalendario: builder.query<Calendario, number>({
      query: (id) => `/calendario/${id}`,
      providesTags: (result, error, id) => [{ type: 'Calendario', id }],
    }),

    // Obter calendário por eleição
    getCalendarioPorEleicao: builder.query<Calendario, number>({
      query: (eleicaoId) => `/calendario/eleicao/${eleicaoId}`,
      providesTags: (result, error, eleicaoId) => [{ type: 'Calendario', id: `eleicao-${eleicaoId}` }],
    }),

    // Criar novo calendário
    createCalendario: builder.mutation<Calendario, Partial<Calendario>>({
      query: (calendario) => ({
        url: '/calendario',
        method: 'POST',
        body: calendario,
      }),
      invalidatesTags: ['Calendario'],
    }),

    // Atualizar calendário
    updateCalendario: builder.mutation<Calendario, { id: number; data: Partial<Calendario> }>({
      query: ({ id, data }) => ({
        url: `/calendario/${id}`,
        method: 'PUT',
        body: data,
      }),
      invalidatesTags: (result, error, { id }) => [{ type: 'Calendario', id }],
    }),

    // Deletar calendário
    deleteCalendario: builder.mutation<void, number>({
      query: (id) => ({
        url: `/calendario/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Calendario'],
    }),

    // Obter períodos de um calendário
    getPeriodos: builder.query<PeriodoEleitoral[], number>({
      query: (calendarioId) => `/calendario/${calendarioId}/periodos`,
      providesTags: (result, error, calendarioId) => [
        { type: 'Calendario', id: `periodos-${calendarioId}` }
      ],
    }),

    // Verificar status de um período específico
    getStatusPeriodo: builder.query<StatusPeriodo, { calendarioId: number; tipoPeriodo: string }>({
      query: ({ calendarioId, tipoPeriodo }) => 
        `/calendario/${calendarioId}/status/${tipoPeriodo}`,
      providesTags: ['Calendario'],
    }),

    // Verificar se uma ação está permitida no momento atual
    isAcaoPermitida: builder.query<{ permitida: boolean; motivo?: string }, { calendarioId: number; acao: string }>({
      query: ({ calendarioId, acao }) => 
        `/calendario/${calendarioId}/acao-permitida/${acao}`,
      providesTags: ['Calendario'],
    }),

    // Obter dashboard do calendário (prazos próximos, alertas, etc.)
    getCalendarioDashboard: builder.query<{
      prazosProximos: Array<{
        periodo: string;
        dataFim: string;
        diasRestantes: number;
        alerta: 'verde' | 'amarelo' | 'vermelho';
      }>;
      periodosAtivos: PeriodoEleitoral[];
      proximosEventos: Array<{
        evento: string;
        data: string;
        descricao: string;
      }>;
    }, number>({
      query: (calendarioId) => `/calendario/${calendarioId}/dashboard`,
      providesTags: ['Calendario'],
    }),

    // Validar calendário antes de ativar
    validarCalendario: builder.mutation<{
      valido: boolean;
      erros: string[];
      avisos: string[];
    }, number>({
      query: (calendarioId) => ({
        url: `/calendario/${calendarioId}/validar`,
        method: 'POST',
      }),
      invalidatesTags: (result, error, calendarioId) => [{ type: 'Calendario', id: calendarioId }],
    }),

    // Ativar calendário
    ativarCalendario: builder.mutation<Calendario, number>({
      query: (id) => ({
        url: `/calendario/${id}/ativar`,
        method: 'POST',
      }),
      invalidatesTags: ['Calendario'],
    }),

    // Desativar calendário
    desativarCalendario: builder.mutation<Calendario, number>({
      query: (id) => ({
        url: `/calendario/${id}/desativar`,
        method: 'POST',
      }),
      invalidatesTags: ['Calendario'],
    }),

    // Clonar calendário de eleição anterior
    clonarCalendario: builder.mutation<Calendario, { calendarioOrigemId: number; novaEleicaoId: number }>({
      query: ({ calendarioOrigemId, novaEleicaoId }) => ({
        url: `/calendario/clonar`,
        method: 'POST',
        body: { calendarioOrigemId, novaEleicaoId },
      }),
      invalidatesTags: ['Calendario'],
    }),
  }),
});

export const {
  useGetCalendariosQuery,
  useGetCalendarioQuery,
  useGetCalendarioPorEleicaoQuery,
  useCreateCalendarioMutation,
  useUpdateCalendarioMutation,
  useDeleteCalendarioMutation,
  useGetPeriodosQuery,
  useGetStatusPeriodoQuery,
  useIsAcaoPermitidaQuery,
  useGetCalendarioDashboardQuery,
  useValidarCalendarioMutation,
  useAtivarCalendarioMutation,
  useDesativarCalendarioMutation,
  useClonarCalendarioMutation,
} = calendarioApi;