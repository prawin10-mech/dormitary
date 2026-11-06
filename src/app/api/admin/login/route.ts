import bcrypt from "bcryptjs";
import { z } from "zod";
import { connectToDatabase } from "@/server/db";
import AdminModel from "@/server/models/admin";
import { signToken, authCookieOptions, COOKIE_NAME } from "@/server/auth";
import { parseBody, handleError, HttpError, json } from "@/server/http";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const LoginSchema = z.object({
  email: z.string().email().toLowerCase(),
  password: z.string().min(1),
});

export async function POST(req: Request) {
  try {
    const { email, password } = await parseBody(req, LoginSchema);
    await connectToDatabase();

    const admin = await AdminModel.findOne({ email }).select("+password");
    if (!admin) throw new HttpError(401, "Invalid email or password");

    const isMatch = await bcrypt.compare(password, admin.password);
    if (!isMatch) throw new HttpError(401, "Invalid email or password");

    const token = signToken({ adminId: admin._id.toString(), role: admin.role });

    const safeAdmin = admin.toObject();
    delete (safeAdmin as { password?: string }).password;

    const res = json({ message: "Logged in successfully", admin: safeAdmin });
    res.cookies.set(COOKIE_NAME, token, authCookieOptions());
    return res;
  } catch (error) {
    return handleError(error);
  }
}
