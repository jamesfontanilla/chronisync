/**
 * =============================================================================
 * ChroniSync
 * User Roles Configuration
 * =============================================================================
 */

/* -------------------------------------------------------------------------- */
/*                                 Roles                                      */
/* -------------------------------------------------------------------------- */

export const ROLES = {
  PATIENT: "patient",

  PHYSICIAN: "physician",

  ADMIN: "admin",
} as const;

export type UserRole = (typeof ROLES)[keyof typeof ROLES];

/* -------------------------------------------------------------------------- */
/*                             Role Labels                                    */
/* -------------------------------------------------------------------------- */

export const ROLE_LABELS: Record<UserRole, string> = {
  [ROLES.PATIENT]: "Patient",

  [ROLES.PHYSICIAN]: "Physician",

  [ROLES.ADMIN]: "Administrator",
};

/* -------------------------------------------------------------------------- */
/*                             Role Priorities                                */
/* -------------------------------------------------------------------------- */

export const ROLE_PRIORITY: Record<UserRole, number> = {
  [ROLES.PATIENT]: 1,

  [ROLES.PHYSICIAN]: 2,

  [ROLES.ADMIN]: 3,
};

/* -------------------------------------------------------------------------- */
/*                          Default Dashboard Routes                          */
/* -------------------------------------------------------------------------- */

export const DEFAULT_ROLE_ROUTE: Record<UserRole, string> = {
  [ROLES.PATIENT]: "/patient/dashboard",

  [ROLES.PHYSICIAN]: "/physician/dashboard",

  [ROLES.ADMIN]: "/admin/dashboard",
};

/* -------------------------------------------------------------------------- */
/*                               Helpers                                      */
/* -------------------------------------------------------------------------- */

export function isPatient(role: UserRole): boolean {
  return role === ROLES.PATIENT;
}

export function isPhysician(role: UserRole): boolean {
  return role === ROLES.PHYSICIAN;
}

export function isAdmin(role: UserRole): boolean {
  return role === ROLES.ADMIN;
}

export function isValidRole(role: string): role is UserRole {
  return Object.values(ROLES).includes(role as UserRole);
}