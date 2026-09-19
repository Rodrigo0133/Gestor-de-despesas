import { Router } from "express";
import { UpdateCategoryController,AllcategoriesController,DeleteCategoryController,NewCategoryController,OneCategoryController } from "../Controllers/category.controller.js";

const router = Router();
router.get("/allcategories",AllcategoriesController)
router.get("/onecategory/:id",OneCategoryController)
router.post("/newcategory",NewCategoryController)
router.delete("/DeleteCategory/:id",DeleteCategoryController)
router.patch("/UpdateCategory/:id",UpdateCategoryController)
export default router;