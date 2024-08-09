"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getBeds = exports.AddBeds = void 0;
const bed_model_1 = __importDefault(require("../models/bed.model"));
const BedTypes_1 = require("../utils/BedTypes");
const AddBeds = async (req, res) => {
    try {
        for (const bedType of BedTypes_1.BedTypes) {
            // Check if a bed of this type already exists
            const existingBed = await bed_model_1.default.findOne({ type: bedType });
            if (existingBed) {
                return res
                    .status(400)
                    .json({ message: `Bed of type ${bedType} already exists` });
            }
            // Create a new bed with the current type
            const newBed = new bed_model_1.default({
                bed: bedType,
                type: bedType.startsWith("A") ? "AC" : "REGULAR",
            });
            await newBed.save();
        }
        return res.status(200).json({ message: "Beds Created Successfully" });
    }
    catch (error) {
        console.error("Error creating beds:", error);
        return res.status(500).json({ message: "Something went wrong", error });
    }
};
exports.AddBeds = AddBeds;
const getBeds = async (req, res) => {
    try {
        const role = req.role || "AGENT";
        const customerFields = role !== "ADMIN" ? "-photo -aadhar" : "";
        const beds = await bed_model_1.default.find()
            .populate({
            path: "customer",
            select: customerFields,
        })
            .exec();
        return res.status(200).json({ message: "Beds fetched successfully", beds });
    }
    catch (error) {
        console.error("Error fetching beds:", error);
        return res
            .status(500)
            .json({ message: "Something went wrong", error: error.message });
    }
};
exports.getBeds = getBeds;
