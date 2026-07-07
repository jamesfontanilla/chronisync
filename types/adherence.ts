/**
 * =============================================================================
 * ChroniSync
 * Adherence Types
 * =============================================================================
 */

import type { RecordOriginRole } from "@/types/provenance";

export interface AdherenceLog {
  id: string;
  patientId: string;
  medicationId: string;
  scheduledTime: Date;
  takenAt: Date | null; // null means missed/not yet taken
  loggedBy: "patient" | "caregiver";
  recordedByRole?: RecordOriginRole;
  createdAt: Date;
  updatedAt: Date;
}
