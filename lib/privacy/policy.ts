/**
 * =============================================================================
 * ChroniSync
 * Privacy Policy Helpers
 * =============================================================================
 */

import { z } from "zod";

export const DEFAULT_EXPORT_RETENTION_DAYS = 30;
export const DEFAULT_CONSENT_AUDIT_RETENTION_DAYS = 365;
export const DEFAULT_PROVENANCE_RETENTION_DAYS = 365;

export const PRIVACY_SCOPE_VALUES = [
  "view_profile",
  "view_medications",
  "view_vitals",
  "view_symptoms",
  "view_diseases",
  "view_documents",
  "view_summaries",
  "receive_alerts",
  "caregiver_support",
  "ai_assistance",
  "export_records",
  "emergency_access",
] as const;

export const privacyScopeSchema = z.enum(PRIVACY_SCOPE_VALUES);

export type PrivacyScope = z.infer<typeof privacyScopeSchema>;

export type CaregiverAccessTier = "read_only" | "log_on_behalf_of";

export interface PrivacyPolicyEntry {
  scope: PrivacyScope;
  label: string;
  description: string;
  allowsCaregiverAccess: boolean;
  allowsExport: boolean;
  allowsAiProcessing: boolean;
  retentionLabel: string;
}

export interface CaregiverAccessPolicy {
  tier: CaregiverAccessTier;
  label: string;
  description: string;
  scopes: readonly PrivacyScope[];
}

export const PRIVACY_SCOPE_LABELS: Record<PrivacyScope, string> = {
  view_profile: "View profile",
  view_medications: "View medications",
  view_vitals: "View vitals",
  view_symptoms: "View symptoms",
  view_diseases: "View diseases",
  view_documents: "View documents",
  view_summaries: "View summaries",
  receive_alerts: "Receive alerts",
  caregiver_support: "Caregiver support",
  ai_assistance: "AI assistance",
  export_records: "Export records",
  emergency_access: "Emergency access",
};

export const PRIVACY_SCOPE_DESCRIPTIONS: Record<PrivacyScope, string> = {
  view_profile: "Demographic and account details.",
  view_medications: "Medication plans and adherence details.",
  view_vitals: "Home and clinic vital sign readings.",
  view_symptoms: "Symptom logs and subjective reports.",
  view_diseases: "Active disease and condition records.",
  view_documents: "Uploaded and reviewed clinical documents.",
  view_summaries: "Visit summaries and chart-ready notes.",
  receive_alerts: "Threshold alerts and care-team notifications.",
  caregiver_support: "On-behalf-of support from a trusted caregiver.",
  ai_assistance: "AI-assisted extraction and summary workflows.",
  export_records: "Portable clinical exports and report packets.",
  emergency_access: "Break-glass access for urgent care situations.",
};

export const CAREGIVER_VISIBLE_SCOPES: readonly PrivacyScope[] = [
  "view_profile",
  "view_medications",
  "view_vitals",
  "view_symptoms",
  "view_diseases",
  "view_documents",
  "view_summaries",
  "receive_alerts",
  "caregiver_support",
  "ai_assistance",
  "export_records",
] as const;

export const EXPORTABLE_SCOPES: readonly PrivacyScope[] = [
  "view_profile",
  "view_medications",
  "view_vitals",
  "view_symptoms",
  "view_diseases",
  "view_documents",
  "view_summaries",
  "receive_alerts",
  "caregiver_support",
  "ai_assistance",
  "export_records",
  "emergency_access",
] as const;

export const AI_PROCESSABLE_SCOPES: readonly PrivacyScope[] = [
  "view_profile",
  "view_medications",
  "view_vitals",
  "view_symptoms",
  "view_diseases",
  "view_documents",
  "view_summaries",
  "receive_alerts",
  "ai_assistance",
  "export_records",
] as const;

function addDays(base: Date, days: number): Date {
  const next = new Date(base);
  next.setDate(next.getDate() + days);
  return next;
}

