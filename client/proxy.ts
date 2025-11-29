import { NextResponse, NextRequest } from "next/server";
import { getSessionUser } from "./utils/getServerSession";

export async function proxy(request: NextRequest) {
  const { isLoggedIn, user } = await getSessionUser();
  const { pathname } = request.nextUrl;

  const authRoutes = [
    "/login",
    "/register",
    "/reset-password",
    "/resend-verification-email",
    "/verify-email",
    "/forgot-password",
  ];

  const protectedRoutes = ["/dashboard", "/menu"];
  const adminOnlyRoute = ["/menu", "register-resturant"];

  if (isLoggedIn && authRoutes.some((route) => pathname.startsWith(route))) {
    return NextResponse.redirect(new URL("/", request.url));
  }

  if (
    !isLoggedIn &&
    protectedRoutes.some((route) => pathname.startsWith(route))
  ) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  // Check admin-only routes
  if (
    isLoggedIn &&
    user?.role !== "ADMIN" &&
    adminOnlyRoute.some((route) => pathname.startsWith(route))
  ) {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  return NextResponse.next();
}
