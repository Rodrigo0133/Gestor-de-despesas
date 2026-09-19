import type { Request, Response } from "express";
import { expense, receitas } from "../database/db.js";
import { isValidObjectId } from "mongoose";
export async function MovementsController(req:Request,res:Response){
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
}
export async function MovementsidController(req:Request,res:Response){
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
}