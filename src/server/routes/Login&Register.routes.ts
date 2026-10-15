import { exigirAutenticacao } from "../middleware/auth.middleware.js";
import { Router } from "express"
import { LoginController,LogoutController } from "../Controllers/login.controller.js"
import { RegisterController } from "../Controllers/Register.controller.js"
import { login_limit } from "../middleware/rateLimits.middleware.js";
const router = Router()
router.post("/login", login_limit, LoginController)
// Apenas o logout exige sessão; login e registo continuam públicos.
router.post("/logout", exigirAutenticacao, LogoutController)
router.post("/register", login_limit, RegisterController)
export default router;
