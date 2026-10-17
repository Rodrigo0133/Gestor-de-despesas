import { expect, test } from "vitest";
import { resumirMovimentosDemo } from "../src/client/utils/demoDashboard";

test("calcula receitas, despesas e saldo dos movimentos apresentados", () => {
  expect(resumirMovimentosDemo([
    { titulo: "Salário", categoria: "Trabalho", tipo: "receita", valor: 1500, dia: 1 },
    { titulo: "Compras", categoria: "Alimentação", tipo: "despesa", valor: 80.5, dia: 3 },
    { titulo: "Passe", categoria: "Transportes", tipo: "despesa", valor: 40, dia: 5 },
  ])).toEqual({ receitas: 1500, despesas: 120.5, saldo: 1379.5 });
});

test("uma demonstração sem movimentos apresenta valores a zero", () => {
  expect(resumirMovimentosDemo([])).toEqual({ receitas: 0, despesas: 0, saldo: 0 });
});
