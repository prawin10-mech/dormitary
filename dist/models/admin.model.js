"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = require("mongoose");
const schema = new mongoose_1.Schema({
    name: { type: String, required: [true, "Name is Required"] },
    email: { type: String, required: [true, "Email is Required"] },
    password: { type: String, required: [true, "Password is Required"] },
    role: {
        type: String,
        required: [true, "Role is Required"],
        enum: ["ADMIN", "USER", "AGENT"],
    },
    profileImage: { type: String },
}, { collection: "Admins", timestamps: true });
const AdminModel = (0, mongoose_1.model)("Admin", schema);
exports.default = AdminModel;
