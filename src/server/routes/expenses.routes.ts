import { exigirAutenticacao } from "../middleware/auth.middleware.js";
import { ValidateMovimentsMiddleware } from "../middleware/Validatemovements.middleware.js";
import { Router } from "express"
import { AuthMovement } from "../middleware/authmovement.middleware.js";
import { DeleteExpensesController, NewExpenseController, UpdateExpenseController} from "../Controllers/expenses.controller.js"
const router = Router();
// Valida a sessão antes de executar os controllers destas rotas privadas.
router.post("/newexpense", exigirAutenticacao,ValidateMovimentsMiddleware, NewExpenseController)
router.delete("/deleteexpense/:id", exigirAutenticacao,AuthMovement, DeleteExpensesController)
router.patch("/updateexpense/:id", exigirAutenticacao,AuthMovement, UpdateExpenseController)
export default router;
