import { ROUTES, PUBLIC_ROUTES, PROTECTED_ROUTES } from "@/config/route";

import {
  DEFAULT_ROLE_ROUTE,
  ROLES,
  type UserRole,
} from "./roles";

function normalizePathname(pathname: string): string {
  if (!pathname || pathname === "/") {
    return "/";
  }

  return pathname.replace(/\/+$/, "");
}

function routeMatches(pathname: string, route: string): boolean {
  const normalizedPath = normalizePathname(pathname);
  const normalizedRoute = normalizePathname(route);

  return (
    normalizedPath === normalizedRoute ||
    normalizedPath.startsWith(`${normalizedRoute}/`)
  );
}

function routeMatchesAny(pathname: string, routes: readonly string[]): boolean {
  return routes.some((route) => routeMatches(pathname, route));
}

export interface RolePermissions {
  readonly role: UserRole;
  readonly homePath: string;
  readonly routes: readonly string[];
  readonly canManageUsers: boolean;
  readonly canManageRules: boolean;
  readonly canReviewPatients: boolean;
  readonly canReviewSummaries: boolean;
}

const PUBLIC_ACCESS_ROUTES = [...PUBLIC_ROUTES] as const;

const PATIENT_ACCESS_ROUTES = [
  ...PUBLIC_ACCESS_ROUTES,
  ...Object.values(ROUTES.PATIENT),
] as const;

const PHYSICIAN_ACCESS_ROUTES = [
  ...PUBLIC_ACCESS_ROUTES,
  ...Object.values(ROUTES.PHYSICIAN),
] as const;

const ADMIN_ACCESS_ROUTES = [
  ...PUBLIC_ACCESS_ROUTES,
  ...PROTECTED_ROUTES,
] as const;

export const ROLE_PERMISSIONS: Record<UserRole, RolePermissions> = {
  [ROLES.PATIENT]: {
    role: ROLES.PATIENT,
    homePath: DEFAULT_ROLE_ROUTE[ROLES.PATIENT],
    routes: PATIENT_ACCESS_ROUTES,
    canManageUsers: false,
    canManageRules: false,
    canReviewPatients: false,
    canReviewSummaries: false,
  },
  [ROLES.PHYSICIAN]: {
    role: ROLES.PHYSICIAN,
    homePath: DEFAULT_ROLE_ROUTE[ROLES.PHYSICIAN],
    routes: PHYSICIAN_ACCESS_ROUTES,
    canManageUsers: false,
    canManageRules: false,
    canReviewPatients: true,
    canReviewSummaries: true,
  },
  [ROLES.ADMIN]: {
    role: ROLES.ADMIN,
    homePath: DEFAULT_ROLE_ROUTE[ROLES.ADMIN],
    routes: ADMIN_ACCESS_ROUTES,
    canManageUsers: true,
    canManageRules: true,
    canReviewPatients: true,
    canReviewSummaries: true,
  },
};

export function getRolePermissions(role: UserRole): RolePermissions {
  return ROLE_PERMISSIONS[role];
}

export function getAccessibleRoutes(role: UserRole): readonly string[] {
  return ROLE_PERMISSIONS[role].routes;
}

export function canAccessRoute(role: UserRole, pathname: string): boolean {
  return routeMatchesAny(pathname, ROLE_PERMISSIONS[role].routes);
}

export function canAccessRouteGroup(
  role: UserRole,
  routes: readonly string[]
): boolean {
  return routes.some((route) => canAccessRoute(role, route));
}

export function canManageUsers(role: UserRole): boolean {
  return ROLE_PERMISSIONS[role].canManageUsers;
}

export function canManageRules(role: UserRole): boolean {
  return ROLE_PERMISSIONS[role].canManageRules;
}

export function canReviewPatients(role: UserRole): boolean {
  return ROLE_PERMISSIONS[role].canReviewPatients;
}

export function canReviewSummaries(role: UserRole): boolean {
  return ROLE_PERMISSIONS[role].canReviewSummaries;
}

export function canAccessAdminArea(role: UserRole): boolean {
  return role === ROLES.ADMIN;
}

export function isProtectedPath(pathname: string): boolean {
  return routeMatchesAny(pathname, PROTECTED_ROUTES);
}

export function isPublicPath(pathname: string): boolean {
  return routeMatchesAny(pathname, PUBLIC_ROUTES);
}
