import { DashboardController } from "../Controllers/dashboard.controller.js";
import { Router } from "express";

const router = Router()
router.get("/Dashboard",DashboardController)
export default router;