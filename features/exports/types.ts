/**
 * =============================================================================
 * ChroniSync
 * Export Feature Types
 * =============================================================================
 */

import type {
  ConsentScope,
} from "@/features/consent/types";
import type {
  ProvenanceInput,
  ProvenanceRecord,
} from "@/lib/privacy/provenance";

export type ExportSection =
  | "full_record"
  | "profile"
  | "caregivers"
  | "consents"
  | "medications"
  | "vitals"
  | "symptoms"
  | "diseases"
  | "documents"
  | "summaries"
  | "alerts"
  | "appointments"
  | "treatment_plan"
  | "ai_outputs"
  | "provenance"
  | "audit_trail";

export type ExportFormat = "json" | "csv" | "pdf";

export type ExportStatus =
  | "queued"
  | "processing"
  | "ready"
  | "failed"
  | "cancelled";

export type ExportDeliveryMethod =
  | "download"
  | "email"
  | "storage";

export type ExportSortOrder =
  | "newest"
  | "oldest"
  | "status"
  | "format";

export interface ExportRecord {
  id: string;
  patientId: string;
  requestedBy: string;
  format: ExportFormat;
  sections: ExportSection[];
  status: ExportStatus;
  deliveryMethod: ExportDeliveryMethod;
  fileName: string;
  filePath?: string;
  downloadUrl?: string;
  checksum?: string;
  consentScopes?: ConsentScope[];
  provenance?: ProvenanceRecord;
  notes?: string;
  errorMessage?: string;
  generatedAt?: Date;
  completedAt?: Date;
  failedAt?: Date;
  expiresAt?: Date;
  metadata?: Record<string, unknown>;
  createdAt: Date;
  updatedAt: Date;
}

export interface ExportCreateInput {
  patientId: string;
  requestedBy: string;
  format: ExportFormat;
  sections: ExportSection[];
  status?: ExportStatus;
  deliveryMethod?: ExportDeliveryMethod;
  fileName?: string;
  filePath?: string;
  downloadUrl?: string;
  checksum?: string;
  consentScopes?: ConsentScope[];
  provenance?: ProvenanceInput;
  notes?: string;
  errorMessage?: string;
  generatedAt?: Date;
  completedAt?: Date;
  failedAt?: Date;
  expiresAt?: Date;
  metadata?: Record<string, unknown>;
}

export type ExportUpdateInput = Partial<
  Omit<ExportRecord, "id" | "patientId" | "requestedBy" | "createdAt" | "updatedAt">
>;

export interface ExportFilters {
  patientId?: string;
  requestedBy?: string;
  status?: ExportStatus;
  format?: ExportFormat;
  section?: ExportSection;
  query?: string;
  limit?: number;
  sort?: ExportSortOrder;
}

export interface ExportSummary {
  total: number;
  queued: number;
  processing: number;
  ready: number;
  failed: number;
  cancelled: number;
  json: number;
  csv: number;
  pdf: number;
  lastUpdated: Date | null;
}

export interface ExportViewModel {
  exportRecord: ExportRecord;
  formatLabel: string;
  statusLabel: string;
  deliveryLabel: string;
  sectionLabel: string;
  timeLabel: string;
  summary: string;
  isReady: boolean;
  canDownload: boolean;
}

export interface ExportManifest {
  exportId: string;
  patientId: string;
  requestedBy: string;
  format: ExportFormat;
  sections: ExportSection[];
  sectionLabels: string[];
  consentScopes: ConsentScope[];
  provenance?: ProvenanceRecord;
  generatedAt: Date;
  fileName: string;
  summary: string;
  canDownload: boolean;
}

export interface ExportActionState {
  exportId: string;
  reason?: string;
}
