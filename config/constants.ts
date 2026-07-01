/**
 * =============================================================================
 * ChroniSync
 * Global Application Constants
 * =============================================================================
 */

/* -------------------------------------------------------------------------- */
/*                              Date & Time                                   */
/* -------------------------------------------------------------------------- */

export const DATE_FORMATS = {
  DATE: "MMM dd, yyyy",
  DATE_TIME: "MMM dd, yyyy - hh:mm a",
  TIME: "hh:mm a",
  ISO: "yyyy-MM-dd",
} as const;

/* -------------------------------------------------------------------------- */
/*                              Pagination                                    */
/* -------------------------------------------------------------------------- */

export const PAGINATION = {
  DEFAULT_PAGE: 1,
  DEFAULT_PAGE_SIZE: 10,
  MAX_PAGE_SIZE: 100,
} as const;

/* -------------------------------------------------------------------------- */
/*                              File Uploads                                  */
/* -------------------------------------------------------------------------- */

export const FILE_LIMITS = {
  MAX_UPLOAD_SIZE_MB: 10,
  MAX_UPLOAD_SIZE_BYTES: 10 * 1024 * 1024,
} as const;

/* -------------------------------------------------------------------------- */
/*                              Validation                                    */
/* -------------------------------------------------------------------------- */

export const VALIDATION = {
  MIN_PASSWORD_LENGTH: 8,
  MAX_PASSWORD_LENGTH: 64,
  MIN_NAME_LENGTH: 2,
  MAX_NAME_LENGTH: 100,
  MAX_DESCRIPTION_LENGTH: 1000,
  MAX_NOTES_LENGTH: 5000,
} as const;

/* -------------------------------------------------------------------------- */
/*                              Dashboard                                     */
/* -------------------------------------------------------------------------- */

export const DASHBOARD = {
  REFRESH_INTERVAL_MS: 60_000,
  RECENT_ACTIVITY_LIMIT: 10,
  ALERT_LIMIT: 10,
} as const;

/* -------------------------------------------------------------------------- */
/*                               AI                                            */
/* -------------------------------------------------------------------------- */

export const AI = {
  MIN_CONFIDENCE_SCORE: 0.8,
  MAX_SUMMARY_LENGTH: 1000,
  MAX_DOCUMENT_PAGES: 20,
} as const;

/* -------------------------------------------------------------------------- */
/*                             Clinical Rules                                 */
/* -------------------------------------------------------------------------- */

export const CLINICAL = {
  SYSTOLIC_BP_HIGH: 140,
  DIASTOLIC_BP_HIGH: 90,
  HEART_RATE_LOW: 50,
  HEART_RATE_HIGH: 120,
  FASTING_GLUCOSE_HIGH: 126,
} as const;

/* -------------------------------------------------------------------------- */
/*                            Application Status                              */
/* -------------------------------------------------------------------------- */

export const STATUS = {
  ACTIVE: "active",
  INACTIVE: "inactive",
  PENDING: "pending",
  ARCHIVED: "archived",
} as const;

/* -------------------------------------------------------------------------- */
/*                           Notification Types                               */
/* -------------------------------------------------------------------------- */

export const NOTIFICATION_TYPES = {
  INFO: "info",
  SUCCESS: "success",
  WARNING: "warning",
  ERROR: "error",
} as const;

/* -------------------------------------------------------------------------- */
/*                             Local Storage                                  */
/* -------------------------------------------------------------------------- */

export const STORAGE_KEYS = {
  THEME: "chronisync-theme",
  USER: "chronisync-user",
  SIDEBAR: "chronisync-sidebar",
} as const;

/* -------------------------------------------------------------------------- */
/*                              Miscellaneous                                 */
/* -------------------------------------------------------------------------- */

export const HTTP_STATUS = {
  OK: 200,
  CREATED: 201,
  NO_CONTENT: 204,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  CONFLICT: 409,
  INTERNAL_SERVER_ERROR: 500,
} as const;
