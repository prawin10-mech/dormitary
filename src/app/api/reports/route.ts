import { connectToDatabase } from "@/server/db";
import CustomerModel from "@/server/models/customer";
import { requireRole } from "@/server/auth";
import { handleError, HttpError, json } from "@/server/http";
import { PRICE_PER_BOOKING } from "@/lib/pricing";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const IST = "+05:30";
const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;
const MAX_RANGE_DAYS = 366;

/**
 * Bookings report for an inclusive IST date range.
 * GET /api/reports?from=YYYY-MM-DD&to=YYYY-MM-DD  (admin only)
 */
export async function GET(request: Request) {
  try {
    requireRole("ADMIN");

    const url = new URL(request.url);
    const from = url.searchParams.get("from") || "";
    const to = url.searchParams.get("to") || "";
    if (!DATE_RE.test(from) || !DATE_RE.test(to)) {
      throw new HttpError(400, "Pick a valid start and end date.");
    }

    const start = new Date(`${from}T00:00:00${IST}`);
    const end = new Date(`${to}T23:59:59.999${IST}`);
    if (isNaN(start.getTime()) || isNaN(end.getTime()) || start > end) {
      throw new HttpError(400, "The start date must be on or before the end date.");
    }
    if ((end.getTime() - start.getTime()) / 86_400_000 > MAX_RANGE_DAYS) {
      throw new HttpError(400, "Reports can cover at most one year at a time.");
    }

    await connectToDatabase();
    const customers = await CustomerModel.find(
      { createdAt: { $gte: start, $lte: end } },
      "name number period paymentType purpose createdAt checkOutAt bed"
    )
      .populate("bed", "bed type")
      .sort({ createdAt: -1 })
      .lean();

    const rows = customers.map((c: any) => ({
      id: String(c._id),
      name: c.name || "",
      number: c.number || "",
      bed: c.bed?.bed || "",
      type: c.bed?.type || "",
      period: c.period || "Day",
      paymentType: c.paymentType || "Not Paid",
      purpose: c.purpose || "",
      checkIn: c.createdAt,
      checkOut: c.checkOutAt,
      amount: PRICE_PER_BOOKING,
    }));

    const tally = (key: "paymentType" | "period" | "type") => {
      const m = new Map<string, { count: number; amount: number }>();
      for (const r of rows) {
        const k = r[key] || "Unknown";
        const cur = m.get(k) || { count: 0, amount: 0 };
        cur.count += 1;
        cur.amount += r.amount;
        m.set(k, cur);
      }
      return Array.from(m, ([label, v]) => ({ label, ...v })).sort(
        (a, b) => b.count - a.count
      );
    };

    const collected = rows
      .filter((r) => r.paymentType !== "Not Paid")
      .reduce((s, r) => s + r.amount, 0);
    const total = rows.reduce((s, r) => s + r.amount, 0);

    return json({
      from,
      to,
      summary: {
        bookings: rows.length,
        guests: new Set(rows.map((r) => r.number)).size,
        total,
        collected,
        pending: total - collected,
        pricePerBooking: PRICE_PER_BOOKING,
      },
      byPayment: tally("paymentType"),
      byPeriod: tally("period"),
      byBedType: tally("type"),
      rows,
    });
  } catch (error) {
    return handleError(error);
  }
}
