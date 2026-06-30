import { COLLECTIONS } from "@/config/firebase";
import {
  createDocument as createFirestoreDocument,
  deleteDocument as deleteFirestoreDocument,
  getDocument as getFirestoreDocument,
  queryDocuments,
  updateDocument as updateFirestoreDocument,
  whereEquals,
} from "@/lib/firebase/firestore";
import type { Disease } from "@/types/disease";

import type { DiseaseFormValues } from "./validation";

const COLLECTION = COLLECTIONS.DISEASES;

export type DiseaseRecord = Disease;

export type DiseaseCreateInput = Omit<
  DiseaseRecord,
  "id" | "createdAt" | "updatedAt"
>;

export type DiseaseUpdateInput = Partial<
  Omit<
    DiseaseRecord,
    "id" | "patientId" | "createdAt" | "updatedAt"
  >
>;

function createRecordId(): string {
  return typeof globalThis.crypto?.randomUUID === "function"
    ? globalThis.crypto.randomUUID()
    : `dis_${Date.now()}_${Math.random().toString(36).slice(2, 10)}`;
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

export function buildDiseaseRecord(
  data: DiseaseCreateInput
): DiseaseRecord {
  const timestamp = createTimestamp();

  return {
    ...data,
    id: createRecordId(),
    createdAt: timestamp,
    updatedAt: timestamp,
  };
}

export function buildDiseaseCreateInput(
  values: DiseaseFormValues
): DiseaseCreateInput {
  const icd10Code = trimOrUndefined(values.icd10Code);
  const notes = trimOrUndefined(values.notes);

  return {
    patientId: values.patientId.trim(),
    name: values.name.trim(),
    status: values.status,
    ...(icd10Code ? { icd10Code } : {}),
    ...(values.severity ? { severity: values.severity } : {}),
    ...(values.isChronic !== undefined ? { isChronic: values.isChronic } : {}),
    ...(notes ? { notes } : {}),
  };
}

export async function createDisease(
  data: DiseaseCreateInput
): Promise<DiseaseRecord> {
  const record = buildDiseaseRecord(data);
  await createFirestoreDocument<DiseaseRecord>(
    COLLECTION,
    record.id,
    record
  );
  return record;
}

export async function getDiseaseById(
  diseaseId: string
): Promise<DiseaseRecord | null> {
  return getFirestoreDocument<DiseaseRecord>(COLLECTION, diseaseId);
}

export async function listDiseasesByPatient(
  patientId: string
): Promise<DiseaseRecord[]> {
  return queryDocuments<DiseaseRecord>(
    COLLECTION,
    whereEquals("patientId", patientId)
  );
}

export async function updateDisease(
  diseaseId: string,
  updates: DiseaseUpdateInput
): Promise<DiseaseRecord> {
  const current = await getDiseaseById(diseaseId);

  if (!current) {
    throw new Error(`Disease ${diseaseId} was not found.`);
  }

  const next: DiseaseRecord = {
    ...current,
    ...updates,
    updatedAt: createTimestamp(),
  };

  await updateFirestoreDocument<DiseaseRecord>(
    COLLECTION,
    diseaseId,
    next
  );

  return next;
}

export async function deleteDisease(
  diseaseId: string
): Promise<void> {
  await deleteFirestoreDocument(COLLECTION, diseaseId);
}
