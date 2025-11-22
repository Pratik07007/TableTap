import { NextResponse, NextRequest } from "next/server";
import { cookies } from "next/headers";
export async function proxy(request: NextRequest) {
  const cookieStore = await cookies();
  const token = cookieStore.get("token")?.value;
  const { pathname } = request.nextUrl;

  if (
    (token &&
      (pathname === "/login" ||
        pathname === "/register" ||
        pathname === "/verify-email" ||
        pathname === "/reset-password")) ||
    pathname === "/forgot-password"
  ) {
    return NextResponse.redirect(new URL("/", request.url));
  }
  if (pathname === "/dashboard") {
    if (!token) {
      return NextResponse.redirect(new URL("/login", request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/login",
    "/register",
    "/verify-email",
    "/reset-password",
    "/forgot-password",
    "/dashboard",
  ],
};
