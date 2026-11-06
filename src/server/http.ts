import { NextResponse } from "next/server";
import { ZodError, ZodSchema } from "zod";

/** An error carrying an HTTP status, thrown from route handlers. */
export class HttpError extends Error {
  status: number;
  code?: string;
  constructor(status: number, message: string, code?: string) {
    super(message);
    this.status = status;
    this.code = code;
  }
}

export function json(data: unknown, status = 200) {
  return NextResponse.json(data, { status });
}

/**
 * Convert any thrown value into a safe JSON response. Validation and
 * known HttpErrors return helpful messages; everything else is logged
 * server-side and returned as a generic 500 so internals never leak.
 */
export function handleError(error: unknown) {
  if (error instanceof HttpError) {
    return json({ message: error.message, code: error.code }, error.status);
  }

  if (error instanceof ZodError) {
    return json(
      {
        message: "Validation failed",
        errors: error.flatten().fieldErrors,
      },
      400
    );
  }

  // Mongoose validation / duplicate-key errors.
  const anyErr = error as { name?: string; code?: number; message?: string };
  if (anyErr?.name === "ValidationError") {
    return json({ message: anyErr.message || "Validation failed" }, 400);
  }
  if (anyErr?.code === 11000) {
    return json({ message: "A record with that value already exists" }, 409);
  }

  console.error("[api] unhandled error:", error);
  return json({ message: "Something went wrong" }, 500);
}

/** Parse + validate a JSON request body against a Zod schema. */
export async function parseBody<T>(
  req: Request,
  schema: ZodSchema<T>
): Promise<T> {
  let raw: unknown;
  try {
    raw = await req.json();
  } catch {
    throw new HttpError(400, "Invalid JSON body");
  }
  return schema.parse(raw);
}
