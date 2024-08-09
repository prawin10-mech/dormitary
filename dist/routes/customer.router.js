"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const authenticate_1 = __importDefault(require("../middlewares/authenticate"));
const customer_controller_1 = require("../controller/customer.controller");
const CustomerRouter = (0, express_1.Router)();
exports.default = CustomerRouter;
CustomerRouter.post("/allocate_bed", authenticate_1.default, customer_controller_1.AllocateBed);
