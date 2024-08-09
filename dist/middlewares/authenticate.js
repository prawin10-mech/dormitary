"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = authentication;
const jsonwebtoken_1 = require("jsonwebtoken");
async function authentication(req, res, next) {
    try {
        const secretKey = process.env.SECRET_KEY;
        const authorization = req.headers.authorization;
        if (!authorization)
            return res.sendStatus(401);
        const token = authorization.split(" ")[1];
        const admin = (0, jsonwebtoken_1.verify)(token, secretKey);
        // req.userId = userId;
        req.adminId = admin.adminId;
        req.role = admin.role;
        next();
    }
    catch (error) {
        // console.log(error);
        if (error instanceof jsonwebtoken_1.JsonWebTokenError) {
            if (error.message === "jwt expired")
                return res.status(401).json({ code: "jwt expired" });
            if (error.message === "jwt malformed")
                return res.status(401).json({ code: "jwt malformed" });
            return res.status(401).json({ code: "other-error" });
        }
        // console.log(error);
        return res.status(500).json({ code: "server-error" });
    }
}
