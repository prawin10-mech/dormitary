import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Define public and restricted paths
  const publicPaths = ["/login"];
  const restrictedPaths = ["/dashboard", "/profile"]; // Add restricted routes if needed

  // Retrieve token from cookies
  const token = request.cookies.get("accessToken")?.value || "";

  // Redirect logged-in users away from the login page
  if (pathname === "/login" && token) {
    return NextResponse.redirect(new URL("/", request.url));
  }

  // Redirect unauthenticated users away from restricted routes
  if (restrictedPaths.includes(pathname) && !token) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  return NextResponse.next();
}

export const config = {
  // Define the list of paths
  matcher: [
    "/",
    "/dashboard",
    "/dashboard/products",
    "/dashboard/products/:id",
    "/dashboard/products/add_product",
    "/dashboard/products/edit_product/:id",
    "/dashboard/users",
    "/dashboard/users/:id",
    "/dashboard/users/add_user",
    "/dashboard/users/edit_user/:id",
    "/login",
    "/signup",
    "/add_product",
  ],
};
