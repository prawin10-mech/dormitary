import { connectToDatabase } from "@/server/db";
import { isCloudinaryConfigured } from "@/server/cloudinary";
import { isAuthConfigured } from "@/server/auth";
import { json } from "@/server/http";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * Operator-facing readiness check. Reports which server env vars are set and
 * whether the database is reachable, so a broken preview is diagnosable in
 * one request instead of guessing from a generic 500.
 */
export async function GET() {
  const checks = {
    database: process.env.MONGODB_URI ? "configured" : "missing",
    cloudinary: isCloudinaryConfigured() ? "configured" : "missing",
    auth: isAuthConfigured() ? "configured" : "missing",
    cronSecret: process.env.CRON_SECRET ? "configured" : "missing",
  } as Record<string, string>;

  let dbReachable = false;
  let dbError: string | undefined;
  if (checks.database === "configured") {
    try {
      await connectToDatabase();
      dbReachable = true;
    } catch (err) {
      dbError = err instanceof Error ? err.message : String(err);
    }
  }

  const ok =
    checks.database === "configured" &&
    checks.cloudinary === "configured" &&
    checks.auth === "configured" &&
    dbReachable;

  return json({ ok, checks, dbReachable, dbError }, ok ? 200 : 503);
}
