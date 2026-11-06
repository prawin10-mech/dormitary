import { connectToDatabase } from "@/server/db";
import BedModel from "@/server/models/bed";
import { requireAuth } from "@/server/auth";
import { handleError, json } from "@/server/http";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const { role } = requireAuth();
    await connectToDatabase();

    // Non-admins never receive the occupant's sensitive ID documents.
    const customerFields =
      role !== "ADMIN" ? "-photo -aadharFront -aadharBack" : "";

    const beds = await BedModel.find()
      .populate({ path: "customer", select: customerFields })
      .lean();

    // Numeric order (1,2,3,…) rather than lexicographic (1,10,11,…2).
    beds.sort((a: any, b: any) => Number(a.bed) - Number(b.bed));

    return json({ message: "Beds fetched successfully", beds });
  } catch (error) {
    return handleError(error);
  }
}
