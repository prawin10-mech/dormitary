"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const admin_controller_1 = require("../controller/admin.controller");
const authenticate_1 = __importDefault(require("../middlewares/authenticate"));
const adminRouter = (0, express_1.Router)();
exports.default = adminRouter;
adminRouter.get("/details", authenticate_1.default, admin_controller_1.getAdminDetails);
adminRouter.post("/login", admin_controller_1.AdminLogin);
adminRouter.post("/register", admin_controller_1.AdminSignup);
