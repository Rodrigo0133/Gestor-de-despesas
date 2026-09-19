import { Router } from 'express';
import { AuthController } from '../Controllers/auth.controller.js';
const router = Router();
router.get("/auth", AuthController);
export default router;
