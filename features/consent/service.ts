/**
 * =============================================================================
 * ChroniSync
 * Consent Feature Service
 * =============================================================================
 */

import {
  createDocument as createFirestoreDocument,
  deleteDocument as deleteFirestoreDocument,
  getDocument as getFirestoreDocument,
  queryDocuments,
  updateDocument as updateFirestoreDocument,
  whereEquals,
} from "@/lib/firebase/firestore";
import { formatDateTime, humanize } from "@/lib/utils";
import {
  getConsentStatusLabel,
  hasActiveConsentForScope,
  isConsentActive,
  isConsentExpired,
  summarizeConsentRecords,
} from "@/lib/privacy/consent";

import type {
  ConsentCreateInput,
  ConsentFilters,
  ConsentRecord,
  ConsentSummary,
  ConsentUpdateInput,
  ConsentViewModel,
} from "./types";

import type { ConsentFormValues } from "./validation";

const COLLECTION = "consents";

export type {
  ConsentActionState,
  ConsentCreateInput,
  ConsentFilters,
  ConsentRecord,
  ConsentScope,
  ConsentSummary,
  ConsentTargetType,
  ConsentUpdateInput,
  ConsentViewModel,
} from "./types";

function createRecordId(): string {
  return typeof globalThis.crypto?.randomUUID === "function"
    ? globalThis.crypto.randomUUID()
    : `con_${Date.now()}_${Math.random().toString(36).slice(2, 10)}`;
}

function createTimestamp(): Date {
  return new Date();
}

const trimOrUndefined = (value: string | undefined): string | undefined => {
  if (typeof value !== "string") {
    return undefined;
  }

  const trimmed = value.trim();
  return trimmed === "" ? undefined : trimmed;
};

function parseDateOrFallback(
  value: string | undefined,
  fallback: Date
): Date {
  if (!value) {
    return fallback;
  }

  const parsed = new Date(value);

  if (Number.isNaN(parsed.getTime())) {
    throw new Error(`Invalid date value: ${value}`);
  }

  return parsed;
}

function matchesQuery(consent: ConsentRecord, query: string): boolean {
  const normalized = query.trim().toLowerCase();

  if (!normalized) {
    return true;
  }

  const haystack = [
    consent.targetLabel,
    consent.targetId,
    consent.purpose,
    consent.notes,
    consent.evidence,
    consent.grantedBy,
  ]
    .filter((value): value is string => Boolean(value))
    .join(" ")
    .toLowerCase();

  return haystack.includes(normalized);
}

function sortConsents(
  consents: ConsentRecord[],
  sort: ConsentFilters["sort"] = "newest"
): ConsentRecord[] {
  const copy = [...consents];

  switch (sort) {
    case "oldest":
      return copy.sort(
        (left, right) => left.createdAt.getTime() - right.createdAt.getTime()
      );
    case "status":
      return copy.sort((left, right) =>
        humanize(left.status).localeCompare(humanize(right.status))
      );
    case "scope":
      return copy.sort((left, right) =>
        humanize(left.scope).localeCompare(humanize(right.scope))
      );
    case "newest":
    default:
      return copy.sort(
        (left, right) => right.createdAt.getTime() - left.createdAt.getTime()
      );
  }
}

export function buildConsentRecord(
  data: ConsentCreateInput
): ConsentRecord {
  const timestamp = createTimestamp();
  const effectiveAt = data.effectiveAt ?? timestamp;
  const status = data.status ?? "granted";

  return {
    ...data,
    id: createRecordId(),
    status,
    channel: data.channel ?? "app",
    effectiveAt,
    ...(status === "granted" && !data.grantedAt
      ? { grantedAt: timestamp }
      : {}),
    ...(status === "revoked" && !data.revokedAt
      ? { revokedAt: timestamp }
      : {}),
    ...(status === "expired" && !data.expiresAt
      ? { expiresAt: timestamp }
      : {}),
    createdAt: timestamp,
    updatedAt: timestamp,
  };
}

export function buildConsentCreateInput(
  values: ConsentFormValues
): ConsentCreateInput {
  const targetId = trimOrUndefined(values.targetId);
  const targetLabel = trimOrUndefined(values.targetLabel);
  const purpose = trimOrUndefined(values.purpose);
  const grantedBy = trimOrUndefined(values.grantedBy);
  const effectiveAt = parseDateOrFallback(values.effectiveAt, new Date());
  const expiresAt = values.expiresAt
    ? parseDateOrFallback(values.expiresAt, new Date())
    : undefined;
  const evidence = trimOrUndefined(values.evidence);
  const notes = trimOrUndefined(values.notes);

  return {
    patientId: values.patientId.trim(),
    scope: values.scope,
    status: values.status,
    targetType: values.targetType,
    ...(targetId ? { targetId } : {}),
    ...(targetLabel ? { targetLabel } : {}),
    ...(purpose ? { purpose } : {}),
    channel: values.channel,
    ...(grantedBy ? { grantedBy } : {}),
    effectiveAt,
    ...(expiresAt ? { expiresAt } : {}),
    ...(evidence ? { evidence } : {}),
    ...(notes ? { notes } : {}),
  };
}

