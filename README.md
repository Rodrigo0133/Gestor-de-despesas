# Gestor de Despesas

Aplicação web para registar e acompanhar despesas, receitas e categorias de cada utilizador.

## Funcionalidades

- Registo, autenticação e encerramento de sessão
- Gestão de despesas e receitas
- Gestão de categorias personalizadas
- Consulta do histórico de movimentos
- Resumo financeiro mensal e anual
- Evolução de despesas, receitas e saldo por mês
- Resumo de despesas por categoria

## Tecnologias utilizadas

### Frontend

- React
- TypeScript
- Vite
- Tailwind CSS
- React Router

### Backend

- Node.js
- Express
- MongoDB e Mongoose
- Sessões e cookies com `express-session`
- Argon2 para proteção das palavras-passe

## Requisitos

- Node.js instalado
- Uma base de dados MongoDB local ou no MongoDB Atlas

## Instalação

Instala as dependências do projeto:

```bash
npm install
```

Cria um ficheiro `.env` na raiz do projeto a partir do `.env.example`:

```env
MONGODB_URI=mongodb://localhost:27017/gestor-despesas
PORT=3000
SESSION_SECRET=coloca_aqui_um_segredo
```

Podes gerar um valor seguro para `SESSION_SECRET` com:

```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

Guarda o resultado apenas no ficheiro `.env`. Não publiques esse ficheiro no GitHub.

## Executar o projeto

Abre dois terminais. No primeiro, inicia o frontend:

```bash
npm run dev
```

No segundo, compila e inicia o backend:

```bash
npm run compile:ts
npm start
```

Por predefinição, o frontend fica disponível em `http://localhost:5173` e a API em `http://localhost:3000`.

## Rotas da API

| Método | Rota | Função |
| --- | --- | --- |
| POST | `/registrar` | Criar um utilizador |
| POST | `/login` | Iniciar sessão |
| POST | `/logout` | Terminar sessão |
| GET | `/auth` | Consultar o utilizador autenticado |
| GET | `/movimentos` | Listar despesas e receitas |
| GET | `/movimentos/:id` | Consultar um movimento |
| POST | `/novadespesa` | Criar uma despesa |
| PATCH | `/despesas/:id` | Atualizar uma despesa |
| DELETE | `/despesas/:id` | Eliminar uma despesa |
| POST | `/receita` | Criar uma receita |
| PATCH | `/receitas/:id` | Atualizar uma receita |
| DELETE | `/receita/:id` | Eliminar uma receita |
| GET | `/categorias` | Listar categorias |
| GET | `/categorias/:id` | Consultar uma categoria |
| POST | `/categoria` | Criar uma categoria |
| PATCH | `/categorias/:id` | Atualizar uma categoria |
| DELETE | `/categoria/:id` | Eliminar uma categoria |
| GET | `/resumo?ano=2026` | Obter o resumo anual |
| GET | `/resumo?mes=2026-09` | Obter o resumo mensal |
| GET | `/resumo/evolucao?ano=2026` | Obter a evolução mensal de um ano |
| GET | `/resumo/categorias?ano=2026` ou `/resumo/categorias?mes=2026-09` | Obter despesas agrupadas por categoria |

As rotas protegidas exigem uma sessão iniciada. O frontend deve enviar os cookies nos pedidos à API.

## Conhecimentos adquiridos

- Criação de uma API com Express e TypeScript
- Integração de uma API com React
- Registo e autenticação de utilizadores
- Gestão de sessões e cookies
- Operações de atualização e eliminação
- Ligação e consultas a uma base de dados MongoDB
- Configuração de CORS entre frontend e backend

## Melhorias futuras

- Concluir e melhorar a interface do frontend
- Adicionar filtros e pesquisa ao histórico de movimentos
- Exportar o resumo mensal para Excel
- Adicionar testes à API
- Preparar a aplicação para publicação
