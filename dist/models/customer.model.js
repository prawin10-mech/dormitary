"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = require("mongoose");
const schema = new mongoose_1.Schema({
    name: { type: String, required: [true, "Name is Required"] },
    email: { type: String }, // Optional field
    number: { type: String, required: [true, "Phone Number is Required"] },
    age: { type: Number, required: [true, "Age is Required"] },
    photo: { type: String }, // Optional field
    aadhar: { type: String, required: [true, "Aadhar is Required"] },
    bed: {
        type: mongoose_1.Schema.Types.ObjectId,
        required: [true, "Bed is Required"],
        ref: "Bed",
    },
}, { collection: "Customers", timestamps: true });
const customerModel = (0, mongoose_1.model)("Customer", schema);
exports.default = customerModel;
