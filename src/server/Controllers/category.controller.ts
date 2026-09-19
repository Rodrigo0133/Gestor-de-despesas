import type { Request,Response } from "express";
import { categorias } from "../database/db.js";
import { isValidObjectId } from "mongoose";
export async function NewCategoryController(req:Request,res:Response) {
  const { nome, cor } = req.body;
  const userId = req.session.userId;
  if (!nome || !cor) {
    return res.status(400).json({
      message: "Dados Invalidos!",
    });
  }
  if (!userId) {
    return res.status(401).json({
      message: "Precisa ter Login feito!",
    });
  }
  const NovaCategoria = await categorias.create({
    nome,
    cor,
    userId: userId,
  });
  if (!NovaCategoria) {
    return res.status(500).json({
      message: "Falha em guardar categoria na base de dados",
    });
  }
  return res.status(201).json({
    message: "Categoria Criada!",
  });
}


export async function AllcategoriesController(req:Request,res:Response) {
  const UserId = req.session.userId;
  if (!UserId) {
    return res.status(400).json({
      message: "Precisa de ter uma conta logada!",
    });
  }
  try {
    const utilizador = await categorias.find({
      userId: UserId,
    });
    return res.status(201).json({
      utilizador,
    });
  } catch (err) {
    console.log(err);
    return res.status(404).json({
      message: "erro na base de dados!",
    });
  }
}


export async function OneCategoryController(req:Request,res:Response){
  const UserId = req.session.userId;
  const id = req.params.id;
  if (!UserId) {
    return res.status(401).json({
      message: "Precisas estar logado",
    });
  }
  if (!id || !isValidObjectId(id)) {
    return res.status(400).json({
      message: "Precisas de indicar a categoria",
    });
  }
  try {
    const categoria = await categorias.findOne({
      _id: id,
      userId: UserId,
    });
    return res.status(200).json({
      categoria,
    });
  } catch (err) {
    console.log(err);
    return res.status(404).json({
      message: "erro na base de dados!",
    });
  }
}

export async function DeleteCategoryController(req:Request,res:Response) {
  const userId = req.session.userId;
  const id = req.params.id;
  if (!userId) {
    return res.status(401).json({
      message: "Precisa ter login",
    });
  }
  if (!id) {
    return res.status(400).json({
      message: "Dado invalido",
    });
  }
  const removercategoria = await categorias.findByIdAndDelete({
    id,
    userId: userId,
  });
  if (!removercategoria) {
    return res.status(404).json({
      message: "erro!",
    });
  }
  return res.status(200).json({
    message: "Categoria Removida",
  });
}

export async function UpdateCategoryController(req:Request,res:Response) {
  const UserId = req.session.userId;
  const id = req.params.id;
  const { nome, cor } = req.body;
  if (!UserId) {
    return res.status(400).json({
      message: "Precisa de ter uma conta logada!",
    });
  }
  if (!id || !isValidObjectId(id) || !nome || !cor) {
    return res.status(400).json({
      message: "erro nos dados!",
    });
  }
  try {
    const categoria = await categorias.findByIdAndUpdate(
      {
        _id: id,
        userId: UserId,
      },
      {
        nome,
        cor,
      },
    );
    return res.status(200).json({
      message: "Categoria atualizada!",
      categoria,
    });
  } catch (err) {
    console.log(err);
    return res.status(404).json({
      message: "erro ao encontrar a categoria!",
    });
  }
}