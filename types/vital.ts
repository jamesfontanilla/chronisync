/**
 * =============================================================================
 * ChroniSync
 * Vital Types
 * =============================================================================
 */

import type { RecordOriginRole } from "@/types/provenance";

/* -------------------------------------------------------------------------- */
/*                              Enumerations                                  */
/* -------------------------------------------------------------------------- */

export type VitalType =
  | "blood_pressure"
  | "heart_rate"
  | "blood_glucose"
  | "weight"
  | "temperature"
  | "oxygen_saturation";

export type VitalSource =
  | "manual"
  | "device"
  | "imported";

export type BloodPressureUnit = "mmHg";

export type NumericVitalUnit =
  | "bpm"
  | "mg/dL"
  | "kg"
  | "C"
  | "F"
  | "%";

/* -------------------------------------------------------------------------- */
/*                                Shared Base                                 */
/* -------------------------------------------------------------------------- */

interface BaseVital {
  id: string;
  patientId: string;
  recordedByRole?: RecordOriginRole;
  recordedAt: Date;
  recordedBy?: string;
  source?: VitalSource;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

/* -------------------------------------------------------------------------- */
/*                                  Vitals                                    */
/* -------------------------------------------------------------------------- */

export interface BloodPressureVital extends BaseVital {
  type: "blood_pressure";
  systolic: number;
  diastolic: number;
  unit?: BloodPressureUnit;
}

export interface NumericVital extends BaseVital {
  type: Exclude<VitalType, "blood_pressure">;
  value: number;
  unit?: NumericVitalUnit;
}

export type Vital = BloodPressureVital | NumericVital;
