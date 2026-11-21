import { connectToDatabase } from "@/server/db";
import CustomerModel from "@/server/models/customer";
import { requireAuth } from "@/server/auth";
import { handleError, json } from "@/server/http";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(
  _req: Request,
  props: { params: Promise<{ number: string }> }
) {
  const params = await props.params;
  try {
    await requireAuth();
    await connectToDatabase();

    const number = params.number.replace(/\D/g, "").slice(-10) || params.number;
    const bookings = await CustomerModel.find({ number })
      .populate("bed")
      .sort({ createdAt: -1 })
      .lean();

    return json(bookings);
  } catch (error) {
    return handleError(error);
  }
}
