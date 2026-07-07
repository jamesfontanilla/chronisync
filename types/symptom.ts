/**
 * =============================================================================
 * ChroniSync
 * Symptom Types
 * =============================================================================
 */

import type { RecordOriginRole } from "@/types/provenance";

/* -------------------------------------------------------------------------- */
/*                              Enumerations                                  */
/* -------------------------------------------------------------------------- */

export type SymptomSeverity =
  | "mild"
  | "moderate"
  | "severe";

export type SymptomFrequency =
  | "once"
  | "intermittent"
  | "daily"
  | "constant";

export type SymptomStatus =
  | "active"
  | "improving"
  | "resolved"
  | "worsening";

/* -------------------------------------------------------------------------- */
/*                                 Symptom                                    */
/* -------------------------------------------------------------------------- */

export interface Symptom {
  id: string;

  /**
   * Associated patient UID.
   */
  patientId: string;

  /**
   * Related disease UID when the symptom belongs to a known condition.
   */
  diseaseId?: string;

  /**
   * Symptom name, for example "headache" or "fatigue".
   */
  name: string;

  /**
   * Optional symptom description.
   */
  description?: string;

  /**
   * Symptom severity.
   */
  severity: SymptomSeverity;

  /**
   * How often the symptom occurs.
   */
  frequency?: SymptomFrequency;

  /**
   * When the symptom first started.
   */
  onsetAt?: Date;

  /**
   * When the symptom resolved.
   */
  resolvedAt?: Date;

  /**
   * Current symptom status.
   */
  status: SymptomStatus;

  /**
   * Known triggers.
   */
  triggers?: string[];

  /**
   * Additional notes.
   */
  notes?: string;

  /**
   * UID of the user who recorded the symptom.
   */
  recordedBy?: string;

  /**
   * Role of the user who recorded the symptom.
   */
  recordedByRole?: RecordOriginRole;

  /**
   * Creation timestamp.
   */
  createdAt: Date;

  /**
   * Last update timestamp.
   */
  updatedAt: Date;
}
