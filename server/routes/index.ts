import { Router } from "express";
import adminRouter from "./admin.router";
import CustomerRouter from "./customer.router";
import BedsRouter from "./bed.router";

const router = Router();
export default router;

router.use("/admin", adminRouter);
router.use("/customer", CustomerRouter);
router.use("/beds", BedsRouter);
