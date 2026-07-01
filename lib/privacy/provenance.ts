/**
 * =============================================================================
 * ChroniSync
 * Provenance Helpers
 * =============================================================================
 */

import { humanize } from "@/lib/utils";

import { z } from "zod";

export const PROVENANCE_SOURCE_KIND_VALUES = [
  "ai",
  "human",
  "device",
  "import",
  "system",
  "export",
] as const;

export const provenanceSourceKindSchema = z.enum(
  PROVENANCE_SOURCE_KIND_VALUES
);

export type ProvenanceSourceKind = z.infer<
  typeof provenanceSourceKindSchema
>;

export const PROVENANCE_SUBJECT_TYPE_VALUES = [
  "document",
  "summary",
  "export",
  "consent",
  "caregiver",
  "alert",
] as const;

export const provenanceSubjectTypeSchema = z.enum(
  PROVENANCE_SUBJECT_TYPE_VALUES
);

export type ProvenanceSubjectType = z.infer<
  typeof provenanceSubjectTypeSchema
>;

export interface ProvenanceRecord {
  id: string;
  subjectType: ProvenanceSubjectType;
  subjectId: string;
  sourceKind: ProvenanceSourceKind;
  sourceId?: string;
  sourceLabel?: string;
  inputFingerprint?: string;
  outputFingerprint?: string;
  model?: string;
  redacted: boolean;
  confidence?: number;
  reviewedBy?: string;
  reviewedAt?: Date;
  createdAt: Date;
  metadata?: Record<string, unknown>;
}

export interface ProvenanceInput {
  subjectType: ProvenanceSubjectType;
  subjectId: string;
  sourceKind: ProvenanceSourceKind;
  sourceId?: string;
  sourceLabel?: string;
  input?: unknown;
  output?: unknown;
  model?: string;
  redacted?: boolean;
  confidence?: number;
  reviewedBy?: string;
  reviewedAt?: Date;
  metadata?: Record<string, unknown>;
}

export interface ProvenanceSummary {
  total: number;
  ai: number;
  human: number;
  device: number;
  imported: number;
  system: number;
  exported: number;
  redacted: number;
}

function createRecordId(): string {
  return typeof globalThis.crypto?.randomUUID === "function"
    ? globalThis.crypto.randomUUID()
    : `prov_${Date.now()}_${Math.random().toString(36).slice(2, 10)}`;
}

function createTimestamp(): Date {
  return new Date();
}

function normalizeForFingerprint(value: unknown): unknown {
  if (value instanceof Date) {
    return value.toISOString();
  }

  if (Array.isArray(value)) {
    return value.map((item) => normalizeForFingerprint(item));
  }

  if (value && typeof value === "object") {
    return Object.fromEntries(
      Object.entries(value as Record<string, unknown>)
        .sort(([left], [right]) => left.localeCompare(right))
        .map(([key, child]) => [key, normalizeForFingerprint(child)])
    );
  }

  return value;
}

function stringifyForFingerprint(value: unknown): string {
  try {
    return JSON.stringify(normalizeForFingerprint(value));
  } catch {
    return String(value);
  }
}

function hashString(value: string): string {
  let hash = 0;

  for (let index = 0; index < value.length; index += 1) {
    hash = (hash * 31 + value.charCodeAt(index)) >>> 0;
  }

  return hash.toString(36).padStart(8, "0");
}

export function createProvenanceFingerprint(value: unknown): string {
  return `fp_${hashString(stringifyForFingerprint(value))}`;
}

export function buildProvenanceRecord(
  input: ProvenanceInput
): ProvenanceRecord {
  const timestamp = createTimestamp();
  const fingerprintBase = {
    subjectType: input.subjectType,
    subjectId: input.subjectId,
    sourceKind: input.sourceKind,
    ...(input.sourceId ? { sourceId: input.sourceId } : {}),
    ...(input.sourceLabel ? { sourceLabel: input.sourceLabel } : {}),
    ...(input.model ? { model: input.model } : {}),
    ...(input.confidence !== undefined ? { confidence: input.confidence } : {}),
    ...(input.metadata ? { metadata: input.metadata } : {}),
  };

  return {
    id: createRecordId(),
    subjectType: input.subjectType,
    subjectId: input.subjectId,
    sourceKind: input.sourceKind,
    ...(input.sourceId ? { sourceId: input.sourceId } : {}),
    ...(input.sourceLabel ? { sourceLabel: input.sourceLabel } : {}),
    ...(input.input !== undefined
      ? { inputFingerprint: createProvenanceFingerprint(input.input) }
      : {}),
    ...(input.output !== undefined
      ? { outputFingerprint: createProvenanceFingerprint(input.output) }
      : {}),
    ...(input.model ? { model: input.model } : {}),
    redacted: input.redacted ?? false,
    ...(input.confidence !== undefined ? { confidence: input.confidence } : {}),
    ...(input.reviewedBy ? { reviewedBy: input.reviewedBy } : {}),
    ...(input.reviewedAt ? { reviewedAt: input.reviewedAt } : {}),
    createdAt: timestamp,
    ...(input.metadata
      ? {
          metadata: {
            ...input.metadata,
            fingerprint: createProvenanceFingerprint(fingerprintBase),
          },
        }
      : {
          metadata: {
            fingerprint: createProvenanceFingerprint(fingerprintBase),
          },
        }),
  };
}

export function summarizeProvenanceRecords(
  records: readonly ProvenanceRecord[]
): ProvenanceSummary {
  return records.reduce<ProvenanceSummary>(
    (accumulator, record) => {
      accumulator.total += 1;

      switch (record.sourceKind) {
        case "ai":
          accumulator.ai += 1;
          break;
        case "human":
          accumulator.human += 1;
          break;
        case "device":
          accumulator.device += 1;
          break;
        case "import":
          accumulator.imported += 1;
          break;
        case "system":
          accumulator.system += 1;
          break;
        case "export":
          accumulator.exported += 1;
          break;
        default:
          break;
      }

      if (record.redacted) {
        accumulator.redacted += 1;
      }

      return accumulator;
    },
    {
      total: 0,
      ai: 0,
      human: 0,
      device: 0,
      imported: 0,
      system: 0,
      exported: 0,
      redacted: 0,
    }
  );
}

export function formatProvenanceReference(
  record: ProvenanceRecord
): string {
  return `${record.subjectType}:${record.subjectId}`;
}

export function describeProvenanceRecord(
  record: ProvenanceRecord
): string {
  const sourceLabel = record.sourceLabel ?? humanize(record.sourceKind);
  return `${humanize(record.subjectType)} from ${sourceLabel}`;
}
