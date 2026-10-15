import type { Request, Response } from "express";
import { expense, receitas, categorias } from "../database/db.js";
import { isValidObjectId } from "mongoose";

export async function MovementsController(req: Request, res: Response) {
  const userId = req.session.userId;
  const mes = req.query.mes;
  const limite = Number(req.params.num ?? 0);
  if (!userId) {
    return res.status(401).json({ message: "Precisas de iniciar sessão" });
  }
  if (mes !== undefined && (typeof mes !== "string" || !/^\d{4}-(0[1-9]|1[0-2])$/.test(mes))) {
    return res.status(400).json({ message: "Mês inválido. Usa o formato AAAA-MM" });
  }
  if (!Number.isInteger(limite) || limite < 0) {
    return res.status(400).json({ message: "Limite de movimentos inválido" });
  }
  try {
    const [listaDespesas, listaReceitas, listaCategorias] = await Promise.all([
      expense.find({ userId }).lean(),
      receitas.find({ userId }).lean(),
      categorias.find({ userId }).lean(),
    ]);
    const categoriasPorId = new Map(listaCategorias.map((categoria) => [String(categoria._id), {
      nome: categoria.nome,
      cor: categoria.cor,
    }]));
    const movimentos = [
      ...listaDespesas.map((despesa) => ({ ...despesa, tipo: "despesa" as const })),
      ...listaReceitas.map((receita) => ({ ...receita, tipo: "receita" as const })),
    ].map((movimento) => ({
      ...movimento,
      categoria: categoriasPorId.get(String(movimento.categoria)) ?? { nome: "Sem categoria", cor: "#64748b" },
    })).sort((a, b) => new Date(b.data ?? 0).getTime() - new Date(a.data ?? 0).getTime());
    const meses = [...new Set([
      new Date().toISOString().slice(0, 7),
      ...movimentos.map((movimento) => new Date(movimento.data).toISOString().slice(0, 7)),
    ])].sort().reverse();
    const movimentosDoMes = typeof mes === "string"
      ? movimentos.filter((movimento) => new Date(movimento.data).toISOString().slice(0, 7) === mes)
      : movimentos;
    return res.status(200).json({
      movimentos: limite > 0 ? movimentosDoMes.slice(0, limite) : movimentosDoMes,
      meses,
    });
  } catch (erro) {
    console.error(erro);
    return res.status(500).json({ message: "Erro ao procurar movimentos" });
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