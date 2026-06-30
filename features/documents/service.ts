import type { DocumentCreateInput } from "@/services/document.service";

export {
  approveDocument,
  buildDocumentPath,
  buildDocumentRecord,
  createDocumentRecord,
  deleteDocumentRecord,
  getDocumentById,
  listDocumentsByPatient,
  listDocumentsByStatus,
  listPendingDocumentsByPatient,
  markDocumentProcessing,
  rejectDocument,
  submitDocumentForReview,
  updateDocumentRecord,
} from "@/services/document.service";

import type { DocumentFormValues } from "./validation";

const trimOrUndefined = (value: string | undefined): string | undefined => {
  if (typeof value !== "string") {
    return undefined;
  }

  const trimmed = value.trim();
  return trimmed === "" ? undefined : trimmed;
};

function toNumber(value: string, fieldName: string): number {
  const parsed = Number(value);

  if (Number.isNaN(parsed)) {
    throw new Error(`Invalid ${fieldName} value: ${value}`);
  }

  return parsed;
}

export function buildDocumentCreateInput(
  values: DocumentFormValues
): DocumentCreateInput {
  const source = values.source;
  const summary = trimOrUndefined(values.summary);

  return {
    patientId: values.patientId.trim(),
    title: values.title.trim(),
    fileName: values.fileName.trim(),
    filePath: values.filePath.trim(),
    contentType: values.contentType.trim(),
    sizeBytes: toNumber(values.sizeBytes, "sizeBytes"),
    category: values.category,
    status: values.status,
    ...(source ? { source } : {}),
    ...(summary ? { summary } : {}),
  };
}
