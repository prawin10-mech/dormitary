"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AdminSignup = exports.AdminLogin = exports.getAdminDetails = void 0;
const bcrypt_1 = __importDefault(require("bcrypt"));
const admin_model_1 = __importDefault(require("../models/admin.model"));
const generateJwtToken_1 = require("../functions/generateJwtToken");
const getAdminDetails = async (req, res) => {
    try {
        const adminId = req.adminId;
        const admin = await admin_model_1.default.findById(adminId);
        if (!admin) {
            return res.status(404).json({ message: "Admin not found" });
        }
        return res.json({ message: "Admin fetched Successfully", admin });
    }
    catch (error) {
        return res.status(500).json({ message: "Something went wrong", error });
    }
};
exports.getAdminDetails = getAdminDetails;
const AdminLogin = async (req, res) => {
    try {
        const { email, password } = req.body;
        const admin = await admin_model_1.default.findOne({ email });
        if (!admin) {
            return res.status(404).json({ message: "Admin not found" });
        }
        const isMatch = await bcrypt_1.default.compare(password, admin.password);
        if (!isMatch) {
            return res.status(401).json({ message: "Invalid password" });
        }
        const token = await (0, generateJwtToken_1.generateJwtToken)({
            adminId: admin._id.toString(),
            role: admin.role,
        });
        return res.json({ message: "Admin Logged in Successfully", admin, token });
    }
    catch (error) {
        return res.status(500).json({ message: "Something went wrong", error });
    }
};
exports.AdminLogin = AdminLogin;
const AdminSignup = async (req, res) => {
    try {
        const { email, password } = req.body;
        const admin = await admin_model_1.default.findOne({ email });
        if (admin) {
            return res
                .status(404)
                .json({ message: "Admin with this email already found" });
        }
        const hashedPassword = await bcrypt_1.default.hash(password, 10);
        const newAdmin = new admin_model_1.default({ ...req.body, password: hashedPassword });
        await newAdmin.save();
        return res.json({ message: "Admin created Successfully", admin: newAdmin });
    }
    catch (error) {
        return res.status(500).json({ message: "Something went wrong", error });
    }
};
exports.AdminSignup = AdminSignup;
