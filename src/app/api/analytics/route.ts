import { connectToDatabase } from "@/server/db";
import BedModel from "@/server/models/bed";
import CustomerModel from "@/server/models/customer";
import { requireRole } from "@/server/auth";
import { handleError, json } from "@/server/http";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const PRICE_PER_BOOKING = 300; // flat tariff used on the invoice
const TZ = "+05:30";

export async function GET() {
  try {
    requireRole("ADMIN");
    await connectToDatabase();

    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const since = new Date(now);
    since.setDate(now.getDate() - 13);
    since.setHours(0, 0, 0, 0);

    const [totalBookings, monthBookings, beds, paymentAgg, periodAgg, dailyAgg] =
      await Promise.all([
        CustomerModel.countDocuments(),
        CustomerModel.countDocuments({ createdAt: { $gte: startOfMonth } }),
        BedModel.find({}, "isOccupied type").lean(),
        CustomerModel.aggregate([
          { $group: { _id: "$paymentType", count: { $sum: 1 } } },
        ]),
        CustomerModel.aggregate([
          { $group: { _id: "$period", count: { $sum: 1 } } },
        ]),
        CustomerModel.aggregate([
          { $match: { createdAt: { $gte: since } } },
          {
            $group: {
              _id: {
                $dateToString: {
                  format: "%Y-%m-%d",
                  date: "$createdAt",
                  timezone: TZ,
                },
              },
              count: { $sum: 1 },
            },
          },
        ]),
      ]);

    const totalBeds = beds.length;
    const occupied = beds.filter((b: any) => b.isOccupied).length;
    const acBeds = beds.filter((b: any) => b.type === "AC").length;
    const occupancyPct = totalBeds ? Math.round((occupied / totalBeds) * 100) : 0;

    // Normalise the breakdown aggregations into { label, count }.
    const toBreakdown = (rows: any[], fallback = "Unknown") =>
      rows
        .map((r) => ({ label: r._id || fallback, count: r.count }))
        .sort((a, b) => b.count - a.count);

    // Fill the 14-day window with zeros for days that had no bookings.
    const dailyMap = new Map<string, number>(
      dailyAgg.map((d: any) => [d._id, d.count])
    );
    const daily: { date: string; label: string; count: number }[] = [];
    for (let i = 13; i >= 0; i--) {
      const d = new Date(now);
      d.setDate(now.getDate() - i);
      const key = d.toLocaleDateString("en-CA", { timeZone: "Asia/Kolkata" }); // YYYY-MM-DD
      daily.push({
        date: key,
        label: d.toLocaleDateString("en-GB", {
          day: "2-digit",
          month: "short",
          timeZone: "Asia/Kolkata",
        }),
        count: dailyMap.get(key) || 0,
      });
    }

    return json({
      kpis: {
        totalBookings,
        monthBookings,
        occupied,
        totalBeds,
        available: totalBeds - occupied,
        occupancyPct,
        acBeds,
        revenue: totalBookings * PRICE_PER_BOOKING,
        monthRevenue: monthBookings * PRICE_PER_BOOKING,
        pricePerBooking: PRICE_PER_BOOKING,
      },
      daily,
      payment: toBreakdown(paymentAgg, "Not Paid"),
      period: toBreakdown(periodAgg, "Day"),
    });
  } catch (error) {
    return handleError(error);
  }
}
