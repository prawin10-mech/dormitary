import { connectToDatabase } from "@/server/db";
import CustomerModel from "@/server/models/customer";
import { requireAuth } from "@/server/auth";
import { handleError, json } from "@/server/http";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(
  _req: Request,
  { params }: { params: { number: string } }
) {
  try {
    requireAuth();
    await connectToDatabase();

    const bookings = await CustomerModel.find({ number: params.number })
      .populate("bed")
      .sort({ createdAt: -1 })
      .lean();

    return json(bookings);
  } catch (error) {
    return handleError(error);
  }
}
