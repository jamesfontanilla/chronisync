import { z } from "zod";

import { AUTH_ROLE_VALUES } from "@/lib/auth/roles";

const PASSWORD_REGEX = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/;
const FULL_NAME_REGEX = /^[A-Za-zÀ-ÖØ-öø-ÿ]+([ '-][A-Za-zÀ-ÖØ-öø-ÿ]+)*$/;

const disposableEmailDomains = new Set([
  "mailinator.com",
  "10minutemail.com",
  "yopmail.com",
  "guerrillamail.com",
  "temporarymail.com",
  "temp-mail.org",
  "temp-mail.com",
  "maildrop.cc",
  "trashmail.com",
  "dispostable.com",
  "fakeinbox.com",
  "example.com",
  "example.org",
  "test.com",
  "testmail.com",
  "mail.com",
]);

function isDisposableEmail(email: string): boolean {
  const domain = email.split("@").pop()?.toLowerCase() ?? "";
  return disposableEmailDomains.has(domain);
}

export const authRoleSchema = z.enum(AUTH_ROLE_VALUES);

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
      .max(100, "Full name is too long.")
      .regex(
        FULL_NAME_REGEX,
        "Full name can only contain letters, spaces, apostrophes, and hyphens."
      )
      .refine(
        (value) => value.split(/\s+/).filter(Boolean).length >= 2,
        {
          message: "Please enter your full name, including first and last name.",
        }
      ),
    email: z
      .string()
      .trim()
      .min(1, "Email is required.")
      .email("Please enter a valid email address.")
      .toLowerCase()
      .refine(
        (value) => !isDisposableEmail(value),
        {
          message:
            "Please use a real email address instead of a temporary or dummy email.",
        }
      ),
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
