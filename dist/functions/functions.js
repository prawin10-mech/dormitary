"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.endBedPeriod = endBedPeriod;
const bed_model_1 = __importDefault(require("../models/bed.model"));
async function endBedPeriod(bedId) {
    try {
        const bed = await bed_model_1.default.findById(bedId);
        if (!bed)
            return;
        if (bed) {
            bed.isOccupied = false;
            bed.customer = undefined;
            await bed?.save();
        }
        console.log("Finished ending bed  period");
    }
    catch (error) {
        console.log("Error finishing bed period", { error });
    }
}
