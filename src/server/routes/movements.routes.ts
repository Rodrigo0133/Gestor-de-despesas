import { exigirAutenticacao } from "../middleware/auth.middleware.js";
import { Router } from "express";
import { MovementsController,MovementsidController } from "../Controllers/movements.controller.js";
import { ExportExcelController } from "../Controllers/ExportExcel.controller.js";

const router = Router()
router.get("/movements/export/excel", exigirAutenticacao, ExportExcelController)
// Valida a sessão antes de executar os controllers destas rotas privadas.
router.get("/movement/:num", exigirAutenticacao, MovementsController)
router.get("/movements/:id", exigirAutenticacao, MovementsidController)
export default router;
