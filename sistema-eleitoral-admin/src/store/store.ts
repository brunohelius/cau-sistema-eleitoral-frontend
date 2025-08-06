import { configureStore } from '@reduxjs/toolkit';
import { setupListeners } from '@reduxjs/toolkit/query';
import authSlice from './slices/authSlice';
import eleicoesSlice from './slices/eleicoesSlice';
import chapasSlice from './slices/chapasSlice';
import denunciasSlice from './slices/denunciasSlice';
import impugnacoesSlice from './slices/impugnacoesSlice';
import comissaoSlice from './slices/comissaoSlice';
import relatoriosSlice from './slices/relatoriosSlice';
import { api } from '../services/api';

export const store = configureStore({
  reducer: {
    auth: authSlice,
    eleicoes: eleicoesSlice,
    chapas: chapasSlice,
    denuncias: denunciasSlice,
    impugnacoes: impugnacoesSlice,
    comissao: comissaoSlice,
    relatorios: relatoriosSlice,
    [api.reducerPath]: api.reducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: ['persist/PERSIST', 'persist/REHYDRATE'],
      },
    }).concat(api.middleware),
  devTools: process.env.NODE_ENV !== 'production',
});

setupListeners(store.dispatch);

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;