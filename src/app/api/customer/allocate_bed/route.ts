import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import localizedFormat from "dayjs/plugin/localizedFormat";
import { z } from "zod";
import { connectToDatabase } from "@/server/db";
import BedModel from "@/server/models/bed";
import CustomerModel from "@/server/models/customer";
import { requireAuth } from "@/server/auth";
import { uploadFile } from "@/server/cloudinary";
import { handleError, HttpError, json } from "@/server/http";
import { getHtmlContent } from "@/server/invoices";

dayjs.extend(utc);
dayjs.extend(localizedFormat);

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const FieldsSchema = z.object({
  number: z.string().min(1, "Phone number is required"),
  bed: z.string().min(1, "Bed is required"),
  name: z.string().optional(),
  email: z.string().email().optional().or(z.literal("")),
  age: z.coerce.number().optional(),
  period: z.enum(["Day", "Month"]).optional(),
  purpose: z.string().optional(),
  paymentType: z.enum(["UPI", "Cash", "Not Paid"]).optional(),
});

function requireImage(form: FormData, key: string): File {
  const value = form.get(key);
  if (!(value instanceof File) || value.size === 0) {
    throw new HttpError(400, `${key} image is required`);
  }
  if (!value.type.startsWith("image/")) {
    throw new HttpError(400, `${key} must be an image`);
  }
  return value;
}

export async function POST(req: Request) {
  try {
    requireAuth();
    const form = await req.formData();

    const fields = FieldsSchema.parse({
      number: form.get("number"),
      bed: form.get("bed"),
      name: form.get("name") ?? undefined,
      email: form.get("email") ?? undefined,
      age: form.get("age") ?? undefined,
      period: form.get("period") ?? undefined,
      purpose: form.get("purpose") ?? undefined,
      paymentType: form.get("paymentType") ?? undefined,
    });

    const photoFile = requireImage(form, "photo");
    const aadharFrontFile = requireImage(form, "aadharFront");
    const aadharBackFile = requireImage(form, "aadharBack");

    await connectToDatabase();

    const existingBed = await BedModel.findOne({ bed: fields.bed });
    if (!existingBed) throw new HttpError(404, "Bed not found");
    if (existingBed.isOccupied) throw new HttpError(409, "Bed is already occupied");

    // Upload the three images in parallel.
    const [photo, aadharFront, aadharBack] = await Promise.all([
      uploadFile(photoFile),
      uploadFile(aadharFrontFile),
      uploadFile(aadharBackFile),
    ]);

    const customer = await CustomerModel.create({
      ...fields,
      email: fields.email || undefined,
      photo,
      aadharFront,
      aadharBack,
      bed: existingBed._id,
    });

    existingBed.isOccupied = true;
    existingBed.customer = customer._id as typeof existingBed.customer;
    existingBed.occupiedDate = new Date();
    await existingBed.save();

    const customersCount = await CustomerModel.countDocuments();

    const invoiceData = {
      product: {
        title: existingBed.type === "AC" ? "AC BED" : "Regular Bed",
        description: `BED ${existingBed.bed}(${existingBed.type})`,
        quantity: 1,
        price: 200,
      },
      status: "paid",
      dueDate: dayjs().utcOffset(330).format("YYYY-MM-DD hh:mm:ss A"),
      invoiceTo: { name: customer.name, address: "", phone: customer.number },
      createDate: dayjs().utcOffset(330).format("YYYY-MM-DD hh:mm:ss A"),
      invoiceFrom: {
        name: "Sri vijayalakshmi A/C Dormitary, Tanuku, 534210",
        phone: "9876643328",
      },
      invoiceNumber: customersCount,
      subTotalPrice: 200,
      totalPrice: 300,
      discount: 0.0,
      taxes: 0.0,
    };

    return json({
      message: "Bed allocated successfully",
      bed: existingBed,
      customer,
      invoice: {
        html: getHtmlContent(invoiceData),
        filename: `${customer.name || "guest"}-checkin-${Date.now()}.pdf`,
      },
    });
  } catch (error) {
    return handleError(error);
  }
}
