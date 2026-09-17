import Router from 'express';
import { LoginController, AuthController, LogoutController } from '../Controllers/auth.controller';
const router = Router();
router.post('/login' , LoginController);
router.get("/auth", AuthController);
router.post("/logout", LogoutController)