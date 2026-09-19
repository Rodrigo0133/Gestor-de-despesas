import type { Request,Response } from "express"
import { User } from "../database/db.js"
import argon2 from 'argon2';
export async function LoginController(req: Request, res: Response) {
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

  req.session.regenerate((err: unknown) => {
    if (err) {
      return res.status(500).json({
        message: "Erro ao iniciar sessão",
      });
    }

    req.session.userId = utilizador._id.toString();

    req.session.save((err: unknown) => {
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
}
export async function LogoutController(req: Request, res: Response) {
  req.session.destroy((err: unknown) => {
    if (err) {
      return res.status(500).json({
        message: "Erro ao terminar sessão",
      });
    }

    res.clearCookie("gestor.sid", { path: "/" });
    return res.sendStatus(204);
  });
}
