import jwt from "jsonwebtoken";
import { cookies } from "next/headers";
import { HttpError } from "./http";

export const COOKIE_NAME = "accessToken";

export interface AuthPayload {
  adminId: string;
  role: "ADMIN" | "USER" | "AGENT";
}

function getSecret(): string {
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    throw new Error("JWT_SECRET is not set. Add it to your .env.local file.");
  }
  return secret;
}

export function signToken(payload: AuthPayload): string {
  const expiresIn = process.env.JWT_EXPIRES_IN || "7d";
  return jwt.sign(payload, getSecret(), { expiresIn });
}

export function verifyToken(token: string): AuthPayload {
  return jwt.verify(token, getSecret()) as AuthPayload;
}

/** Options for the auth cookie. httpOnly keeps the token out of reach of JS/XSS. */
export function authCookieOptions() {
  const sevenDays = 60 * 60 * 24 * 7;
  return {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax" as const,
    path: "/",
    maxAge: sevenDays,
  };
}

/** Read and verify the current admin from the request cookie. Returns null if absent/invalid. */
export function getAuth(): AuthPayload | null {
  const token = cookies().get(COOKIE_NAME)?.value;
  if (!token) return null;
  try {
    return verifyToken(token);
  } catch {
    return null;
  }
}

/** Like getAuth but throws a 401 when there is no valid session. */
export function requireAuth(): AuthPayload {
  const auth = getAuth();
  if (!auth) throw new HttpError(401, "Not authenticated");
  return auth;
}

/** Throws 403 unless the current session has one of the allowed roles. */
export function requireRole(...roles: AuthPayload["role"][]): AuthPayload {
  const auth = requireAuth();
  if (!roles.includes(auth.role)) {
    throw new HttpError(403, "You do not have access to this resource");
  }
  return auth;
}
