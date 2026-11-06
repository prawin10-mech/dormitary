import { connectToDatabase } from "@/server/db";
import BedModel from "@/server/models/bed";
import { ICustomer } from "@/server/models/customer";
import { handleError, HttpError, json } from "@/server/http";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * Free any bed whose occupant's check-out time has passed. Replaces the old
 * Agenda job (serverless functions can't hold a long-lived scheduler).
 *
 * Protect with a secret: configure Vercel Cron to call this route and set
 * CRON_SECRET, then it must arrive as `Authorization: Bearer <CRON_SECRET>`.
 */
export async function GET(req: Request) {
  try {
    const secret = process.env.CRON_SECRET;
    if (secret) {
      const auth = req.headers.get("authorization");
      if (auth !== `Bearer ${secret}`) throw new HttpError(401, "Unauthorized");
    }

    await connectToDatabase();
    const now = new Date();

    const occupiedBeds = await BedModel.find({ isOccupied: true }).populate("customer");
    let freed = 0;

    for (const bed of occupiedBeds) {
      const customer = bed.customer as unknown as ICustomer | undefined;
      if (customer?.checkOutAt && new Date(customer.checkOutAt) <= now) {
        bed.isOccupied = false;
        bed.customer = undefined;
        await bed.save();
        freed++;
      }
    }

    return json({ message: "Expired beds released", freed });
  } catch (error) {
    return handleError(error);
  }
}
