import { connectToDatabase } from "@/server/db";
import BedModel from "@/server/models/bed";
import { requireRole } from "@/server/auth";
import { BedTypes } from "@/server/bedTypes";
import { handleError, json } from "@/server/http";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * Create any beds that don't exist yet (1..40). Idempotent and ADMIN-only —
 * it never deletes or disturbs occupied beds.
 */
export async function POST() {
  try {
    requireRole("ADMIN");
    await connectToDatabase();

    const existing = await BedModel.find({}, "bed").lean();
    const existingSet = new Set(existing.map((b: any) => String(b.bed)));

    const toCreate = BedTypes.filter((bed) => !existingSet.has(bed)).map(
      (bed) => ({ bed, type: "AC" as const })
    );

    if (toCreate.length) await BedModel.insertMany(toCreate);

    return json({
      message: "Beds seeded successfully",
      created: toCreate.length,
    });
  } catch (error) {
    return handleError(error);
  }
}
