/**
 * =============================================================================
 * ChroniSync
 * Global Application Constants
 * =============================================================================
 */

export const APP_NAME = "ChroniSync";

export const APP_DESCRIPTION =
  "A two-sided chronic disease management platform for patients and physicians.";

export const APP_VERSION = "0.1.0";

export const SUPPORT_EMAIL = "support@chronisync.app";

/* -------------------------------------------------------------------------- */
/*                                   Roles                                    */
/* -------------------------------------------------------------------------- */

export const USER_ROLES = {
  PATIENT: "patient",
  PHYSICIAN: "physician",
  ADMIN: "admin",
} as const;

export type UserRole = (typeof USER_ROLES)[keyof typeof USER_ROLES];

/* -------------------------------------------------------------------------- */
/*                              Authentication                                */
/* -------------------------------------------------------------------------- */

export const AUTH_ROUTES = {
  LOGIN: "/auth/login",
  REGISTER: "/auth/register",
  FORGOT_PASSWORD: "/auth/forgot-password",
};

export const DASHBOARD_ROUTES = {
  PATIENT: "/patient/dashboard",
  PHYSICIAN: "/physician/dashboard",
  ADMIN: "/admin/dashboard",
};

/* -------------------------------------------------------------------------- */
/*                               Firestore                                    */
/* -------------------------------------------------------------------------- */

export const COLLECTIONS = {
  USERS: "users",
  PATIENTS: "patients",
  MEDICATIONS: "medications",
  ALLERGIES: "allergies",
  VITALS: "vitals",
  SYMPTOMS: "symptoms",
  DOCUMENTS: "documents",
  VISITS: "visits",
  TREATMENTS: "treatments",
  ALERTS: "alerts",
  SUMMARIES: "summaries",
} as const;

/* -------------------------------------------------------------------------- */
/*                             Document Upload                                */
/* -------------------------------------------------------------------------- */

export const ALLOWED_FILE_TYPES = [
  "application/pdf",
  "image/jpeg",
  "image/png",
  "image/webp",
] as const;

export const MAX_DOCUMENT_SIZE = 10 * 1024 * 1024; // 10 MB

/* -------------------------------------------------------------------------- */
/*                               Vital Signs                                  */
/* -------------------------------------------------------------------------- */

export const VITAL_TYPES = {
  BLOOD_PRESSURE: "blood_pressure",
  HEART_RATE: "heart_rate",
  BLOOD_GLUCOSE: "blood_glucose",
  WEIGHT: "weight",
  TEMPERATURE: "temperature",
  OXYGEN_SATURATION: "oxygen_saturation",
} as const;

/* -------------------------------------------------------------------------- */
/*                               Alert Levels                                 */
/* -------------------------------------------------------------------------- */

export const ALERT_LEVEL = {
  INFO: "info",
  WARNING: "warning",
  CRITICAL: "critical",
} as const;

/* -------------------------------------------------------------------------- */
/*                             Clinical Statuses                              */
/* -------------------------------------------------------------------------- */

export const DOCUMENT_STATUS = {
  PENDING: "pending",
  PROCESSING: "processing",
  REVIEW_REQUIRED: "review_required",
  APPROVED: "approved",
  REJECTED: "rejected",
} as const;

export const TREATMENT_STATUS = {
  ACTIVE: "active",
  COMPLETED: "completed",
  DISCONTINUED: "discontinued",
} as const;

/* -------------------------------------------------------------------------- */
/*                              AI Configuration                              */
/* -------------------------------------------------------------------------- */

export const AI_MODELS = {
  DEFAULT: "gemini-2.5-flash",
} as const;

export const AI_FEATURES = {
  DOCUMENT_EXTRACTION: "document_extraction",
  VISIT_SUMMARIZATION: "visit_summarization",
} as const;

/* -------------------------------------------------------------------------- */
/*                                Pagination                                  */
/* -------------------------------------------------------------------------- */

export const DEFAULT_PAGE_SIZE = 10;

export const MAX_PAGE_SIZE = 100;

/* -------------------------------------------------------------------------- */
/*                              Date Formatting                               */
/* -------------------------------------------------------------------------- */

export const DATE_FORMAT = "MMM dd, yyyy";

export const DATE_TIME_FORMAT = "MMM dd, yyyy - hh:mm a";

/* -------------------------------------------------------------------------- */
/*                              Local Storage                                 */
/* -------------------------------------------------------------------------- */

export const STORAGE_KEYS = {
  THEME: "theme",
  USER_ROLE: "user_role",
} as const;
