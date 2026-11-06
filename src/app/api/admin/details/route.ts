import { connectToDatabase } from "@/server/db";
import AdminModel from "@/server/models/admin";
import { requireAuth } from "@/server/auth";
import { handleError, HttpError, json } from "@/server/http";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const { adminId } = requireAuth();
    await connectToDatabase();

    const admin = await AdminModel.findById(adminId).select("-password").lean();
    if (!admin) throw new HttpError(404, "Admin not found");

    return json({ message: "Admin fetched successfully", admin });
  } catch (error) {
    return handleError(error);
  }
}
