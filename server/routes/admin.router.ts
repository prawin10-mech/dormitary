import { Router } from "express";
import {
  AdminLogin,
  AdminSignup,
  getAdminDetails,
} from "../controller/admin.controller";
import authentication from "../middlewares/authenticate";

const adminRouter = Router();
export default adminRouter;

adminRouter.get("/details", authentication, getAdminDetails);

adminRouter.post("/login", AdminLogin);

adminRouter.post("/register", AdminSignup);
