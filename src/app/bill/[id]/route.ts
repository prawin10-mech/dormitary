import mongoose from "mongoose";
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import { connectToDatabase } from "@/server/db";
import CustomerModel from "@/server/models/customer";
import { getHtmlContent } from "@/server/invoices";

dayjs.extend(utc);

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * Public, viewable bill for a booking. Shared with the guest over WhatsApp as a
 * link; they can open it in any browser and print / save it as a PDF. The id is
 * the customer's Mongo ObjectId (not enumerable), so no login is required.
 */
export async function GET(
  _req: Request,
  { params }: { params: { id: string } }
) {
  if (!mongoose.Types.ObjectId.isValid(params.id)) {
    return new Response("Bill not found", { status: 404 });
  }

  try {
    await connectToDatabase();
    const customer: any = await CustomerModel.findById(params.id)
      .populate("bed")
      .lean();

    if (!customer) {
      return new Response("Bill not found", { status: 404 });
    }

    const bed = customer.bed || {};
    const when = dayjs(customer.createdAt || new Date()).utcOffset(330);

    const invoiceData = {
      product: {
        title: bed.type === "AC" ? "AC BED" : "Regular Bed",
        description: `BED ${bed.bed ?? "-"}(${bed.type ?? "-"})`,
        quantity: 1,
        price: 200,
      },
      status: "paid",
      dueDate: when.format("YYYY-MM-DD hh:mm:ss A"),
      invoiceTo: {
        name: customer.name || "Guest",
        address: "",
        phone: customer.number || "",
      },
      createDate: when.format("YYYY-MM-DD hh:mm:ss A"),
      invoiceFrom: {
        name: "Sri vijayalakshmi A/C Dormitary, Tanuku, 534210",
        phone: "9876543210",
      },
      invoiceNumber: String(customer._id).slice(-6).toUpperCase(),
      subTotalPrice: 200,
      totalPrice: 300,
      discount: 0.0,
      taxes: 0.0,
    };

    return new Response(getHtmlContent(invoiceData), {
      headers: {
        "content-type": "text/html; charset=utf-8",
        "cache-control": "no-store",
      },
    });
  } catch {
    return new Response("Something went wrong", { status: 500 });
  }
}
