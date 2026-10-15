import { z } from "zod";
import type { Request, Response, NextFunction } from "express";
const expense = z.object({
  titulo: z.string(),
  descricao: z.string(),
  valor: z.float32(),
  data: z.iso.date(),
  categoria: z.string(),
});
export async function ValidateMovimentsMiddleware(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  const userId = req.session.userId;
  if (!userId) {
    return res.status(401).json({ message: "Precisas de iniciar sessão" });
  }
  const respost = expense.safeParse(req.body);
  if (!respost.success) {
    return res.status(400).json({
      message: "Valores inseridos errados",
    });
  }
  next();
}
