# 🗳️ CAU Sistema Eleitoral - Frontend

Interface moderna desenvolvida em React com TypeScript para o Sistema Eleitoral do CAU.

## ✨ Funcionalidades

- 🔐 **Autenticação Segura** - Login com JWT e refresh tokens
- 📊 **Dashboard Interativo** - Visualização de dados em tempo real
- 🗳️ **Interface de Votação** - Sistema intuitivo de votação online
- 📈 **Apuração ao Vivo** - Acompanhamento em tempo real com WebSockets
- 📱 **Responsivo** - Funciona em desktop, tablet e mobile
- 🎨 **Design Moderno** - Material-UI com tema personalizado
- ♿ **Acessível** - Compatível com leitores de tela

## 🛠️ Tecnologias

- **React 18** - Framework principal
- **TypeScript** - Type safety
- **Material-UI** - Componentes de interface
- **Redux Toolkit** - Gerenciamento de estado
- **React Query** - Cache e sincronização de dados
- **React Hook Form** - Formulários performáticos
- **Socket.io Client** - WebSocket para real-time
- **Axios** - Cliente HTTP
- **Recharts** - Gráficos e visualizações
- **Vite** - Build tool

## 🚀 Instalação

### Pré-requisitos
- Node.js 18+
- npm ou yarn

### Setup

1. Clone o repositório:
```bash
git clone https://github.com/brunozexter/cau-sistema-eleitoral-frontend.git
cd cau-sistema-eleitoral-frontend
```

2. Instale as dependências:
```bash
npm install
# ou
yarn install
```

3. Configure as variáveis de ambiente:
```bash
cp .env.example .env
# Edite o arquivo .env com as URLs da API
```

4. Execute o projeto:
```bash
npm run dev
# ou
yarn dev
```

A aplicação estará disponível em: http://localhost:5173

## 📁 Estrutura do Projeto

```
src/
├── components/       # Componentes reutilizáveis
├── pages/           # Páginas da aplicação
├── services/        # Serviços de API
├── store/           # Redux store e slices
├── hooks/           # Custom hooks
├── utils/           # Funções utilitárias
├── types/           # TypeScript types
├── styles/          # Estilos globais
└── assets/          # Imagens e arquivos estáticos
```

## 🎨 Componentes Principais

- **LoginForm** - Formulário de autenticação
- **Dashboard** - Painel principal
- **VotingBallot** - Cédula de votação
- **ResultsChart** - Gráficos de resultados
- **ChapaCard** - Card de chapa eleitoral
- **ElectionTimeline** - Timeline da eleição

## 🧪 Testes

```bash
# Executar testes unitários
npm run test

# Executar testes e2e
npm run test:e2e

# Coverage
npm run test:coverage
```

## 📦 Build

```bash
# Build de produção
npm run build

# Preview do build
npm run preview
```

## 🔒 Segurança

- Autenticação JWT com refresh tokens
- Proteção contra XSS
- Validação de inputs
- Rate limiting no cliente
- HTTPS enforced

## 🤝 Contribuindo

1. Fork o projeto
2. Crie sua feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit suas mudanças (`git commit -m 'Add some AmazingFeature'`)
4. Push para a branch (`git push origin feature/AmazingFeature`)
5. Abra um Pull Request

## 📝 Licença

Este projeto está sob licença proprietária do CAU.

## 👨‍💻 Autor

**Bruno Souza**
- GitHub: [@brunozexter](https://github.com/brunozexter)

## 🙏 Agradecimentos

- Equipe CAU
- Comunidade React
- Material-UI Team