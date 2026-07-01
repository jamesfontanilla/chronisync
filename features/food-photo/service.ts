/**
 * =============================================================================
 * ChroniSync
 * Food Photo Feature Service
 * =============================================================================
 */

import { logger } from "@/lib/logger";
import {
  createDocument,
  deleteDocument,
  getDocument,
  queryDocuments,
  updateDocument,
  whereEquals,
} from "@/lib/firebase/firestore";
import { formatDateTime, humanize } from "@/lib/utils";

import type {
  FoodPhotoCreateInput,
  FoodPhotoFilters,
  FoodPhotoRecord,
  FoodPhotoSummary,
  FoodPhotoUpdateInput,
  FoodPhotoViewModel,
} from "./types";

export type {
  FoodPhotoCreateInput,
  FoodPhotoFilters,
  FoodPhotoMealType,
  FoodPhotoRecord,
  FoodPhotoSource,
  FoodPhotoStatus,
  FoodPhotoSummary,
  FoodPhotoUpdateInput,
  FoodPhotoViewModel,
} from "./types";

const COLLECTION = "foodPhotoLogs";
const DEMO_PATIENT_ID = "demo-patient";
const DEMO_REFERENCE_TIMESTAMP = Date.parse("2026-07-01T00:08:00.000Z");

function createRecordId(): string {
  return typeof globalThis.crypto?.randomUUID === "function"
    ? globalThis.crypto.randomUUID()
    : `food_${Date.now()}_${Math.random().toString(36).slice(2, 10)}`;
}

function createTimestamp(minutesAgo = 0): Date {
  return new Date(DEMO_REFERENCE_TIMESTAMP - minutesAgo * 60_000);
}

function normalizeDate(value: unknown): Date {
  if (value instanceof Date) {
    return value;
  }

  if (typeof value === "string" || typeof value === "number") {
    return new Date(value);
  }

  if (
    value &&
    typeof value === "object" &&
    "toDate" in value &&
    typeof (value as { toDate: () => Date }).toDate === "function"
  ) {
    return (value as { toDate: () => Date }).toDate();
  }

  return createTimestamp();
}

function normalizeRecord(record: FoodPhotoRecord): FoodPhotoRecord {
  return {
    ...record,
    capturedAt: normalizeDate(record.capturedAt),
    createdAt: normalizeDate(record.createdAt),
    updatedAt: normalizeDate(record.updatedAt),
  };
}

function matchesQuery(record: FoodPhotoRecord, query: string): boolean {
  const normalized = query.trim().toLowerCase();

  if (!normalized) {
    return true;
  }

  const haystack = [
    record.mealLabel,
    record.mealType,
    record.portionLabel,
    record.source,
    record.status,
    record.notes,
    ...(record.suggestedEdits ?? []),
  ]
    .filter((value): value is string => Boolean(value))
    .join(" ")
    .toLowerCase();

  return haystack.includes(normalized);
}

function inferMealProfile(mealLabel: string) {
  const normalized = mealLabel.trim().toLowerCase();

  if (
    normalized.includes("salad") ||
    normalized.includes("grilled") ||
    normalized.includes("fish")
  ) {
    return {
      confidence: 0.84,
      estimatedCalories: 360,
      estimatedCarbsG: 18,
      estimatedProteinG: 32,
      estimatedFatG: 14,
      suggestedEdits: [
        "Confirm dressing or sauce portions.",
        "Adjust protein if the plate was larger than expected.",
      ],
    };
  }

  if (
    normalized.includes("rice") ||
    normalized.includes("adobo") ||
    normalized.includes("noodle") ||
    normalized.includes("spaghetti") ||
    normalized.includes("silog")
  ) {
    return {
      confidence: 0.69,
      estimatedCalories: 610,
      estimatedCarbsG: 54,
      estimatedProteinG: 32,
      estimatedFatG: 24,
      suggestedEdits: [
        "Confirm the rice portion before saving.",
        "Double-check sweetened sauce or added oil.",
      ],
    };
  }

  if (
    normalized.includes("soup") ||
    normalized.includes("lugaw") ||
    normalized.includes("porridge")
  ) {
    return {
      confidence: 0.64,
      estimatedCalories: 280,
      estimatedCarbsG: 38,
      estimatedProteinG: 12,
      estimatedFatG: 8,
      suggestedEdits: [
        "Confirm bowl size or add side dishes if present.",
      ],
    };
  }

  if (
    normalized.includes("fruit") ||
    normalized.includes("yogurt") ||
    normalized.includes("snack")
  ) {
    return {
      confidence: 0.78,
      estimatedCalories: 180,
      estimatedCarbsG: 28,
      estimatedProteinG: 6,
      estimatedFatG: 4,
      suggestedEdits: [
        "Add a second snack if the photo captured more than one serving.",
      ],
    };
  }

  return {
    confidence: 0.63,
    estimatedCalories: 450,
    estimatedCarbsG: 42,
    estimatedProteinG: 18,
    estimatedFatG: 20,
    suggestedEdits: [
      "Confirm the main ingredients before publishing the draft.",
    ],
  };
}

