import { beforeEach, expect, test, vi } from "vitest";
import type { Request, Response } from "express";

const banco = vi.hoisted(() => ({
  expense: { find: vi.fn() },
  receitas: { find: vi.fn() },
  categorias: { find: vi.fn() },
}));
vi.mock("../src/server/database/db.js", () => banco);
import { MovementsController } from "../src/server/Controllers/movements.controller.js";

beforeEach(() => {
  vi.clearAllMocks();
  const despesas = [{ _id: "d1", titulo: "Compras", valor: 42, data: new Date("2026-05-15"), categoria: "c1" }];
  const receitas = [{ _id: "r1", titulo: "Salário", valor: 900, data: new Date("2026-04-30"), categoria: "c2" }];
  const consulta = (dados: unknown[]) => ({
    lean: vi.fn().mockResolvedValue(dados),
    populate: vi.fn().mockReturnValue({ lean: vi.fn().mockResolvedValue(dados) }),
  });
  banco.expense.find.mockReturnValue(consulta(despesas));
  banco.receitas.find.mockReturnValue(consulta(receitas));
  banco.categorias.find.mockReturnValue(consulta([
    { _id: "c1", nome: "Alimentação", cor: "#ff8800" },
    { _id: "c2", nome: "Trabalho", cor: "#123456" },
  ]));
});

async function consultar(mes?: string, num = "0") {
  const req = { session: { userId: "utilizador" }, params: { num }, query: mes ? { mes } : {} } as unknown as Request;
  const json = vi.fn();
  const status = vi.fn().mockReturnValue({ json });
  await MovementsController(req, { status } as unknown as Response);
  return { status, dados: json.mock.calls[0][0] };
}

test("devolve os meses reais e as categorias das despesas e receitas", async () => {
  const { status, dados } = await consultar();
  expect(status).toHaveBeenCalledWith(200);
  expect(dados.meses).toEqual(expect.arrayContaining(["2026-05", "2026-04"]));
  expect(dados.movimentos).toHaveLength(2);
  expect(dados.movimentos[0].categoria).toEqual({ nome: "Alimentação", cor: "#ff8800" });
  expect(dados.movimentos[1].categoria).toEqual({ nome: "Trabalho", cor: "#123456" });
  expect(banco.categorias.find).toHaveBeenCalledWith({ userId: "utilizador" });
});

test("filtra os movimentos pelo mês e mantém os meses disponíveis", async () => {
  const { dados } = await consultar("2026-04", "10");
  expect(dados.movimentos.map((item: { _id: string }) => item._id)).toEqual(["r1"]);
  expect(dados.meses).toContain("2026-05");
});

test("rejeita mês inválido", async () => {
  const { status } = await consultar("2026-13");
  expect(status).toHaveBeenCalledWith(400);
  expect(banco.expense.find).not.toHaveBeenCalled();
});

test("sem movimentos devolve lista vazia e mês atual", async () => {
  banco.expense.find.mockReturnValue({ lean: vi.fn().mockResolvedValue([]) });
  banco.receitas.find.mockReturnValue({ lean: vi.fn().mockResolvedValue([]) });
  const { dados } = await consultar();
  expect(dados.movimentos).toEqual([]);
  expect(dados.meses).toContain(new Date().toISOString().slice(0, 7));
});
