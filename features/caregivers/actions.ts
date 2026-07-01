/**
 * =============================================================================
 * ChroniSync
 * Caregiver Server Actions
 * =============================================================================
 */

"use server";

import { revalidatePath } from "next/cache";

import { ROUTES } from "@/config/route";

import {
  activateCaregiver,
  buildCaregiverCreateInput,
  createCaregiver,
  deleteCaregiver,
  pauseCaregiver,
  revokeCaregiver,
  updateCaregiver,
} from "./service";

import type { CaregiverFormValues } from "./validation";
import type { CaregiverUpdateInput } from "./types";

function revalidateCaregiverViews(): void {
  revalidatePath(ROUTES.PATIENT.DASHBOARD);
  revalidatePath(ROUTES.PATIENT.SETTINGS);
  revalidatePath(ROUTES.PHYSICIAN.DASHBOARD);
  revalidatePath(ROUTES.PHYSICIAN.SETTINGS);
}

export async function createCaregiverRecord(
  values: CaregiverFormValues
): Promise<void> {
  await createCaregiver(buildCaregiverCreateInput(values));
  revalidateCaregiverViews();
}

export async function updateCaregiverRecord(
  caregiverId: string,
  updates: CaregiverUpdateInput
): Promise<void> {
  await updateCaregiver(caregiverId, updates);
  revalidateCaregiverViews();
}

export async function activateCaregiverRecord(
  caregiverId: string
): Promise<void> {
  await activateCaregiver(caregiverId);
  revalidateCaregiverViews();
}

export async function pauseCaregiverRecord(
  caregiverId: string
): Promise<void> {
  await pauseCaregiver(caregiverId);
  revalidateCaregiverViews();
}

export async function revokeCaregiverRecord(
  caregiverId: string,
  reason?: string
): Promise<void> {
  await revokeCaregiver(caregiverId, reason);
  revalidateCaregiverViews();
}

export async function deleteCaregiverRecord(
  caregiverId: string
): Promise<void> {
  await deleteCaregiver(caregiverId);
  revalidateCaregiverViews();
}
