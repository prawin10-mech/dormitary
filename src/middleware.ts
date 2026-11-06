import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// Routes that require a signed-in admin.
const protectedPaths = ["/", "/history", "/user_history"];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const hasSession = Boolean(request.cookies.get("accessToken")?.value);

  // Signed-in users shouldn't see the login page.
  if (pathname === "/login" && hasSession) {
    return NextResponse.redirect(new URL("/", request.url));
  }

  // Gate protected pages. Real verification happens in the API routes;
  // this is a fast UX redirect based on cookie presence.
  if (protectedPaths.includes(pathname) && !hasSession) {
    const loginUrl = new URL("/login", request.url);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/", "/history", "/user_history", "/login"],
};
