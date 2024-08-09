"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateJwtToken = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const generateJwtToken = async (data) => {
    const secretKey = process.env.SECRET_KEY;
    const token = jsonwebtoken_1.default.sign(data, secretKey, { expiresIn: "1h" });
    return token;
};
exports.generateJwtToken = generateJwtToken;
