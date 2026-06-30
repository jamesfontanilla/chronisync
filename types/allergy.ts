/**
 * =============================================================================
 * ChroniSync
 * Allergy Types
 * =============================================================================
 */

/* -------------------------------------------------------------------------- */
/*                              Enumerations                                  */
/* -------------------------------------------------------------------------- */

export type AllergyType =
  | "drug"
  | "food"
  | "environmental"
  | "latex"
  | "other";

export type AllergySeverity =
  | "mild"
  | "moderate"
  | "severe"
  | "anaphylaxis";

export type AllergyStatus =
  | "active"
  | "resolved";

/* -------------------------------------------------------------------------- */
/*                                 Allergy                                    */
/* -------------------------------------------------------------------------- */

export interface Allergy {
  id: string;

  /**
   * Associated patient UID.
   */
  patientId: string;

  /**
   * Allergen name.
   */
  allergen: string;

  /**
   * Allergy classification.
   */
  type: AllergyType;

  /**
   * Observed reaction, for example "hives" or "shortness of breath".
   */
  reaction?: string;

  /**
   * Reaction severity.
   */
  severity: AllergySeverity;

  /**
   * Date when the allergy was first observed.
   */
  firstObservedAt?: Date;

  /**
   * Date when the most recent reaction occurred.
   */
  lastReactionAt?: Date;

  /**
   * Current allergy status.
   */
  status: AllergyStatus;

  /**
   * UID of the user who recorded the allergy.
   */
  recordedBy?: string;

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
