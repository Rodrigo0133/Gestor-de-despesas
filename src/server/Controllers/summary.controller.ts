import type { Request,Response } from "express"
import { expense, receitas } from "../database/db.js";
export async function  SummaryCategories(req: Request, res: Response){
  const userId = req.session.userId;
  const anoSelecionado = req.query.ano;
  const mesSelecionado = req.query.mes;

  if (!userId) {
    return res.status(401).json({
      message: "Precisas de iniciar sessão",
    });
  }

  if (anoSelecionado && mesSelecionado) {
    return res.status(400).json({
      message: "Indica apenas mes ou ano",
    });
  }

  let inicio: Date;
  let fim: Date;
  let periodo: { ano?: string; mes?: string };

  if (typeof mesSelecionado === "string") {
    if (!/^\d{4}-\d{2}$/.test(mesSelecionado)) {
      return res.status(400).json({
        message: "Mes invalido. Usa o formato AAAA-MM",
      });
    }

    const [ano, mes] = mesSelecionado.split("-").map(Number);
    if (mes < 1 || mes > 12) {
      return res.status(400).json({
        message: "Mes invalido",
      });
    }

    inicio = new Date(Date.UTC(ano, mes - 1, 1));
    fim = new Date(Date.UTC(ano, mes, 1));
    periodo = { mes: mesSelecionado };
  } else if (typeof anoSelecionado === "string") {
    if (!/^\d{4}$/.test(anoSelecionado)) {
      return res.status(400).json({
        message: "Ano invalido. Usa o formato AAAA",
      });
    }

    const ano = Number(anoSelecionado);
    inicio = new Date(Date.UTC(ano, 0, 1));
    fim = new Date(Date.UTC(ano + 1, 0, 1));
    periodo = { ano: anoSelecionado };
  } else {
    return res.status(400).json({
      message: "Indica mes ou ano",
    });
  }

  try {
    const despesas = await expense
      .find({
        userId,
        data: {
          $gte: inicio,
          $lt: fim,
        },
      })
      .populate({
        path: "categoria",
        select: "nome cor",
        match: { userId },
      })
      .lean();

    const categoriasAgrupadas: Record<
      string,
      { id: string; nome: string; cor: string; total: number }
    > = {};

    for (const despesa of despesas) {
      const categoria = despesa.categoria as unknown as {
        _id: unknown;
        nome: string;
        cor: string;
      } | null;

      if (!categoria) continue;

      const categoriaId = String(categoria._id);
      categoriasAgrupadas[categoriaId] ??= {
        id: categoriaId,
        nome: categoria.nome,
        cor: categoria.cor,
        total: 0,
      };
      categoriasAgrupadas[categoriaId].total += despesa.valor;
    }

    const categoriasDoPeriodo = Object.values(categoriasAgrupadas);
    const totalDespesas = categoriasDoPeriodo.reduce(
      (total, categoria) => total + categoria.total,
      0,
    );

    return res.status(200).json({
      ...periodo,
      totalDespesas,
      categorias: categoriasDoPeriodo.map((categoria) => ({
        ...categoria,
        percentagem:
          totalDespesas === 0
            ? 0
            : Number(((categoria.total / totalDespesas) * 100).toFixed(2)),
      })),
    });
  } catch (erro) {
    console.error(erro);
    return res.status(500).json({
      message: "Erro ao calcular resumo por categoria",
    });
  }
}
export async function SummaryEvolution(req:Request,res:Response){
  const userId = req.session.userId;
  const anoSelecionado = req.query.ano;
  if (!userId) {
    return res.status(401).json({
      message: "Precisas de iniciar sessão",
    });
  }
  if (
    !anoSelecionado ||
    typeof anoSelecionado !== "string" ||
    !/^\d{4}$/.test(anoSelecionado)
  ) {
    return res.status(400).json({
      message: "Ano selecionado inválido",
    });
  }
  const ano = Number(anoSelecionado);
  const inicioDoAno = new Date(Date.UTC(ano, 0, 1));
  const inicioDoAnoSeguinte = new Date(Date.UTC(ano + 1, 0, 1));
  try {
    const [listaDespesas, listaReceitas] = await Promise.all([
      expense
        .find({
          userId,
          data: {
            $gte: inicioDoAno,
            $lt: inicioDoAnoSeguinte,
          },
        })
        .lean(),
      receitas
        .find({
          userId,
          data: {
            $gte: inicioDoAno,
            $lt: inicioDoAnoSeguinte,
          },
        })
        .lean(),
    ]);
    const despesasPorMes = Array(12).fill(0);
    const receitasPorMes = Array(12).fill(0);
    for (const despesa of listaDespesas) {
      const mes = despesa.data.getUTCMonth();
      despesasPorMes[mes] += despesa.valor;
    }
    for (const receita of listaReceitas) {
      const mes = receita.data.getUTCMonth();
      receitasPorMes[mes] += receita.valor;
    }
    const saldoPorMes: number[] = [];
    for (let i = 0; i < 12; i++) {
      saldoPorMes[i] = receitasPorMes[i] - despesasPorMes[i];
    }
    return res.status(200).json({
      despesasPorMes,
      receitasPorMes,
      saldoPorMes,
    });
  } catch (erro) {
    console.error(erro);
    return res.status(500).json({
      message: "Erro ao calcular evolução",
    });
  }
}
export async function Summary(req:Request,res:Response){
  const userId = req.session.userId;
  const mesSelecionado = req.query.mes;
  const anoSelecionado = req.query.ano;
  if (!userId) {
    return res.status(401).json({
      message: "Precisas de iniciar sessão",
    });
  }
  if (mesSelecionado && anoSelecionado) {
    return res.status(400).json({
      message: "Indica apenas mes ou ano",
    });
  }
  if (typeof mesSelecionado === "string") {
    if (!/^\d{4}-\d{2}$/.test(mesSelecionado)) {
      return res.status(400).json({
        message: "Usa o formato AAAA-MM",
      });
    }
    if (!/^\d{4}-\d{2}$/.test(mesSelecionado)) {
      return res.status(400).json({
        message: "Usa o formato AAAA-MM",
      });
    }
    const [ano, mes] = mesSelecionado.split("-").map(Number);

    if (mes < 1 || mes > 12) {
      return res.status(400).json({
        message: "Mês inválido",
      });
    }

    const inicioDoMes = new Date(Date.UTC(ano, mes - 1, 1));
    const inicioDoMesSeguinte = new Date(Date.UTC(ano, mes, 1));

    try {
      const [listaDespesas, listaReceitas] = await Promise.all([
        expense
          .find({
            userId,
            data: {
              $gte: inicioDoMes,
              $lt: inicioDoMesSeguinte,
            },
          })
          .lean(),

        receitas
          .find({
            userId,
            data: {
              $gte: inicioDoMes,
              $lt: inicioDoMesSeguinte,
            },
          })
          .lean(),
      ]);

      const totalDespesas = listaDespesas.reduce(
        (total, despesa) => total + despesa.valor,
        0,
      );

      const totalReceitas = listaReceitas.reduce(
        (total, receita) => total + receita.valor,
        0,
      );

      const saldo = totalReceitas - totalDespesas;

      return res.status(200).json({
        mes: mesSelecionado,
        totalDespesas,
        totalReceitas,
        saldo,
      });
    } catch (erro) {
      console.error(erro);

      return res.status(500).json({
        message: "Erro ao calcular resumo",
      });
    }
  } else if (typeof anoSelecionado === "string") {
    if (!/^\d{4}$/.test(anoSelecionado)) {
      return res.status(400).json({
        message: "Usa o formato AAAA",
      });
    }
    const ano = Number(anoSelecionado);
    const inicioDoAno = new Date(Date.UTC(ano, 0, 1));
    const inicioDoAnoSeguinte = new Date(Date.UTC(ano + 1, 0, 1));
    try {
      const [listaDespesas, listaReceitas] = await Promise.all([
        expense
          .find({
            userId,
            data: {
              $gte: inicioDoAno,
              $lt: inicioDoAnoSeguinte,
            },
          })
          .lean(),

        receitas
          .find({
            userId,
            data: {
              $gte: inicioDoAno,
              $lt: inicioDoAnoSeguinte,
            },
          })
          .lean(),
      ]);
      const totalDespesas = listaDespesas.reduce(
        (total, despesa) => total + despesa.valor,
        0,
      );

      const totalReceitas = listaReceitas.reduce(
        (total, receita) => total + receita.valor,
        0,
      );

      const saldo = totalReceitas - totalDespesas;
      return res.status(200).json({
        ano: anoSelecionado,
        totalDespesas,
        totalReceitas,
        saldo,
      });
    } catch (erro) {
      console.error(erro);

      return res.status(500).json({
        message: "Erro ao calcular resumo",
      });
    }
  } else {
    return res.status(400).json({
      message: "Indica mes ou ano",
    });
  }
}