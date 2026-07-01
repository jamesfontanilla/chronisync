/**
 * =============================================================================
 * ChroniSync
 * Patient Types
 * =============================================================================
 */

import type { InteroperabilityStandard, User } from "@/types/user";

/* -------------------------------------------------------------------------- */
/*                              Enumerations                                  */
/* -------------------------------------------------------------------------- */

export type BiologicalSex = "male" | "female";

export type BloodType =
  | "A+"
  | "A-"
  | "B+"
  | "B-"
  | "AB+"
  | "AB-"
  | "O+"
  | "O-";

/* -------------------------------------------------------------------------- */
/*                           Emergency Contact                                */
/* -------------------------------------------------------------------------- */

export interface EmergencyContact {
  fullName: string;
  relationship: string;
  phoneNumber: string;
}

/* -------------------------------------------------------------------------- */
/*                             Chronic Disease                                */
/* -------------------------------------------------------------------------- */

export interface ChronicCondition {
  id: string;

  /**
   * Example:
   * - Type 2 Diabetes
   * - Hypertension
   * - Asthma
   */
  name: string;

  diagnosedAt?: Date;

  notes?: string;
}

/* -------------------------------------------------------------------------- */
/*                                Patient                                     */
/* -------------------------------------------------------------------------- */

export interface Patient extends User {
  /**
   * Date of birth.
   */
  dateOfBirth: Date;

  /**
   * Biological sex.
   */
  biologicalSex: BiologicalSex;

  /**
   * Blood type.
   */
  bloodType?: BloodType;

  /**
   * Height in centimeters.
   */
  heightCm?: number;

  /**
   * Current weight in kilograms.
   */
  weightKg?: number;

  /**
   * Chronic conditions being managed.
   */
  chronicConditions: ChronicCondition[];

  /**
   * Emergency contact.
   */
  emergencyContact: EmergencyContact;

  /**
   * Primary physician UID.
   */
  physicianId?: string;

  /**
   * FHIR Patient identifier, when mapped from an external record system.
   */
  fhirPatientId?: string;

  /**
   * OpenMRS Patient identifier, when mapped from a clinic record system.
   */
  openmrsPatientId?: string;

  /**
   * Preferred interoperability standard for exports.
   */
  preferredInteropStandard?: InteroperabilityStandard;
}

/* -------------------------------------------------------------------------- */
/*                           Patient Dashboard                                */
/* -------------------------------------------------------------------------- */

export interface PatientSummary {
  patientId: string;

  latestBloodPressure?: string;

  latestHeartRate?: number;

  latestBloodGlucose?: number;

  latestWeightKg?: number;

  activeMedicationCount: number;

  activeAlertCount: number;

  lastUpdated: Date;
}
