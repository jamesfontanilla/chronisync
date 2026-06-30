import {
  buildDocumentCreateInput,
  buildDocumentPath,
  createDocumentRecord,
  deleteDocumentRecord,
  getDocumentById,
  listDocumentsByPatient,
  listDocumentsByStatus,
  listPendingDocumentsByPatient,
} from "./service";
import type { DocumentFormValues } from "./validation";

export async function createDocumentEntry(values: DocumentFormValues) {
  return createDocumentRecord(buildDocumentCreateInput(values));
}

export async function deleteDocumentEntry(documentId: string) {
  return deleteDocumentRecord(documentId);
}

export async function getDocumentEntry(documentId: string) {
  return getDocumentById(documentId);
}

export async function listDocumentEntriesByPatient(patientId: string) {
  return listDocumentsByPatient(patientId);
}

export async function listPendingDocumentEntriesByPatient(patientId: string) {
  return listPendingDocumentsByPatient(patientId);
}

export { buildDocumentPath, listDocumentsByStatus };
