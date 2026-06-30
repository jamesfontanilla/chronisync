import { ROUTES, PUBLIC_ROUTES, PROTECTED_ROUTES } from "@/config/route";

import { canAccessRoute } from "./permissions";
import {
  getRoleHomePath,
  normalizeRole,
  type UserRole,
} from "./roles";

function normalizePathname(pathname: string): string {
  if (!pathname || pathname === "/") {
    return "/";
  }

  return pathname.replace(/\/+$/, "");
}

function matchesRoute(pathname: string, route: string): boolean {
  const normalizedPath = normalizePathname(pathname);
  const normalizedRoute = normalizePathname(route);

  return (
    normalizedPath === normalizedRoute ||
    normalizedPath.startsWith(`${normalizedRoute}/`)
  );
}

function matchesAnyRoute(pathname: string, routes: readonly string[]): boolean {
  return routes.some((route) => matchesRoute(pathname, route));
}

export function isHomeRoute(pathname: string): boolean {
  return normalizePathname(pathname) === ROUTES.HOME;
}

export function isAuthRoute(pathname: string): boolean {
  return matchesAnyRoute(pathname, [
    ROUTES.AUTH.LOGIN,
    ROUTES.AUTH.REGISTER,
    ROUTES.AUTH.FORGOT_PASSWORD,
    ROUTES.AUTH.CALLBACK,
  ]);
}

export function isPublicRoute(pathname: string): boolean {
  return matchesAnyRoute(pathname, PUBLIC_ROUTES);
}

export function isProtectedRoute(pathname: string): boolean {
  return matchesAnyRoute(pathname, PROTECTED_ROUTES);
}

export function getRoleHomeRoute(role: UserRole): string {
  return getRoleHomePath(role);
}

export function getRedirectPathForRole(role: UserRole | null): string {
  if (!role) {
    return ROUTES.AUTH.LOGIN;
  }

  return getRoleHomeRoute(role);
}

export function getAuthRedirectPath(
  pathname: string,
  role: UserRole | null
): string | null {
  const normalizedPath = normalizePathname(pathname);

  if (!role) {
    if (isProtectedRoute(normalizedPath)) {
      return ROUTES.AUTH.LOGIN;
    }

    return null;
  }

  if (isHomeRoute(normalizedPath) || isAuthRoute(normalizedPath)) {
    return getRoleHomeRoute(role);
  }

  if (!canAccessRoute(role, normalizedPath)) {
    return getRoleHomeRoute(role);
  }

  return null;
}

export function resolveRoleFromInput(
  input: string | null | undefined
): UserRole | null {
  return normalizeRole(input);
}

export function shouldRedirectAuthenticatedUser(
  pathname: string,
  role: UserRole | null
): boolean {
  return Boolean(getAuthRedirectPath(pathname, role));
}

export function getRedirectTarget(
  pathname: string,
  role: UserRole | null
): string | null {
  return getAuthRedirectPath(pathname, role);
}
