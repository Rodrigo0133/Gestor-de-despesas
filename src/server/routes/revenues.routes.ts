import { Router } from "express";
import {DeleteRevenue,NewRevenue,UpdateRevenue} from "../Controllers/revenues.controller"
const router = Router()
router.post("/newrevenue",NewRevenue)
router.delete("/deleterevenue/:id",DeleteRevenue)
router.patch("/updaterevenue/:id",UpdateRevenue)