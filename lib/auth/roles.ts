import {
  DEFAULT_ROLE_ROUTE,
  ROLE_LABELS,
  ROLE_PRIORITY,
  ROLES,
  isValidRole,
  type UserRole,
} from "@/config/roles";

export { DEFAULT_ROLE_ROUTE, ROLE_LABELS, ROLE_PRIORITY, ROLES, isValidRole };
export type { UserRole };

export const AUTH_ROLE_VALUES = [
  ROLES.PATIENT,
  ROLES.PHYSICIAN,
] as const;

export type AuthRole = (typeof AUTH_ROLE_VALUES)[number];

export const AUTH_ROLE_OPTIONS = [
  {
    value: ROLES.PATIENT,
    label: ROLE_LABELS[ROLES.PATIENT],
    description:
      "Track medications, symptoms, and vitals for your own care plan.",
  },
  {
    value: ROLES.PHYSICIAN,
    label: ROLE_LABELS[ROLES.PHYSICIAN],
    description:
      "Review assigned patients, alerts, and shared treatment history.",
  },
] as const;

export const ROLE_COOKIE_NAME = "chronisync-role";

export const ROLE_COOKIE_ALIASES = [
  ROLE_COOKIE_NAME,
  "user_role",
  "chronisync-user-role",
] as const;

export const ROLE_STORAGE_KEY = ROLE_COOKIE_NAME;

export const ROLE_COOKIE_MAX_AGE_SECONDS = 60 * 60 * 24 * 30;

function hasBrowserStorage(): boolean {
  return (
    typeof window !== "undefined" &&
    typeof document !== "undefined"
  );
}

function isSecureContext(): boolean {
  return (
    typeof window !== "undefined" &&
    window.location.protocol === "https:"
  );
}

function readCookieValue(name: string): string | null {
  if (typeof document === "undefined") {
    return null;
  }

  const entry = document.cookie
    .split("; ")
    .find((cookie) => cookie.startsWith(`${name}=`));

  if (!entry) {
    return null;
  }

  return decodeURIComponent(entry.slice(name.length + 1));
}

function writeCookieValue(name: string, value: string): void {
  if (typeof document === "undefined") {
    return;
  }

  const cookieParts = [
    `${name}=${encodeURIComponent(value)}`,
    "Path=/",
    `Max-Age=${ROLE_COOKIE_MAX_AGE_SECONDS}`,
    "SameSite=Lax",
  ];

  if (isSecureContext()) {
    cookieParts.push("Secure");
  }

  document.cookie = cookieParts.join("; ");
}

function clearCookieValue(name: string): void {
  if (typeof document === "undefined") {
    return;
  }

  const cookieParts = [
    `${name}=`,
    "Path=/",
    "Max-Age=0",
    "SameSite=Lax",
  ];

  if (isSecureContext()) {
    cookieParts.push("Secure");
  }

  document.cookie = cookieParts.join("; ");
}

export function isAuthRole(role: string | null | undefined): role is AuthRole {
  return role === ROLES.PATIENT || role === ROLES.PHYSICIAN;
}

export function normalizeRole(role: string | null | undefined): UserRole | null {
  if (!role || !isValidRole(role)) {
    return null;
  }

  return role;
}

export function getRoleLabel(role: UserRole): string {
  return ROLE_LABELS[role];
}

export function getRoleHomePath(role: UserRole): string {
  return DEFAULT_ROLE_ROUTE[role];
}

export function getRoleCookie(): UserRole | null {
  for (const cookieName of ROLE_COOKIE_ALIASES) {
    const cookieValue = readCookieValue(cookieName);
    const normalizedRole = normalizeRole(cookieValue);

    if (normalizedRole) {
      return normalizedRole;
    }
  }

  if (hasBrowserStorage()) {
    const storedRole = window.localStorage.getItem(ROLE_STORAGE_KEY);
    const normalizedRole = normalizeRole(storedRole);

    if (normalizedRole) {
      return normalizedRole;
    }
  }

  return null;
}

export function setRoleCookie(role: UserRole): void {
  for (const cookieName of ROLE_COOKIE_ALIASES) {
    writeCookieValue(cookieName, role);
  }

  if (hasBrowserStorage()) {
    window.localStorage.setItem(ROLE_STORAGE_KEY, role);
  }
}

export function clearRoleCookie(): void {
  for (const cookieName of ROLE_COOKIE_ALIASES) {
    clearCookieValue(cookieName);
  }

  if (hasBrowserStorage()) {
    window.localStorage.removeItem(ROLE_STORAGE_KEY);
  }
}

export function persistRole(role: UserRole | null): void {
  if (role) {
    setRoleCookie(role);
    return;
  }

  clearRoleCookie();
}
