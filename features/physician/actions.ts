/**
 * =============================================================================
 * ChroniSync
 * Physician Server Actions
 * =============================================================================
 */

"use server";

import { revalidatePath } from "next/cache";

import { ROUTES } from "@/config/route";

export async function refreshPhysicianWorkspaceAction(
  physicianId?: string
): Promise<{ physicianId: string | null }> {
  revalidatePath(ROUTES.PHYSICIAN.DASHBOARD);
  revalidatePath(ROUTES.PHYSICIAN.PATIENTS);
  revalidatePath(ROUTES.PHYSICIAN.ALERTS);
  revalidatePath(ROUTES.PHYSICIAN.DOCUMENTS);
  revalidatePath(ROUTES.PHYSICIAN.SUMMARIES);
  revalidatePath(ROUTES.PHYSICIAN.TREATMENT);
  revalidatePath(ROUTES.PHYSICIAN.SETTINGS);

  return {
    physicianId: physicianId?.trim() || null,
  };
}

export async function refreshPhysicianPanelAction(
  panel: keyof typeof ROUTES.PHYSICIAN,
  physicianId?: string
): Promise<{ panel: keyof typeof ROUTES.PHYSICIAN; physicianId: string | null }> {
  const route = ROUTES.PHYSICIAN[panel];

  revalidatePath(route);

  return {
    panel,
    physicianId: physicianId?.trim() || null,
  };
}
