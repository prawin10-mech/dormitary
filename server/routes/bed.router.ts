import { Router } from "express";
import { AddBeds, getBeds, getBedsHistory } from "../controller/bed.controller";
import authentication from "../middlewares/authenticate";

const BedsRouter = Router();
export default BedsRouter;

BedsRouter.get("/get_beds", authentication, getBeds);

BedsRouter.get("/get_beds_history", getBedsHistory);

BedsRouter.get("/add_beds", AddBeds);
