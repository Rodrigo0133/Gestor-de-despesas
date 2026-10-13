import { exigirAutenticacao } from "../middleware/auth.middleware.js";
import { DashboardController } from "../Controllers/dashboard.controller.js";
import { Router } from "express";

const router = Router()
// Valida a sessão antes de executar os controllers destas rotas privadas.
router.get("/Dashboard", exigirAutenticacao, DashboardController)
export default router;