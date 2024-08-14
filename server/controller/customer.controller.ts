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
import { getHtmlContent } from "../functions/GetHtmlContent";
import { generatePDF } from "../functions/generatePdf";

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

      // const message = await sendWhatsappMessage(
      //   number,
      //   `Your Bed ${bed} was allocated successfully. Enjoy our services uninterrupted for the next 24 hours. Thank you!`
      // );

      const customersCount = await customerModel.countDocuments();

      const invoice = {
        product: {
          title: existingBed.type === "A/C" ? "AC BED" : "Regular Bed",
          description: `BED ${existingBed.bed}(${existingBed.type})`,
          quantity: 1,
          price: existingBed.type === "A/C" ? 200 : 100,
        },
        status: "paid",
        dueDate: date.format("DD MMMM, YYYY"),
        invoiceTo: {
          name: newCustomer.name,
          address: "",
          phone: newCustomer.number,
        },
        createDate: date.format("DD MMMM, YYYY"),
        invoiceFrom: {
          name: "Murali Ande",
          address: "Sri vijayalakshmi A/C Dormitary, Tanuku, 534210",
          phone: "9876543210",
        },
        invoiceNumber: customersCount,
        subTotalPrice: existingBed.type === "A/C" ? 200 : 100,
        totalPrice: existingBed.type === "A/C" ? 200 : 100,
        discount: 0.0,
        taxes: 0.0,
      };

      const htmlContent = getHtmlContent(invoice);
      const pdfBuffer = await generatePDF(htmlContent);

      const response = {
        message: "Bed successfully allocated",
        bed: existingBed,
        customer: newCustomer,
        invoice: {
          file: pdfBuffer.toString("base64"), // Base64 encode the PDF
          filename: `${newCustomer.name}-${new Date().getTime()}.pdf`,
        },
      };

      res.setHeader("Content-Disposition", "attachment; filename=invoice.pdf");
      res.setHeader("Content-Type", "application/pdf");

      return res.status(200).json(response);
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
