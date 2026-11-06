import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import localizedFormat from "dayjs/plugin/localizedFormat";
import { connectToDatabase } from "@/server/db";
import BedModel from "@/server/models/bed";
import CustomerModel, { ICustomer } from "@/server/models/customer";
import { requireAuth } from "@/server/auth";
import { handleError, HttpError, json } from "@/server/http";
import { getCheckoutHtmlContent } from "@/server/invoices";

dayjs.extend(utc);
dayjs.extend(localizedFormat);

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(
  _req: Request,
  { params }: { params: { bedId: string } }
) {
  try {
    requireAuth();
    const { bedId } = params;
    if (!bedId) throw new HttpError(400, "Invalid or missing bedId");

    await connectToDatabase();

    const bed = await BedModel.findById(bedId).populate("customer");
    if (!bed) throw new HttpError(404, "Bed not found");

    const customer = bed.customer as unknown as ICustomer | undefined;
    if (!customer) throw new HttpError(404, "No customer is checked in on this bed");

    customer.checkOutAt = new Date();
    await customer.save();

    const date = dayjs();
    const customersCount = await CustomerModel.countDocuments();

    bed.isOccupied = false;
    bed.customer = undefined;
    await bed.save();

    const invoiceData = {
      product: {
        title: bed.type === "AC" ? "AC BED" : "Regular Bed",
        description: `BED ${bed.bed}(${bed.type})`,
        quantity: 1,
        price: 200,
      },
      status: "paid",
      dueDate: date.utcOffset(330).format("DD-MM-YYYY hh:mm:ss A"),
      invoiceTo: { name: customer.name, address: "", phone: customer.number },
      createDate: dayjs(bed.occupiedDate).utcOffset(330).format("DD-MM-YYYY hh:mm:ss"),
      checkoutDate: date.utcOffset(330).format("DD-MM-YYYY hh:mm:ss A"),
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

    return json({
      message: "Bed checked out successfully",
      bed,
      customer,
      invoice: {
        html: getCheckoutHtmlContent(invoiceData),
        filename: `${customer.name || "guest"}-checkout-${Date.now()}.pdf`,
      },
    });
  } catch (error) {
    return handleError(error);
  }
}
