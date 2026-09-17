import express from "express";
import {
  ligarBaseDados,
  User,
  expense,  
  categorias,
  receitas,
} from "./database/db.js";
import argon2 from "argon2";
import cors from "cors";
import "dotenv/config";
import session from "express-session";
import MongoStore from "connect-mongo";
import { isValidObjectId } from "mongoose";
const mongoUri = process.env.MONGODB_URI;
const sessionSecret = process.env.SESSION_SECRET;
const PORT = Number(process.env.PORT ?? 3000);
const app = express();


app.use(
  cors({
    origin: "http://localhost:5173",
    credentials: true,
  }),
);
declare module "express-session" {
  interface SessionData {
    userId: string;
  }
}

if (!mongoUri || !sessionSecret) {
  throw new Error("Define MONGODB_URI e SESSION_SECRET no .env");
}

app.use(
  session({
    name: "gestor.sid",
    secret: sessionSecret,
    resave: false,
    saveUninitialized: false,
    store: MongoStore.create({
      mongoUrl: mongoUri,
    }),
    cookie: {
      httpOnly: true,
      sameSite: "lax",
      secure: false,
      maxAge: 1000 * 60 * 60 * 24,
    },
  }),
);
app.use(express.json());

// Routes
app.post("/novadespesa", async (req, res) => {
  console.log(req.body);
  const id = req.session.userId;

  if (!id) {
    return res.status(401).json({
      message: "Precisas de iniciar sessão",
    });
  }

  const { descricao, valor, data, categoria } = req.body;
  if (!descricao || !valor || !data || !categoria) {
    return res.status(400).json({
      message: "Preenche todos os campos",
    });
  }

  const dataDoMovimento = converterDataDoUtilizador(data);

  if (!dataDoMovimento) {
    return res.status(400).json({
      message: "Data inválida. Usa o formato AAAA-MM-DD",
    });
  }

  const verificar_dado = isValidObjectId(id);
  if (!verificar_dado) {
    return res.status(401).json({
      message: "Credencias invalidas",
    });
  }
  const IdExistente = await User.findById(id);
  if (!IdExistente) {
    return res.status(404).json({
      message: "Usuario Não encontrado",
    });
  }
  if (typeof categoria !== "string" || !isValidObjectId(categoria)) {
    return res.status(400).json({
      message: "Categoria inválida",
    });
  }

  const categoriaExistente = await categorias.findOne({
    _id: categoria,
    userId: id,
  });

  if (!categoriaExistente) {
    return res.status(400).json({
      message: "Categoria não encontrada",
    });
  }
  try {
    const novaDespesa = await expense.create({
      descricao,
      valor,
      data: dataDoMovimento,
      categoria,
      userId: id,
    });
    return res.status(201).json({
      message: "Despesa Adicionada",
      despesa: novaDespesa,
    });
  } catch (err) {
    console.log(err);
    return res.status(500).json({
      message: "Erro ao guardar despesa!",
    });
  }
});
app.get("/movimentos/:num", async (req, res) => {
  const userId = req.session.userId;
  const num = req.params.num;
  const limit = Number(num)
  if (!userId) {
    return res.status(401).json({
      message: "Precisas de iniciar sessão",
    });
  }
  
  try {
    const [listaDespesas, listaReceitas] = await Promise.all([
      expense.find({ userId }).populate("categoria", "nome cor").lean(),
      receitas.find({ userId }).lean(),
    ]);
    const movimentos = [
      ...listaDespesas.map((despesa) => ({
        ...despesa,
        tipo: "despesa" as const,
      })),
      ...listaReceitas.map((receita) => ({
        ...receita,
        tipo: "receita" as const,
        categoria: { nome: receita.categoria, cor: "#15803d" },
      })),
    ].sort(
      (a, b) =>
        new Date(b.data ?? 0).getTime() - new Date(a.data ?? 0).getTime(),
    );
    return res.status(200).json({
      movimentos: limit > 0 ? movimentos.slice(0, limit) : movimentos,
    });
  } catch (err) {
    console.log(err);
    return res.status(500).json({
      message: "Erro ao procurar movimentos",
    });
  }
});
app.delete("/despesas/:id", async (req, res) => {
  const userId = req.session.userId;
  const despesaId = req.params.id;
  if (!userId) {
    return res.status(401).json({
      message: "Precisas ter uma conta logada!",
    });
  }
  if (!despesaId) {
    return res.status(401).json({
      message: "Precisas ter uma despesa",
    });
  }
  if (!isValidObjectId(despesaId)) {
    return res.status(400).json({
      message: "ID da despesa inválido",
    });
  }
  const despesaEliminada = await expense.findOneAndDelete({
    _id: despesaId,
    userId,
  });
  if (!despesaEliminada) {
    return res.status(404).json({
      message: "Despesa não encontrada",
    });
  }
  return res.status(200).json({
    message: "Despesa Elimanda!",
  });
});
app.post("/receita", async (req, res) => {
  const userId = req.session.userId;
  if (!userId) {
    return res.status(401).json({
      message: "Precisas ter uma conta logada!",
    });
  }
  const { descricao, valor, data, categoria } = req.body;
  if (!descricao || !valor || !data || !categoria) {
    return res.status(400).json({
      message: "Preenche todos os campos",
    });
  }

  const dataDoMovimento = converterDataDoUtilizador(data);

  if (!dataDoMovimento) {
    return res.status(400).json({
      message: "Data inválida. Usa o formato AAAA-MM-DD",
    });
  }

  const verificar_dado = isValidObjectId(userId);
  if (!verificar_dado) {
    return res.status(401).json({
      message: "Credencias invalidas",
    });
  }
  const IdExistente = await User.findById(userId);
  if (!IdExistente) {
    return res.status(404).json({
      message: "Usuario Não encontrado",
    });
  }
  if (typeof categoria !== "string" || !isValidObjectId(categoria)) {
    return res.status(400).json({
      message: "Categoria inválida",
    });
  }
  const categoriaExistente = await categorias.findOne({
    _id: categoria,
    userId,
  });

  if (!categoriaExistente) {
    return res.status(400).json({
      message: "Categoria não encontrada",
    });
  }
  try {
    const novareceita = await receitas.create({
      descricao,
      valor,
      data: dataDoMovimento,
      categoria,
      userId: userId,
    });
    return res.status(201).json({
      message: "Despesa Adicionada",
      despesa: novareceita,
    });
  } catch (err) {
    console.log(err);
    return res.status(500).json({
      message: "Erro ao guardar despesa!",
    });
  }
});
app.delete("/receita/:id", async (req, res) => {
  const userId = req.session.userId;
  const receitaId = req.params.id;
  if (!userId) {
    return res.status(401).json({
      message: "Precisas ter uma conta logada!",
    });
  }
  if (!receitaId) {
    return res.status(401).json({
      message: "Precisas ter uma despesa",
    });
  }
  if (!isValidObjectId(receitaId)) {
    return res.status(400).json({
      message: "ID da despesa inválido",
    });
  }
  const receitaEliminada = await receitas.findOneAndDelete({
    _id: receitaId,
    userId,
  });
  if (!receitaEliminada) {
    return res.status(404).json({
      message: "Despesa não encontrada",
    });
  }
  return res.status(200).json({
    message: "Despesa Elimanda!",
  });
});
app.post("/login", async (req, res) => {
  const { pesquisa, senha } = req.body;

  if (!pesquisa || !senha) {
    return res.status(400).json({
      message: "Preenche todos os campos",
    });
  }

  const termo = String(pesquisa);
  const utilizador = await User.findOne({
    $or: [{ nome: termo }, { email: termo.trim().toLowerCase() }],
  });

  if (!utilizador || !utilizador.passwordHash) {
    return res.status(401).json({
      message: "Credenciais inválidas",
    });
  }

  const senhaCorreta = await argon2.verify(
    utilizador.passwordHash,
    String(senha),
  );

  if (!senhaCorreta) {
    return res.status(401).json({
      message: "Credenciais inválidas",
    });
  }

  req.session.regenerate((err) => {
    if (err) {
      return res.status(500).json({
        message: "Erro ao iniciar sessão",
      });
    }

    req.session.userId = utilizador._id.toString();

    req.session.save((err) => {
      if (err) {
        return res.status(500).json({
          message: "Erro ao guardar sessão",
        });
      }

      return res.status(200).json({
        message: "Login efetuado",
        utilizador: {
          id: utilizador._id,
          nome: utilizador.nome,
          email: utilizador.email,
        },
      });
    });
  });
});
app.post("/categoria", async (req, res) => {
  const { nome, cor } = req.body;
  const userId = req.session.userId;
  if (!nome || !cor) {
    return res.status(400).json({
      message: "Dados Invalidos!",
    });
  }
  if (!userId) {
    return res.status(401).json({
      message: "Precisa ter Login feito!",
    });
  }
  const NovaCategoria = await categorias.create({
    nome,
    cor,
    userId: userId,
  });
  if (!NovaCategoria) {
    return res.status(500).json({
      message: "Falha em guardar categoria na base de dados",
    });
  }
  return res.status(201).json({
    message: "Categoria Criada!",
  });
});
app.delete("/categoria/:id", async (req, res) => {
  const userId = req.session.userId;
  const id = req.params.id;
  if (!userId) {
    return res.status(401).json({
      message: "Precisa ter login",
    });
  }
  if (!id) {
    return res.status(400).json({
      message: "Dado invalido",
    });
  }
  const removercategoria = await categorias.findByIdAndDelete({
    id,
    userId: userId,
  });
  if (!removercategoria) {
    return res.status(404).json({
      message: "erro!",
    });
  }
  return res.status(200).json({
    message: "Categoria Removida",
  });
});
app.post("/registrar", async (req, res) => {
  const { nome, email, senha } = req.body;
  if (!nome || !email || !senha) {
    return res.status(400).json({
      message: "Preenche todos os campos",
    });
  }
  const email_normal = email.trim().toLowerCase();
  const emailExistente = await User.findOne({
    email: email_normal,
  });
  const nomeExistente = await User.findOne({
    nome: nome,
  });
  if (emailExistente) {
    return res.status(409).json({
      message: "Este email já está registado",
    });
  }
  if (nomeExistente) {
    return res.status(409).json({
      message: "Este nome já está registado",
    });
  }
  const passwordHash = await argon2.hash(senha, {
    type: argon2.argon2id,
  });

  let utilizador;
  try {
    utilizador = await User.create({
      nome: nome.trim(),
      email: email_normal,
      passwordHash,
    });
    console.log("Usuario Criado");
  } catch (err) {
    console.log(err);
    return res.status(500).json({
      message: "Erro na base de dados!",
    });
  }

  return res.status(201).json({
    message: "Utilizador criado",
    utilizador: {
      id: utilizador._id,
      nome: utilizador.nome,
      email: utilizador.email,
    },
  });
});

