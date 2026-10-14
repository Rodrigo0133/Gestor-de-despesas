import type { NextFunction, Request, Response } from "express";
import z from "zod";
const category = z.object({
  nome: z.string,
  cor:  z.string
})

export async function ValidateCategory(req:Request,res:Response,next: NextFunction) {
  const userId = req.session.userId;
  if (!userId) {
    return res.status(401).json({ message: "Precisas de iniciar sessão" });
  }
  const respost = category.safeParse(req.body);
  if (!respost.success) {
    return res.status(404).json({
      message: "Valores inseridos errados",
    });
  }
  next();
}
