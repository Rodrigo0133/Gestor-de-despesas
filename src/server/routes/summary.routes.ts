import { Router } from "express"
import { SummaryCategories,SummaryEvolution,Summary } from "../Controllers/summary.controller.js";
const router = Router()
router.get("/summary/categories",SummaryCategories);
router.get("/summary/evolution",SummaryEvolution);
router.get("/summary",Summary);
export default router;