export function buildConsentViewModel(
  consent: ConsentRecord
): ConsentViewModel {
  const targetLabel =
    consent.targetLabel ??
    consent.targetId ??
    humanize(consent.targetType ?? "caregiver");

  return {
    consent,
    scopeLabel: humanize(consent.scope),
    statusLabel: getConsentStatusLabel(consent.status),
    targetLabel,
    timeLabel: formatDateTime(consent.effectiveAt),
    summary:
      consent.purpose ??
      consent.notes ??
      `${humanize(consent.scope)} access for ${targetLabel}`,
    isActive: isConsentActive(consent),
    isExpired: isConsentExpired(consent),
  };
}

export function summarizeConsents(
  consents: ConsentRecord[]
): ConsentSummary {
  const snapshot = summarizeConsentRecords(consents);
  return {
    total: snapshot.total,
    active: snapshot.granted,
    pending: snapshot.pending,
    revoked: snapshot.revoked,
    expired: snapshot.expired,
    scopeCount: snapshot.activeScopes.length,
    lastUpdated: snapshot.lastUpdated,
  };
}

export async function createConsent(
  data: ConsentCreateInput
): Promise<ConsentRecord> {
  const record = buildConsentRecord(data);

  await createFirestoreDocument<ConsentRecord>(
    COLLECTION,
    record.id,
    record
  );

  return record;
}

export async function getConsentById(
  consentId: string
): Promise<ConsentRecord | null> {
  return getFirestoreDocument<ConsentRecord>(COLLECTION, consentId);
}

export async function listConsentsByPatient(
  patientId: string
): Promise<ConsentRecord[]> {
  return queryDocuments<ConsentRecord>(
    COLLECTION,
    whereEquals("patientId", patientId)
  );
}

export async function listConsentsByScope(
  scope: ConsentRecord["scope"]
): Promise<ConsentRecord[]> {
  return queryDocuments<ConsentRecord>(
    COLLECTION,
    whereEquals("scope", scope)
  );
}

export async function listConsentsByStatus(
  status: ConsentRecord["status"]
): Promise<ConsentRecord[]> {
  return queryDocuments<ConsentRecord>(
    COLLECTION,
    whereEquals("status", status)
  );
}

export async function listActiveConsentsByPatient(
  patientId: string
): Promise<ConsentRecord[]> {
  const consents = await listConsentsByPatient(patientId);
  return consents.filter((consent) => isConsentActive(consent));
}

export async function listConsentViewModelsByFilters(
  filters: ConsentFilters = {}
): Promise<ConsentViewModel[]> {
  const records = await listConsentsByFilters(filters);
  return records.map(buildConsentViewModel);
}

export async function listConsentsByFilters(
  filters: ConsentFilters = {}
): Promise<ConsentRecord[]> {
  const hasPatientFilter = Boolean(filters.patientId);
  const baseConsents = hasPatientFilter
    ? await listConsentsByPatient(filters.patientId as string)
    : await queryDocuments<ConsentRecord>(COLLECTION);

  const filtered = baseConsents.filter((consent) => {
    if (filters.scope && consent.scope !== filters.scope) {
      return false;
    }

    if (filters.status && consent.status !== filters.status) {
      return false;
    }

    if (
      filters.targetType &&
      consent.targetType !== filters.targetType
    ) {
      return false;
    }

    if (filters.query && !matchesQuery(consent, filters.query)) {
      return false;
    }

    return true;
  });

  const sorted = sortConsents(filtered, filters.sort);
  return sorted.slice(0, filters.limit ?? 20);
}

export async function updateConsent(
  consentId: string,
  updates: ConsentUpdateInput
): Promise<ConsentRecord> {
  const current = await getConsentById(consentId);

  if (!current) {
    throw new Error(`Consent ${consentId} was not found.`);
  }

  const next: ConsentRecord = {
    ...current,
    ...updates,
    updatedAt: createTimestamp(),
  };

  await updateFirestoreDocument<ConsentRecord>(
    COLLECTION,
    consentId,
    next
  );

  return next;
}

export async function grantConsent(
  consentId: string
): Promise<ConsentRecord> {
  return updateConsent(consentId, {
    status: "granted",
    grantedAt: createTimestamp(),
  } as ConsentUpdateInput);
}

export async function revokeConsent(
  consentId: string,
  reason?: string
): Promise<ConsentRecord> {
  return updateConsent(consentId, {
    status: "revoked",
    revokedAt: createTimestamp(),
    ...(reason ? { notes: reason } : {}),
  });
}

export async function expireConsent(
  consentId: string
): Promise<ConsentRecord> {
  return updateConsent(consentId, {
    status: "expired",
    expiresAt: createTimestamp(),
  });
}

export async function deleteConsent(
  consentId: string
): Promise<void> {
  await deleteFirestoreDocument(COLLECTION, consentId);
}

export function hasConsentForScope(
  consents: readonly ConsentRecord[],
  scope: ConsentRecord["scope"]
): boolean {
  return hasActiveConsentForScope(consents, scope);
}
