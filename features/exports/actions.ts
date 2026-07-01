/**
 * =============================================================================
 * ChroniSync
 * Export Server Actions
 * =============================================================================
 */

"use server";

import { revalidatePath } from "next/cache";

import { ROUTES } from "@/config/route";

import {
  buildExportCreateInput,
  cancelExport,
  createExport,
  deleteExport,
  markExportFailed,
  markExportProcessing,
  markExportReady,
  updateExport,
} from "./service";

import type { ExportFormValues } from "./validation";
import type { ExportUpdateInput } from "./types";

function revalidateExportViews(): void {
  revalidatePath(ROUTES.PATIENT.DASHBOARD);
  revalidatePath(ROUTES.PATIENT.DOCUMENTS);
  revalidatePath(ROUTES.PATIENT.SETTINGS);
  revalidatePath(ROUTES.PHYSICIAN.DASHBOARD);
  revalidatePath(ROUTES.PHYSICIAN.DOCUMENTS);
  revalidatePath(ROUTES.PHYSICIAN.SUMMARIES);
  revalidatePath(ROUTES.PHYSICIAN.SETTINGS);
  revalidatePath(ROUTES.ADMIN.DASHBOARD);
}

export async function createExportRecord(
  values: ExportFormValues
): Promise<void> {
  await createExport(buildExportCreateInput(values));
  revalidateExportViews();
}

export async function updateExportRecord(
  exportId: string,
  updates: ExportUpdateInput
): Promise<void> {
  await updateExport(exportId, updates);
  revalidateExportViews();
}

export async function markExportProcessingRecord(
  exportId: string
): Promise<void> {
  await markExportProcessing(exportId);
  revalidateExportViews();
}

export async function markExportReadyRecord(
  exportId: string,
  details?: Partial<{
    fileName: string;
    filePath: string;
    downloadUrl: string;
    checksum: string;
  }>
): Promise<void> {
  await markExportReady(exportId, details);
  revalidateExportViews();
}

export async function markExportFailedRecord(
  exportId: string,
  errorMessage?: string
): Promise<void> {
  await markExportFailed(exportId, errorMessage);
  revalidateExportViews();
}

export async function cancelExportRecord(
  exportId: string
): Promise<void> {
  await cancelExport(exportId);
  revalidateExportViews();
}

export async function deleteExportRecord(
  exportId: string
): Promise<void> {
  await deleteExport(exportId);
  revalidateExportViews();
}
