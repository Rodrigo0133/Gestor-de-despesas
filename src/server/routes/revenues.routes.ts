import { exigirAutenticacao } from "../middleware/auth.middleware.js";
import { Router } from "express";
import { ValidateMovimentsMiddleware } from "../middleware/Validatemovements.middleware.js";
import {DeleteRevenue,NewRevenue,UpdateRevenue} from "../Controllers/revenues.controller.js"
const router = Router()
// Valida a sessão antes de executar os controllers destas rotas privadas.
router.post("/newrevenue", exigirAutenticacao,ValidateMovimentsMiddleware, NewRevenue)
router.delete("/deleterevenue/:id", exigirAutenticacao, DeleteRevenue)
router.patch("/updaterevenue/:id", exigirAutenticacao, UpdateRevenue)
export default router;