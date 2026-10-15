
import type { Request, Response, NextFunction } from "express";
import { expense } from "../database/db.js";
import z from "zod";

const category = z.object({
  despesaId: z.string().min(1),
  userId: z.string().min(1),
});
const category2 = z.object({
  receitaId: z.string().min(1),
  userId: z.string().min(1),
})
export async function AuthExpense(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  const userId = req.session.userId;
  const despesaId = req.params.id;

  if (!userId) {
    return res.status(401).json({
      message: "Precisas de iniciar sessão",
    });
  }

  if (!despesaId) {
    return res.status(400).json({
      message: "Precisas de fornecer um ID de movimento",
    });
  }

  try {
    const resposta = category.safeParse({
      despesaId,
      userId,
    });

    if (!resposta.success) {
      return res.status(400).json({
        message: "Dados inválidos",
      });
    }

    const verificar = await expense.findOne({
      _id: resposta.data.despesaId,
      userId: resposta.data.userId,
    });

    if (!verificar) {
      return res.status(404).json({
        message: "Movimento não encontrado",
      });
    }

    return next();
  } catch (err) {
    console.error("Erro ao procurar o movimento:", err);

    return res.status(500).json({
      message: "Erro ao procurar o movimento",
    });
  }
}
export async function AuthRevenue(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  const userId = req.session.userId;
  const receitaId = req.params.id;

  if (!userId) {
    return res.status(401).json({
      message: "Precisas de iniciar sessão",
    });
  }

  if (!receitaId) {
    return res.status(400).json({
      message: "Precisas de fornecer um ID de movimento",
    });
  }

  try {
    const resposta = category2.safeParse({
      receitaId,
      userId,
    });

    if (!resposta.success) {
      return res.status(400).json({
        message: "Dados inválidos",
      });
    }

    const verificar = await expense.findOne({
      _id: resposta.data.receitaId,
      userId: resposta.data.userId,
    });

    if (!verificar) {
      return res.status(404).json({
        message: "Movimento não encontrado",
      });
    }

    return next();
  } catch (err) {
    console.error("Erro ao procurar o movimento:", err);

    return res.status(500).json({
      message: "Erro ao procurar o movimento",
    });
  }
}
