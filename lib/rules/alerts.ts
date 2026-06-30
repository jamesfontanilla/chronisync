/**
 * =============================================================================
 * ChroniSync
 * Clinical Rule Alert Helpers
 * =============================================================================
 */

import type { Alert } from "@/types/alert";

export const RULE_ALERT_SOURCE = "rules_engine" as const;

export interface ClinicalRuleFinding {
  patientId: string;
  title: string;
  message: string;
  ruleId: string;
  metric: string;
  threshold: string;
  actualValue: string;
  level: Alert["level"];
  recommendation: string;
  physicianId?: string;
  recordedAt?: Date;
  metadata?: Record<string, unknown>;
}

export type ClinicalAlertInput = Omit<
  Alert,
  "id" | "createdAt" | "updatedAt"
>;

function createAlertId(): string {
  return typeof globalThis.crypto?.randomUUID === "function"
    ? globalThis.crypto.randomUUID()
    : `alt_${Date.now()}_${Math.random().toString(36).slice(2, 10)}`;
}

export function formatClinicalNumber(
  value: number,
  decimals = 1
): string {
  return Number(value.toFixed(decimals)).toString();
}

export function formatClinicalPercentage(
  value: number,
  decimals = 1
): string {
  return `${formatClinicalNumber(value * 100, decimals)}%`;
}

export function formatBloodPressureReading(
  systolic: number,
  diastolic: number
): string {
  return `${formatClinicalNumber(systolic, 0)}/${formatClinicalNumber(
    diastolic,
    0
  )} mmHg`;
}

export function createClinicalAlertInput(
  finding: ClinicalRuleFinding
): ClinicalAlertInput {
  const metadata: Record<string, unknown> = {
    ...(finding.metadata ?? {}),
    ...(finding.recordedAt ? { recordedAt: finding.recordedAt } : {}),
  };

  const alert: ClinicalAlertInput = {
    patientId: finding.patientId,
    title: finding.title,
    message: finding.message,
    level: finding.level,
    status: "open",
    source: RULE_ALERT_SOURCE,
    ruleId: finding.ruleId,
    metric: finding.metric,
    threshold: finding.threshold,
    actualValue: finding.actualValue,
    notes: finding.recommendation,
    ...(finding.physicianId ? { physicianId: finding.physicianId } : {}),
  };

  if (Object.keys(metadata).length > 0) {
    alert.metadata = metadata;
  }

  return alert;
}

export function createClinicalAlertRecord(
  finding: ClinicalRuleFinding,
  createdAt = new Date()
): Alert {
  const alert = createClinicalAlertInput(finding);

  return {
    ...alert,
    id: createAlertId(),
    createdAt,
    updatedAt: createdAt,
  };
}
