import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// Define user roles
export type UserRole = "student" | "college_admin" | "company_admin";

// Mock function to get user role from session/cookie
// In production, this would verify JWT/session tokens
function getUserRole(request: NextRequest): UserRole | null {
  // Check for role in cookies (set during login)
  const roleCookie = request.cookies.get("user_role");

  if (roleCookie) {
    return roleCookie.value as UserRole;
  }

  // For development, allow test routes to set role via query param
  const url = new URL(request.url);
  const testRole = url.searchParams.get("_role");
  if (testRole && ["student", "college_admin", "company_admin"].includes(testRole)) {
    return testRole as UserRole;
  }

  return null;
}

// Define route access rules
const routeAccessRules: Record<string, UserRole[]> = {
  "/admin/college": ["college_admin"],
  "/admin/company": ["company_admin"],
  "/dashboard": ["student"],
  "/assessments": ["student"],
  "/leaderboard": ["student"],
  "/opportunities": ["student"],
  "/profile": ["student"],
  "/settings": ["student"],
};

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Skip middleware for static files, API routes, and auth pages
  if (
    pathname.startsWith("/_next") ||
    pathname.startsWith("/api") ||
    pathname.startsWith("/login") ||
    pathname.startsWith("/signup") ||
    pathname.startsWith("/forgot-password") ||
    pathname.startsWith("/reset-password") ||
    pathname.startsWith("/verify-email") ||
    pathname.startsWith("/onboarding") ||
    pathname === "/" ||
    pathname.includes(".")
  ) {
    return NextResponse.next();
  }

  const userRole = getUserRole(request);

  // If no role (not logged in), redirect to login
  if (!userRole) {
    // For now, allow access in development mode
    // In production, uncomment the redirect:
    // const loginUrl = new URL("/login", request.url);
    // loginUrl.searchParams.set("redirect", pathname);
    // return NextResponse.redirect(loginUrl);
    return NextResponse.next();
  }

  // Check if user has access to the requested route
  for (const [routePrefix, allowedRoles] of Object.entries(routeAccessRules)) {
    if (pathname.startsWith(routePrefix)) {
      if (!allowedRoles.includes(userRole)) {
        // Redirect to appropriate dashboard based on role
        let redirectPath = "/";
        switch (userRole) {
          case "student":
            redirectPath = "/dashboard";
            break;
          case "college_admin":
            redirectPath = "/admin/college";
            break;
          case "company_admin":
            redirectPath = "/admin/company";
            break;
        }

        // Don't redirect if already going to the correct place
        if (pathname !== redirectPath) {
          return NextResponse.redirect(new URL(redirectPath, request.url));
        }
      }
      break;
    }
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
