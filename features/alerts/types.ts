/**
 * =============================================================================
 * ChroniSync
 * Alert Feature Types
 * =============================================================================
 */

import type { Alert, AlertLevel, AlertStatus } from "@/types/alert";

export type AlertRecord = Alert;

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
}

export interface AlertActionState {
  alertId: string;
  notes?: string;
}
