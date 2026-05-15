import { NextRequest, NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";
import { hasRequiredRole, roles } from "@/lib/permissions";

export async function middleware(req: NextRequest) {
  const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });
  const isLoggedIn = Boolean(token);
  const role = typeof token?.role === "string" ? token.role : undefined;
  const pathname = req.nextUrl.pathname;

  if (!isLoggedIn) {
    const loginUrl = new URL("/login", req.nextUrl.origin);
    // Keep the full path + query so users return to the exact page they asked for.
    const callbackPath = `${pathname}${req.nextUrl.search}`;
    loginUrl.searchParams.set("callbackUrl", callbackPath);
    return NextResponse.redirect(loginUrl);
  }

  if (pathname.startsWith("/admin") && !hasRequiredRole(role, roles.ADMIN)) {
    return NextResponse.redirect(new URL("/", req.nextUrl.origin));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*", "/profile/:path*", "/blog/create", "/blog/edit/:path*"]
};
