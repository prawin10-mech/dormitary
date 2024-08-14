import { Request, Response } from "express";
import BedModel, { IBed } from "../models/bed.model";
import customerModel, { ICustomer } from "../models/customer.model";
import multer from "multer";
import { CloudinaryStorage } from "multer-storage-cloudinary";
import { v2 as cloudinary } from "cloudinary";
import { Types } from "mongoose";
import dotenv from "dotenv";
import dayjs from "dayjs";
import AgendaHelper from "../functions/agenda_helper";
import { sendWhatsappMessage } from "../functions/sendWhatsAppMessage";

dotenv.config();

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
});

const upload = multer({ storage }).fields([
  { name: "photo", maxCount: 1 },
  { name: "aadhar", maxCount: 1 },
]);

interface FileFields {
  photo?: Express.Multer.File[];
  aadhar?: Express.Multer.File[];
}

export const AllocateBed = [
  (req: Request, res: Response, next: Function) => {
    upload(req, res, (err: any) => {
      if (err) {
        return res
          .status(500)
          .json({ message: "Error uploading files", error: err });
      }
      next();
    });
  },
  async (req: Request, res: Response) => {
    try {
      const { name, email, number, age, bed } = req.body;
      const files = req.files as FileFields;
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

      const existingBed: (IBed & { _id: Types.ObjectId }) | null =
        await BedModel.findOne({ bed });

      if (!existingBed) {
        return res.status(404).json({ message: "Bed not found" });
      }

      if (existingBed.isOccupied) {
        return res.status(403).json({ message: "Bed is already occupied" });
      }

      const newCustomer = new customerModel({
        name,
        email,
        number,
        age,
        aadhar,
        photo,
      }) as ICustomer & { _id: Types.ObjectId };

      existingBed.isOccupied = true;
      existingBed.customer = newCustomer._id;
      existingBed.occupiedDate = new Date();
      await existingBed.save();

      newCustomer.bed = existingBed._id;
      await newCustomer.save();

      const date = dayjs();
      const endDate = date.add(1, "day").toDate();

      AgendaHelper.scheduleEndBedPeriod(existingBed._id.toString(), endDate);

      const message = await sendWhatsappMessage(
        number,
        `Your Bed ${bed} was allocated successfully Enjoy our services uninterrupted for the next 24 hours. Thank You`
      );
      console.log(message);

      return res.status(200).json({
        message: "Bed successfully allocated",
        bed: existingBed,
        customer: newCustomer,
      });
    } catch (error) {
      console.error("Error allocating bed:", error);
      return res.status(500).json({ message: "Something went wrong", error });
    }
  },
];

export const getCustomerDetails = async (req: Request, res: Response) => {
  try {
    const { number } = req.params;
    const customer = await customerModel.findOne({ number });

    if (!customer) {
      return res.status(400).json({ message: "Customer not found" });
    }

    return res
      .status(200)
      .json({ message: "Details fetched successfully", customer });
  } catch (error: any) {
    return res.status(500).json({ message: "Something went wrong", error });
  }
};
