import { Request, Response } from "express";
import BedModel from "../models/bed.model";
import { BedTypes } from "../utils/BedTypes";
import { CustomAdminRequest } from "../functions/CustomRequest";
import customerModel from "../models/customer.model";

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

export const getBedsHistory = async (req: Request, res: Response) => {
  try {
    // Fetch customers and populate bed details
    const customers = await customerModel
      .find() // Or use find({ <filter> }) to filter results
      .populate("bed") // Populate the 'bed' field with bed details
      .exec();

    // Organize data by year, month, and day
    const history = customers.reduce((acc, customer) => {
      const createdAt = customer.createdAt!;
      const year = createdAt.getFullYear();
      const month = createdAt.getMonth() + 1; // Months are zero-indexed
      const day = createdAt.getDate();

      if (!acc[year]) acc[year] = {};
      if (!acc[year][month]) acc[year][month] = {};
      if (!acc[year][month][day]) acc[year][month][day] = [];

      acc[year][month][day].push({
        bed: customer.bed,
        name: customer.name,
        phone: customer.number,
        createdAt: customer.createdAt,
      });

      return acc;
    }, {} as Record<number, Record<number, Record<number, Array<any>>>>);

    return res
      .status(200)
      .json({ message: "Beds fetched successfully", history });
  } catch (error: any) {
    console.error("Error fetching beds:", error);
    return res
      .status(500)
      .json({ message: "Something went wrong", error: error.message });
  }
};