function sortRecords(records: FoodPhotoRecord[]): FoodPhotoRecord[] {
  return [...records].sort(
    (left, right) => right.capturedAt.getTime() - left.capturedAt.getTime()
  );
}

function createDemoRecords(
  patientId: string = DEMO_PATIENT_ID
): FoodPhotoRecord[] {
  return [
    buildFoodPhotoRecord({
      patientId,
      mealType: "lunch",
      mealLabel: "Chicken adobo with rice",
      portionLabel: "1 plate",
      imageName: "lunch-photo.jpg",
      source: "photo",
      status: "needs_review",
      capturedAt: createTimestamp(35),
      notes: "Confirm the rice portion before saving.",
    }),
    buildFoodPhotoRecord({
      patientId,
      mealType: "breakfast",
      mealLabel: "Greek yogurt with fruit",
      portionLabel: "1 bowl",
      imageName: "breakfast-photo.jpg",
      source: "photo",
      status: "draft",
      capturedAt: createTimestamp(160),
      notes: "Waiting for final confirmation.",
    }),
  ];
}

function filterByQuery(
  record: FoodPhotoRecord,
  filters: FoodPhotoFilters
): boolean {
  if (filters.status && record.status !== filters.status) {
    return false;
  }

  if (filters.mealType && record.mealType !== filters.mealType) {
    return false;
  }

  if (filters.query && !matchesQuery(record, filters.query)) {
    return false;
  }

  return true;
}

export function buildFoodPhotoRecord(
  data: FoodPhotoCreateInput
): FoodPhotoRecord {
  const timestamp = data.capturedAt ?? createTimestamp();
  const inferred = inferMealProfile(data.mealLabel);
  const isManualSource = data.source === "manual";
  const suggestedEdits =
    data.suggestedEdits ?? (isManualSource ? [] : inferred.suggestedEdits);

  return normalizeRecord({
    id: createRecordId(),
    patientId: data.patientId.trim(),
    mealType: data.mealType,
    mealLabel: data.mealLabel.trim(),
    imageName: data.imageName.trim(),
    source: data.source ?? "photo",
    status: data.status ?? "draft",
    confidence: data.confidence ?? (isManualSource ? 0.95 : inferred.confidence),
    estimatedCalories: data.estimatedCalories ?? inferred.estimatedCalories,
    estimatedCarbsG: data.estimatedCarbsG ?? inferred.estimatedCarbsG,
    estimatedProteinG: data.estimatedProteinG ?? inferred.estimatedProteinG,
    estimatedFatG: data.estimatedFatG ?? inferred.estimatedFatG,
    capturedAt: timestamp,
    createdAt: timestamp,
    updatedAt: timestamp,
    ...(data.portionLabel?.trim()
      ? { portionLabel: data.portionLabel.trim() }
      : {}),
    ...(data.imageUrl?.trim() ? { imageUrl: data.imageUrl.trim() } : {}),
    ...(data.notes?.trim() ? { notes: data.notes.trim() } : {}),
    ...(suggestedEdits?.length ? { suggestedEdits } : {}),
  });
}

export function buildFoodPhotoViewModel(
  record: FoodPhotoRecord
): FoodPhotoViewModel {
  return {
    record,
    mealTypeLabel: humanize(record.mealType),
    statusLabel: humanize(record.status),
    confidenceLabel: `${Math.round(record.confidence * 100)}% confidence`,
    timeLabel: formatDateTime(record.capturedAt),
    preview:
      record.source === "manual"
        ? `${record.mealLabel} - manual entry`
        : `${record.mealLabel} - ${record.estimatedCalories} kcal estimate`,
  };
}

export function summarizeFoodPhotoRecords(
  records: FoodPhotoRecord[]
): FoodPhotoSummary {
  const normalized = sortRecords(records.map(normalizeRecord));
  const confidenceTotal = normalized.reduce(
    (total, record) => total + record.confidence,
    0
  );

  return {
    total: normalized.length,
    draft: normalized.filter((record) => record.status === "draft").length,
    needsReview: normalized.filter((record) => record.status === "needs_review").length,
    confirmed: normalized.filter((record) => record.status === "confirmed").length,
    rejected: normalized.filter((record) => record.status === "rejected").length,
    averageConfidence:
      normalized.length > 0 ? confidenceTotal / normalized.length : 0,
    lastUpdated: normalized[0]?.updatedAt ?? createTimestamp(),
  };
}

export async function createFoodPhotoRecord(
  data: FoodPhotoCreateInput
): Promise<FoodPhotoRecord> {
  const record = buildFoodPhotoRecord(data);

  try {
    await createDocument<FoodPhotoRecord>(COLLECTION, record.id, record);
  } catch (error) {
    logger.warn("Falling back to a local food photo record.", {
      patientId: record.patientId,
      foodPhotoId: record.id,
      error: error instanceof Error ? error.message : String(error),
    });
  }

  return record;
}

export async function getFoodPhotoRecordById(
  foodPhotoId: string
): Promise<FoodPhotoRecord | null> {
  try {
    const record = await getDocument<FoodPhotoRecord>(COLLECTION, foodPhotoId);

    if (record) {
      return normalizeRecord(record);
    }
  } catch {
    // Fall back to demo data below.
  }

  const demoRecord = createDemoRecords().find(
    (record) => record.id === foodPhotoId
  );

  return demoRecord ? normalizeRecord(demoRecord) : null;
}

