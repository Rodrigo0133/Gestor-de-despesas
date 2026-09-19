import { Router } from "express";
import { MovementsController,MovementsidController } from "../Controllers/movements.controller.js";

const router = Router()
router.get("/movement/:num",MovementsController)
router.get("/movements/:id",MovementsidController)
export default router;