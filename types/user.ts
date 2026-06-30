/**
 * =============================================================================
 * ChroniSync
 * User Types
 * =============================================================================
 */

export type UserRole = "patient" | "physician" | "admin";

export type AccountStatus =
  | "active"
  | "inactive"
  | "pending"
  | "suspended";

export interface User {
  /**
   * Firebase Authentication UID
   */
  id: string;

  /**
   * User's email address.
   */
  email: string;

  /**
   * Full name.
   */
  fullName: string;

  /**
   * User role.
   */
  role: UserRole;

  /**
   * Account status.
   */
  status: AccountStatus;

  /**
   * Optional profile photo URL.
   */
  photoURL?: string;

  /**
   * Email verification status.
   */
  emailVerified: boolean;

  /**
   * Contact number.
   */
  phoneNumber?: string;

  /**
   * User timezone.
   */
  timezone?: string;

  /**
   * Preferred language.
   */
  language?: string;

  /**
   * Creation timestamp.
   */
  createdAt: Date;

  /**
   * Last update timestamp.
   */
  updatedAt: Date;

  /**
   * Last login timestamp.
   */
  lastLoginAt?: Date;
}

/* -------------------------------------------------------------------------- */
/*                              Authentication                                */
/* -------------------------------------------------------------------------- */

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterCredentials {
  fullName: string;
  email: string;
  password: string;
  confirmPassword: string;
  role: Exclude<UserRole, "admin">;
}

export interface AuthUser {
  uid: string;
  email: string | null;
  displayName: string | null;
  photoURL: string | null;
  emailVerified: boolean;
}