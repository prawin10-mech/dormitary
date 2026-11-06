import { z } from "zod";
import { connectToDatabase } from "@/server/db";
import AdminModel from "@/server/models/admin";
import { requireAuth } from "@/server/auth";
import { parseBody, handleError, HttpError, json } from "@/server/http";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const TokenSchema = z.object({ token: z.string().min(1) });

export async function POST(req: Request) {
  try {
    const { adminId } = requireAuth();
    const { token } = await parseBody(req, TokenSchema);
    await connectToDatabase();

    const admin = await AdminModel.findByIdAndUpdate(
      adminId,
      { $addToSet: { fcmToken: token } },
      { new: true }
    ).select("-password");

    if (!admin) throw new HttpError(404, "Admin not found");

    return json({ message: "Token added successfully" });
  } catch (error) {
    return handleError(error);
  }
}
