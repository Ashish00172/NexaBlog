import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { hasRequiredRole, roles } from "@/lib/permissions";

export const proxy = auth((req) => {
  const isLoggedIn = Boolean(req.auth?.user);
  const role = typeof req.auth?.user?.role === "string" ? req.auth.user.role : undefined;
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
});

export const config = {
  matcher: ["/admin/:path*", "/profile/:path*", "/blog/create", "/blog/edit/:path*"]
};
