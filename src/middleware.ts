import { getToken } from "next-auth/jwt";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// Define protected route patterns
const COMPANY_ROUTES = ["/admin/company", "/company"];
const COLLEGE_ROUTES = ["/admin/college", "/college"];
const STUDENT_ROUTES = ["/dashboard", "/assessments", "/leaderboard", "/opportunities", "/profile"];
const AUTH_ROUTES = ["/login", "/signup", "/forgot-password", "/reset-password", "/verify-email"];
const PUBLIC_ROUTES = ["/", "/about", "/contact", "/terms", "/privacy", "/join"];

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Skip middleware for static files and API routes
  if (
    pathname.startsWith("/_next") ||
    pathname.startsWith("/api") ||
    pathname.includes(".") ||
    pathname.startsWith("/onboarding")
  ) {
    return NextResponse.next();
  }

  // Allow public routes
  if (PUBLIC_ROUTES.some((route) => pathname === route || pathname.startsWith(`${route}/`))) {
    // Special case for /join routes - they need to be public
    if (pathname.startsWith("/join")) {
      return NextResponse.next();
    }
    if (pathname === "/") {
      return NextResponse.next();
    }
  }

  // Get the session token
  const token = await getToken({
    req: request,
    secret: process.env.NEXTAUTH_SECRET,
  });

  // If user is on auth routes and already logged in, redirect to appropriate dashboard
  if (AUTH_ROUTES.some((route) => pathname.startsWith(route))) {
    if (token) {
      const userType = token.userType as string;
      const verificationStatus = token.verificationStatus as string;

      // If pending verification, show a pending page or just allow access to login
      if (verificationStatus === "PENDING") {
        return NextResponse.next();
      }

      // Redirect to appropriate dashboard
      switch (userType) {
        case "COMPANY":
          return NextResponse.redirect(new URL("/admin/company", request.url));
        case "COLLEGE_ADMIN":
          return NextResponse.redirect(new URL("/admin/college", request.url));
        case "PLATFORM_ADMIN":
          return NextResponse.redirect(new URL("/admin", request.url));
        default:
          return NextResponse.redirect(new URL("/dashboard", request.url));
      }
    }
    return NextResponse.next();
  }

  // For protected routes, check if user is logged in
  if (!token) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("redirect", pathname);
    return NextResponse.redirect(loginUrl);
  }

  const userType = token.userType as string;
  const verificationStatus = token.verificationStatus as string;

  // Check verification status for company and college routes
  if (verificationStatus === "PENDING") {
    // Redirect pending users to a pending approval page
    if (!pathname.startsWith("/pending-approval")) {
      return NextResponse.redirect(new URL("/pending-approval", request.url));
    }
    return NextResponse.next();
  }

  if (verificationStatus === "REJECTED") {
    // Redirect rejected users to a rejection page
    if (!pathname.startsWith("/account-rejected")) {
      return NextResponse.redirect(new URL("/account-rejected", request.url));
    }
    return NextResponse.next();
  }

  // Check company routes - require COMPANY userType and APPROVED status
  if (COMPANY_ROUTES.some((route) => pathname.startsWith(route))) {
    if (userType !== "COMPANY") {
      return NextResponse.redirect(new URL("/unauthorized", request.url));
    }
    return NextResponse.next();
  }

  // Check college routes - require COLLEGE_ADMIN userType and APPROVED status
  if (COLLEGE_ROUTES.some((route) => pathname.startsWith(route))) {
    if (userType !== "COLLEGE_ADMIN") {
      return NextResponse.redirect(new URL("/unauthorized", request.url));
    }
    return NextResponse.next();
  }

  // Check student routes - require STUDENT userType
  if (STUDENT_ROUTES.some((route) => pathname.startsWith(route))) {
    if (userType !== "STUDENT" && userType !== "PLATFORM_ADMIN") {
      // Non-students accessing student routes
      switch (userType) {
        case "COMPANY":
          return NextResponse.redirect(new URL("/admin/company", request.url));
        case "COLLEGE_ADMIN":
          return NextResponse.redirect(new URL("/admin/college", request.url));
        default:
          return NextResponse.redirect(new URL("/", request.url));
      }
    }
    return NextResponse.next();
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    "/((?!api|_next/static|_next/image|favicon.ico).*)",
  ],
};
