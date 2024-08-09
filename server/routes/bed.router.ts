import { Router } from "express";
import { AddBeds, getBeds } from "../controller/bed.controller";
import authentication from "../middlewares/authenticate";

const BedsRouter = Router();
export default BedsRouter;

BedsRouter.get("/get_beds", authentication, getBeds);

BedsRouter.get("/add_beds", AddBeds);
