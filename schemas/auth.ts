/**
 * =============================================================================
 * ChroniSync
 * Authentication Schemas
 * =============================================================================
 */

import { z } from "zod";

/* -------------------------------------------------------------------------- */
/*                                 Constants                                  */
/* -------------------------------------------------------------------------- */

const PASSWORD_REGEX =
  /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/;

/* -------------------------------------------------------------------------- */
/*                              Login Schema                                  */
/* -------------------------------------------------------------------------- */

export const loginSchema = z.object({
  email: z
    .email("Please enter a valid email address.")
    .trim()
    .toLowerCase(),

  password: z
    .string()
    .min(1, "Password is required."),
});

export type LoginFormData = z.infer<typeof loginSchema>;

/* -------------------------------------------------------------------------- */
/*                            Register Schema                                 */
/* -------------------------------------------------------------------------- */

export const registerSchema = z
  .object({
    fullName: z
      .string()
      .trim()
      .min(2, "Full name must be at least 2 characters.")
      .max(100, "Full name is too long."),

    email: z
      .email("Please enter a valid email address.")
      .trim()
      .toLowerCase(),

    password: z
      .string()
      .min(8, "Password must be at least 8 characters.")
      .regex(
        PASSWORD_REGEX,
        "Password must contain at least one uppercase letter, one lowercase letter, and one number."
      ),

    confirmPassword: z.string(),

    role: z.enum(["patient", "physician"]),
  })
  .refine(
    (data) => data.password === data.confirmPassword,
    {
      path: ["confirmPassword"],
      message: "Passwords do not match.",
    }
  );

export type RegisterFormData = z.infer<
  typeof registerSchema
>;

/* -------------------------------------------------------------------------- */
/*                         Forgot Password Schema                             */
/* -------------------------------------------------------------------------- */

export const forgotPasswordSchema = z.object({
  email: z
    .email("Please enter a valid email address.")
    .trim()
    .toLowerCase(),
});

export type ForgotPasswordFormData = z.infer<
  typeof forgotPasswordSchema
>;

/* -------------------------------------------------------------------------- */
/*                         Reset Password Schema                              */
/* -------------------------------------------------------------------------- */

export const resetPasswordSchema = z
  .object({
    password: z
      .string()
      .min(8, "Password must be at least 8 characters.")
      .regex(
        PASSWORD_REGEX,
        "Password must contain at least one uppercase letter, one lowercase letter, and one number."
      ),

    confirmPassword: z.string(),
  })
  .refine(
    (data) => data.password === data.confirmPassword,
    {
      path: ["confirmPassword"],
      message: "Passwords do not match.",
    }
  );

export type ResetPasswordFormData = z.infer<
  typeof resetPasswordSchema
>;