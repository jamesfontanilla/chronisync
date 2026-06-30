"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm, type UseFormReturn } from "react-hook-form";

import { ROUTES } from "@/config/route";
import {
  AUTH_ROLE_OPTIONS,
  type AuthRole,
  getRoleHomePath,
  ROLES,
  type UserRole,
} from "@/lib/auth/roles";

import {
  forgotPasswordSchema,
  loginSchema,
  registerSchema,
  type ForgotPasswordFormData,
  type LoginFormData,
  type RegisterFormData,
} from "./validation";

export function useLoginForm(
  defaultRole: AuthRole = ROLES.PATIENT
): UseFormReturn<LoginFormData> {
  return useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
      role: defaultRole,
    },
    mode: "onSubmit",
  });
}

export function useRegisterForm(
  defaultRole: AuthRole = ROLES.PATIENT
): UseFormReturn<RegisterFormData> {
  return useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      fullName: "",
      email: "",
      password: "",
      confirmPassword: "",
      role: defaultRole,
    },
    mode: "onSubmit",
  });
}

export function useForgotPasswordForm(
  defaultEmail = ""
): UseFormReturn<ForgotPasswordFormData> {
  return useForm<ForgotPasswordFormData>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: {
      email: defaultEmail,
    },
    mode: "onSubmit",
  });
}

export function useAuthRoleOptions() {
  return AUTH_ROLE_OPTIONS;
}

export function useAuthSuccessPath(
  role: UserRole | null,
  fallback = ROUTES.AUTH.LOGIN
): string {
  if (!role) {
    return fallback;
  }

  return getRoleHomePath(role);
}
