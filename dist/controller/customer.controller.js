"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AllocateBed = void 0;
const bed_model_1 = __importDefault(require("../models/bed.model"));
const customer_model_1 = __importDefault(require("../models/customer.model"));
const multer_1 = __importDefault(require("multer"));
const multer_storage_cloudinary_1 = require("multer-storage-cloudinary");
const cloudinary_1 = require("cloudinary");
const dotenv_1 = __importDefault(require("dotenv"));
const dayjs_1 = __importDefault(require("dayjs"));
const agenda_helper_1 = __importDefault(require("../functions/agenda_helper"));
dotenv_1.default.config();
cloudinary_1.v2.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
});
const storage = new multer_storage_cloudinary_1.CloudinaryStorage({
    cloudinary: cloudinary_1.v2,
});
const upload = (0, multer_1.default)({ storage }).fields([
    { name: "photo", maxCount: 1 },
    { name: "aadhar", maxCount: 1 },
]);
exports.AllocateBed = [
    (req, res, next) => {
        upload(req, res, (err) => {
            if (err) {
                return res
                    .status(500)
                    .json({ message: "Error uploading files", error: err });
            }
            next();
        });
    },
    async (req, res) => {
        try {
            const { name, email, number, age, bed } = req.body;
            const files = req.files;
            const photo = files.photo?.[0]?.path;
            const aadhar = files.aadhar?.[0]?.path;
            if (!photo || !aadhar) {
                return res
                    .status(400)
                    .json({ error: "Both photo and aadhar must be uploaded." });
            }
            if (!bed) {
                return res.status(400).json({ message: "Bed details are required" });
            }
            const existingBed = await bed_model_1.default.findOne({ bed });
            if (!existingBed) {
                return res.status(404).json({ message: "Bed not found" });
            }
            if (existingBed.isOccupied) {
                return res.status(403).json({ message: "Bed is already occupied" });
            }
            const newCustomer = new customer_model_1.default({
                name,
                email,
                number,
                age,
                aadhar,
                photo,
            });
            existingBed.isOccupied = true;
            existingBed.customer = newCustomer._id;
            existingBed.occupiedDate = new Date();
            await existingBed.save();
            newCustomer.bed = existingBed._id;
            await newCustomer.save();
            const date = (0, dayjs_1.default)();
            const endDate = date.add(1, "day").toDate();
            agenda_helper_1.default.scheduleEndBedPeriod(existingBed._id.toString(), endDate);
            return res.status(200).json({
                message: "Bed successfully allocated",
                bed: existingBed,
                customer: newCustomer,
            });
        }
        catch (error) {
            console.error("Error allocating bed:", error);
            return res.status(500).json({ message: "Something went wrong", error });
        }
    },
];
