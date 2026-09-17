import { Router } from "express"
import { DeleteExpensesController, NewExpenseController, UpdateExpenseController} from "../Controllers/expenses.controller"
const router = Router();
router.post("/newexpense", NewExpenseController)
router.delete("/deleteexpense/:id", DeleteExpensesController)
router.patch("/updateexpense/:id", UpdateExpenseController)
