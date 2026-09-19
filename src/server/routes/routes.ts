import { Router } from "express";
import authRoutes from "./auth.routes.js";
import categoryRoutes from "./category.routes.js";
import dashboardRoutes from "./dashboard.route.js";
import expensesRoutes from "./expenses.routes.js";
import loginRegisterRoutes from "./Login&Register.routes.js";
import movementsRoutes from "./movements.routes.js";
import revenuesRoutes from "./revenues.routes.js";
import summaryRoutes from "./summary.routes.js";

const router = Router();

router.use(authRoutes);
router.use(categoryRoutes);
router.use(dashboardRoutes);
router.use(expensesRoutes);
router.use(loginRegisterRoutes);
router.use(movementsRoutes);
router.use(revenuesRoutes);
router.use(summaryRoutes);

export default router;
