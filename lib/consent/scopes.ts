/**
 * =============================================================================
 * ChroniSync
 * Consent Scope Helpers
 * =============================================================================
 */

import { humanize } from "@/lib/utils";

import {
  canAiProcessScope,
  canCaregiverAccessScope,
  canExportScope,
  getPrivacyScopeDescription,
  getPrivacyScopeLabel,
  isPrivacyScope,
  listPrivacyScopes,
  normalizePrivacyScopes,
  PRIVACY_SCOPE_VALUES,
  privacyScopeSchema,
  type PrivacyScope,
} from "@/lib/privacy/policy";

export type ConsentScope = PrivacyScope;

export const CONSENT_SCOPE_VALUES = PRIVACY_SCOPE_VALUES;

export const consentScopeSchema = privacyScopeSchema;

export const CONSENT_SCOPE_GROUP_VALUES = [
  "profile",
  "clinical",
  "support",
  "automation",
  "sharing",
  "emergency",
] as const;

export type ConsentScopeGroup =
  (typeof CONSENT_SCOPE_GROUP_VALUES)[number];

const CONSENT_SCOPE_GROUP_MAP: Record<
  ConsentScopeGroup,
  readonly ConsentScope[]
> = {
  profile: ["view_profile"],
  clinical: [
    "view_medications",
    "view_vitals",
    "view_symptoms",
    "view_diseases",
    "view_documents",
    "view_summaries",
    "receive_alerts",
  ],
  support: ["caregiver_support"],
  automation: ["ai_assistance"],
  sharing: ["export_records"],
  emergency: ["emergency_access"],
};

export function listConsentScopes(): ConsentScope[] {
  return listPrivacyScopes();
}

export function isConsentScope(value: string): value is ConsentScope {
  return isPrivacyScope(value);
}

export function normalizeConsentScopes(
  scopes: readonly ConsentScope[]
): ConsentScope[] {
  return normalizePrivacyScopes(scopes);
}

export function getConsentScopeLabel(scope: ConsentScope): string {
  return getPrivacyScopeLabel(scope);
}

export function getConsentScopeDescription(scope: ConsentScope): string {
  return getPrivacyScopeDescription(scope);
}

export function canConsentScopeBeAccessedByCaregiver(
  scope: ConsentScope
): boolean {
  return canCaregiverAccessScope(scope);
}

export function canConsentScopeBeExported(scope: ConsentScope): boolean {
  return canExportScope(scope);
}

export function canConsentScopeUseAi(scope: ConsentScope): boolean {
  return canAiProcessScope(scope);
}

export function getConsentScopeGroup(
  scope: ConsentScope
): ConsentScopeGroup {
  for (const [group, values] of Object.entries(
    CONSENT_SCOPE_GROUP_MAP
  ) as Array<[ConsentScopeGroup, readonly ConsentScope[]]>) {
    if (values.includes(scope)) {
      return group;
    }
  }

  return "clinical";
}

export function listConsentScopesByGroup(
  group: ConsentScopeGroup
): ConsentScope[] {
  return [...CONSENT_SCOPE_GROUP_MAP[group]];
}

export function getConsentScopeGroupLabel(
  group: ConsentScopeGroup
): string {
  return humanize(group);
}

export function describeConsentScopeAccess(
  scope: ConsentScope
): string {
  return `${getConsentScopeLabel(scope)} (${getConsentScopeGroupLabel(
    getConsentScopeGroup(scope)
  )})`;
}
