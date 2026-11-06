import bcrypt from "bcryptjs";
import { z } from "zod";
import { connectToDatabase } from "@/server/db";
import AdminModel from "@/server/models/admin";
import { parseBody, handleError, HttpError, json } from "@/server/http";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const RegisterSchema = z.object({
  name: z.string().min(1),
  email: z.string().email().toLowerCase(),
  password: z.string().min(6, "Password must be at least 6 characters"),
  role: z.enum(["ADMIN", "USER", "AGENT"]),
});

export async function POST(req: Request) {
  try {
    const body = await parseBody(req, RegisterSchema);
    await connectToDatabase();

    const existing = await AdminModel.findOne({ email: body.email });
    if (existing) throw new HttpError(409, "An account with this email already exists");

    const hashedPassword = await bcrypt.hash(body.password, 10);
    const admin = await AdminModel.create({ ...body, password: hashedPassword });

    const safeAdmin = admin.toObject();
    delete (safeAdmin as { password?: string }).password;

    return json({ message: "Account created successfully", admin: safeAdmin }, 201);
  } catch (error) {
    return handleError(error);
  }
}
