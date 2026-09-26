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
SESSION_SECRET=coloca_aqui_uma_chave
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
| POST | `/api/register` | Criar um utilizador |
| POST | `/api/login` | Iniciar sessão |
| POST | `/api/logout` | Terminar sessão |
| GET | `/api/auth` | Consultar o utilizador autenticado |
| GET | `/api/Dashboard?mes=2026-09` | Obter os dados mensais do dashboard |
| GET | `/api/movement/:num` | Listar despesas e receitas, limitando o resultado a `num` movimentos; usa `0` para listar todos |
| GET | `/api/movements/:id` | Consultar um movimento pelo seu ID |
| POST | `/api/newexpense` | Criar uma despesa |
| PATCH | `/api/updateexpense/:id` | Atualizar uma despesa |
| DELETE | `/api/deleteexpense/:id` | Eliminar uma despesa |
| POST | `/api/newrevenue` | Criar uma receita |
| PATCH | `/api/updaterevenue/:id` | Atualizar uma receita |
| DELETE | `/api/deleterevenue/:id` | Eliminar uma receita |
| GET | `/api/allcategories` | Listar categorias |
| GET | `/api/onecategory/:id` | Consultar uma categoria pelo seu ID |
| POST | `/api/newcategory` | Criar uma categoria |
| PATCH | `/api/UpdateCategory/:id` | Atualizar uma categoria |
| DELETE | `/api/DeleteCategory/:id` | Eliminar uma categoria |
| GET | `/api/summary?ano=2026` | Obter o resumo anual |
| GET | `/api/summary?mes=2026-09` | Obter o resumo mensal |
| GET | `/api/summary/evolution?ano=2026` | Obter a evolução mensal de um ano |
| GET | `/api/summary/categories?ano=2026` ou `/api/summary/categories?mes=2026-09` | Obter despesas agrupadas por categoria |

Com exceção de `POST /api/register` e `POST /api/login`, todas as rotas exigem uma sessão iniciada. O frontend deve enviar os cookies nos pedidos à API.

## Rotas do frontend

| Rota | Página |
| --- | --- |
| `/` | Página inicial |
| `/registrar` | Registo de utilizador |
| `/login` | Início de sessão |
| `/dashboard` | Dashboard financeiro |
| `/dashboard/despesas` | Gestão de despesas |

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
- Preparar a aplicação para publicação
