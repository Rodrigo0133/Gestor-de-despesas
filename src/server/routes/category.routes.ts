import { exigirAutenticacao } from "../middleware/auth.middleware.js";
import { Router } from "express";
import { UpdateCategoryController,AllcategoriesController,DeleteCategoryController,NewCategoryController,OneCategoryController } from "../Controllers/category.controller.js";
import { ValidateCategory } from "../middleware/ValidateCategory.middleware.js";
const router = Router();
// Valida a sessão antes de executar os controllers destas rotas privadas.
router.get("/allcategories", exigirAutenticacao, AllcategoriesController)
router.get("/onecategory/:id", exigirAutenticacao,ValidateCategory, OneCategoryController)
router.post("/newcategory", exigirAutenticacao, NewCategoryController)
router.delete("/DeleteCategory/:id", exigirAutenticacao, DeleteCategoryController)
router.patch("/UpdateCategory/:id", exigirAutenticacao, UpdateCategoryController)
export default router;