/**
 * =============================================================================
 * ChroniSync
 * Privacy Policy Helpers
 * =============================================================================
 */

import { z } from "zod";

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

export interface PrivacyPolicyEntry {
  scope: PrivacyScope;
  label: string;
  description: string;
  allowsCaregiverAccess: boolean;
  allowsExport: boolean;
  allowsAiProcessing: boolean;
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
  };
}

export function listPrivacyPolicy(): PrivacyPolicyEntry[] {
  return listPrivacyScopes().map(buildPrivacyPolicy);
}
