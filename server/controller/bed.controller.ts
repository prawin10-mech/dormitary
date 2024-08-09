import { Request, Response } from "express";
import BedModel from "../models/bed.model";
import { BedTypes } from "../utils/BedTypes";
import { CustomAdminRequest } from "../functions/CustomRequest";

export const AddBeds = async (req: Request, res: Response) => {
  try {
    for (const bedType of BedTypes) {
      // Check if a bed of this type already exists
      const existingBed = await BedModel.findOne({ type: bedType });

      if (existingBed) {
        return res
          .status(400)
          .json({ message: `Bed of type ${bedType} already exists` });
      }

      // Create a new bed with the current type
      const newBed = new BedModel({
        bed: bedType,
        type: bedType.startsWith("A") ? "AC" : "REGULAR",
      });
      await newBed.save();
    }

    return res.status(200).json({ message: "Beds Created Successfully" });
  } catch (error) {
    console.error("Error creating beds:", error);
    return res.status(500).json({ message: "Something went wrong", error });
  }
};

export const getBeds = async (req: Request, res: Response) => {
  try {
    const role = (req as CustomAdminRequest).role || "AGENT";

    const customerFields = role !== "ADMIN" ? "-photo -aadhar" : "";

    const beds = await BedModel.find()
      .populate({
        path: "customer",
        select: customerFields,
      })
      .exec();

    return res.status(200).json({ message: "Beds fetched successfully", beds });
  } catch (error: any) {
    console.error("Error fetching beds:", error);
    return res
      .status(500)
      .json({ message: "Something went wrong", error: error.message });
  }
};
