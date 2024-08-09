import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Define public paths
  const publicPaths = ["/login"];

  // Retrieve token from cookies
  const token = request.cookies.get("accessToken")?.value || "";

  // Check if the current path is a public path
  const isPublicPath = publicPaths.includes(pathname);

  // Check authentication and redirect accordingly
  //   if (token && pathname === "/") {
  //     return NextResponse.redirect(new URL("/", request.nextUrl));
  //   }

  if (isPublicPath && token) {
    return NextResponse.redirect(new URL("/", request.nextUrl));
  }

  if (!isPublicPath && !token) {
    return NextResponse.redirect(new URL("/login", request.nextUrl));
  }

  // If the request doesn't match any condition, proceed as usual
  return NextResponse.next();
}

// Define paths for which this middleware should be applied
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
