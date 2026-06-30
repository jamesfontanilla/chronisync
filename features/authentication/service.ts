import type { User as FirebaseUser } from "firebase/auth";

import {
  clearRoleCookie,
  getRoleCookie,
  persistRole,
  type UserRole,
} from "@/lib/auth/roles";
import {
  loginUser,
  logoutUser,
  registerUser,
  resetPassword,
} from "@/lib/firebase/auth";

import type {
  ForgotPasswordFormData,
  LoginFormData,
  RegisterFormData,
} from "./validation";

export interface AuthResult {
  user: FirebaseUser;
  role: UserRole;
}

export async function signInWithRole(
  values: LoginFormData
): Promise<AuthResult> {
  const user = await loginUser({
    email: values.email,
    password: values.password,
  });

  persistRole(values.role);

  return {
    user,
    role: values.role,
  };
}

export async function registerWithRole(
  values: RegisterFormData
): Promise<AuthResult> {
  const user = await registerUser(values);

  persistRole(values.role);

  return {
    user,
    role: values.role,
  };
}

export async function requestPasswordReset(
  values: ForgotPasswordFormData | string
): Promise<void> {
  const email = typeof values === "string" ? values : values.email;
  await resetPassword(email);
}

export async function signOutCurrentUser(): Promise<void> {
  await logoutUser();
  clearRoleCookie();
}

export function getStoredAuthRole(): UserRole | null {
  return getRoleCookie();
}

export function setStoredAuthRole(role: UserRole | null): void {
  persistRole(role);
}

export function clearStoredAuthRole(): void {
  clearRoleCookie();
}
