import { Router } from "express";
import authentication from "../middlewares/authenticate";
import { AllocateBed } from "../controller/customer.controller";

const CustomerRouter = Router();
export default CustomerRouter;

CustomerRouter.post("/allocate_bed", authentication, AllocateBed);
