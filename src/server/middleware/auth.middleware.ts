import type { NextFunction, Request, Response } from "express";
import { User } from "../database/db.js";

export async function exigirAutenticacao(req: Request, res: Response, next: NextFunction) {
  // A sessão continua a ser criada pelo login e lida através do cookie existente.
  const userId = req.session.userId;
  if (!userId) {
    return res.status(401).json({ message: "Precisas de iniciar sessão" });
  }

  // Confirma também a existência da conta, como fazia a antiga consulta de autenticação.
  const utilizador = await User.findById(userId);
  if (!utilizador) {
    return res.status(401).json({ message: "Utilizador não encontrado" });
  }

  // Deixa o controller responder com os dados da rota; não termina o pedido com um 200.
  next();
}
