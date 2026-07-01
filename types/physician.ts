/**
 * =============================================================================
 * ChroniSync
 * Physician Types
 * =============================================================================
 */

import type { InteroperabilityStandard, User } from "@/types/user";

/* -------------------------------------------------------------------------- */
/*                              Enumerations                                  */
/* -------------------------------------------------------------------------- */

export type PhysicianStatus =
  | "available"
  | "busy"
  | "offline";

export type MedicalSpecialty =
  | "Cardiology"
  | "Endocrinology"
  | "Family Medicine"
  | "General Internal Medicine"
  | "General Practice"
  | "Nephrology"
  | "Neurology"
  | "Pulmonology"
  | "Rheumatology"
  | "Other";

/* -------------------------------------------------------------------------- */
/*                               Physician                                    */
/* -------------------------------------------------------------------------- */

export interface Physician extends User {
  /**
   * Professional license number.
   */
  licenseNumber: string;

  /**
   * Primary medical specialty.
   */
  specialty: MedicalSpecialty;

  /**
   * Hospital or clinic affiliation.
   */
  organization?: string;

  /**
   * Department within the organization.
   */
  department?: string;

  /**
   * Years of clinical experience.
   */
  yearsOfExperience?: number;

  /**
   * Professional biography.
   */
  biography?: string;

  /**
   * Current availability.
   */
  availability: PhysicianStatus;

  /**
   * Number of active patients.
   * Derived value for dashboard display.
   */
  activePatientCount?: number;

  /**
   * FHIR Practitioner identifier for interoperability exports.
   */
  fhirPractitionerId?: string;

  /**
   * OpenMRS provider identifier for interoperability exports.
   */
  openmrsProviderId?: string;

  /**
   * Preferred interoperability standard for exports.
   */
  preferredInteropStandard?: InteroperabilityStandard;
}

/* -------------------------------------------------------------------------- */
/*                           Physician Dashboard                              */
/* -------------------------------------------------------------------------- */

export interface PhysicianSummary {
  physicianId: string;

  totalPatients: number;

  activeAlerts: number;

  pendingDocumentReviews: number;

  pendingVisitSummaries: number;

  upcomingAppointments: number;

  lastUpdated: Date;
}

/* -------------------------------------------------------------------------- */
/*                           Patient Assignment                               */
/* -------------------------------------------------------------------------- */

export interface PatientAssignment {
  patientId: string;

  physicianId: string;

  assignedAt: Date;

  isPrimaryPhysician: boolean;
}
