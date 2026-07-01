/**
 * =============================================================================
 * ChroniSync
 * Application Configuration
 * =============================================================================
 */

export const APP_CONFIG = {
  /* ------------------------------------------------------------------------ */
  /* Application Metadata                                                     */
  /* ------------------------------------------------------------------------ */

  name: "ChroniSync",
  shortName: "ChroniSync",
  description:
    "A web-based chronic disease management platform for patients and physicians with explainable AI-assisted workflows.",
  version: "0.1.0",
  author: "ChroniSync Team",
  repository: "https://github.com/jamesfontanilla/chronisync.git",
  website:
    process.env["NEXT_PUBLIC_APP_URL"] ?? "http://localhost:3000",
  supportEmail: "support@chronisync.app",

  /* ------------------------------------------------------------------------ */
  /* Locale & Time                                                            */
  /* ------------------------------------------------------------------------ */

  locale: "en-PH",
  timeZone: "Asia/Manila",
  dateFormat: "MMM dd, yyyy",
  dateTimeFormat: "MMM dd, yyyy - hh:mm a",

  /* ------------------------------------------------------------------------ */
  /* Pagination                                                               */
  /* ------------------------------------------------------------------------ */

  defaultPageSize: 10,
  maxPageSize: 100,

  /* ------------------------------------------------------------------------ */
  /* File Upload Limits                                                       */
  /* ------------------------------------------------------------------------ */

  maxUploadSizeMB: 10,
  allowedDocumentTypes: [
    "application/pdf",
    "image/jpeg",
    "image/png",
    "image/webp",
  ],

  /* ------------------------------------------------------------------------ */
  /* Dashboard Refresh                                                        */
  /* ------------------------------------------------------------------------ */

  dashboardRefreshInterval: 60_000,

  /* ------------------------------------------------------------------------ */
  /* AI                                                                       */
  /* ------------------------------------------------------------------------ */

  enableAI: true,
  enableDocumentExtraction: true,
  enableVisitSummaries: true,
  enableClinicalRecommendations: false,

  /* ------------------------------------------------------------------------ */
  /* Development                                                              */
  /* ------------------------------------------------------------------------ */

  isDevelopment: process.env.NODE_ENV === "development",
  isProduction: process.env.NODE_ENV === "production",
} as const;

export type AppConfig = typeof APP_CONFIG;