export async function listFoodPhotoRecordsByPatient(
  patientId: string,
  filters: Omit<FoodPhotoFilters, "patientId"> = {}
): Promise<FoodPhotoRecord[]> {
  const queryFilters: FoodPhotoFilters = {
    patientId,
    ...(filters.status ? { status: filters.status } : {}),
    ...(filters.mealType ? { mealType: filters.mealType } : {}),
    ...(filters.query ? { query: filters.query } : {}),
    ...(filters.limit ? { limit: filters.limit } : {}),
  };

  try {
    const records = await queryDocuments<FoodPhotoRecord>(
      COLLECTION,
      whereEquals("patientId", patientId)
    );

    const filtered = sortRecords(
      records.map(normalizeRecord).filter((record) =>
        filterByQuery(record, queryFilters)
      )
    );

    if (filtered.length > 0) {
      return filtered.slice(0, queryFilters.limit ?? 20);
    }
  } catch (error) {
    logger.warn("Falling back to demo food photo records.", {
      patientId,
      error: error instanceof Error ? error.message : String(error),
    });
  }

  return sortRecords(
    createDemoRecords(patientId).filter((record) =>
      filterByQuery(record, queryFilters)
    )
  ).slice(0, queryFilters.limit ?? 20);
}

export async function listFoodPhotoViewModelsByPatient(
  patientId: string,
  filters: Omit<FoodPhotoFilters, "patientId"> = {}
): Promise<FoodPhotoViewModel[]> {
  const records = await listFoodPhotoRecordsByPatient(patientId, filters);
  return records.map(buildFoodPhotoViewModel);
}

export async function updateFoodPhotoRecord(
  foodPhotoId: string,
  updates: FoodPhotoUpdateInput
): Promise<FoodPhotoRecord> {
  const existing =
    (await getFoodPhotoRecordById(foodPhotoId)) ??
    buildFoodPhotoRecord({
      patientId: DEMO_PATIENT_ID,
      mealType: "other",
      mealLabel: "Food photo",
      imageName: "placeholder.jpg",
    });

  const record: FoodPhotoRecord = normalizeRecord({
    ...existing,
    ...updates,
    imageName: updates.imageName ?? existing.imageName,
    source: updates.source ?? existing.source,
    status: updates.status ?? existing.status,
    confidence: updates.confidence ?? existing.confidence,
    estimatedCalories:
      updates.estimatedCalories ?? existing.estimatedCalories,
    estimatedCarbsG: updates.estimatedCarbsG ?? existing.estimatedCarbsG,
    estimatedProteinG:
      updates.estimatedProteinG ?? existing.estimatedProteinG,
    estimatedFatG: updates.estimatedFatG ?? existing.estimatedFatG,
    capturedAt: updates.capturedAt ?? existing.capturedAt,
    updatedAt: createTimestamp(),
    ...(updates.portionLabel !== undefined
      ? { portionLabel: updates.portionLabel }
      : existing.portionLabel
        ? { portionLabel: existing.portionLabel }
        : {}),
    ...(updates.imageUrl !== undefined
      ? { imageUrl: updates.imageUrl }
      : existing.imageUrl
        ? { imageUrl: existing.imageUrl }
        : {}),
    ...(updates.notes !== undefined
      ? { notes: updates.notes }
      : existing.notes
        ? { notes: existing.notes }
        : {}),
    ...(updates.suggestedEdits !== undefined
      ? { suggestedEdits: updates.suggestedEdits }
      : existing.suggestedEdits
        ? { suggestedEdits: existing.suggestedEdits }
        : {}),
  });

  try {
    await updateDocument<FoodPhotoRecord>(COLLECTION, foodPhotoId, record);
  } catch (error) {
    logger.warn("Could not persist the food photo update.", {
      foodPhotoId,
      error: error instanceof Error ? error.message : String(error),
    });
  }

  return record;
}

export async function deleteFoodPhotoRecord(
  foodPhotoId: string
): Promise<void> {
  try {
    await deleteDocument(COLLECTION, foodPhotoId);
  } catch (error) {
    logger.warn("Could not delete the food photo record.", {
      foodPhotoId,
      error: error instanceof Error ? error.message : String(error),
    });
  }
}

export function buildFoodPhotoDemoRecord(
  patientId: string = DEMO_PATIENT_ID
): FoodPhotoRecord {
  return buildFoodPhotoRecord({
    patientId,
    mealType: "lunch",
    mealLabel: "Chicken adobo with rice",
    portionLabel: "1 plate",
    imageName: "meal-photo.jpg",
    source: "photo",
    status: "needs_review",
    capturedAt: createTimestamp(35),
    notes: "Confirm the rice portion before saving.",
  });
}

export function describeFoodPhotoSnapshot(
  records: FoodPhotoRecord[]
): string {
  const summary = summarizeFoodPhotoRecords(records);

  return `${summary.total} captures, ${summary.needsReview} pending review`;
}
