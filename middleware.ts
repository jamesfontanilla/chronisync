import { NextRequest, NextResponse } from "next/server";

import { ROUTES, PROTECTED_ROUTES } from "./config/route";
import { DEFAULT_ROLE_ROUTE, isValidRole } from "./config/roles";

const ROLE_COOKIE_NAMES = [
  "chronisync-role",
  "user_role",
  "chronisync-user-role",
] as const;

const STATIC_PATHS = new Set([
  "/favicon.ico",
  "/robots.txt",
  "/sitemap.xml",
  "/manifest.json",
]);

function normalizePathname(pathname: string): string {
  if (pathname === "/") {
    return pathname;
  }

  return pathname.replace(/\/+$/, "");
}

function matchesRoute(pathname: string, route: string): boolean {
  if (route === "/") {
    return pathname === "/";
  }

  return pathname === route || pathname.startsWith(`${route}/`);
}

function matchesAnyRoute(pathname: string, routes: readonly string[]) {
  return routes.some((route) => matchesRoute(pathname, route));
}

function getRoleFromCookies(request: NextRequest) {
  for (const cookieName of ROLE_COOKIE_NAMES) {
    const cookieValue = request.cookies.get(cookieName)?.value;
    if (cookieValue && isValidRole(cookieValue)) {
      return cookieValue;
    }
  }

  return null;
}

function getDashboardPath(role: string): string | null {
  if (!isValidRole(role)) {
    return null;
  }

  return DEFAULT_ROLE_ROUTE[role];
}

function isAuthEntryRoute(pathname: string): boolean {
  return matchesAnyRoute(pathname, [
    ROUTES.AUTH.LOGIN,
    ROUTES.AUTH.REGISTER,
    ROUTES.AUTH.FORGOT_PASSWORD,
  ]);
}

function isProtectedRoute(pathname: string): boolean {
  return matchesAnyRoute(pathname, PROTECTED_ROUTES);
}

function isRoleAllowedForPath(pathname: string, role: string): boolean {
  if (role === "admin") {
    return true;
  }

  if (role === "patient") {
    return matchesAnyRoute(pathname, [
      ROUTES.PATIENT.DASHBOARD,
      ...Object.values(ROUTES.PATIENT),
    ]);
  }

  if (role === "physician") {
    return matchesAnyRoute(pathname, [
      ROUTES.PHYSICIAN.DASHBOARD,
      ...Object.values(ROUTES.PHYSICIAN),
    ]);
  }

  return false;
}

export function middleware(request: NextRequest) {
  const pathname = normalizePathname(request.nextUrl.pathname);

  if (
    pathname.startsWith("/_next/") ||
    pathname.startsWith("/api/") ||
    STATIC_PATHS.has(pathname)
  ) {
    return NextResponse.next();
  }

  const role = getRoleFromCookies(request);

  if (pathname === "/" && role) {
    const dashboardPath = getDashboardPath(role);
    if (dashboardPath) {
      return NextResponse.redirect(new URL(dashboardPath, request.url));
    }
  }

  if (isAuthEntryRoute(pathname) && role) {
    const dashboardPath = getDashboardPath(role);
    if (dashboardPath) {
      return NextResponse.redirect(new URL(dashboardPath, request.url));
    }
  }

  if (role && isProtectedRoute(pathname) && !isRoleAllowedForPath(pathname, role)) {
    const dashboardPath = getDashboardPath(role);
    if (dashboardPath) {
      return NextResponse.redirect(new URL(dashboardPath, request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|api|favicon.ico|robots.txt|sitemap.xml|manifest.json).*)",
  ],
};
