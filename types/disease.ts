/**
 * =============================================================================
 * ChroniSync
 * Disease Types
 * =============================================================================
 */

/* -------------------------------------------------------------------------- */
/*                              Enumerations                                  */
/* -------------------------------------------------------------------------- */

export type DiseaseStatus =
  | "suspected"
  | "active"
  | "remission"
  | "resolved";

export type DiseaseSeverity =
  | "mild"
  | "moderate"
  | "severe";

/* -------------------------------------------------------------------------- */
/*                                 Disease                                    */
/* -------------------------------------------------------------------------- */

export interface Disease {
  id: string;

  /**
   * Associated patient UID.
   */
  patientId: string;

  /**
   * Disease or condition name.
   */
  name: string;

  /**
   * Optional ICD-10 code.
   */
  icd10Code?: string;

  /**
   * Date when the disease was diagnosed.
   */
  diagnosedAt?: Date;

  /**
   * Severity of the condition.
   */
  severity?: DiseaseSeverity;

  /**
   * Current condition state.
   */
  status: DiseaseStatus;

  /**
   * UID of the physician primarily managing the condition.
   */
  managedByPhysicianId?: string;

  /**
   * Whether the condition is chronic.
   */
  isChronic?: boolean;

  /**
   * Additional notes.
   */
  notes?: string;

  /**
   * Creation timestamp.
   */
  createdAt: Date;

  /**
   * Last update timestamp.
   */
  updatedAt: Date;
}