export function listPrivacyScopes(): PrivacyScope[] {
  return [...PRIVACY_SCOPE_VALUES];
}

export function isPrivacyScope(value: string): value is PrivacyScope {
  return privacyScopeSchema.safeParse(value).success;
}

export function getPrivacyScopeLabel(scope: PrivacyScope): string {
  return PRIVACY_SCOPE_LABELS[scope];
}

export function getPrivacyScopeDescription(scope: PrivacyScope): string {
  return PRIVACY_SCOPE_DESCRIPTIONS[scope];
}

export function normalizePrivacyScopes(
  scopes: Iterable<PrivacyScope>
): PrivacyScope[] {
  return [...new Set(scopes)];
}

export function canCaregiverAccessScope(scope: PrivacyScope): boolean {
  return CAREGIVER_VISIBLE_SCOPES.includes(scope);
}

export function canExportScope(scope: PrivacyScope): boolean {
  return EXPORTABLE_SCOPES.includes(scope);
}

export function canAiProcessScope(scope: PrivacyScope): boolean {
  return AI_PROCESSABLE_SCOPES.includes(scope);
}

export function getPrivacyScopeRetentionLabel(
  scope: PrivacyScope
): string {
  switch (scope) {
    case "export_records":
      return `${DEFAULT_EXPORT_RETENTION_DAYS}-day retention`;
    case "caregiver_support":
      return "Active while the caregiver invite remains in force";
    case "emergency_access":
      return "Break-glass session only";
    case "ai_assistance":
      return "Kept with the source record";
    default:
      return "Kept with the patient record";
  }
}

export function buildPrivacyPolicy(
  scope: PrivacyScope
): PrivacyPolicyEntry {
  return {
    scope,
    label: getPrivacyScopeLabel(scope),
    description: getPrivacyScopeDescription(scope),
    allowsCaregiverAccess: canCaregiverAccessScope(scope),
    allowsExport: canExportScope(scope),
    allowsAiProcessing: canAiProcessScope(scope),
    retentionLabel: getPrivacyScopeRetentionLabel(scope),
  };
}

export function listPrivacyPolicy(): PrivacyPolicyEntry[] {
  return listPrivacyScopes().map(buildPrivacyPolicy);
}

export function getCaregiverAccessTier(
  scopes: readonly PrivacyScope[]
): CaregiverAccessTier {
  return scopes.includes("caregiver_support")
    ? "log_on_behalf_of"
    : "read_only";
}

export function getCaregiverAccessTierLabel(
  tier: CaregiverAccessTier
): string {
  return tier === "log_on_behalf_of"
    ? "Log on behalf of"
    : "Read only";
}

export function getCaregiverAccessTierDescription(
  tier: CaregiverAccessTier
): string {
  return tier === "log_on_behalf_of"
    ? "Can create entries on the patient's behalf when the patient has explicitly invited support."
    : "Can review the shared record without changing it.";
}

export function buildCaregiverAccessPolicy(
  scopes: readonly PrivacyScope[]
): CaregiverAccessPolicy {
  const normalized = normalizePrivacyScopes(scopes);
  const tier = getCaregiverAccessTier(normalized);

  return {
    tier,
    label: getCaregiverAccessTierLabel(tier),
    description: getCaregiverAccessTierDescription(tier),
    scopes: normalized,
  };
}

export function describeExportRetentionWindow(
  days: number = DEFAULT_EXPORT_RETENTION_DAYS
): string {
  return `${days}-day retention`;
}

export function getDefaultExportExpirationDate(
  createdAt: Date = new Date(),
  days: number = DEFAULT_EXPORT_RETENTION_DAYS
): Date {
  return addDays(createdAt, days);
}

export function describeConsentAuditRetention(): string {
  return `${DEFAULT_CONSENT_AUDIT_RETENTION_DAYS}-day audit retention`;
}

export function describeProvenanceRetentionWindow(
  days: number = DEFAULT_PROVENANCE_RETENTION_DAYS
): string {
  return `${days}-day audit retention`;
}
