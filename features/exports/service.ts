/**
 * =============================================================================
 * ChroniSync
 * Export Feature Service
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
  DEFAULT_EXPORT_RETENTION_DAYS,
  describeExportRetentionWindow,
  getDefaultExportExpirationDate,
  normalizePrivacyScopes,
} from "@/lib/privacy/policy";
import {
  buildProvenanceRecord,
  formatProvenanceReference,
  type ProvenanceInput,
} from "@/lib/privacy/provenance";

import type {
  ExportCreateInput,
  ExportDeliveryMethod,
  ExportFilters,
  ExportFormat,
  ExportManifest,
  ExportRecord,
  ExportSection,
  ExportSortOrder,
  ExportStatus,
  ExportSummary,
  ExportUpdateInput,
  ExportViewModel,
} from "./types";

import type { ExportFormValues } from "./validation";

const COLLECTION = "exports";

const EXPORT_SECTION_VALUES: ExportSection[] = [
  "profile",
  "caregivers",
  "consents",
  "medications",
  "vitals",
  "symptoms",
  "diseases",
  "documents",
  "summaries",
  "alerts",
  "appointments",
  "treatment_plan",
  "ai_outputs",
  "provenance",
  "audit_trail",
];

export type {
  ExportActionState,
  ExportCreateInput,
  ExportDeliveryMethod,
  ExportFilters,
  ExportFormat,
  ExportManifest,
  ExportRecord,
  ExportSection,
  ExportSortOrder,
  ExportStatus,
  ExportSummary,
  ExportUpdateInput,
  ExportViewModel,
} from "./types";

function createRecordId(): string {
  return typeof globalThis.crypto?.randomUUID === "function"
    ? globalThis.crypto.randomUUID()
    : `exp_${Date.now()}_${Math.random().toString(36).slice(2, 10)}`;
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

function parseDateOrUndefined(value: string | undefined): Date | undefined {
  if (!value) {
    return undefined;
  }

  const parsed = new Date(value);

  if (Number.isNaN(parsed.getTime())) {
    throw new Error(`Invalid date value: ${value}`);
  }

  return parsed;
}

function sanitizeFileName(value: string): string {
  return value
    .trim()
    .replace(/[^a-zA-Z0-9._-]+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}

function getExportFormatLabel(format: ExportFormat): string {
  return humanize(format);
}

export type ExportInteroperabilityStandard = "fhir" | "openmrs";

export interface ExportInteroperabilityMapping {
  standard: ExportInteroperabilityStandard;
  section: ExportSection;
  resourceType: string;
  notes: string;
}

export interface ExportInteroperabilityProfile {
  standards: ExportInteroperabilityStandard[];
  mappings: ExportInteroperabilityMapping[];
  summary: string;
}

const EXPORT_INTEROPERABILITY_RESOURCE_MAP: Record<
  ExportSection,
  {
    fhir: string;
    openmrs: string;
    notes: string;
  }
> = {
  full_record: {
    fhir: "Bundle",
    openmrs: "export-bundle",
    notes: "Full chart export across all supported sections.",
  },
  profile: {
    fhir: "Patient",
    openmrs: "person",
    notes: "Demographic and identity data for the patient record.",
  },
  caregivers: {
    fhir: "RelatedPerson",
    openmrs: "person-relationship",
    notes: "Patient-linked support people and their access tiers.",
  },
  consents: {
    fhir: "Consent",
    openmrs: "consent-resource",
    notes: "Purpose-specific consent and revocation history.",
  },
  medications: {
    fhir: "MedicationStatement",
    openmrs: "drug-order",
    notes: "Medication history and adherence events.",
  },
  vitals: {
    fhir: "Observation",
    openmrs: "obs",
    notes: "Blood pressure, glucose, weight, and other vital trends.",
  },
  symptoms: {
    fhir: "Observation",
    openmrs: "obs",
    notes: "Symptom logs and subjective check-ins.",
  },
  diseases: {
    fhir: "Condition",
    openmrs: "problem-list-item",
    notes: "Problem list, diagnosis, and disease staging data.",
  },
  documents: {
    fhir: "DocumentReference",
    openmrs: "document",
    notes: "Uploaded documents and reviewed attachments.",
  },
  summaries: {
    fhir: "Composition",
    openmrs: "clinical-note",
    notes: "Patient and physician summary views.",
  },
  alerts: {
    fhir: "RiskAssessment",
    openmrs: "alert",
    notes: "Guideline and threshold alerts for care teams.",
  },
  appointments: {
    fhir: "Appointment",
    openmrs: "visit",
    notes: "Upcoming visit and scheduling context.",
  },
  treatment_plan: {
    fhir: "CarePlan",
    openmrs: "care-plan",
    notes: "Active treatment and follow-up plan bundle.",
  },
  ai_outputs: {
    fhir: "DiagnosticReport",
    openmrs: "ai-summary",
    notes: "AI extractions and consultation summaries.",
  },
  provenance: {
    fhir: "Provenance",
    openmrs: "audit-trail",
    notes: "Source traceability and record lineage.",
  },
  audit_trail: {
    fhir: "AuditEvent",
    openmrs: "audit-trail",
    notes: "Action history and administrative review records.",
  },
};

export function buildExportInteroperabilityProfile(
  sections: ExportSection[]
): ExportInteroperabilityProfile {
  const resolvedSections = resolveExportSections(sections);
  const mappings = resolvedSections.flatMap((section) => {
    const resource = EXPORT_INTEROPERABILITY_RESOURCE_MAP[section];

    return [
      {
        standard: "fhir" as const,
        section,
        resourceType: resource.fhir,
        notes: resource.notes,
      },
      {
        standard: "openmrs" as const,
        section,
        resourceType: resource.openmrs,
        notes: resource.notes,
      },
    ];
  });

  return {
    standards: ["fhir", "openmrs"],
    mappings,
    summary: `${resolvedSections.length} export sections mapped across FHIR and OpenMRS`,
  };
}

interface ExportLifecycleInput {
  patientId: string;
  requestedBy: string;
  format: ExportFormat;
  sections: ExportSection[];
  status: ExportStatus;
  deliveryMethod: ExportDeliveryMethod;
  fileName: string;
  expiresAt: Date | undefined;
}

function buildExportLifecycleMetadata(
  exportRecord: ExportLifecycleInput,
  metadata?: Record<string, unknown>
): Record<string, unknown> {
  return {
    ...(metadata ?? {}),
    lifecycle: {
      retentionDays: DEFAULT_EXPORT_RETENTION_DAYS,
      retentionLabel: describeExportRetentionWindow(),
      expiresAt: exportRecord.expiresAt?.toISOString(),
      format: exportRecord.format,
      status: exportRecord.status,
      deliveryMethod: exportRecord.deliveryMethod,
      sections: exportRecord.sections,
    },
    interoperability: buildExportInteroperabilityProfile(
      exportRecord.sections
    ),
  };
}

export function getExportSectionLabel(
  section: ExportSection
): string {
  switch (section) {
    case "full_record":
      return "Full record";
    case "ai_outputs":
      return "AI outputs";
    case "treatment_plan":
      return "Treatment plan";
    case "audit_trail":
      return "Audit trail";
    default:
      return humanize(section);
  }
}

export function getExportStatusLabel(
  status: ExportStatus
): string {
  return humanize(status);
}

export function getExportDeliveryLabel(
  deliveryMethod: ExportDeliveryMethod
): string {
  return humanize(deliveryMethod);
}

function resolveExportSections(
  sections: ExportSection[]
): ExportSection[] {
  const normalized = [...new Set(sections)];

  if (normalized.includes("full_record")) {
    return [...EXPORT_SECTION_VALUES];
  }

  return normalized;
}

function describeExportSections(
  sections: ExportSection[]
): string {
  const labels = resolveExportSections(sections).map(getExportSectionLabel);
  return labels.length > 0 ? labels.join(", ") : "No sections";
}

function matchesQuery(exportRecord: ExportRecord, query: string): boolean {
  const normalized = query.trim().toLowerCase();

  if (!normalized) {
    return true;
  }

  const haystack = [
    exportRecord.fileName,
    exportRecord.filePath,
    exportRecord.downloadUrl,
    exportRecord.notes,
    exportRecord.errorMessage,
    exportRecord.provenance?.sourceLabel,
    exportRecord.provenance?.sourceKind,
    ...exportRecord.sections.map(getExportSectionLabel),
  ]
    .filter((value): value is string => Boolean(value))
    .join(" ")
    .toLowerCase();

  return haystack.includes(normalized);
}

function sortExports(
  exports: ExportRecord[],
  sort: ExportSortOrder = "newest"
): ExportRecord[] {
  const copy = [...exports];

  switch (sort) {
    case "oldest":
      return copy.sort(
        (left, right) => left.createdAt.getTime() - right.createdAt.getTime()
      );
    case "status":
      return copy.sort((left, right) =>
        humanize(left.status).localeCompare(humanize(right.status))
      );
    case "format":
      return copy.sort((left, right) =>
        getExportFormatLabel(left.format).localeCompare(
          getExportFormatLabel(right.format)
        )
      );
    case "newest":
    default:
      return copy.sort(
        (left, right) => right.createdAt.getTime() - left.createdAt.getTime()
      );
  }
}

function buildDefaultExportFileName(
  patientId: string,
  format: ExportFormat,
  timestamp: Date
): string {
  const safePatientId = sanitizeFileName(patientId || "patient");
  const safeTimestamp = timestamp.toISOString().replace(/[:.]/g, "-");
  return `chronisync-${safePatientId}-${safeTimestamp}.${format}`;
}

export function buildExportRecord(
  data: ExportCreateInput
): ExportRecord {
  const timestamp = createTimestamp();
  const sections = resolveExportSections(data.sections);
  const consentScopes = data.consentScopes
    ? normalizePrivacyScopes(data.consentScopes)
    : undefined;
  const status = data.status ?? "queued";
  const deliveryMethod = data.deliveryMethod ?? "download";
  const notes = trimOrUndefined(data.notes);
  const errorMessage = trimOrUndefined(data.errorMessage);
  const fileName =
    data.fileName?.trim() ||
    buildDefaultExportFileName(data.patientId, data.format, timestamp);
  const generatedAt =
    data.generatedAt ?? (status === "queued" ? undefined : timestamp);
  const completedAt =
    data.completedAt ??
    (status === "ready" ? timestamp : undefined);
  const failedAt =
    data.failedAt ?? (status === "failed" ? timestamp : undefined);
  const expiresAt =
    data.expiresAt ?? getDefaultExportExpirationDate(timestamp);

  const record: ExportRecord = {
    id: createRecordId(),
    patientId: data.patientId.trim(),
    requestedBy: data.requestedBy.trim(),
    format: data.format,
    sections,
    status,
    deliveryMethod,
    fileName,
    ...(data.filePath ? { filePath: data.filePath.trim() } : {}),
    ...(data.downloadUrl ? { downloadUrl: data.downloadUrl.trim() } : {}),
    ...(data.checksum ? { checksum: data.checksum.trim() } : {}),
    ...(consentScopes ? { consentScopes } : {}),
    ...(notes ? { notes } : {}),
    ...(errorMessage ? { errorMessage } : {}),
    ...(generatedAt ? { generatedAt } : {}),
    ...(completedAt ? { completedAt } : {}),
    ...(failedAt ? { failedAt } : {}),
    expiresAt,
    metadata: buildExportLifecycleMetadata(
      {
        patientId: data.patientId.trim(),
        requestedBy: data.requestedBy.trim(),
        format: data.format,
        sections,
        status,
        deliveryMethod,
        fileName,
        expiresAt,
      },
      data.metadata
    ),
    createdAt: timestamp,
    updatedAt: timestamp,
  };

  const provenanceInput: ProvenanceInput = {
    subjectType: "export",
    subjectId: record.id,
    sourceKind: data.provenance?.sourceKind ?? "human",
    ...(data.provenance?.sourceId
      ? { sourceId: data.provenance.sourceId }
      : {}),
    sourceLabel: data.provenance?.sourceLabel ?? "Export request",
    input: {
      patientId: record.patientId,
      requestedBy: record.requestedBy,
      format: record.format,
      sections: record.sections,
      status: record.status,
      deliveryMethod: record.deliveryMethod,
      consentScopes: record.consentScopes ?? [],
      fileName: record.fileName,
    },
    output: {
      fileName: record.fileName,
      filePath: record.filePath,
      downloadUrl: record.downloadUrl,
      checksum: record.checksum,
    },
    ...(data.provenance?.model ? { model: data.provenance.model } : {}),
    ...(data.provenance?.redacted !== undefined
      ? { redacted: data.provenance.redacted }
      : {}),
    ...(data.provenance?.confidence !== undefined
      ? { confidence: data.provenance.confidence }
      : {}),
    ...(data.provenance?.metadata
      ? { metadata: data.provenance.metadata }
      : {}),
  };

  return {
    ...record,
    provenance: buildProvenanceRecord(provenanceInput),
  };
}

export function buildExportCreateInput(
  values: ExportFormValues
): ExportCreateInput {
  const fileName = trimOrUndefined(values.fileName);
  const filePath = trimOrUndefined(values.filePath);
  const downloadUrl = trimOrUndefined(values.downloadUrl);
  const checksum = trimOrUndefined(values.checksum);
  const notes = trimOrUndefined(values.notes);
  const errorMessage = trimOrUndefined(values.errorMessage);
  const expiresAt = parseDateOrUndefined(values.expiresAt);
  const consentScopes = normalizePrivacyScopes(values.consentScopes);

  return {
    patientId: values.patientId.trim(),
    requestedBy: values.requestedBy.trim(),
    format: values.format,
    sections: resolveExportSections(values.sections),
    status: values.status,
    deliveryMethod: values.deliveryMethod,
    ...(fileName ? { fileName } : {}),
    ...(filePath ? { filePath } : {}),
    ...(downloadUrl ? { downloadUrl } : {}),
    ...(checksum ? { checksum } : {}),
    consentScopes,
    ...(notes ? { notes } : {}),
    ...(errorMessage ? { errorMessage } : {}),
    ...(expiresAt ? { expiresAt } : {}),
  };
}

export function buildExportManifest(
  exportRecord: ExportRecord
): ExportManifest {
  const sections = resolveExportSections(exportRecord.sections);
  const sectionLabels = sections.map(getExportSectionLabel);
  const consentScopes = exportRecord.consentScopes
    ? normalizePrivacyScopes(exportRecord.consentScopes)
    : [];

  return {
    exportId: exportRecord.id,
    patientId: exportRecord.patientId,
    requestedBy: exportRecord.requestedBy,
    format: exportRecord.format,
    sections,
    sectionLabels,
    consentScopes,
    ...(exportRecord.provenance
      ? { provenance: exportRecord.provenance }
      : {}),
    generatedAt: exportRecord.generatedAt ?? exportRecord.createdAt,
    fileName: exportRecord.fileName,
    summary:
      exportRecord.notes ??
      `${getExportFormatLabel(exportRecord.format)} export for ${exportRecord.patientId}`,
    canDownload:
      exportRecord.status === "ready" &&
      Boolean(exportRecord.downloadUrl ?? exportRecord.filePath),
  };
}

export function buildExportViewModel(
  exportRecord: ExportRecord
): ExportViewModel {
  const sectionLabel = describeExportSections(exportRecord.sections);

  return {
    exportRecord,
    formatLabel: getExportFormatLabel(exportRecord.format),
    statusLabel: getExportStatusLabel(exportRecord.status),
    deliveryLabel: getExportDeliveryLabel(exportRecord.deliveryMethod),
    sectionLabel,
    timeLabel: formatDateTime(
      exportRecord.completedAt ?? exportRecord.generatedAt ?? exportRecord.createdAt
    ),
    summary:
      exportRecord.errorMessage ??
      exportRecord.notes ??
      `${getExportFormatLabel(exportRecord.format)} export with ${sectionLabel}`,
    isReady: exportRecord.status === "ready",
    canDownload:
      exportRecord.status === "ready" &&
      Boolean(exportRecord.downloadUrl ?? exportRecord.filePath),
  };
}

export function summarizeExports(
  exports: ExportRecord[]
): ExportSummary {
  const lastUpdated = exports.reduce<Date | null>((latest, exportRecord) => {
    if (!latest) {
      return exportRecord.updatedAt;
    }

    return exportRecord.updatedAt.getTime() > latest.getTime()
      ? exportRecord.updatedAt
      : latest;
  }, null);

  return exports.reduce<ExportSummary>(
    (accumulator, exportRecord) => {
      accumulator.total += 1;

      switch (exportRecord.status) {
        case "queued":
          accumulator.queued += 1;
          break;
        case "processing":
          accumulator.processing += 1;
          break;
        case "ready":
          accumulator.ready += 1;
          break;
        case "failed":
          accumulator.failed += 1;
          break;
        case "cancelled":
          accumulator.cancelled += 1;
          break;
        default:
          break;
      }

      switch (exportRecord.format) {
        case "json":
          accumulator.json += 1;
          break;
        case "csv":
          accumulator.csv += 1;
          break;
        case "pdf":
          accumulator.pdf += 1;
          break;
        default:
          break;
      }

      return accumulator;
    },
    {
      total: 0,
      queued: 0,
      processing: 0,
      ready: 0,
      failed: 0,
      cancelled: 0,
      json: 0,
      csv: 0,
      pdf: 0,
      lastUpdated,
    }
  );
}

export async function createExport(
  data: ExportCreateInput
): Promise<ExportRecord> {
  const record = buildExportRecord(data);

  await createFirestoreDocument<ExportRecord>(
    COLLECTION,
    record.id,
    record
  );

  return record;
}

export async function getExportById(
  exportId: string
): Promise<ExportRecord | null> {
  return getFirestoreDocument<ExportRecord>(COLLECTION, exportId);
}

export async function listExportsByPatient(
  patientId: string
): Promise<ExportRecord[]> {
  return queryDocuments<ExportRecord>(
    COLLECTION,
    whereEquals("patientId", patientId)
  );
}

export async function listExportsByRequester(
  requestedBy: string
): Promise<ExportRecord[]> {
  return queryDocuments<ExportRecord>(
    COLLECTION,
    whereEquals("requestedBy", requestedBy)
  );
}

export async function listReadyExportsByPatient(
  patientId: string
): Promise<ExportRecord[]> {
  const exports = await listExportsByPatient(patientId);
  return exports.filter((exportRecord) => exportRecord.status === "ready");
}

export async function listExportViewModelsByFilters(
  filters: ExportFilters = {}
): Promise<ExportViewModel[]> {
  const records = await listExportsByFilters(filters);
  return records.map(buildExportViewModel);
}

export async function listExportsByFilters(
  filters: ExportFilters = {}
): Promise<ExportRecord[]> {
  const hasPatientFilter = Boolean(filters.patientId);
  const hasRequesterFilter = Boolean(filters.requestedBy);
  const baseExports = hasPatientFilter
    ? await listExportsByPatient(filters.patientId as string)
    : hasRequesterFilter
      ? await listExportsByRequester(filters.requestedBy as string)
      : await queryDocuments<ExportRecord>(COLLECTION);

  const filtered = baseExports.filter((exportRecord) => {
    if (filters.status && exportRecord.status !== filters.status) {
      return false;
    }

    if (filters.format && exportRecord.format !== filters.format) {
      return false;
    }

    if (
      filters.section &&
      !exportRecord.sections.includes(filters.section)
    ) {
      return false;
    }

    if (filters.query && !matchesQuery(exportRecord, filters.query)) {
      return false;
    }

    return true;
  });

  const sorted = sortExports(filtered, filters.sort);
  return sorted.slice(0, filters.limit ?? 20);
}

export async function updateExport(
  exportId: string,
  updates: ExportUpdateInput
): Promise<ExportRecord> {
  const current = await getExportById(exportId);

  if (!current) {
    throw new Error(`Export ${exportId} was not found.`);
  }

  const next: ExportRecord = {
    ...current,
    ...updates,
    ...(updates.sections
      ? { sections: resolveExportSections(updates.sections) }
      : {}),
    ...(updates.consentScopes
      ? { consentScopes: normalizePrivacyScopes(updates.consentScopes) }
      : {}),
    ...(updates.expiresAt ? { expiresAt: updates.expiresAt } : {}),
    metadata: buildExportLifecycleMetadata(
      {
        patientId: current.patientId,
        requestedBy: current.requestedBy,
        format: updates.format ?? current.format,
        sections: updates.sections
          ? resolveExportSections(updates.sections)
          : current.sections,
        status: updates.status ?? current.status,
        deliveryMethod: updates.deliveryMethod ?? current.deliveryMethod,
        fileName: updates.fileName ?? current.fileName,
        expiresAt: updates.expiresAt ?? current.expiresAt,
      },
      {
        ...(current.metadata ?? {}),
        ...(updates.metadata ?? {}),
      }
    ),
    updatedAt: createTimestamp(),
  };

  await updateFirestoreDocument<ExportRecord>(
    COLLECTION,
    exportId,
    next
  );

  return next;
}

export async function markExportProcessing(
  exportId: string
): Promise<ExportRecord> {
  return updateExport(exportId, {
    status: "processing",
    generatedAt: createTimestamp(),
  });
}

export async function markExportReady(
  exportId: string,
  details: Partial<Pick<ExportRecord, "fileName" | "filePath" | "downloadUrl" | "checksum">> = {}
): Promise<ExportRecord> {
  return updateExport(exportId, {
    status: "ready",
    completedAt: createTimestamp(),
    generatedAt: createTimestamp(),
    ...details,
  });
}

export async function markExportFailed(
  exportId: string,
  errorMessage?: string
): Promise<ExportRecord> {
  return updateExport(exportId, {
    status: "failed",
    failedAt: createTimestamp(),
    ...(errorMessage ? { errorMessage } : {}),
  });
}

export async function cancelExport(
  exportId: string
): Promise<ExportRecord> {
  return updateExport(exportId, {
    status: "cancelled",
  });
}

export async function deleteExport(
  exportId: string
): Promise<void> {
  await deleteFirestoreDocument(COLLECTION, exportId);
}

export function describeExportReference(
  exportRecord: ExportRecord
): string {
  return formatProvenanceReference(
    exportRecord.provenance ?? {
      id: exportRecord.id,
      subjectType: "export",
      subjectId: exportRecord.id,
      sourceKind: "human",
      redacted: false,
      createdAt: exportRecord.createdAt,
    }
  );
}
