import express from "express";
import { ligarBaseDados, User, expense, categorias , receitas } from "./database/db.js";
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

function converterDataDoUtilizador(valor: unknown): Date | null {
  if (typeof valor !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(valor)) {
    return null;
  }

  const data = new Date(`${valor}T00:00:00.000Z`);

  if (Number.isNaN(data.getTime()) || data.toISOString().slice(0, 10) !== valor) {
    return null;
  }

  return data;
}

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
app.get("/movimentos", async (req, res) => {
  const userId = req.session.userId;

  if (!userId) {
    return res.status(401).json({
      message: "Precisas de iniciar sessão",
    });
  }

  try {
    const [listaDespesas, listaReceitas] = await Promise.all([
      expense.find({ userId }).lean(),
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
      })),
    ].sort(
      (a, b) =>
        new Date(b.data ?? 0).getTime() - new Date(a.data ?? 0).getTime(),
    );

    return res.status(200).json({ movimentos });
  } catch (err) {
    console.log(err);
    return res.status(500).json({
      message: "Erro ao procurar movimentos",
    });
  }
});
app.delete("/despesas/:id", async (req,res) => {
  const userId = req.session.userId
  const despesaId = req.params.id;
  if(!userId){
    return res.status(401).json({
      message: "Precisas ter uma conta logada!"
    })
  }
  if(!despesaId){
    return res.status(401).json({
      message: "Precisas ter uma despesa"
    })
  }
  if (!isValidObjectId(despesaId)) {
    return res.status(400).json({
      message: "ID da despesa inválido",
    });
  }
  const despesaEliminada = await expense.findOneAndDelete({
    _id: despesaId,
    userId
  })
  if(!despesaEliminada){
    return res.status(404).json({
      message: "Despesa não encontrada"
    })
  }
  return res.status(200).json({
    message: "Despesa Elimanda!"    
  })
})
app.post("/receita", async (req,res) => {
  const userId = req.session.userId
  if(!userId){
    return res.status(401).json({
      message: "Precisas ter uma conta logada!"
    })
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
    userId
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
      userId: userId
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
})
app.delete("/receita/:id", async (req,res) => {
  const userId = req.session.userId
  const receitaId = req.params.id;
  if(!userId){
    return res.status(401).json({
      message: "Precisas ter uma conta logada!"
    })
  }
  if(!receitaId){
    return res.status(401).json({
      message: "Precisas ter uma despesa"
    })
  }
  if (!isValidObjectId(receitaId)) {
    return res.status(400).json({
      message: "ID da despesa inválido",
    });
  }
  const receitaEliminada = await receitas.findOneAndDelete({
    _id: receitaId,
    userId
  })
  if(!receitaEliminada){
    return res.status(404).json({
      message: "Despesa não encontrada"
    })
  }
  return res.status(200).json({
    message: "Despesa Elimanda!"    
  })
})
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
app.post("/categoria",async (req,res) => {
  const { nome, cor } = req.body;
  const userId = req.session.userId
  if(!nome || !cor){
    return res.status(400).json({
      message: "Dados Invalidos!"
    })
  }
  if(!userId){
    return res.status(401).json({
      message: "Precisa ter Login feito!"
    })
  }
  const NovaCategoria = await categorias.create({
    nome,
    cor,
    userId: userId,
  })
  if(!NovaCategoria){
    return res.status(500).json({
      message: "Falha em guardar categoria na base de dados"
    })
  }
  return res.status(201).json({
    message: "Categoria Criada!"
  })
})
app.delete("/categoria/:id", async (req,res) => {
  const userId = req.session.userId
  const id = req.params.id
  if(!userId){
    return res.status(401).json({
      message: "Precisa ter login"
    })
  }
  if(!id){
    return res.status(400).json({
      message: "Dado invalido"
    })
  }
  const removercategoria = await categorias.findByIdAndDelete({
    id,
    userId: userId
  })
  if(!removercategoria){
    return res.status(404).json({
      message: "erro!"
    })
  }
  return res.status(200).json({
    message: "Categoria Removida"
  })
})
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

// Database
await ligarBaseDados();

// Listen
app.listen(PORT, () => {
  console.log(`Server a rodar em http://localhost:${PORT}`);
});
