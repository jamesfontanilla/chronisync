import assert from "node:assert/strict";
import test from "node:test";

import { ROUTES } from "@/config/route";
import { authCallbackSchema, authRoleSchema, forgotPasswordSchema, loginSchema, registerSchema } from "@/features/authentication/validation";
import {
  AUTH_ROLE_OPTIONS,
  AUTH_ROLE_VALUES,
  getRoleHomePath,
  getRoleLabel,
  isAuthRole,
  normalizeRole,
  ROLES,
} from "@/lib/auth/roles";
import {
  canAccessRoute,
  canManageRules,
  canManageUsers,
  canReviewPatients,
  getRolePermissions,
} from "@/lib/auth/permissions";
import {
  getAuthRedirectPath,
  getRedirectPathForRole,
  isAuthRoute,
  isProtectedRoute,
  isPublicRoute,
} from "@/lib/auth/guards";

test("role helpers and permissions line up with the route map", () => {
  assert.deepEqual([...AUTH_ROLE_VALUES], [ROLES.PATIENT, ROLES.PHYSICIAN]);
  assert.equal(AUTH_ROLE_OPTIONS[0]?.label, "Patient");
  assert.equal(AUTH_ROLE_OPTIONS[1]?.label, "Physician");
  assert.equal(isAuthRole("patient"), true);
  assert.equal(isAuthRole("admin"), false);
  assert.equal(normalizeRole("admin"), ROLES.ADMIN);
  assert.equal(getRoleLabel(ROLES.ADMIN), "Administrator");
  assert.equal(getRoleHomePath(ROLES.PATIENT), ROUTES.PATIENT.DASHBOARD);
  assert.equal(getRedirectPathForRole(ROLES.PHYSICIAN), ROUTES.PHYSICIAN.DASHBOARD);
  assert.equal(isAuthRoute(ROUTES.AUTH.LOGIN), true);
  assert.equal(isPublicRoute(ROUTES.AUTH.LOGIN), true);
  assert.equal(isProtectedRoute(ROUTES.ADMIN.SETTINGS), true);
  assert.equal(canAccessRoute(ROLES.ADMIN, ROUTES.ADMIN.USERS), true);
  assert.equal(canManageUsers(ROLES.ADMIN), true);
  assert.equal(canManageRules(ROLES.ADMIN), true);
  assert.equal(canReviewPatients(ROLES.PHYSICIAN), true);
  assert.equal(getAuthRedirectPath(ROUTES.ADMIN.DASHBOARD, null), ROUTES.AUTH.LOGIN);
  assert.equal(getRolePermissions(ROLES.PHYSICIAN).canReviewSummaries, true);
});

test("authentication schemas validate and normalize payloads", () => {
  const login = loginSchema.parse({
    email: "USER@Example.com",
    password: "Secret123",
    role: ROLES.PATIENT,
  });
  assert.equal(login.email, "user@example.com");
  assert.equal(login.role, ROLES.PATIENT);

  const register = registerSchema.parse({
    fullName: "Patient Example",
    email: "Patient@Example.com",
    password: "Secret123",
    confirmPassword: "Secret123",
    role: ROLES.PHYSICIAN,
  });
  assert.equal(register.email, "patient@example.com");

  const forgot = forgotPasswordSchema.parse({
    email: "RESET@Example.com",
  });
  assert.equal(forgot.email, "reset@example.com");

  const callback = authCallbackSchema.parse({
    status: "signed-in",
    role: ROLES.PHYSICIAN,
    email: "doctor@example.com",
    next: ROUTES.PHYSICIAN.DASHBOARD,
  });
  assert.equal(callback.status, "signed-in");
  assert.equal(callback.role, ROLES.PHYSICIAN);
  assert.equal(authRoleSchema.parse(ROLES.PATIENT), ROLES.PATIENT);
});
