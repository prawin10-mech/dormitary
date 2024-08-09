"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const bed_controller_1 = require("../controller/bed.controller");
const authenticate_1 = __importDefault(require("../middlewares/authenticate"));
const BedsRouter = (0, express_1.Router)();
exports.default = BedsRouter;
BedsRouter.get("/get_beds", authenticate_1.default, bed_controller_1.getBeds);
BedsRouter.get("/add_beds", bed_controller_1.AddBeds);
