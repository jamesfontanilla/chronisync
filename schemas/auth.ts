/**
 * =============================================================================
 * ChroniSync
 * Auth Schemas
 * =============================================================================
 */

import { z } from "zod";

import { AUTH_ROLE_VALUES } from "@/lib/auth/roles";

const PASSWORD_REGEX = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/;

export const authRoleSchema = z.enum(AUTH_ROLE_VALUES);

export const interoperabilityStandardSchema = z.enum([
  "fhir",
  "openmrs",
]);

export const interoperabilityMappingStatusSchema = z.enum([
  "unmapped",
  "partial",
  "mapped",
]);

export const interoperabilityReferenceSchema = z.object({
  standard: interoperabilityStandardSchema,
  resourceType: z.string().trim().min(1, "Resource type is required."),
  resourceId: z.string().trim().min(1, "Resource ID is required."),
  identifier: z.string().trim().optional(),
  url: z.string().url().optional(),
});

export const interoperabilityProfileSchema = z.object({
  mappingStatus: interoperabilityMappingStatusSchema.default("mapped"),
  primaryStandard: interoperabilityStandardSchema.optional(),
  references: z.array(interoperabilityReferenceSchema).default([]),
  externalIds: z.record(z.string(), z.string()).default({}),
  lastMappedAt: z.coerce.date().optional(),
});

export const authUserSchema = z.object({
  uid: z.string().min(1, "User ID is required."),
  email: z.string().email().nullable(),
  displayName: z.string().nullable(),
  photoURL: z.string().url().nullable(),
  emailVerified: z.boolean(),
  interop: interoperabilityProfileSchema.optional(),
});

export type AuthUserData = z.infer<typeof authUserSchema>;

export const loginSchema = z.object({
  email: z
    .string()
    .trim()
    .min(1, "Email is required.")
    .email("Please enter a valid email address.")
    .toLowerCase(),
  password: z.string().min(1, "Password is required."),
  role: authRoleSchema,
});

export type LoginFormData = z.infer<typeof loginSchema>;

export const registerSchema = z
  .object({
    fullName: z
      .string()
      .trim()
      .min(2, "Full name must be at least 2 characters.")
      .max(100, "Full name is too long."),
    email: z
      .string()
      .trim()
      .min(1, "Email is required.")
      .email("Please enter a valid email address.")
      .toLowerCase(),
    password: z
      .string()
      .min(8, "Password must be at least 8 characters.")
      .regex(
        PASSWORD_REGEX,
        "Password must contain at least one uppercase letter, one lowercase letter, and one number."
      ),
    confirmPassword: z.string().min(1, "Please confirm your password."),
    role: authRoleSchema,
  })
  .refine((values) => values.password === values.confirmPassword, {
    path: ["confirmPassword"],
    message: "Passwords do not match.",
  });

export type RegisterFormData = z.infer<typeof registerSchema>;

export const forgotPasswordSchema = z.object({
  email: z
    .string()
    .trim()
    .min(1, "Email is required.")
    .email("Please enter a valid email address.")
    .toLowerCase(),
});

export type ForgotPasswordFormData = z.infer<
  typeof forgotPasswordSchema
>;

export const resetPasswordSchema = z
  .object({
    password: z
      .string()
      .min(8, "Password must be at least 8 characters.")
      .regex(
        PASSWORD_REGEX,
        "Password must contain at least one uppercase letter, one lowercase letter, and one number."
      ),
    confirmPassword: z.string().min(1, "Please confirm your password."),
  })
  .refine((values) => values.password === values.confirmPassword, {
    path: ["confirmPassword"],
    message: "Passwords do not match.",
  });

export type ResetPasswordFormData = z.infer<
  typeof resetPasswordSchema
>;

export const authCallbackStatusSchema = z.enum([
  "signed-in",
  "registered",
  "reset-sent",
  "verification-sent",
  "error",
]);

export const authCallbackSchema = z.object({
  status: authCallbackStatusSchema.optional(),
  role: authRoleSchema.optional(),
  email: z
    .string()
    .trim()
    .min(1)
    .email("Please enter a valid email address.")
    .optional(),
  next: z.string().trim().optional(),
  message: z.string().trim().optional(),
});

export type AuthCallbackData = z.infer<typeof authCallbackSchema>;
