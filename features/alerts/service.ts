/**
 * =============================================================================
 * ChroniSync
 * Alert Feature Service
 * =============================================================================
 */

import { COLLECTIONS } from "@/config/firebase";
import {
  acknowledgeAlert as acknowledgeAlertRecord,
  createAlert as createAlertRecord,
  deleteAlert as deleteAlertRecord,
  dismissAlert as dismissAlertRecord,
  getAlertById as getAlertRecordById,
  listAlertsByPatient as listPatientAlerts,
  listOpenAlertsByPatient as listOpenPatientAlerts,
  resolveAlert as resolveAlertRecord,
  updateAlert as updateAlertRecord,
  type AlertCreateInput,
  type AlertRecord,
  type AlertUpdateInput,
} from "@/services/alert.service";
import { queryDocuments, whereEquals } from "@/lib/firebase/firestore";
import { formatDateTime, humanize } from "@/lib/utils";
import type { Alert } from "@/types/alert";

import type {
  AlertFilters,
  AlertSummary,
  AlertViewModel,
} from "./types";

export type { AlertCreateInput, AlertRecord, AlertUpdateInput };

function isAlertOpen(alert: AlertRecord): boolean {
  return alert.status !== "resolved" && alert.status !== "dismissed";
}

function sortAlerts(
  alerts: AlertRecord[],
  sort: AlertFilters["sort"] = "newest"
): AlertRecord[] {
  const copy = [...alerts];

  switch (sort) {
    case "oldest":
      return copy.sort(
        (left, right) => left.createdAt.getTime() - right.createdAt.getTime()
      );
    case "severity":
      return copy.sort((left, right) =>
        severityRank(right.level) - severityRank(left.level)
      );
    case "status":
      return copy.sort((left, right) =>
        humanize(left.status).localeCompare(humanize(right.status))
      );
    case "newest":
    default:
      return copy.sort(
        (left, right) => right.createdAt.getTime() - left.createdAt.getTime()
      );
  }
}

function severityRank(level: Alert["level"]): number {
  switch (level) {
    case "critical":
      return 3;
    case "warning":
      return 2;
    case "info":
    default:
      return 1;
  }
}

function matchesQuery(alert: AlertRecord, query: string): boolean {
  const normalized = query.trim().toLowerCase();

  if (!normalized) {
    return true;
  }

  const haystack = [
    alert.title,
    alert.message,
    alert.metric,
    alert.ruleId,
    alert.notes,
  ]
    .filter((value): value is string => Boolean(value))
    .join(" ")
    .toLowerCase();

  return haystack.includes(normalized);
}

export function buildAlertViewModel(
  alert: AlertRecord
): AlertViewModel {
  return {
    alert,
    levelLabel: humanize(alert.level),
    statusLabel: humanize(alert.status),
    timeLabel: formatDateTime(alert.createdAt),
    summary: alert.notes ?? alert.message,
    isOpen: isAlertOpen(alert),
  };
}

export function summarizeAlerts(
  alerts: AlertRecord[]
): AlertSummary {
  return alerts.reduce<AlertSummary>(
    (accumulator, alert) => {
      accumulator.total += 1;

      switch (alert.status) {
        case "acknowledged":
          accumulator.acknowledged += 1;
          break;
        case "resolved":
          accumulator.resolved += 1;
          break;
        case "dismissed":
          accumulator.dismissed += 1;
          break;
        default:
          accumulator.open += 1;
          break;
      }

      return accumulator;
    },
    {
      total: 0,
      open: 0,
      acknowledged: 0,
      resolved: 0,
      dismissed: 0,
    }
  );
}

export async function listAlertsByPhysician(
  physicianId: string
): Promise<AlertRecord[]> {
  return queryDocuments<AlertRecord>(
    COLLECTIONS.ALERTS,
    whereEquals("physicianId", physicianId)
  );
}

export async function listOpenAlertsByPhysician(
  physicianId: string
): Promise<AlertRecord[]> {
  const alerts = await listAlertsByPhysician(physicianId);
  return alerts.filter(isAlertOpen);
}

export async function listAlertViewModelsByFilters(
  filters: AlertFilters = {}
): Promise<AlertViewModel[]> {
  const normalizedFilters = {
    sort: filters.sort ?? "newest",
    limit: filters.limit ?? 20,
    ...(filters.patientId ? { patientId: filters.patientId } : {}),
    ...(filters.physicianId ? { physicianId: filters.physicianId } : {}),
    ...(filters.status ? { status: filters.status } : {}),
    ...(filters.level ? { level: filters.level } : {}),
    ...(filters.query ? { query: filters.query } : {}),
  } satisfies AlertFilters;

  const records = await listAlertsByFilters(normalizedFilters);
  return records.map(buildAlertViewModel);
}

export async function listAlertsByFilters(
  filters: AlertFilters = {}
): Promise<AlertRecord[]> {
  const hasPatientFilter = Boolean(filters.patientId);
  const hasPhysicianFilter = Boolean(filters.physicianId);
  const hasStatusFilter = Boolean(filters.status);
  const hasLevelFilter = Boolean(filters.level);

  const baseAlerts = hasPatientFilter
    ? await listPatientAlerts(filters.patientId as string)
    : hasPhysicianFilter
      ? await listAlertsByPhysician(filters.physicianId as string)
      : await queryDocuments<AlertRecord>(COLLECTIONS.ALERTS);

  const filtered = baseAlerts.filter((alert) => {
    if (hasStatusFilter && alert.status !== filters.status) {
      return false;
    }

    if (hasLevelFilter && alert.level !== filters.level) {
      return false;
    }

    if (filters.query && !matchesQuery(alert, filters.query)) {
      return false;
    }

    return true;
  });

  const sorted = sortAlerts(filtered, filters.sort);
  return sorted.slice(0, filters.limit ?? 20);
}

export async function listOpenAlertViewModelsByPatient(
  patientId: string
): Promise<AlertViewModel[]> {
  const records = await listOpenPatientAlerts(patientId);
  return records.map(buildAlertViewModel);
}

export async function getAlertById(
  alertId: string
): Promise<AlertRecord | null> {
  return getAlertRecordById(alertId);
}

export async function createAlert(
  data: AlertCreateInput
): Promise<AlertRecord> {
  return createAlertRecord(data);
}

export async function updateAlert(
  alertId: string,
  updates: AlertUpdateInput
): Promise<AlertRecord> {
  return updateAlertRecord(alertId, updates);
}

export async function acknowledgeAlert(
  alertId: string,
  acknowledgedBy?: string
): Promise<AlertRecord> {
  return acknowledgeAlertRecord(alertId, acknowledgedBy);
}

export async function resolveAlert(
  alertId: string,
  notes?: string
): Promise<AlertRecord> {
  return resolveAlertRecord(alertId, notes);
}

export async function dismissAlert(
  alertId: string,
  notes?: string
): Promise<AlertRecord> {
  return dismissAlertRecord(alertId, notes);
}

export async function deleteAlert(
  alertId: string
): Promise<void> {
  await deleteAlertRecord(alertId);
}
