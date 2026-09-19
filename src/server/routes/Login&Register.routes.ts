import { Router } from "express"
import { LoginController,LogoutController } from "../Controllers/login.controller.js"
import { RegisterController } from "../Controllers/Register.controller.js"
const router = Router()
router.post("/login",LoginController)
router.post("/logout",LogoutController)
router.post("/register",RegisterController)
export default router;