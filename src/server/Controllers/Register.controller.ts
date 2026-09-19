import type {Request,Response} from "express"
import { User } from "../database/db.js"
import argon2 from "argon2"
export async function RegisterController(req: Request, res: Response){
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
}