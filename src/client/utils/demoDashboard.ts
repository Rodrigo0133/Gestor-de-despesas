export type MovimentoDemo = {
  titulo: string;
  categoria: string;
  tipo: "receita" | "despesa";
  valor: number;
  dia: number;
};

export function resumirMovimentosDemo(movimentos: MovimentoDemo[]) {
  const receitas = movimentos.filter(item => item.tipo === "receita").reduce((total, item) => total + item.valor, 0);
  const despesas = movimentos.filter(item => item.tipo === "despesa").reduce((total, item) => total + item.valor, 0);
  return { receitas, despesas, saldo: receitas - despesas };
}

export const mesesDemo: { nome: string; movimentos: MovimentoDemo[] }[] = [
  { nome: "Setembro 2026", movimentos: [
    { titulo: "Salário", categoria: "Trabalho", tipo: "receita", valor: 1800, dia: 1 },
    { titulo: "Renda de casa", categoria: "Casa", tipo: "despesa", valor: 600, dia: 3 },
    { titulo: "Supermercado", categoria: "Alimentação", tipo: "despesa", valor: 210, dia: 10 },
    { titulo: "Passe mensal", categoria: "Transportes", tipo: "despesa", valor: 40, dia: 12 },
    { titulo: "Projeto freelance", categoria: "Trabalho", tipo: "receita", valor: 250, dia: 18 },
    { titulo: "Cinema e jantar", categoria: "Lazer", tipo: "despesa", valor: 85, dia: 25 },
  ] },
  { nome: "Outubro 2026", movimentos: [
    { titulo: "Salário", categoria: "Trabalho", tipo: "receita", valor: 1800, dia: 1 },
    { titulo: "Renda de casa", categoria: "Casa", tipo: "despesa", valor: 600, dia: 3 },
    { titulo: "Supermercado", categoria: "Alimentação", tipo: "despesa", valor: 245, dia: 9 },
    { titulo: "Passe mensal", categoria: "Transportes", tipo: "despesa", valor: 40, dia: 12 },
    { titulo: "Projeto freelance", categoria: "Trabalho", tipo: "receita", valor: 350, dia: 20 },
    { titulo: "Fim de semana", categoria: "Lazer", tipo: "despesa", valor: 140, dia: 26 },
  ] },
  { nome: "Novembro 2026", movimentos: [
    { titulo: "Salário", categoria: "Trabalho", tipo: "receita", valor: 1900, dia: 1 },
    { titulo: "Renda de casa", categoria: "Casa", tipo: "despesa", valor: 600, dia: 3 },
    { titulo: "Supermercado", categoria: "Alimentação", tipo: "despesa", valor: 195, dia: 8 },
    { titulo: "Passe mensal", categoria: "Transportes", tipo: "despesa", valor: 40, dia: 12 },
    { titulo: "Projeto freelance", categoria: "Trabalho", tipo: "receita", valor: 200, dia: 19 },
    { titulo: "Livros e concertos", categoria: "Lazer", tipo: "despesa", valor: 70, dia: 23 },
  ] },
];
