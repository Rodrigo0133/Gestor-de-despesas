import express from "express";
import { ligarBaseDados, User } from "./database/db.js";
import argon2 from "argon2";
import cors from "cors";
import { isValidObjectId } from "mongoose";
const PORT = 3000;
const app = express();
app.use(
  cors({
    origin: "http://localhost:5174",
  }),
);

app.use(express.json());

// Routes
app.post("/novadespesa", async (req, res) => {
  console.log(req.body);
  res.status(200).send({ message: "Despesa recebida" });
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

  const senhaCorreta = await argon2.verify(utilizador.passwordHash, String(senha));

  if (!senhaCorreta) {
    return res.status(401).json({
      message: "Credenciais inválidas",
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



app.get("/auth/:id", async (req,res)=>{
  const { id } = req.params;
  const verificar_dado = isValidObjectId(id);
  if(!id || !verificar_dado){
    return res.status(401).json({
      message: "Credencias invalidas"
    })
  }
  
  const IdExistente = await User.findById(id)
  if(IdExistente){
    return res.status(200).json({
      message: "Usuario encontrado!",
      utilizador: {
        nome: IdExistente.nome,
      },
    });
  }else{
    return res.status(404).json({
      message: "Usuario Não encontrado"
    })
  }
})


// Database
await ligarBaseDados();

// Listen
app.listen(PORT, () => {
  console.log(`Server a rodar em http://localhost:${PORT}`);
});
