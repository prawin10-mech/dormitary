import { Router } from "express";
import authentication from "../middlewares/authenticate";
import {
  AllocateBed,
  getCustomerDetails,
} from "../controller/customer.controller";

const CustomerRouter = Router();
export default CustomerRouter;

CustomerRouter.post("/allocate_bed", authentication, AllocateBed);

CustomerRouter.get(
  "/customer_details/:number",
  authentication,
  getCustomerDetails
);
