# Sistema Eleitoral CAU - Interface Pública

Portal público para visualização e participação em eleições do Conselho de Arquitetura e Urbanismo (CAU), desenvolvido em React 18 com Vite.

## 🚀 Tecnologias

- **React 18** com TypeScript
- **Vite** para build e desenvolvimento
- **Zustand** para gerenciamento de estado
- **TanStack Query** para cache de dados
- **Material-UI v5** para interface
- **React Router v6** para roteamento
- **Playwright** para testes E2E
- **Vitest** para testes unitários

## 🌐 Funcionalidades Públicas

### Visualização de Eleições
- **Lista de eleições** ativas e encerradas
- **Calendário eleitoral** com fases e prazos
- **Resultados** em tempo real durante apuração
- **Histórico** de eleições anteriores

### Chapas Eleitorais
- **Visualização de chapas** com propostas
- **Perfis dos candidatos** com currículos
- **Documentos** e planos de governo
- **Estatísticas** de participação

### Transparência
- **Relatórios públicos** de prestação de contas
- **Atas** de reuniões da comissão eleitoral
- **Decisões judiciais** públicas
- **Cronograma** detalhado do processo

### Features Interativas
- **Busca avançada** por eleições e chapas
- **Filtros** por período, região, status
- **Compartilhamento** nas redes sociais
- **Download** de documentos oficiais
- **Modo escuro/claro** configurável

## 🏗️ Arquitetura

### Estrutura do Projeto

```
src/
├── components/           # Componentes reutilizáveis
│   ├── Layout/          # Layout público
│   ├── Elections/       # Componentes de eleições
│   ├── Tickets/         # Componentes de chapas
│   └── Results/         # Componentes de resultados
├── pages/               # Páginas públicas
│   ├── Home/           # Página inicial
│   ├── Elections/      # Lista de eleições
│   ├── Tickets/        # Chapas eleitorais
│   └── Results/        # Resultados
├── store/               # Estado global (Zustand)
├── services/            # Serviços de API
├── types/               # Definições TypeScript
├── theme/               # Tema Material-UI
└── tests/               # Testes E2E e unitários
    ├── e2e/            # Testes Playwright
    └── unit/           # Testes Vitest
```

### Performance Otimizada
- **Vite** para builds ultra-rápidos
- **Code splitting** automático
- **Lazy loading** de rotas
- **Image optimization** para fotos
- **Service Worker** para cache offline

## 🚀 Instalação e Execução

### Pré-requisitos
- Node.js 18+
- npm ou yarn

### Instalação

```bash
# Navegue até o diretório do projeto
cd /Users/brunosouza/Documents/Development/AI\ POC/eleitoral-react-net-v2/frontend/sistema-eleitoral-publico/Eleitoral-Public-React

# Instale as dependências
npm install

# Configure as variáveis de ambiente
cp .env.example .env
# Edite o arquivo .env com suas configurações
```

### 📋 Informações do Projeto

#### 🗂️ **Localização**
- **Caminho**: `/Users/brunosouza/Documents/Development/AI POC/eleitoral-react-net-v2/frontend/sistema-eleitoral-publico/Eleitoral-Public-React`
- **Tipo**: Frontend Público React + Vite
- **Porta**: 4173 (build) / 5173 (dev)

#### 🔗 **Integração com Backend**
- **API URL**: `http://localhost:5000/api`
- **Endpoints**: Públicos (sem autenticação)
- **Cache**: TanStack Query

### Execução

```bash
# Desenvolvimento
npm run dev
# Servidor: http://localhost:5173

# Preview de produção
npm run preview
# Servidor: http://localhost:4173

# Build de produção
npm run build
```

### Scripts Disponíveis

- `npm run dev`: Servidor de desenvolvimento (Vite)
- `npm run build`: Build otimizado para produção
- `npm run preview`: Preview da build de produção
- `npm run test`: Testes unitários (Vitest)
- `npm run test:e2e`: Testes E2E (Playwright)
- `npm run test:e2e:ui`: Interface gráfica do Playwright
- `npm run lint`: ESLint
- `npm run type-check`: Verificação TypeScript

## 🧪 Testes

### Testes E2E (Playwright)

```bash
# Executar todos os testes E2E
npm run test:e2e

# Executar com interface gráfica
npm run test:e2e:ui

# Executar em modo debug
npm run test:e2e:debug
```

### Cobertura de Testes E2E
- ✅ Navegação entre páginas
- ✅ Visualização de eleições
- ✅ Detalhes de chapas
- ✅ Busca e filtros
- ✅ Responsividade mobile
- ✅ Acessibilidade

### Testes Unitários (Vitest)

```bash
# Executar testes unitários
npm run test

# Com coverage
npm run test:coverage

# Em modo watch
npm run test:watch
```

## 🎨 Design System

### Cores CAU
- **Primary**: #1976d2 (Azul CAU)
- **Secondary**: #ff6b35 (Laranja)
- **Background**: #f5f5f5 / #121212 (claro/escuro)
- **Surface**: #ffffff / #1e1e1e (claro/escuro)

### Tipografia
- **Primary**: Inter
- **Secondary**: Roboto
- **Monospace**: Fira Code

### Breakpoints
- **xs**: 0px - 599px (mobile)
- **sm**: 600px - 959px (tablet)
- **md**: 960px - 1279px (desktop small)
- **lg**: 1280px - 1919px (desktop)
- **xl**: 1920px+ (desktop large)

## 🔧 Configuração

### Variáveis de Ambiente

```env
VITE_API_URL=http://localhost:5000/api
VITE_APP_NAME=Sistema Eleitoral CAU
VITE_ENABLE_ANALYTICS=false
VITE_ENABLE_PWA=true
```

### PWA (Progressive Web App)
- **Service Worker** para cache offline
- **Web App Manifest** para instalação
- **Push Notifications** (futuro)
- **Offline Mode** para visualização básica

## 📱 Responsividade

### Mobile First
- Layout adaptativo para todas as telas
- Touch-friendly para dispositivos móveis
- Otimização para diferentes densidades de pixel

### Acessibilidade
- **WCAG 2.1 AA** compliance
- **Screen readers** compatível
- **Keyboard navigation** completa
- **High contrast** mode
- **Focus management** otimizado

## 🚀 Performance

### Métricas Alvo
- **First Contentful Paint**: < 1.5s
- **Largest Contentful Paint**: < 2.5s
- **Cumulative Layout Shift**: < 0.1
- **First Input Delay**: < 100ms

### Otimizações
- **Tree shaking** automático
- **Bundle splitting** inteligente
- **Image lazy loading**
- **Critical CSS** inlined
- **Preload** de recursos críticos

## 📊 Analytics

### Métricas Coletadas
- Visualizações de página
- Interações do usuário
- Performance metrics
- Erros JavaScript
- Taxa de conversão (quando aplicável)

## 🚀 Deploy

### Build para Produção

```bash
npm run build
# Os arquivos estarão em /dist
```

### Ambientes
- **Development**: `npm run dev`
- **Preview**: `npm run preview`
- **Production**: Deploy da pasta `/dist`

## 📄 Documentação

### Componentes
- Props interfaces documentadas
- Storybook stories (planejado)
- Testes E2E para cada componente crítico

### API Integration
- Endpoints públicos documentados
- Error handling padronizado
- Loading states consistentes

## 📞 Suporte

Para questões técnicas ou dúvidas sobre a interface pública, entre em contato com a equipe de desenvolvimento do CAU.

---

**Sistema Eleitoral CAU v2.0** - Interface Pública  
*Transparência e Participação Democrática*