app.get("/auth", async (req, res) => {
  const userId = req.session.userId;

  if (!userId) {
    return res.status(401).json({
      message: "Precisas de iniciar sessão",
    });
  }

  const utilizador = await User.findById(userId);

  if (!utilizador) {
    return res.status(401).json({
      message: "Utilizador não encontrado",
    });
  }

  return res.status(200).json({
    utilizador: {
      id: utilizador._id,
      nome: utilizador.nome,
      email: utilizador.email,
    },
  });
});

app.post("/logout", (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      return res.status(500).json({
        message: "Erro ao terminar sessão",
      });
    }

    res.clearCookie("gestor.sid", { path: "/" });
    return res.sendStatus(204);
  });
});

app.get("/categorias", async (req, res) => {
  const UserId = req.session.userId;
  if (!UserId) {
    return res.status(400).json({
      message: "Precisa de ter uma conta logada!",
    });
  }
  try {
    const utilizador = await categorias.find({
      userId: UserId,
    });
    return res.status(201).json({
      utilizador,
    });
  } catch (err) {
    console.log(err);
    return res.status(404).json({
      message: "erro na base de dados!",
    });
  }
});
app.get("/categorias/:id", async (req, res) => {
  const UserId = req.session.userId;
  const id = req.params.id;
  if (!UserId) {
    return res.status(401).json({
      message: "Precisas estar logado",
    });
  }
  if (!id || !isValidObjectId(id)) {
    return res.status(400).json({
      message: "Precisas de indicar a categoria",
    });
  }
  try {
    const categoria = await categorias.findOne({
      _id: id,
      userId: UserId,
    });
    return res.status(200).json({
      categoria,
    });
  } catch (err) {
    console.log(err);
    return res.status(404).json({
      message: "erro na base de dados!",
    });
  }
});
app.patch("/categorias/:id", async (req, res) => {
  const UserId = req.session.userId;
  const id = req.params.id;
  const { nome, cor } = req.body;
  if (!UserId) {
    return res.status(400).json({
      message: "Precisa de ter uma conta logada!",
    });
  }
  if (!id || !isValidObjectId(id) || !nome || !cor) {
    return res.status(400).json({
      message: "erro nos dados!",
    });
  }
  try {
    const categoria = await categorias.findByIdAndUpdate(
      {
        _id: id,
        userId: UserId,
      },
      {
        nome,
        cor,
      },
    );
    return res.status(200).json({
      message: "Categoria atualizada!",
      categoria,
    });
  } catch (err) {
    console.log(err);
    return res.status(404).json({
      message: "erro ao encontrar a categoria!",
    });
  }
});
app.get("/movimentos/:id", async (req, res) => {
  const userId = req.session.userId;
  const movimentoId = req.params.id;

  if (!userId) {
    return res.status(401).json({
      message: "Precisas de iniciar sessão",
    });
  }

  if (!isValidObjectId(movimentoId)) {
    return res.status(400).json({
      message: "ID do movimento inválido",
    });
  }

  try {
    const [despesa, receita] = await Promise.all([
      expense
        .findOne({
          _id: movimentoId,
          userId,
        })
        .lean(),

      receitas
        .findOne({
          _id: movimentoId,
          userId,
        })
        .lean(),
    ]);

    if (despesa) {
      return res.status(200).json({
        movimento: {
          ...despesa,
          tipo: "despesa",
        },
      });
    }

    if (receita) {
      return res.status(200).json({
        movimento: {
          ...receita,
          tipo: "receita",
        },
      });
    }

    return res.status(404).json({
      message: "Movimento não encontrado",
    });
  } catch (erro) {
    console.error(erro);

    return res.status(500).json({
      message: "Erro ao procurar movimento",
    });
  }
});
app.get("/resumo/categorias", async (req, res) => {
  const userId = req.session.userId;
  const anoSelecionado = req.query.ano;
  const mesSelecionado = req.query.mes;

  if (!userId) {
    return res.status(401).json({
      message: "Precisas de iniciar sessão",
    });
  }

  if (anoSelecionado && mesSelecionado) {
    return res.status(400).json({
      message: "Indica apenas mes ou ano",
    });
  }

  let inicio: Date;
  let fim: Date;
  let periodo: { ano?: string; mes?: string };

  if (typeof mesSelecionado === "string") {
    if (!/^\d{4}-\d{2}$/.test(mesSelecionado)) {
      return res.status(400).json({
        message: "Mes invalido. Usa o formato AAAA-MM",
      });
    }

    const [ano, mes] = mesSelecionado.split("-").map(Number);
    if (mes < 1 || mes > 12) {
      return res.status(400).json({
        message: "Mes invalido",
      });
    }

    inicio = new Date(Date.UTC(ano, mes - 1, 1));
    fim = new Date(Date.UTC(ano, mes, 1));
    periodo = { mes: mesSelecionado };
  } else if (typeof anoSelecionado === "string") {
    if (!/^\d{4}$/.test(anoSelecionado)) {
      return res.status(400).json({
        message: "Ano invalido. Usa o formato AAAA",
      });
    }

    const ano = Number(anoSelecionado);
    inicio = new Date(Date.UTC(ano, 0, 1));
    fim = new Date(Date.UTC(ano + 1, 0, 1));
    periodo = { ano: anoSelecionado };
  } else {
    return res.status(400).json({
      message: "Indica mes ou ano",
    });
  }

  try {
    const despesas = await expense
      .find({
        userId,
        data: {
          $gte: inicio,
          $lt: fim,
        },
      })
      .populate({
        path: "categoria",
        select: "nome cor",
        match: { userId },
      })
      .lean();

    const categoriasAgrupadas: Record<
      string,
      { id: string; nome: string; cor: string; total: number }
    > = {};

    for (const despesa of despesas) {
      const categoria = despesa.categoria as unknown as {
        _id: unknown;
        nome: string;
        cor: string;
      } | null;

      if (!categoria) continue;

      const categoriaId = String(categoria._id);
      categoriasAgrupadas[categoriaId] ??= {
        id: categoriaId,
        nome: categoria.nome,
        cor: categoria.cor,
        total: 0,
      };
      categoriasAgrupadas[categoriaId].total += despesa.valor;
    }

    const categoriasDoPeriodo = Object.values(categoriasAgrupadas);
    const totalDespesas = categoriasDoPeriodo.reduce(
      (total, categoria) => total + categoria.total,
      0,
    );

    return res.status(200).json({
      ...periodo,
      totalDespesas,
      categorias: categoriasDoPeriodo.map((categoria) => ({
        ...categoria,
        percentagem:
          totalDespesas === 0
            ? 0
            : Number(((categoria.total / totalDespesas) * 100).toFixed(2)),
      })),
    });
  } catch (erro) {
    console.error(erro);
    return res.status(500).json({
      message: "Erro ao calcular resumo por categoria",
    });
  }
});
app.get("/resumo/categorias-antigo", async (req, res) => {
  const userId = req.session.userId;
  const anoSelecionado = req.query.ano;
  if (!userId) {
    return res.status(401).json({
      message: "Precisas de iniciar sessão",
    });
  }
  if (
    !anoSelecionado ||
    typeof anoSelecionado !== "string" ||
    !/^\d{4}$/.test(anoSelecionado)
  ) {
    return res.status(400).json({
      message: "Ano selecionado inválido",
    });
  }
  const ano = Number(anoSelecionado);
  const inicioDoAno = new Date(Date.UTC(ano, 0, 1));
  const inicioDoAnoSeguinte = new Date(Date.UTC(ano + 1, 0, 1));
  try {
    const despesas = await expense
      .find({
        userId,
        data: {
          $gte: inicioDoAno,
          $lt: inicioDoAnoSeguinte,
        },
      })
      .populate({
        path: "categoria",
        select: "nome cor",
        match: { userId },
      })
      .lean();
    const categoriasAgrupadas: Record<
      string,
      {
        id: string;
        nome: string;
        cor: string;
        total: number;
      }
    > = {};
    for (const despesa of despesas) {
      const categoria = despesa.categoria as unknown as {
        _id: unknown;
        nome: string;
        cor: string;
      } | null;

      if (!categoria) {
        continue;
      }

      const categoriaId = String(categoria._id);

      if (!categoriasAgrupadas[categoriaId]) {
        categoriasAgrupadas[categoriaId] = {
          id: categoriaId,
          nome: categoria.nome,
          cor: categoria.cor,
          total: 0,
        };
      }

      categoriasAgrupadas[categoriaId].total += despesa.valor;
    }
    const resumoCategorias = Object.values(categoriasAgrupadas);
    return res.status(200).json({
      ano: anoSelecionado,
      categorias: resumoCategorias,
    });
  } catch (erro) {
    console.error(erro);
    return res.status(500).json({
      message: "Erro ao calcular evolução",
    });
  }
});
app.get("/resumo/evolucao", async (req, res) => {
  const userId = req.session.userId;
  const anoSelecionado = req.query.ano;
  if (!userId) {
    return res.status(401).json({
      message: "Precisas de iniciar sessão",
    });
  }
  if (
    !anoSelecionado ||
    typeof anoSelecionado !== "string" ||
    !/^\d{4}$/.test(anoSelecionado)
  ) {
    return res.status(400).json({
      message: "Ano selecionado inválido",
    });
  }
  const ano = Number(anoSelecionado);
  const inicioDoAno = new Date(Date.UTC(ano, 0, 1));
  const inicioDoAnoSeguinte = new Date(Date.UTC(ano + 1, 0, 1));
  try {
    const [listaDespesas, listaReceitas] = await Promise.all([
      expense
        .find({
          userId,
          data: {
            $gte: inicioDoAno,
            $lt: inicioDoAnoSeguinte,
          },
        })
        .lean(),
      receitas
        .find({
          userId,
          data: {
            $gte: inicioDoAno,
            $lt: inicioDoAnoSeguinte,
          },
        })
        .lean(),
    ]);
    const despesasPorMes = Array(12).fill(0);
    const receitasPorMes = Array(12).fill(0);
    for (const despesa of listaDespesas) {
      const mes = despesa.data.getUTCMonth();
      despesasPorMes[mes] += despesa.valor;
    }
    for (const receita of listaReceitas) {
      const mes = receita.data.getUTCMonth();
      receitasPorMes[mes] += receita.valor;
    }
    const saldoPorMes: number[] = [];
    for (let i = 0; i < 12; i++) {
      saldoPorMes[i] = receitasPorMes[i] - despesasPorMes[i];
    }
    return res.status(200).json({
      despesasPorMes,
      receitasPorMes,
      saldoPorMes,
    });
  } catch (erro) {
    console.error(erro);
    return res.status(500).json({
      message: "Erro ao calcular evolução",
    });
  }
});
app.patch("/despesas/:id", async (req, res) => {
  const userId = req.session.userId;
  const despesaid = req.params.id;
  const { descricao, valor, data, categoria } = req.body;
  if (!userId) {
    return res.status(401).json({
      message: "Precisas de iniciar sessão",
    });
  }

  if (!isValidObjectId(despesaid)) {
    return res.status(400).json({
      message: "ID do movimento inválido",
    });
  }
  if (!descricao || !valor || !data || !categoria) {
    return res.status(400).json({
      message: "falta de valores",
    });
  }
  try {
    const DespesaAtualizada = await expense.findOneAndUpdate(
      {
        userId: userId,
        _id: despesaid,
      },
      {
        descricao,
        valor,
        data,
        categoria,
      },
    );
    return res.status(201).json({
      message: "despesa atualizada",
      DespesaAtualizada,
    });
  } catch (err) {
    console.log(err);
    return res.status(500).json({
      message: "Erro ao procurar movimento",
    });
  }
});
app.patch("/receitas/:id", async (req, res) => {
  const userId = req.session.userId;
  const receitasid = req.params.id;
  const { descricao, valor, data, categoria } = req.body;
  if (!userId) {
    return res.status(401).json({
      message: "Precisas de iniciar sessão",
    });
  }

  if (!isValidObjectId(receitasid)) {
    return res.status(400).json({
      message: "ID do movimento inválido",
    });
  }
  if (!descricao || !valor || !data || !categoria) {
    return res.status(400).json({
      message: "falta de valores",
    });
  }
  try {
    const ReceitaAtualizada = await receitas.findOneAndUpdate(
      {
        userId: userId,
        _id: receitasid,
      },
      {
        descricao,
        valor,
        data,
        categoria,
      },
    );
    return res.status(201).json({
      message: "receita atualizada",
      ReceitaAtualizada,
    });
  } catch (err) {
    console.log(err);
    return res.status(500).json({
      message: "Erro ao procurar movimento",
    });
  }
});
app.get("/resumo", async (req, res) => {
  const userId = req.session.userId;
  const mesSelecionado = req.query.mes;
  const anoSelecionado = req.query.ano;
  if (!userId) {
    return res.status(401).json({
      message: "Precisas de iniciar sessão",
    });
  }
  if (mesSelecionado && anoSelecionado) {
    return res.status(400).json({
      message: "Indica apenas mes ou ano",
    });
  }
  if (typeof mesSelecionado === "string") {
    if (!/^\d{4}-\d{2}$/.test(mesSelecionado)) {
      return res.status(400).json({
        message: "Usa o formato AAAA-MM",
      });
    }
    if (!/^\d{4}-\d{2}$/.test(mesSelecionado)) {
      return res.status(400).json({
        message: "Usa o formato AAAA-MM",
      });
    }
    const [ano, mes] = mesSelecionado.split("-").map(Number);

    if (mes < 1 || mes > 12) {
      return res.status(400).json({
        message: "Mês inválido",
      });
    }

    const inicioDoMes = new Date(Date.UTC(ano, mes - 1, 1));
    const inicioDoMesSeguinte = new Date(Date.UTC(ano, mes, 1));

    try {
      const [listaDespesas, listaReceitas] = await Promise.all([
        expense
          .find({
            userId,
            data: {
              $gte: inicioDoMes,
              $lt: inicioDoMesSeguinte,
            },
          })
          .lean(),

        receitas
          .find({
            userId,
            data: {
              $gte: inicioDoMes,
              $lt: inicioDoMesSeguinte,
            },
          })
          .lean(),
      ]);

      const totalDespesas = listaDespesas.reduce(
        (total, despesa) => total + despesa.valor,
        0,
      );

      const totalReceitas = listaReceitas.reduce(
        (total, receita) => total + receita.valor,
        0,
      );

      const saldo = totalReceitas - totalDespesas;

      return res.status(200).json({
        mes: mesSelecionado,
        totalDespesas,
        totalReceitas,
        saldo,
      });
    } catch (erro) {
      console.error(erro);

      return res.status(500).json({
        message: "Erro ao calcular resumo",
      });
    }
  } else if (typeof anoSelecionado === "string") {
    if (!/^\d{4}$/.test(anoSelecionado)) {
      return res.status(400).json({
        message: "Usa o formato AAAA",
      });
    }
    const ano = Number(anoSelecionado);
    const inicioDoAno = new Date(Date.UTC(ano, 0, 1));
    const inicioDoAnoSeguinte = new Date(Date.UTC(ano + 1, 0, 1));
    try {
      const [listaDespesas, listaReceitas] = await Promise.all([
        expense
          .find({
            userId,
            data: {
              $gte: inicioDoAno,
              $lt: inicioDoAnoSeguinte,
            },
          })
          .lean(),

        receitas
          .find({
            userId,
            data: {
              $gte: inicioDoAno,
              $lt: inicioDoAnoSeguinte,
            },
          })
          .lean(),
      ]);
      const totalDespesas = listaDespesas.reduce(
        (total, despesa) => total + despesa.valor,
        0,
      );

      const totalReceitas = listaReceitas.reduce(
        (total, receita) => total + receita.valor,
        0,
      );

      const saldo = totalReceitas - totalDespesas;
      return res.status(200).json({
        ano: anoSelecionado,
        totalDespesas,
        totalReceitas,
        saldo,
      });
    } catch (erro) {
      console.error(erro);

      return res.status(500).json({
        message: "Erro ao calcular resumo",
      });
    }
  } else {
    return res.status(400).json({
      message: "Indica mes ou ano",
    });
  }
});
app.get("/dashboard", async (req, res) => {
  const userId = req.session.userId;
  const mesSelecionado = req.query.mes;
  if(!userId) {
    return res.status(401).json({
      message: "Precisas de iniciar sessão",
    });
  }
  if(!mesSelecionado || typeof mesSelecionado !== "string" || !/^\d{4}-\d{2}$/.test(mesSelecionado)) {
    return res.status(400).json({
      message: "Mes selecionado inválido. Usa o formato AAAA-MM",
    });
  }
  const mesSelecionadoArray = mesSelecionado.split("-").map(Number);
  const [ano, mes] = mesSelecionadoArray;
  if(mes < 1 || mes > 12) {
    return res.status(400).json({
      message: "Mês inválido",
    });
  }
  if(ano < 1900 || ano > new Date().getFullYear()) {
    return res.status(400).json({
      message: "Ano inválido",
    });
  }
  
  try{
    const Utilizador = await User.findById(userId);
    
    const inicioDoMes = new Date(Date.UTC(mesSelecionadoArray[0], mesSelecionadoArray[1] - 1, 1));
    const inicioDoMesSeguinte = new Date(Date.UTC(mesSelecionadoArray[0], mesSelecionadoArray[1], 1));
    const inicioDoMesÁ2MesesAtrás = new Date(Date.UTC(mesSelecionadoArray[0], mesSelecionadoArray[1] - 2, 1));
    const fimDoMesanterior = new Date(Date.UTC(mesSelecionadoArray[0], mesSelecionadoArray[1] - 1, 1));
    const despesasestemes = await expense.find({  
      userId,
      data: {
        $gte: inicioDoMes,
        $lt: inicioDoMesSeguinte,
      },
    }).lean();
    const receitaestemes = await receitas.find({ 
      userId,
      data: {
        $gte: inicioDoMes,
        $lt: inicioDoMesSeguinte,
      }, }).lean();
    const despesasmesanterior = await expense.find({
      userId,
      data: {
        $gte: inicioDoMesÁ2MesesAtrás,
        $lt: fimDoMesanterior,
      },
    }).lean();
    const receitamesanterior = await receitas.find({
      userId,
      data: {
        $gte: inicioDoMesÁ2MesesAtrás,
        $lt: fimDoMesanterior,
      },
    }).lean();
    const totalDespesas = despesasestemes.reduce((total, despesa) => total + despesa.valor, 0);
    const totalReceitas = receitaestemes.reduce((total, receita) => total + receita.valor, 0);
    const saldo = totalReceitas - totalDespesas;
    const totalDespesasMesAnterior = despesasmesanterior.reduce((total, despesa) => total + despesa.valor, 0);
    const totalReceitasMesAnterior = receitamesanterior.reduce((total, receita) => total + receita.valor, 0);
    const saldoMesAnterior = totalReceitasMesAnterior - totalDespesasMesAnterior;
    const comparacaoDespesas = ((totalDespesas - totalDespesasMesAnterior) / (totalDespesasMesAnterior || 1)) * 100;
    const comparacaoReceitas = ((totalReceitas - totalReceitasMesAnterior) / (totalReceitasMesAnterior || 1)) * 100;
    const comparacaoSaldo = ((saldo - saldoMesAnterior) / (saldoMesAnterior || 1)) * 100;
    return res.status(200).json({
      Utilizador : { nome: Utilizador?.nome },
      resumo : {
        totalDespesas,
        totalReceitas,
        saldo
      },
      comparacao : {
        comparacaoDespesas,
        comparacaoReceitas,
        comparacaoSaldo
      },
    });
  }catch(err){
    console.log(err);
    return res.status(500).json({
      message: "Erro ao obter dados do dashboard",
    });
  }
})
// Database
await ligarBaseDados();

// Listen
app.listen(PORT, () => {
  console.log(`Server a rodar em http://localhost:${PORT}`);
});
