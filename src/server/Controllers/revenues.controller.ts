import type { Request, Response } from "express";
import { converterDataDoUtilizador } from "../Utils/ConverterDateUser.js"
import { isValidObjectId } from "mongoose";
import { User,categorias,receitas } from "../database/db.js";
export async function NewRevenue(req: Request, res: Response) {
  const userId = req.session.userId;
  if (!userId) {
    return res.status(401).json({
      message: "Precisas ter uma conta logada!",
    });
  }
  const { descricao, valor, data, categoria } = req.body;
  if (!descricao || !valor || !data || !categoria) {
    return res.status(400).json({
      message: "Preenche todos os campos",
    });
  }

  const dataDoMovimento = converterDataDoUtilizador(data);

  if (!dataDoMovimento) {
    return res.status(400).json({
      message: "Data inválida. Usa o formato AAAA-MM-DD",
    });
  }

  const verificar_dado = isValidObjectId(userId);
  if (!verificar_dado) {
    return res.status(401).json({
      message: "Credencias invalidas",
    });
  }
  const IdExistente = await User.findById(userId);
  if (!IdExistente) {
    return res.status(404).json({
      message: "Usuario Não encontrado",
    });
  }
  if (typeof categoria !== "string" || !isValidObjectId(categoria)) {
    return res.status(400).json({
      message: "Categoria inválida",
    });
  }
  const categoriaExistente = await categorias.findOne({
    _id: categoria,
    userId,
  });

  if (!categoriaExistente) {
    return res.status(400).json({
      message: "Categoria não encontrada",
    });
  }
  try {
    const novareceita = await receitas.create({
      descricao,
      valor,
      data: dataDoMovimento,
      categoria,
      userId: userId,
    });
    return res.status(201).json({
      message: "Despesa Adicionada",
      despesa: novareceita,
    });
  } catch (err) {
    console.log(err);
    return res.status(500).json({
      message: "Erro ao guardar despesa!",
    });
  }
}
export async function DeleteRevenue(req: Request, res: Response){
  const userId = req.session.userId;
  const receitaId = req.params.id;
  if (!userId) {
    return res.status(401).json({
      message: "Precisas ter uma conta logada!",
    });
  }
  if (!receitaId) {
    return res.status(401).json({
      message: "Precisas ter uma despesa",
    });
  }
  if (!isValidObjectId(receitaId)) {
    return res.status(400).json({
      message: "ID da despesa inválido",
    });
  }
  const receitaEliminada = await receitas.findOneAndDelete({
    _id: receitaId,
    userId,
  });
  if (!receitaEliminada) {
    return res.status(404).json({
      message: "Despesa não encontrada",
    });
  }
  return res.status(200).json({
    message: "Despesa Elimanda!",
  });
}
export async function UpdateRevenue(req: Request, res: Response){
  const userId = req.session.userId;
  const receitasid = req.params.id;
  const { descricao, valor, data, categoria } = req.body;
  if (!userId) {
    return res.status(401).json({
      message: "Precisas de iniciar sessão",
    });
  }

  if (!isValidObjectId(receitasid)) {
    return res.status(400).json({
      message: "ID do movimento inválido",
    });
  }
  if (!descricao || !valor || !data || !categoria) {
    return res.status(400).json({
      message: "falta de valores",
    });
  }
  try {
    const ReceitaAtualizada = await receitas.findOneAndUpdate(
      {
        userId: userId,
        _id: receitasid,
      },
      {
        descricao,
        valor,
        data,
        categoria,
      },
    );
    return res.status(201).json({
      message: "receita atualizada",
      ReceitaAtualizada,
    });
  } catch (err) {
    console.log(err);
    return res.status(500).json({
      message: "Erro ao procurar movimento",
    });
  }
};