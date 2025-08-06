# CAU Electoral - Sistema de Gestão Eleitoral

Sistema completo de gestão eleitoral para o Conselho de Arquitetura e Urbanismo (CAU), desenvolvido em React 18 com TypeScript.

## 🚀 Tecnologias

- **React 18** com TypeScript strict
- **Redux Toolkit** para gerenciamento de estado
- **RTK Query** para chamadas de API
- **React Hook Form + Zod** para formulários
- **Material-UI v5** para interface
- **React Router v6** para roteamento
- **Jest + React Testing Library** para testes

## 📋 Funcionalidades

### Core Modules

- **Gestão de Eleições**: Criação, edição e gerenciamento completo de eleições
- **Calendário Eleitoral**: Controle de fases e prazos eleitorais
- **Chapas**: Cadastro, validação e gestão de chapas eleitorais
- **Comissões Eleitorais**: Formação automática com cálculo proporcional
- **Processos Judiciais**: Denúncias e impugnações com workflow completo
- **Relatórios**: Geração de relatórios customizáveis
- **Dashboard**: Visão geral do sistema com métricas

### Features Avançadas

- **Autenticação JWT** integrada com sistema CAU
- **Validação automática** de membros (situação CAU, financeira, ética)
- **Análise de diversidade** com critérios configuráveis
- **Workflow judicial completo** (admissibilidade, defesa, provas, audiência, julgamento)
- **Sistema de prazos** automatizado
- **Tema customizável** (claro/escuro)
- **Interface responsiva** para desktop e mobile

## 🏗️ Arquitetura

### Frontend Structure

```
src/
├── components/           # Componentes reutilizáveis
│   ├── Layout/          # Layout principal
│   ├── Auth/            # Componentes de autenticação
│   ├── Elections/       # Componentes de eleições
│   ├── Tickets/         # Componentes de chapas
│   └── Complaints/      # Componentes de denúncias
├── pages/               # Páginas da aplicação
├── store/               # Redux store e slices
├── services/            # Serviços de API
├── types/               # Definições TypeScript
├── theme/               # Tema Material-UI customizado
└── utils/               # Utilitários
```

### State Management

- **Redux Toolkit** com slices organizados por módulo
- **RTK Query** para cache e sincronização de dados
- **Persistência** de autenticação no localStorage

### API Integration

- **Axios** para HTTP requests
- **Interceptors** para autenticação e tratamento de erros
- **TypeScript interfaces** para type safety

## 🚀 Instalação e Execução

### Pré-requisitos

- Node.js 16+
- npm ou yarn

### Instalação

```bash
# Clone o repositório
git clone <repository-url>
cd Eleitoral-Admin-React

# Instale as dependências
npm install

# Configure as variáveis de ambiente
cp .env.example .env
# Edite o arquivo .env com suas configurações
```

### Execução

```bash
# Desenvolvimento
npm start

# Build de produção
npm run build

# Testes
npm test

# Linting
npm run lint
```

### Scripts Disponíveis

- `npm start`: Servidor de desenvolvimento
- `npm run build`: Build otimizado para produção
- `npm run dev`: Alias para start
- `npm run hmg`: Build para homologação
- `npm run prd`: Build para produção
- `npm test`: Executa testes
- `npm run lint`: Executa linting

## 🔧 Configuração

### Variáveis de Ambiente

```env
REACT_APP_API_URL=http://localhost:8000/api
REACT_APP_ENV=development
REACT_APP_ENABLE_DARK_MODE=true
```

### Backend Integration

O frontend está preparado para integrar com a API PHP/Lumen existente:

- Autenticação JWT
- Endpoints RESTful
- Upload de arquivos
- Geração de relatórios

## 📱 Interface

### Design System

- **Cores principais**: Azul CAU (#0066CC) e laranja (#FF6B35)
- **Tipografia**: Inter (primary) / Roboto (fallback)
- **Componentes**: Material-UI customizados
- **Ícones**: Material Icons
- **Responsividade**: Breakpoints Material-UI

### Temas

- **Modo claro** (padrão)
- **Modo escuro** (opcional)
- **Alto contraste** (acessibilidade)

## 🔐 Segurança

- **JWT Authentication** com refresh automático
- **Role-based access control** (RBAC)
- **Validação client-side** com Zod
- **HTTPS enforced** em produção
- **XSS protection** nos componentes

## 📊 Performance

- **Code splitting** por rotas
- **Lazy loading** de componentes
- **Bundle optimization** com Webpack
- **Caching** inteligente com RTK Query
- **Memoization** em componentes críticos

## 🧪 Testes

```bash
# Executar todos os testes
npm test

# Executar com coverage
npm test -- --coverage

# Executar em modo watch
npm test -- --watch
```

### Cobertura de Testes

- Componentes principais
- Redux slices
- Serviços de API
- Utilitários

## 📚 Documentação

### Componentes

Cada componente principal possui:
- Props interface documentada
- Exemplos de uso
- Testes unitários
- Storybook stories (quando aplicável)

### API Services

Serviços organizados por módulo:
- `authService`: Autenticação
- `eleicoesService`: Gestão de eleições
- `chapasService`: Gestão de chapas
- `denunciasService`: Processos judiciais

## 🚀 Deploy

### Build

```bash
# Build para produção
npm run prd

# Os arquivos estarão em /build
```

### Ambientes

- **Development**: `npm run dev`
- **Homologation**: `npm run hmg`
- **Production**: `npm run prd`

## 🤝 Contribuição

1. Fork o projeto
2. Crie uma branch para sua feature
3. Commit suas mudanças
4. Push para a branch
5. Abra um Pull Request

## 📄 Licença

Este projeto é propriedade do Conselho de Arquitetura e Urbanismo do Brasil (CAU).

## 📞 Suporte

Para suporte técnico ou dúvidas sobre o sistema, entre em contato com a equipe de desenvolvimento do CAU.

---

**CAU Electoral v2.0** - Sistema de Gestão Eleitoral
Desenvolvido para o Conselho de Arquitetura e Urbanismo do Brasil