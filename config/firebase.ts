/**
 * =============================================================================
 * ChroniSync
 * Firebase Configuration
 * =============================================================================
 */

/* -------------------------------------------------------------------------- */
/*                             Environment                                    */
/* -------------------------------------------------------------------------- */

export const FIREBASE_CONFIG = {
  apiKey: process.env["NEXT_PUBLIC_FIREBASE_API_KEY"] ?? "",

  authDomain:
    process.env["NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN"] ?? "",

  projectId:
    process.env["NEXT_PUBLIC_FIREBASE_PROJECT_ID"] ?? "",

  storageBucket:
    process.env["NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET"] ?? "",

  messagingSenderId:
    process.env["NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID"] ?? "",

  appId:
    process.env["NEXT_PUBLIC_FIREBASE_APP_ID"] ?? "",

  ...(process.env["NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID"]
    ? {
        measurementId:
          process.env["NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID"],
      }
    : {}),
} as const;

/* -------------------------------------------------------------------------- */
/*                          Firestore Collections                             */
/* -------------------------------------------------------------------------- */

export const COLLECTIONS = {
  USERS: "users",

  PATIENTS: "patients",

  PHYSICIANS: "physicians",

  MEDICATIONS: "medications",

  ALLERGIES: "allergies",

  VITALS: "vitals",

  SYMPTOMS: "symptoms",

  DISEASES: "diseases",

  DOCUMENTS: "documents",

  TREATMENT_PLANS: "treatmentPlans",

  APPOINTMENTS: "appointments",

  ALERTS: "alerts",

  SUMMARIES: "summaries",

  NOTIFICATIONS: "notifications",
} as const;

/* -------------------------------------------------------------------------- */
/*                           Storage Folders                                  */
/* -------------------------------------------------------------------------- */

export const STORAGE_PATHS = {
  PATIENT_DOCUMENTS: "patients",

  PROFILE_IMAGES: "users",

  TEMP_UPLOADS: "temp",
} as const;

/* -------------------------------------------------------------------------- */
/*                          Authentication                                    */
/* -------------------------------------------------------------------------- */

export const AUTH = {
  PASSWORD_MIN_LENGTH: 8,

  SESSION_TIMEOUT_MINUTES: 60,

  REQUIRE_EMAIL_VERIFICATION: true,
} as const;

/* -------------------------------------------------------------------------- */
/*                         Upload Configuration                               */
/* -------------------------------------------------------------------------- */

export const UPLOAD = {
  MAX_SIZE_MB: 10,

  ALLOWED_TYPES: [
    "application/pdf",
    "image/jpeg",
    "image/png",
    "image/webp",
  ],
} as const;

/* -------------------------------------------------------------------------- */
/*                               Helpers                                      */
/* -------------------------------------------------------------------------- */

export function patientDocumentsPath(
  patientId: string
): string {
  return `${STORAGE_PATHS.PATIENT_DOCUMENTS}/${patientId}/documents`;
}

export function profilePhotoPath(
  userId: string
): string {
  return `${STORAGE_PATHS.PROFILE_IMAGES}/${userId}/profile`;
}
