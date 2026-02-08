import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  const token = req.cookies.get("token")?.value;
  const role = req.cookies.get("role")?.value;

  const requiresAuth =
    pathname.startsWith("/user") ||
    pathname.startsWith("/home") ||
    pathname.startsWith("/movies") ||
    pathname.startsWith("/history");

  if (requiresAuth) {
    if (!token) {
      const url = req.nextUrl.clone();
      url.pathname = "/login";
      return NextResponse.redirect(url);
    }
  }

  if (pathname.startsWith("/admin")) {
    if (!token) {
      const url = req.nextUrl.clone();
      url.pathname = "/login";
      return NextResponse.redirect(url);
    }

    if (role !== "admin") {
      const url = req.nextUrl.clone();
      url.pathname = "/home"; // or "/"
      return NextResponse.redirect(url);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*", "/user/:path*", "/home/:path*", "/movies/:path*", "/history/:path*", "/home", "/movies", "/history"],
};
