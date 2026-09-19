import type { Request, Response } from "express";
import { converterDataDoUtilizador } from "../Utils/ConverterDateUser.js";
import { isValidObjectId } from "mongoose";
import { User, categorias, expense} from "../database/db.js";
export async function NewExpenseController(req: Request, res: Response) {
      console.log(req.body);
      const id = req.session.userId;
    
      if (!id) {
        return res.status(401).json({
          message: "Precisas de iniciar sessão",
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
    
      const verificar_dado = isValidObjectId(id);
      if (!verificar_dado) {
        return res.status(401).json({
          message: "Credencias invalidas",
        });
      }
      const IdExistente = await User.findById(id);
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
        userId: id,
      });
    
      if (!categoriaExistente) {
        return res.status(400).json({
          message: "Categoria não encontrada",
        });
      }
      try {
        const novaDespesa = await expense.create({
          descricao,
          valor,
          data: dataDoMovimento,
          categoria,
          userId: id,
        });
        return res.status(201).json({
          message: "Despesa Adicionada",
          despesa: novaDespesa,
        });
      } catch (err) {
        console.log(err);
        return res.status(500).json({
          message: "Erro ao guardar despesa!",
        });
      }
}
export async function DeleteExpensesController(req: Request, res: Response) {
  const userId = req.session.userId;
  const despesaId = req.params.id;
  if (!userId) {
    return res.status(401).json({
      message: "Precisas ter uma conta logada!",
    });
  }
  if (!despesaId) {
    return res.status(401).json({
      message: "Precisas ter uma despesa",
    });
  }
  if (!isValidObjectId(despesaId)) {
    return res.status(400).json({
      message: "ID da despesa inválido",
    });
  }
  
  const despesaEliminada = await expense.findOneAndDelete({
    _id: despesaId,
    userId,
  });
  if (!despesaEliminada) {
    return res.status(404).json({
      message: "Despesa não encontrada",
    });
  }
  return res.status(200).json({
    message: "Despesa Elimanda!",
  });
};
export async function UpdateExpenseController (req: Request, res: Response){
  const userId = req.session.userId;
  const despesaid = req.params.id;
  const { descricao, valor, data, categoria } = req.body;
  if (!userId) {
    return res.status(401).json({
      message: "Precisas de iniciar sessão",
    });
  }

  if (!isValidObjectId(despesaid)) {
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
    const DespesaAtualizada = await expense.findOneAndUpdate(
      {
        userId: userId,
        _id: despesaid,
      },
      {
        descricao,
        valor,
        data,
        categoria,
      },
    );
    return res.status(201).json({
      message: "despesa atualizada",
      DespesaAtualizada,
    });
  } catch (err) {
    console.log(err);
    return res.status(500).json({
      message: "Erro ao procurar movimento",
    });
  }
}