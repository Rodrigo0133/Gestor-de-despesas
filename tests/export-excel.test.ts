import { beforeEach, expect, test, vi } from "vitest";
import type { Request, Response } from "express";
import ExcelJS from "exceljs";

const banco = vi.hoisted(() => ({
  expense: { find: vi.fn() },
  receitas: { find: vi.fn() },
  categorias: { find: vi.fn() },
}));
vi.mock("../src/server/database/db", () => banco);
vi.mock("../src/server/database/db.js", () => banco);
import { ExportExcelController } from "../src/server/Controllers/ExportExcel.controller.js";

beforeEach(() => {
  vi.resetAllMocks();
  banco.expense.find.mockReturnValue({ lean: vi.fn().mockResolvedValue([
    { titulo: "Compras", descricao: "Mercearia", valor: 42.5, data: new Date("2026-05-15"), categoria: "c1" },
  ]) });
  banco.receitas.find.mockReturnValue({ lean: vi.fn().mockResolvedValue([
    { titulo: "Salário", descricao: "Ordenado", valor: 900, data: new Date("2026-04-30"), categoria: "c2" },
  ]) });
  banco.categorias.find.mockReturnValue({ lean: vi.fn().mockResolvedValue([
    { _id: "c1", nome: "Alimentação" }, { _id: "c2", nome: "Trabalho" },
  ]) });
});

async function exportar(query = {}, userId: string | null = "utilizador") {
  const req = { session: { userId }, params: {}, query } as unknown as Request;
  const res = { status: vi.fn().mockReturnThis(), json: vi.fn(), setHeader: vi.fn(), send: vi.fn() };
  await ExportExcelController(req, res as unknown as Response);
  return res;
}

async function lerFolha(res: Awaited<ReturnType<typeof exportar>>) {
  expect(res.send).toHaveBeenCalledOnce();
  const workbook = new ExcelJS.Workbook();
  await workbook.xlsx.load(res.send.mock.calls[0][0]);
  return workbook.getWorksheet("Movimentos")!;
}

test("exporta um XLSX com datas, categorias e valores numéricos do utilizador", async () => {
  const res = await exportar();
  const folha = await lerFolha(res);
  expect(folha.rowCount).toBe(3);
  expect(folha.getRow(2).getCell(1).value).toEqual(new Date("2026-05-15"));
  expect(folha.getRow(2).values).toEqual([undefined, new Date("2026-05-15"), "Compras", "Mercearia", "Alimentação", "Despesa", 42.5]);
  expect(res.setHeader).toHaveBeenCalledWith("Content-Type", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet");
  for (const modelo of Object.values(banco)) {
    expect(modelo.find).toHaveBeenCalledWith({ userId: "utilizador" });
  }
});

test("respeita o mês, tipo e pesquisa sem acentos", async () => {
  const folha = await lerFolha(await exportar({ mes: "2026-05", tipo: "despesa", pesquisa: "alimentacao" }));
  expect(folha.rowCount).toBe(2);
  expect(folha.getCell("B2").value).toBe("Compras");
  const vazia = await lerFolha(await exportar({ mes: "2026-05", tipo: "receita" }));
  expect(vazia.rowCount).toBe(1);
});

test("respeita a ordenação por valor", async () => {
  const folha = await lerFolha(await exportar({ ordenacao: "maiorValor" }));
  expect(folha.getCell("B2").value).toBe("Salário");
});

test.each([{ mes: "2026-13" }, { tipo: "outro" }, { ordenacao: "outro" }, { pesquisa: ["a", "b"] }])("rejeita filtros inválidos: %j", async (query) => {
  const res = await exportar(query);
  expect(res.status).toHaveBeenCalledWith(400);
  expect(banco.expense.find).not.toHaveBeenCalled();
});

test("rejeita pedidos sem sessão", async () => {
  const res = await exportar({}, null);
  expect(res.status).toHaveBeenCalledWith(401);
  expect(banco.expense.find).not.toHaveBeenCalled();
});

test("devolve erro quando a consulta falha", async () => {
  banco.expense.find.mockReturnValue({ lean: vi.fn().mockRejectedValue(new Error("Falha de ligação")) });
  const consola = vi.spyOn(console, "error").mockImplementation(() => {});
  try {
    const res = await exportar();
    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.send).not.toHaveBeenCalled();
  } finally {
    consola.mockRestore();
  }
});
