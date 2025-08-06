import { api } from './api';
import type { 
  Chapa, 
  ChapaCreate, 
  ChapaUpdate, 
  ChapaMembro, 
  ChapaStatus, 
  ChapaValidacao,
  CalculoDiversidade,
  ChapaListResponse
} from '../types/chapas.types';

export const chapasApi = api.injectEndpoints({
  endpoints: (builder) => ({
    // Listar chapas com paginação e filtros
    getChapas: builder.query<ChapaListResponse, {
      page?: number;
      pageSize?: number;
      eleicaoId?: number;
      status?: ChapaStatus;
      search?: string;
      orderBy?: string;
      orderDirection?: 'asc' | 'desc';
    }>({
      query: (params) => ({
        url: '/chapas',
        params,
      }),
      providesTags: ['Chapa'],
    }),

    // Obter chapa por ID
    getChapa: builder.query<Chapa, number>({
      query: (id) => `/chapas/${id}`,
      providesTags: (result, error, id) => [{ type: 'Chapa', id }],
    }),

    // Criar nova chapa
    createChapa: builder.mutation<Chapa, ChapaCreate>({
      query: (chapa) => ({
        url: '/chapas',
        method: 'POST',
        body: chapa,
      }),
      invalidatesTags: ['Chapa'],
    }),

    // Atualizar chapa
    updateChapa: builder.mutation<Chapa, { id: number; data: ChapaUpdate }>({
      query: ({ id, data }) => ({
        url: `/chapas/${id}`,
        method: 'PUT',
        body: data,
      }),
      invalidatesTags: (result, error, { id }) => [{ type: 'Chapa', id }],
    }),

    // Deletar chapa
    deleteChapa: builder.mutation<void, number>({
      query: (id) => ({
        url: `/chapas/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Chapa'],
    }),

    // Gerenciar membros da chapa
    getMembros: builder.query<ChapaMembro[], number>({
      query: (chapaId) => `/chapas/${chapaId}/membros`,
      providesTags: (result, error, chapaId) => [
        { type: 'Chapa', id: `membros-${chapaId}` }
      ],
    }),

    adicionarMembro: builder.mutation<ChapaMembro, { chapaId: number; membro: Partial<ChapaMembro> }>({
      query: ({ chapaId, membro }) => ({
        url: `/chapas/${chapaId}/membros`,
        method: 'POST',
        body: membro,
      }),
      invalidatesTags: (result, error, { chapaId }) => [
        { type: 'Chapa', id: chapaId },
        { type: 'Chapa', id: `membros-${chapaId}` }
      ],
    }),

    atualizarMembro: builder.mutation<ChapaMembro, { 
      chapaId: number; 
      membroId: number; 
      data: Partial<ChapaMembro> 
    }>({
      query: ({ chapaId, membroId, data }) => ({
        url: `/chapas/${chapaId}/membros/${membroId}`,
        method: 'PUT',
        body: data,
      }),
      invalidatesTags: (result, error, { chapaId }) => [
        { type: 'Chapa', id: chapaId },
        { type: 'Chapa', id: `membros-${chapaId}` }
      ],
    }),

    removerMembro: builder.mutation<void, { chapaId: number; membroId: number }>({
      query: ({ chapaId, membroId }) => ({
        url: `/chapas/${chapaId}/membros/${membroId}`,
        method: 'DELETE',
      }),
      invalidatesTags: (result, error, { chapaId }) => [
        { type: 'Chapa', id: chapaId },
        { type: 'Chapa', id: `membros-${chapaId}` }
      ],
    }),

    // Validações e verificações
    validarChapa: builder.mutation<ChapaValidacao, number>({
      query: (chapaId) => ({
        url: `/chapas/${chapaId}/validar`,
        method: 'POST',
      }),
      invalidatesTags: (result, error, chapaId) => [{ type: 'Chapa', id: chapaId }],
    }),

    calcularDiversidade: builder.query<CalculoDiversidade, number>({
      query: (chapaId) => `/chapas/${chapaId}/diversidade`,
      providesTags: (result, error, chapaId) => [
        { type: 'Chapa', id: `diversidade-${chapaId}` }
      ],
    }),

    verificarElegibilidade: builder.mutation<{
      elegivel: boolean;
      motivos: string[];
    }, { cpf: string; eleicaoId: number }>({
      query: ({ cpf, eleicaoId }) => ({
        url: '/chapas/verificar-elegibilidade',
        method: 'POST',
        body: { cpf, eleicaoId },
      }),
    }),

    // Fluxo de trabalho da chapa
    submeterChapa: builder.mutation<Chapa, number>({
      query: (chapaId) => ({
        url: `/chapas/${chapaId}/submeter`,
        method: 'POST',
      }),
      invalidatesTags: (result, error, chapaId) => [{ type: 'Chapa', id: chapaId }],
    }),

    aprovarChapa: builder.mutation<Chapa, { chapaId: number; observacoes?: string }>({
      query: ({ chapaId, observacoes }) => ({
        url: `/chapas/${chapaId}/aprovar`,
        method: 'POST',
        body: { observacoes },
      }),
      invalidatesTags: (result, error, { chapaId }) => [{ type: 'Chapa', id: chapaId }],
    }),

    rejeitarChapa: builder.mutation<Chapa, { chapaId: number; motivo: string; observacoes?: string }>({
      query: ({ chapaId, motivo, observacoes }) => ({
        url: `/chapas/${chapaId}/rejeitar`,
        method: 'POST',
        body: { motivo, observacoes },
      }),
      invalidatesTags: (result, error, { chapaId }) => [{ type: 'Chapa', id: chapaId }],
    }),

    solicitarCorrecao: builder.mutation<Chapa, { chapaId: number; itens: string[]; observacoes?: string }>({
      query: ({ chapaId, itens, observacoes }) => ({
        url: `/chapas/${chapaId}/solicitar-correcao`,
        method: 'POST',
        body: { itens, observacoes },
      }),
      invalidatesTags: (result, error, { chapaId }) => [{ type: 'Chapa', id: chapaId }],
    }),

    // Upload e gestão de documentos
    uploadDocumento: builder.mutation<{ url: string; nome: string }, { 
      chapaId: number; 
      tipoDocumento: string; 
      file: File 
    }>({
      query: ({ chapaId, tipoDocumento, file }) => {
        const formData = new FormData();
        formData.append('file', file);
        formData.append('tipoDocumento', tipoDocumento);
        
        return {
          url: `/chapas/${chapaId}/documentos`,
          method: 'POST',
          body: formData,
          formData: true,
        };
      },
      invalidatesTags: (result, error, { chapaId }) => [{ type: 'Chapa', id: chapaId }],
    }),

    getDocumentos: builder.query<Array<{
      id: number;
      nome: string;
      tipo: string;
      url: string;
      uploadEm: string;
      tamanho: number;
    }>, number>({
      query: (chapaId) => `/chapas/${chapaId}/documentos`,
      providesTags: (result, error, chapaId) => [
        { type: 'Chapa', id: `documentos-${chapaId}` }
      ],
    }),

    removerDocumento: builder.mutation<void, { chapaId: number; documentoId: number }>({
      query: ({ chapaId, documentoId }) => ({
        url: `/chapas/${chapaId}/documentos/${documentoId}`,
        method: 'DELETE',
      }),
      invalidatesTags: (result, error, { chapaId }) => [
        { type: 'Chapa', id: chapaId },
        { type: 'Chapa', id: `documentos-${chapaId}` }
      ],
    }),

    // Relatórios e estatísticas
    getChapasSummary: builder.query<{
      total: number;
      porStatus: Record<ChapaStatus, number>;
      porRegiao: Record<string, number>;
      diversidade: {
        genero: Record<string, number>;
        etnia: Record<string, number>;
        lgbtqi: number;
        pcd: number;
      };
    }, { eleicaoId: number }>({
      query: ({ eleicaoId }) => `/chapas/summary?eleicaoId=${eleicaoId}`,
      providesTags: ['Chapa'],
    }),

    exportarChapas: builder.mutation<{ url: string }, {
      eleicaoId: number;
      formato: 'excel' | 'pdf' | 'csv';
      filtros?: any;
    }>({
      query: ({ eleicaoId, formato, filtros }) => ({
        url: '/chapas/exportar',
        method: 'POST',
        body: { eleicaoId, formato, filtros },
      }),
    }),

    // Histórico de alterações
    getHistoricoChapa: builder.query<Array<{
      id: number;
      acao: string;
      descricao: string;
      usuarioId: number;
      usuarioNome: string;
      dataHora: string;
      detalhes?: any;
    }>, number>({
      query: (chapaId) => `/chapas/${chapaId}/historico`,
      providesTags: (result, error, chapaId) => [
        { type: 'Chapa', id: `historico-${chapaId}` }
      ],
    }),
  }),
});

export const {
  useGetChapasQuery,
  useGetChapaQuery,
  useCreateChapaMutation,
  useUpdateChapaMutation,
  useDeleteChapaMutation,
  useGetMembrosQuery,
  useAdicionarMembroMutation,
  useAtualizarMembroMutation,
  useRemoverMembroMutation,
  useValidarChapaMutation,
  useCalcularDiversidadeQuery,
  useVerificarElegibilidadeMutation,
  useSubmeterChapaMutation,
  useAprovarChapaMutation,
  useRejeitarChapaMutation,
  useSolicitarCorrecaoMutation,
  useUploadDocumentoMutation,
  useGetDocumentosQuery,
  useRemoverDocumentoMutation,
  useGetChapasSummaryQuery,
  useExportarChapasMutation,
  useGetHistoricoChapaQuery,
} = chapasApi;