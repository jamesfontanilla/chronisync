/**
 * =============================================================================
 * ChroniSync
 * Alert Feature Types
 * =============================================================================
 */

import type { Alert, AlertLevel, AlertStatus } from "@/types/alert";

export type AlertRecord = Alert;

export type AlertFamily =
  | "guideline"
  | "interaction"
  | "manual"
  | "system";

export type AlertSeverity = AlertLevel;

export type AlertLifecycleStatus = AlertStatus;

export type AlertSortOrder =
  | "newest"
  | "oldest"
  | "severity"
  | "status";

export interface AlertFilters {
  patientId?: string;
  physicianId?: string;
  status?: AlertLifecycleStatus;
  level?: AlertSeverity;
  query?: string;
  limit?: number;
  sort?: AlertSortOrder;
}

export interface AlertViewModel {
  alert: AlertRecord;
  levelLabel: string;
  statusLabel: string;
  family: AlertFamily;
  familyLabel: string;
  timeLabel: string;
  summary: string;
  isOpen: boolean;
}

export interface AlertSummary {
  total: number;
  open: number;
  acknowledged: number;
  resolved: number;
  dismissed: number;
  guideline: number;
  interaction: number;
  manual: number;
  system: number;
}

export interface AlertActionState {
  alertId: string;
  notes?: string;
}
