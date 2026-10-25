import { NextResponse } from "next/server";
import { auth } from "@/auth";
import {
  isOnboardingRoute,
  userHasHouseholdContext,
} from "@/lib/auth/onboardingRoutes";
import { isProtectedRoute } from "@/lib/auth/protectedRoutes";

export default auth((req) => {
  const { pathname } = req.nextUrl;

  if (isOnboardingRoute(pathname)) {
    if (!req.auth) {
      const loginUrl = new URL("/login", req.nextUrl.origin);
      loginUrl.searchParams.set("callbackUrl", pathname);
      return NextResponse.redirect(loginUrl);
    }
    if (userHasHouseholdContext(req.auth.user)) {
      return NextResponse.redirect(new URL("/dashboard", req.nextUrl.origin));
    }
    return NextResponse.next();
  }

  if (!isProtectedRoute(pathname)) {
    return NextResponse.next();
  }

  if (!req.auth) {
    const loginUrl = new URL("/login", req.nextUrl.origin);
    loginUrl.searchParams.set("callbackUrl", pathname);
    return NextResponse.redirect(loginUrl);
  }

  if (!userHasHouseholdContext(req.auth.user)) {
    return NextResponse.redirect(new URL("/onboarding", req.nextUrl.origin));
  }

  return NextResponse.next();
});

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/chores/:path*",
    "/members/:path*",
    "/onboarding",
    "/onboarding/:path*",
  ],
};
