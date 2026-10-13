import { exigirAutenticacao } from "../middleware/auth.middleware.js";
import { Router } from "express"
import { LoginController,LogoutController } from "../Controllers/login.controller.js"
import { RegisterController } from "../Controllers/Register.controller.js"
const router = Router()
router.post("/login",LoginController)
// Apenas o logout exige sessão; login e registo continuam públicos.
router.post("/logout", exigirAutenticacao, LogoutController)
router.post("/register",RegisterController)
export default router;