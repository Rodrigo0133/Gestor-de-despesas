import { exigirAutenticacao } from "../middleware/auth.middleware.js";
import { Router } from "express";
import { MovementsController,MovementsidController } from "../Controllers/movements.controller.js";

const router = Router()
// Valida a sessão antes de executar os controllers destas rotas privadas.
router.get("/movement/:num", exigirAutenticacao, MovementsController)
router.get("/movements/:id", exigirAutenticacao, MovementsidController)
export default router;