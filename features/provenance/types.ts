/**
 * =============================================================================
 * ChroniSync
 * Provenance Feature Types
 * =============================================================================
 */

import type {
  ProvenanceInput,
  ProvenanceRecord as PrivacyProvenanceRecord,
  ProvenanceSourceKind as PrivacyProvenanceSourceKind,
  ProvenanceSubjectType as PrivacyProvenanceSubjectType,
  ProvenanceSummary as PrivacyProvenanceSummary,
} from "@/lib/privacy/provenance";

export type ProvenanceSourceKind = PrivacyProvenanceSourceKind;

export type ProvenanceSubjectType = PrivacyProvenanceSubjectType;

export type ProvenanceCreateInput = ProvenanceInput;

export interface ProvenanceRecord extends PrivacyProvenanceRecord {
  updatedAt: Date;
}

export type ProvenanceUpdateInput = Partial<
  Omit<ProvenanceRecord, "id" | "createdAt">
>;

export type ProvenanceSortOrder =
  | "newest"
  | "oldest"
  | "source"
  | "subject"
  | "confidence";

export interface ProvenanceFilters {
  subjectType?: ProvenanceSubjectType;
  subjectId?: string;
  sourceKind?: ProvenanceSourceKind;
  sourceId?: string;
  redacted?: boolean;
  query?: string;
  sort?: ProvenanceSortOrder;
  limit?: number;
}

export type ProvenanceSummary = PrivacyProvenanceSummary;

export interface ProvenanceViewModel {
  provenance: ProvenanceRecord;
  subjectLabel: string;
  sourceLabel: string;
  confidenceLabel: string;
  timeLabel: string;
  summary: string;
  isRedacted: boolean;
}

export interface ProvenanceActionState {
  provenanceId: string;
  reason?: string;
}
