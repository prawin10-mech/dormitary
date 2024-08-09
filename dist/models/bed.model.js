"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = require("mongoose");
const BedTypes_1 = require("../utils/BedTypes");
const schema = new mongoose_1.Schema({
    bed: { type: String, required: [true, "Bed is Required"], enum: BedTypes_1.BedTypes },
    type: { type: String, required: true, enum: ["AC", "REGULAR"] },
    isOccupied: { type: Boolean, required: true, default: false },
    occupiedDate: { type: Date },
    customer: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: "Customer",
    },
}, { collection: "Beds", timestamps: true });
const BedModel = (0, mongoose_1.model)("Bed", schema);
exports.default = BedModel;
