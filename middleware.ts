import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { isProtectedRoute } from "@/lib/auth/protectedRoutes";

export default auth((req) => {
  const { pathname } = req.nextUrl;

  if (!isProtectedRoute(pathname)) {
    return NextResponse.next();
  }

  if (!req.auth) {
    const loginUrl = new URL("/login", req.nextUrl.origin);
    loginUrl.searchParams.set("callbackUrl", pathname);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
});

export const config = {
  matcher: ["/dashboard/:path*", "/chores/:path*", "/members/:path*"],
};
