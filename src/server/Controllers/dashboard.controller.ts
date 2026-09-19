import type { Request,Response } from "express";
import { User,expense,receitas } from "../database/db.js";
export async function DashboardController(req:Request,res:Response){
  const userId = req.session.userId;
  const mesSelecionado = req.query.mes;
  if(!userId) {
    return res.status(401).json({
      message: "Precisas de iniciar sessão",
    });
  }
  if(!mesSelecionado || typeof mesSelecionado !== "string" || !/^\d{4}-\d{2}$/.test(mesSelecionado)) {
    return res.status(400).json({
      message: "Mes selecionado inválido. Usa o formato AAAA-MM",
    });
  }
  const mesSelecionadoArray = mesSelecionado.split("-").map(Number);
  const [ano, mes] = mesSelecionadoArray;
  if(mes < 1 || mes > 12) {
    return res.status(400).json({
      message: "Mês inválido",
    });
  }
  if(ano < 1900 || ano > new Date().getFullYear()) {
    return res.status(400).json({
      message: "Ano inválido",
    });
  }

  try{
    const Utilizador = await User.findById(userId);

    const inicioDoMes = new Date(Date.UTC(mesSelecionadoArray[0], mesSelecionadoArray[1] - 1, 1));
    const inicioDoMesSeguinte = new Date(Date.UTC(mesSelecionadoArray[0], mesSelecionadoArray[1], 1));
    const inicioDoMesÁ2MesesAtrás = new Date(Date.UTC(mesSelecionadoArray[0], mesSelecionadoArray[1] - 2, 1));
    const fimDoMesanterior = new Date(Date.UTC(mesSelecionadoArray[0], mesSelecionadoArray[1] - 1, 1));
    const despesasestemes = await expense.find({
      userId,
      data: {
        $gte: inicioDoMes,
        $lt: inicioDoMesSeguinte,
      },
    }).lean();
    const receitaestemes = await receitas.find({
      userId,
      data: {
        $gte: inicioDoMes,
        $lt: inicioDoMesSeguinte,
      }, }).lean();
    const despesasmesanterior = await expense.find({
      userId,
      data: {
        $gte: inicioDoMesÁ2MesesAtrás,
        $lt: fimDoMesanterior,
      },
    }).lean();
    const receitamesanterior = await receitas.find({
      userId,
      data: {
        $gte: inicioDoMesÁ2MesesAtrás,
        $lt: fimDoMesanterior,
      },
    }).lean();
    const totalDespesas = despesasestemes.reduce((total, despesa) => total + despesa.valor, 0);
    const totalReceitas = receitaestemes.reduce((total, receita) => total + receita.valor, 0);
    const saldo = totalReceitas - totalDespesas;
    const totalDespesasMesAnterior = despesasmesanterior.reduce((total, despesa) => total + despesa.valor, 0);
    const totalReceitasMesAnterior = receitamesanterior.reduce((total, receita) => total + receita.valor, 0);
    const saldoMesAnterior = totalReceitasMesAnterior - totalDespesasMesAnterior;
    const comparacaoDespesas = ((totalDespesas - totalDespesasMesAnterior) / (totalDespesasMesAnterior || 1)) * 100;
    const comparacaoReceitas = ((totalReceitas - totalReceitasMesAnterior) / (totalReceitasMesAnterior || 1)) * 100;
    const comparacaoSaldo = ((saldo - saldoMesAnterior) / (saldoMesAnterior || 1)) * 100;
    return res.status(200).json({
      Utilizador : { nome: Utilizador?.nome },
      resumo : {
        totalDespesas,
        totalReceitas,
        saldo
      },
      comparacao : {
        comparacaoDespesas,
        comparacaoReceitas,
        comparacaoSaldo
      },
    });
  }catch(err){
    console.log(err);
    return res.status(500).json({
      message: "Erro ao obter dados do dashboard",
    });
  }
}