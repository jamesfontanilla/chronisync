/**
 * =============================================================================
 * ChroniSync
 * Provenance Types
 * =============================================================================
 */

export const RECORD_ORIGIN_ROLES = [
  "patient",
  "caregiver",
  "clinician",
] as const;

export type RecordOriginRole =
  (typeof RECORD_ORIGIN_ROLES)[number];
