import { PRICE_PER_BOOKING } from "@/lib/pricing";
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
/** Toolbar on the public bill page: Download PDF + Print. Hidden when printing. */
function withDownloadBar(html: string, customerId: string): string {
  const bar = `
  <div id="bill-actions" style="max-width:760px;margin:0 auto 12px;display:flex;gap:8px;justify-content:flex-end">
    <a href="/bill/${customerId}/download" style="display:inline-flex;align-items:center;gap:6px;background:#4f46e5;color:#fff;font-weight:600;font-size:14px;padding:10px 16px;border-radius:12px;text-decoration:none">
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
      Download PDF
    </a>
    <button type="button" onclick="window.print()" style="background:#fff;color:#334155;font-weight:600;font-size:14px;padding:10px 16px;border-radius:12px;border:1px solid #cbd5e1;cursor:pointer">Print</button>
  </div>
  <style>@media print { #bill-actions { display:none !important } }</style>`;
  return html.replace(/(<body[^>]*>)/, `$1${bar}`);
}

export async function GET(
  req: Request,
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
        price: PRICE_PER_BOOKING,
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
        phone: "9876643328",
      },
      invoiceNumber: String(customer._id).slice(-6).toUpperCase(),
      subTotalPrice: 200,
      totalPrice: 300,
      discount: 0.0,
      taxes: 0.0,
    };

    // ?embed=1 returns the plain bill for in-app PDF rendering (no toolbar).
    const embed = new URL(req.url).searchParams.get("embed") === "1";
    const html = getHtmlContent(invoiceData);
    return new Response(embed ? html : withDownloadBar(html, String(customer._id)), {
      headers: {
        "content-type": "text/html; charset=utf-8",
        "cache-control": "no-store",
      },
    });
  } catch {
    return new Response("Something went wrong", { status: 500 });
  }
}
