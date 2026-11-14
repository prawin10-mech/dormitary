import { connectToDatabase } from "@/server/db";
import CustomerModel from "@/server/models/customer";
import { requireAuth } from "@/server/auth";
import { handleError, HttpError, json } from "@/server/http";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(
  _req: Request,
  { params }: { params: { number: string } }
) {
  try {
    requireAuth();
    await connectToDatabase();

    const number = params.number.replace(/\D/g, "").slice(-10) || params.number;
    const customer = await CustomerModel.findOne({ number })
      .sort({ createdAt: -1 })
      .populate("bed")
      .lean();

    if (!customer) throw new HttpError(404, "Customer not found");

    return json({ message: "Details fetched successfully", customer });
  } catch (error) {
    return handleError(error);
  }
}
