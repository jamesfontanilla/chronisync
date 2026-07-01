/**
 * =============================================================================
 * ChroniSync
 * Provenance Server Actions
 * =============================================================================
 */

"use server";

import { revalidatePath } from "next/cache";

import { ROUTES } from "@/config/route";

import {
  createProvenanceRecord,
  deleteProvenanceRecord,
  updateProvenanceRecord,
} from "./service";

import type { ProvenanceCreateInput, ProvenanceUpdateInput } from "./types";

function revalidateProvenanceViews(): void {
  revalidatePath(ROUTES.PATIENT.DASHBOARD);
  revalidatePath(ROUTES.PATIENT.DOCUMENTS);
  revalidatePath(ROUTES.PATIENT.SETTINGS);
  revalidatePath(ROUTES.PHYSICIAN.DASHBOARD);
  revalidatePath(ROUTES.PHYSICIAN.DOCUMENTS);
  revalidatePath(ROUTES.PHYSICIAN.SUMMARIES);
  revalidatePath(ROUTES.PHYSICIAN.SETTINGS);
  revalidatePath(ROUTES.ADMIN.DASHBOARD);
  revalidatePath(ROUTES.ADMIN.RULES);
  revalidatePath(ROUTES.ADMIN.SETTINGS);
}

export async function createProvenanceRecordAction(
  input: ProvenanceCreateInput
): Promise<void> {
  await createProvenanceRecord(input);
  revalidateProvenanceViews();
}

export async function updateProvenanceRecordAction(
  provenanceId: string,
  updates: ProvenanceUpdateInput
): Promise<void> {
  await updateProvenanceRecord(provenanceId, updates);
  revalidateProvenanceViews();
}

export async function deleteProvenanceRecordAction(
  provenanceId: string
): Promise<void> {
  await deleteProvenanceRecord(provenanceId);
  revalidateProvenanceViews();
}
