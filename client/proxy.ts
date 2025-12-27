import { NextResponse, NextRequest } from "next/server";
import jwt from "jsonwebtoken";
import { cookies } from "next/headers";

export async function proxy(request: NextRequest) {
  const cookieStore = await cookies();
  const token = cookieStore.get("token")?.value || "";
  const { pathname } = request.nextUrl;

  let isLoggedIn = false;
  let userRole = null;

  if (pathname.startsWith("/_next/") || pathname.startsWith("/api/")) {
    return NextResponse.next();
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as {
      id: string;
      role: "ADMIN" | "USER";
      name: string;
    };
    isLoggedIn = true;
    userRole = decoded.role;
  } catch {
    console.error("Error validaiting the permissions");
  }

  if (isLoggedIn && authRoutes.includes(pathname)) {
    return NextResponse.redirect(new URL("/", request.url));
  }

  if (!isLoggedIn && protectedRoutes.includes(pathname)) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  if (isLoggedIn && userRole !== "ADMIN" && adminOnlyRoute.includes(pathname)) {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }
  if (userRole === "ADMIN" && userOnlyRoute.includes(pathname)) {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  return NextResponse.next();
}

const authRoutes = [
  "/login",
  "/register",
  "/reset-password",
  "/resend-verification-email",
  "/verify-email",
  "/forgot-password",
];
const protectedRoutes = [
  "/dashboard",
  "/menu",
  "/register-resturant",
  "/update-resturant",
  "/orders-details",
  "/give-order",
  "/my-orders",
];

const userOnlyRoute = ["/give-order", "/my-orders"];
const adminOnlyRoute = ["/menu", "/register-resturant", "/update-resturant"];
