import { Request, Response } from "express";
import BedModel from "../models/bed.model";
import { BedTypes } from "../utils/BedTypes";
import { CustomAdminRequest } from "../functions/CustomRequest";
import customerModel, { ICustomer } from "../models/customer.model";
import { generatePDF } from "../functions/generatePdf";
import { getCheckoutHtmlContent } from "../functions/getCheckoutHtml";
import dayjs from "dayjs";

export const AddBeds = async (req: Request, res: Response) => {
  try {
    for (const bedType of BedTypes) {
      // Check if a bed of this type already exists
      const existingBed = await BedModel.findOne({ type: bedType });

      if (existingBed) {
        continue;
        // return res
        //   .status(400)
        //   .json({ message: `Bed of type ${bedType} already exists` });
      }

      // Create a new bed with the current type
      const newBed = new BedModel({
        bed: bedType,
        type: "AC",
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

export const CheckoutBed = async (req: Request, res: Response) => {
  try {
    const { bedId } = req.params;
    if (!bedId || typeof bedId !== "string") {
      return res.status(400).json({ message: "Invalid or missing bedId" });
    }

    // Find the bed details
    const bedDetails = await BedModel.findById(bedId).populate("customer");
    if (!bedDetails) {
      return res.status(404).json({ message: "Bed not found" });
    }

    const customer = bedDetails.customer as ICustomer | undefined;

    if (!customer) {
      return res.status(404).json({ message: "Customer not found" });
    }

    if (customer) {
      // Update the customer's check-out time
      customer.checkOutAt = new Date();
      await customer.save();
    }

    const date = dayjs();

    const customersCount = await customerModel.countDocuments();

    // Update the bed's occupancy status
    bedDetails.isOccupied = false;
    bedDetails.customer = undefined;
    await bedDetails.save();

    const invoice = {
      product: {
        title: bedDetails.type === "A/C" ? "AC BED" : "Regular Bed",
        description: `BED ${bedDetails.bed}(${bedDetails.type})`,
        quantity: 1,
        price: 200,
      },
      status: "paid",
      dueDate: date.format("DD-MM-YYYY hh:mm::ss"),
      invoiceTo: {
        name: customer.name,
        address: "",
        phone: customer.number,
      },
      createDate: dayjs(bedDetails.occupiedDate).format("DD-MM-YYYY hh:mm::ss"),
      checkoutDate: date.format("DD-MM-YYYY hh:mm::ss"),
      invoiceFrom: {
        name: "Sri vijayalakshmi A/C Dormitary, Tanuku, 534210",
        phone: "9876543210",
      },
      invoiceNumber: customersCount,
      subTotalPrice: 300,
      totalPrice: 300,
      discount: 0.0,
      taxes: 0.0,
    };

    const htmlContent = getCheckoutHtmlContent(invoice);
    const pdfBuffer = await generatePDF(htmlContent);

    const response = {
      message: "Bed successfully allocated",
      bed: bedDetails,
      customer: customer,
      invoice: {
        file: pdfBuffer.toString("base64"), // Base64 encode the PDF
        filename: `${customer.name}-invoice-${new Date().getTime()}.pdf`,
      },
    };

    res.setHeader("Content-Disposition", "attachment; filename=invoice.pdf");
    res.setHeader("Content-Type", "application/pdf");

    return res.status(200).json(response);
  } catch (error: any) {
    console.error("Error during bed checkout:", error);
    return res
      .status(500)
      .json({ message: "Something went wrong", error: error.message });
  }
};
