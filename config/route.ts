/**
 * =============================================================================
 * ChroniSync
 * Application Routes
 * =============================================================================
 */

export const ROUTES = {
  /* ------------------------------------------------------------------------ */
  /* Public Routes                                                            */
  /* ------------------------------------------------------------------------ */

  HOME: "/",

  /* ------------------------------------------------------------------------ */
  /* Authentication                                                           */
  /* ------------------------------------------------------------------------ */

  AUTH: {
    LOGIN: "/auth/login",

    REGISTER: "/auth/register",

    FORGOT_PASSWORD: "/auth/forgot-password",

    CALLBACK: "/auth/callback",
  },

  /* ------------------------------------------------------------------------ */
  /* Patient                                                                  */
  /* ------------------------------------------------------------------------ */

  PATIENT: {
    DASHBOARD: "/patient/dashboard",

    MEDICATIONS: "/patient/medications",

    ALLERGIES: "/patient/allergies",

    VITALS: "/patient/vitals",

    SYMPTOMS: "/patient/symptoms",

    DISEASES: "/patient/diseases",

    DOCUMENTS: "/patient/documents",

    APPOINTMENTS: "/patient/appointments",

    TREATMENT_PLAN: "/patient/treatment-plan",

    SETTINGS: "/patient/settings",
  },

  /* ------------------------------------------------------------------------ */
  /* Physician                                                                */
  /* ------------------------------------------------------------------------ */

  PHYSICIAN: {
    DASHBOARD: "/physician/dashboard",

    PATIENTS: "/physician/patients",

    ALERTS: "/physician/alerts",

    DOCUMENTS: "/physician/documents",

    SUMMARIES: "/physician/summaries",

    TREATMENT: "/physician/treatment",

    SETTINGS: "/physician/settings",
  },

  /* ------------------------------------------------------------------------ */
  /* Administrator                                                            */
  /* ------------------------------------------------------------------------ */

  ADMIN: {
    DASHBOARD: "/admin/dashboard",

    USERS: "/admin/users",

    RULES: "/admin/rules",

    SETTINGS: "/admin/settings",
  },

  /* ------------------------------------------------------------------------ */
  /* API Routes                                                               */
  /* ------------------------------------------------------------------------ */

  API: {
    GEMINI: "/api/gemini",

    UPLOAD: "/api/upload",

    ALERTS: "/api/alerts",

    SUMMARY: "/api/summary",

    WEBHOOKS: "/api/webhooks",
  },
} as const;

/* -----------------------------------------------------------------------------
 * Route Groups
 * --------------------------------------------------------------------------- */

export const PUBLIC_ROUTES = [
  ROUTES.HOME,
  ROUTES.AUTH.LOGIN,
  ROUTES.AUTH.REGISTER,
  ROUTES.AUTH.FORGOT_PASSWORD,
  ROUTES.AUTH.CALLBACK,
] as const;

export const PATIENT_ROUTES = Object.values(
  ROUTES.PATIENT
);

export const PHYSICIAN_ROUTES = Object.values(
  ROUTES.PHYSICIAN
);

export const ADMIN_ROUTES = Object.values(
  ROUTES.ADMIN
);

export const PROTECTED_ROUTES = [
  ...PATIENT_ROUTES,
  ...PHYSICIAN_ROUTES,
  ...ADMIN_ROUTES,
] as const;

export type Route =
  (typeof PROTECTED_ROUTES)[number] |
  (typeof PUBLIC_ROUTES)[number];