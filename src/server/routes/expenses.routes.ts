import { exigirAutenticacao } from "../middleware/auth.middleware.js";
import { ValidateMovimentsMiddleware } from "../middleware/Validatemovements.middleware.js";
import { Router } from "express"
import { DeleteExpensesController, NewExpenseController, UpdateExpenseController} from "../Controllers/expenses.controller.js"
const router = Router();
// Valida a sessão antes de executar os controllers destas rotas privadas.
router.post("/newexpense", exigirAutenticacao,ValidateMovimentsMiddleware, NewExpenseController)
router.delete("/deleteexpense/:id", exigirAutenticacao, DeleteExpensesController)
router.patch("/updateexpense/:id", exigirAutenticacao, UpdateExpenseController)
export default router;
