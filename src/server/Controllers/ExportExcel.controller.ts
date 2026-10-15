import type { Request, Response } from "express";
import ExcelJS from "exceljs";
import { expense, receitas, categorias } from "../database/db.js";

export async function ExportExcelController(req: Request, res: Response) {
  const userId = req.session.userId;
  const { mes, tipo = "todos", pesquisa = "", ordenacao = "recentes" } = req.query;
  if (!userId) {
    return res.status(401).json({ message: "Precisas de iniciar sessão" });
  }
  if (mes !== undefined && (typeof mes !== "string" || !/^\d{4}-(0[1-9]|1[0-2])$/.test(mes))) {
    return res.status(400).json({ message: "Mês inválido. Usa o formato AAAA-MM" });
  }
  if (typeof tipo !== "string" || !["todos", "receita", "despesa"].includes(tipo)
    || typeof pesquisa !== "string" || typeof ordenacao !== "string"
    || !["recentes", "antigos", "maiorValor", "menorValor"].includes(ordenacao)) {
    return res.status(400).json({ message: "Filtros de exportação inválidos" });
  }

  try {
    const [listaDespesas, listaReceitas, listaCategorias] = await Promise.all([
      expense.find({ userId }).lean(),
      receitas.find({ userId }).lean(),
      categorias.find({ userId }).lean(),
    ]);
    const categoriasPorId = new Map(listaCategorias.map((categoria) => [String(categoria._id), categoria.nome]));
    const normalizar = (texto: string) => texto.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLocaleLowerCase("pt-PT").trim();
    const pesquisaNormalizada = normalizar(pesquisa);
    const movimentos = [
      ...listaDespesas.map((despesa) => ({ ...despesa, tipo: "despesa" })),
      ...listaReceitas.map((receita) => ({ ...receita, tipo: "receita" })),
    ].map((movimento) => ({
      ...movimento,
      categoria: categoriasPorId.get(String(movimento.categoria)) ?? "Sem categoria",
    })).filter((movimento) => {
      const correspondeAoMes = !mes || new Date(movimento.data).toISOString().slice(0, 7) === mes;
      const correspondeAoTipo = tipo === "todos" || movimento.tipo === tipo;
      const texto = normalizar(`${movimento.titulo ?? ""} ${movimento.descricao} ${movimento.categoria}`);
      return correspondeAoMes && correspondeAoTipo && texto.includes(pesquisaNormalizada);
    }).sort((primeiro, segundo) => {
      if (ordenacao === "maiorValor") return segundo.valor - primeiro.valor;
      if (ordenacao === "menorValor") return primeiro.valor - segundo.valor;
      const diferencaDatas = new Date(primeiro.data).getTime() - new Date(segundo.data).getTime();
      return ordenacao === "antigos" ? diferencaDatas : -diferencaDatas;
    });

    const workbook = new ExcelJS.Workbook();
    const folha = workbook.addWorksheet("Movimentos");
    folha.columns = [
      { header: "Data", key: "data", width: 14, style: { numFmt: "dd/mm/yyyy" } },
      { header: "Título", key: "titulo", width: 30 },
      { header: "Descrição", key: "descricao", width: 50 },
      { header: "Categoria", key: "categoria", width: 25 },
      { header: "Tipo", key: "tipo", width: 14 },
      { header: "Valor (€)", key: "valor", width: 18, style: { numFmt: '#,##0.00 "€"' } },
    ];
    for (const movimento of movimentos) {
      folha.addRow({
        data: new Date(movimento.data),
        titulo: movimento.titulo || "Sem título",
        descricao: movimento.descricao,
        categoria: movimento.categoria,
        tipo: movimento.tipo === "receita" ? "Receita" : "Despesa",
        valor: movimento.valor,
      });
    }
    folha.getRow(1).font = { bold: true };
    folha.views = [{ state: "frozen", ySplit: 1 }];
    folha.autoFilter = { from: "A1", to: "F1" };
    const ficheiro = await workbook.xlsx.writeBuffer();
    const nomeFicheiro = `movimentos-${mes || "todos"}.xlsx`;
    res.setHeader("Content-Type", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet");
    res.setHeader("Content-Disposition", `attachment; filename="${nomeFicheiro}"`);
    res.setHeader("Cache-Control", "no-store");
    return res.send(Buffer.from(ficheiro));
  } catch (erro) {
    console.error(erro);
    return res.status(500).json({ message: "Não foi possível exportar os movimentos para Excel." });
  }
}
