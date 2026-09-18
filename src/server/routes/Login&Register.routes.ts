import { Router } from "express"
import { LoginController,LogoutController } from "../Controllers/login.controller"
import { RegisterController } from "../Controllers/Register.controller"
const router = Router()
router.post("/login",LoginController)
router.post("/logout",LogoutController)
router.post("/register",RegisterController)
