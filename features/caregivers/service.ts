/**
 * =============================================================================
 * ChroniSync
 * Caregiver Feature Service
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
import {
  formatDateTime,
  humanize,
} from "@/lib/utils";
import {
  getPrivacyScopeLabel,
  normalizePrivacyScopes,
} from "@/lib/privacy/policy";

import type {
  CaregiverCreateInput,
  CaregiverFilters,
  CaregiverRecord,
  CaregiverSummary,
  CaregiverUpdateInput,
  CaregiverViewModel,
} from "./types";

import type { CaregiverFormValues } from "./validation";

const COLLECTION = "caregivers";

export type {
  CaregiverCreateInput,
  CaregiverFilters,
  CaregiverPermission,
  CaregiverRecord,
  CaregiverRelationship,
  CaregiverSortOrder,
  CaregiverStatus,
  CaregiverSummary,
  CaregiverUpdateInput,
  CaregiverViewModel,
} from "./types";

function createRecordId(): string {
  return typeof globalThis.crypto?.randomUUID === "function"
    ? globalThis.crypto.randomUUID()
    : `car_${Date.now()}_${Math.random().toString(36).slice(2, 10)}`;
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

function matchesQuery(caregiver: CaregiverRecord, query: string): boolean {
  const normalized = query.trim().toLowerCase();

  if (!normalized) {
    return true;
  }

  const haystack = [
    caregiver.fullName,
    caregiver.email,
    caregiver.phoneNumber,
    caregiver.relationship,
    caregiver.notes,
    ...(caregiver.permissions.map(getPrivacyScopeLabel) as string[]),
  ]
    .filter((value): value is string => Boolean(value))
    .join(" ")
    .toLowerCase();

  return haystack.includes(normalized);
}

function sortCaregivers(
  caregivers: CaregiverRecord[],
  sort: CaregiverFilters["sort"] = "newest"
): CaregiverRecord[] {
  const copy = [...caregivers];

  switch (sort) {
    case "oldest":
      return copy.sort(
        (left, right) => left.createdAt.getTime() - right.createdAt.getTime()
      );
    case "relationship":
      return copy.sort((left, right) =>
        humanize(left.relationship).localeCompare(
          humanize(right.relationship)
        )
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

export function buildCaregiverRecord(
  data: CaregiverCreateInput
): CaregiverRecord {
  const timestamp = createTimestamp();
  const permissions = normalizePrivacyScopes(data.permissions);

  return {
    ...data,
    id: createRecordId(),
    permissions,
    status: data.status ?? "invited",
    isPrimary: data.isPrimary ?? false,
    ...(data.status === "active" ? { acceptedAt: timestamp } : {}),
    ...(data.status === "revoked" ? { revokedAt: timestamp } : {}),
    createdAt: timestamp,
    updatedAt: timestamp,
  };
}

export function buildCaregiverCreateInput(
  values: CaregiverFormValues
): CaregiverCreateInput {
  const email = trimOrUndefined(values.email);
  const phoneNumber = trimOrUndefined(values.phoneNumber);
  const notes = trimOrUndefined(values.notes);
  const invitedBy = trimOrUndefined(values.invitedBy);

  return {
    patientId: values.patientId.trim(),
    fullName: values.fullName.trim(),
    relationship: values.relationship,
    ...(email ? { email } : {}),
    ...(phoneNumber ? { phoneNumber } : {}),
    permissions: normalizePrivacyScopes(values.permissions),
    status: values.status,
    isPrimary: values.isPrimary,
    ...(notes ? { notes } : {}),
    ...(invitedBy ? { invitedBy } : {}),
  };
}

export function buildCaregiverViewModel(
  caregiver: CaregiverRecord
): CaregiverViewModel {
  const permissionLabel =
    caregiver.permissions
      .map(getPrivacyScopeLabel)
      .join(", ") || "No permissions";

  return {
    caregiver,
    relationshipLabel: humanize(caregiver.relationship),
    statusLabel: humanize(caregiver.status),
    permissionLabel,
    timeLabel: formatDateTime(caregiver.createdAt),
    summary:
      caregiver.notes ??
      `${humanize(caregiver.relationship)} support for ${caregiver.fullName}`,
    isActive: caregiver.status === "active",
  };
}

export function summarizeCaregivers(
  caregivers: CaregiverRecord[]
): CaregiverSummary {
  return caregivers.reduce<CaregiverSummary>(
    (accumulator, caregiver) => {
      accumulator.total += 1;

      switch (caregiver.status) {
        case "active":
          accumulator.active += 1;
          break;
        case "invited":
          accumulator.invited += 1;
          break;
        case "paused":
          accumulator.paused += 1;
          break;
        case "revoked":
          accumulator.revoked += 1;
          break;
        default:
          break;
      }

      if (caregiver.isPrimary) {
        accumulator.primary += 1;
      }

      return accumulator;
    },
    {
      total: 0,
      active: 0,
      invited: 0,
      paused: 0,
      revoked: 0,
      primary: 0,
    }
  );
}

export async function createCaregiver(
  data: CaregiverCreateInput
): Promise<CaregiverRecord> {
  const record = buildCaregiverRecord(data);

  await createFirestoreDocument<CaregiverRecord>(
    COLLECTION,
    record.id,
    record
  );

  return record;
}

export async function getCaregiverById(
  caregiverId: string
): Promise<CaregiverRecord | null> {
  return getFirestoreDocument<CaregiverRecord>(COLLECTION, caregiverId);
}

export async function listCaregiversByPatient(
  patientId: string
): Promise<CaregiverRecord[]> {
  return queryDocuments<CaregiverRecord>(
    COLLECTION,
    whereEquals("patientId", patientId)
  );
}

export async function listActiveCaregiversByPatient(
  patientId: string
): Promise<CaregiverRecord[]> {
  const caregivers = await listCaregiversByPatient(patientId);
  return caregivers.filter((caregiver) => caregiver.status === "active");
}

export async function listPrimaryCaregiversByPatient(
  patientId: string
): Promise<CaregiverRecord[]> {
  const caregivers = await listCaregiversByPatient(patientId);
  return caregivers.filter((caregiver) => caregiver.isPrimary);
}

export async function listCaregiversByFilters(
  filters: CaregiverFilters = {}
): Promise<CaregiverRecord[]> {
  const hasPatientFilter = Boolean(filters.patientId);
  const baseCaregivers = hasPatientFilter
    ? await listCaregiversByPatient(filters.patientId as string)
    : await queryDocuments<CaregiverRecord>(COLLECTION);

  const filtered = baseCaregivers.filter((caregiver) => {
    if (filters.status && caregiver.status !== filters.status) {
      return false;
    }

    if (
      filters.relationship &&
      caregiver.relationship !== filters.relationship
    ) {
      return false;
    }

    if (
      filters.permission &&
      !caregiver.permissions.includes(filters.permission)
    ) {
      return false;
    }

    if (filters.query && !matchesQuery(caregiver, filters.query)) {
      return false;
    }

    return true;
  });

  const sorted = sortCaregivers(filtered, filters.sort);
  return sorted.slice(0, filters.limit ?? 20);
}

export async function listCaregiverViewModelsByFilters(
  filters: CaregiverFilters = {}
): Promise<CaregiverViewModel[]> {
  const records = await listCaregiversByFilters(filters);
  return records.map(buildCaregiverViewModel);
}

export async function updateCaregiver(
  caregiverId: string,
  updates: CaregiverUpdateInput
): Promise<CaregiverRecord> {
  const current = await getCaregiverById(caregiverId);

  if (!current) {
    throw new Error(`Caregiver ${caregiverId} was not found.`);
  }

  const next: CaregiverRecord = {
    ...current,
    ...updates,
    ...(updates.permissions
      ? { permissions: normalizePrivacyScopes(updates.permissions) }
      : {}),
    updatedAt: createTimestamp(),
  };

  await updateFirestoreDocument<CaregiverRecord>(
    COLLECTION,
    caregiverId,
    next
  );

  return next;
}

export async function activateCaregiver(
  caregiverId: string
): Promise<CaregiverRecord> {
  return updateCaregiver(caregiverId, {
    status: "active",
    acceptedAt: createTimestamp(),
  } as CaregiverUpdateInput);
}

export async function pauseCaregiver(
  caregiverId: string
): Promise<CaregiverRecord> {
  return updateCaregiver(caregiverId, {
    status: "paused",
  });
}

export async function revokeCaregiver(
  caregiverId: string,
  reason?: string
): Promise<CaregiverRecord> {
  return updateCaregiver(caregiverId, {
    status: "revoked",
    revokedAt: createTimestamp(),
    ...(reason ? { notes: reason } : {}),
  });
}

export async function deleteCaregiver(
  caregiverId: string
): Promise<void> {
  await deleteFirestoreDocument(COLLECTION, caregiverId);
}
