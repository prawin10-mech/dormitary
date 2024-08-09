"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const admin_router_1 = __importDefault(require("./admin.router"));
const customer_router_1 = __importDefault(require("./customer.router"));
const bed_router_1 = __importDefault(require("./bed.router"));
const router = (0, express_1.Router)();
exports.default = router;
router.use("/admin", admin_router_1.default);
router.use("/customer", customer_router_1.default);
router.use("/beds", bed_router_1.default);
