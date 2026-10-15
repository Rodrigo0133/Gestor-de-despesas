import { beforeEach, expect, test, vi } from "vitest";
import type { Request, Response } from "express";

const banco = vi.hoisted(() => ({
  expense: { findOneAndUpdate: vi.fn(), findOneAndDelete: vi.fn() },
  receitas: { findOneAndUpdate: vi.fn(), findOneAndDelete: vi.fn() },
  categorias: { findOne: vi.fn() },
  User: {},
}));
vi.mock("../src/server/database/db.js", () => banco);
import { UpdateExpenseController, DeleteExpensesController } from "../src/server/Controllers/expenses.controller.js";
import { UpdateRevenue, DeleteRevenue } from "../src/server/Controllers/revenues.controller.js";

const userId = "507f1f77bcf86cd799439011";
const movimentoId = "507f1f77bcf86cd799439012";
const categoriaId = "507f1f77bcf86cd799439013";
const corpo = { titulo: "Novo título", descricao: "Descrição atualizada", valor: 42, data: "2026-05-15", categoria: categoriaId };

beforeEach(() => {
  vi.resetAllMocks();
  banco.categorias.findOne.mockResolvedValue({ _id: categoriaId });
  for (const modelo of [banco.expense, banco.receitas]) {
    modelo.findOneAndUpdate.mockResolvedValue({ _id: movimentoId, ...corpo });
    modelo.findOneAndDelete.mockResolvedValue({ _id: movimentoId });
  }
});

async function executar(controller: (req: Request, res: Response) => unknown, body = corpo) {
  const req = { session: { userId }, params: { id: movimentoId }, body } as unknown as Request;
  const json = vi.fn();
  const status = vi.fn().mockReturnValue({ json });
  await controller(req, { status } as unknown as Response);
  return { status, json };
}

for (const [nome, atualizar, eliminar, modelo] of [
  ["despesa", UpdateExpenseController, DeleteExpensesController, banco.expense],
  ["receita", UpdateRevenue, DeleteRevenue, banco.receitas],
] as const) {
  test(`atualiza título, data e categoria da ${nome} do utilizador`, async () => {
    const { status } = await executar(atualizar);
    expect(status).toHaveBeenCalledWith(200);
    expect(banco.categorias.findOne).toHaveBeenCalledWith({ _id: categoriaId, userId });
    expect(modelo.findOneAndUpdate).toHaveBeenCalledWith(
      { userId, _id: movimentoId },
      { ...corpo, data: new Date("2026-05-15T00:00:00.000Z") },
      { returnDocument: "after", runValidators: true },
    );
  });

  test(`não atualiza ${nome} com categoria de outro utilizador`, async () => {
    banco.categorias.findOne.mockResolvedValue(null);
    const { status } = await executar(atualizar);
    expect(status).toHaveBeenCalledWith(400);
    expect(modelo.findOneAndUpdate).not.toHaveBeenCalled();
  });

  test(`devolve 404 ao atualizar ${nome} inexistente ou de outro utilizador`, async () => {
    modelo.findOneAndUpdate.mockResolvedValue(null);
    const { status } = await executar(atualizar);
    expect(status).toHaveBeenCalledWith(404);
  });

  test(`rejeita data impossível e valor negativo na edição da ${nome}`, async () => {
    expect((await executar(atualizar, { ...corpo, data: "2026-02-30" })).status).toHaveBeenCalledWith(400);
    expect((await executar(atualizar, { ...corpo, valor: -10 })).status).toHaveBeenCalledWith(400);
    expect(modelo.findOneAndUpdate).not.toHaveBeenCalled();
  });

  test(`elimina apenas a ${nome} do utilizador autenticado`, async () => {
    const { status } = await executar(eliminar);
    expect(status).toHaveBeenCalledWith(200);
    expect(modelo.findOneAndDelete).toHaveBeenCalledWith({ _id: movimentoId, userId });
  });

  test(`devolve 404 ao eliminar ${nome} inexistente ou de outro utilizador`, async () => {
    modelo.findOneAndDelete.mockResolvedValue(null);
    expect((await executar(eliminar)).status).toHaveBeenCalledWith(404);
  });
}
