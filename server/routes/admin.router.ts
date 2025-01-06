import { Router } from "express";
import {
  AddTokenToAdmin,
  AdminLogin,
  AdminSignup,
  getAdminDetails,
  sendNotification,
} from "../controller/admin.controller";
import authentication from "../middlewares/authenticate";

const adminRouter = Router();
export default adminRouter;

adminRouter.get("/details", authentication, getAdminDetails);

adminRouter.post("/login", AdminLogin);

adminRouter.post("/register", AdminSignup);

adminRouter.post("/add_token", authentication, AddTokenToAdmin);

adminRouter.get("/notification", sendNotification);
