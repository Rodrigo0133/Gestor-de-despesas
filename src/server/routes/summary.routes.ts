import { exigirAutenticacao } from "../middleware/auth.middleware.js";
import { Router } from "express"
import { SummaryCategories,SummaryEvolution,Summary } from "../Controllers/summary.controller.js";
const router = Router()
// Valida a sessão antes de executar os controllers destas rotas privadas.
router.get("/summary/categories", exigirAutenticacao, SummaryCategories);
router.get("/summary/evolution", exigirAutenticacao, SummaryEvolution);
router.get("/summary", exigirAutenticacao, Summary);
export default router;