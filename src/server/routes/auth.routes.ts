import Router from 'express';
import { AuthController } from '../Controllers/auth.controller';
const router = Router();
router.get("/auth", AuthController);