import { Router } from "express";
import categoryRoutes from "./category.routes.js";
import dashboardRoutes from "./dashboard.routes.js";
import expensesRoutes from "./expenses.routes.js";
import loginRegisterRoutes from "./Login&Register.routes.js";
import movementsRoutes from "./movements.routes.js";
import revenuesRoutes from "./revenues.routes.js";
import summaryRoutes from "./summary.routes.js";
import { dashboard_limit } from "../middleware/rateLimits.middleware.js";

const router = Router();

// Login e registo têm limite próprio; o logout fica sempre disponível.
router.use(loginRegisterRoutes);
// Uma única contagem partilhada pelas restantes rotas da API.
router.use(dashboard_limit);
router.use(categoryRoutes);
router.use(dashboardRoutes);
router.use(expensesRoutes);
router.use(movementsRoutes);
router.use(revenuesRoutes);
router.use(summaryRoutes);

export default router;
