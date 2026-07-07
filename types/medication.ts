/**
 * =============================================================================
 * ChroniSync
 * Medication Types
 * =============================================================================
 */

import type { RecordOriginRole } from "@/types/provenance";

/* -------------------------------------------------------------------------- */
/*                              Enumerations                                  */
/* -------------------------------------------------------------------------- */

export type MedicationRoute =
  | "oral"
  | "topical"
  | "inhaled"
  | "injection"
  | "intravenous"
  | "subcutaneous"
  | "rectal"
  | "other";

export type MedicationFrequency =
  | "once_daily"
  | "twice_daily"
  | "three_times_daily"
  | "every_other_day"
  | "weekly"
  | "as_needed"
  | "custom";

export type MedicationStatus =
  | "active"
  | "paused"
  | "completed"
  | "discontinued";

/* -------------------------------------------------------------------------- */
/*                                Medication                                  */
/* -------------------------------------------------------------------------- */

export interface Medication {
  id: string;

  /**
   * Associated patient UID.
   */
  patientId: string;

  /**
   * Role of the person who recorded the medication log.
   */
  recordedByRole?: RecordOriginRole;

  /**
   * Physician or clinician UID who prescribed the medication.
   */
  prescribedBy?: string;

  /**
   * Brand or commercial medication name.
   */
  name: string;

  /**
   * Optional generic medication name.
   */
  genericName?: string;

  /**
   * Dosage description, for example "500 mg".
   */
  dosage: string;

  /**
   * Medication strength, for example "10 mg / 5 mL".
   */
  strength?: string;

  /**
   * Route of administration.
   */
  route?: MedicationRoute;

  /**
   * Standard dosing frequency.
   */
  frequency: MedicationFrequency;

  /**
   * Free-form custom frequency text when the schedule is unusual.
   */
  customFrequency?: string;

  /**
   * Instruction text shown to the patient.
   */
  instructions?: string;

  /**
   * Scheduled start date.
   */
  startDate: Date;

  /**
   * Scheduled end date.
   */
  endDate?: Date;

  /**
   * Current medication status.
   */
  status: MedicationStatus;

  /**
   * Remaining refill count.
   */
  refillRemaining?: number;

  /**
   * Whether the medication is taken only when needed.
   */
  isAsNeeded?: boolean;

  /**
   * Additional clinical notes.
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
