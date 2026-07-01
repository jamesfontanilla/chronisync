/**
 * =============================================================================
 * ChroniSync
 * Consent Server Actions
 * =============================================================================
 */

"use server";

import { revalidatePath } from "next/cache";

import { ROUTES } from "@/config/route";

import {
  buildConsentCreateInput,
  createConsent,
  deleteConsent,
  expireConsent,
  grantConsent,
  revokeConsent,
  updateConsent,
} from "./service";

import type { ConsentFormValues } from "./validation";
import type { ConsentUpdateInput } from "./types";

function revalidateConsentViews(): void {
  revalidatePath(ROUTES.PATIENT.DASHBOARD);
  revalidatePath(ROUTES.PATIENT.SETTINGS);
  revalidatePath(ROUTES.PHYSICIAN.DASHBOARD);
  revalidatePath(ROUTES.PHYSICIAN.SETTINGS);
}

export async function createConsentRecord(
  values: ConsentFormValues
): Promise<void> {
  await createConsent(buildConsentCreateInput(values));
  revalidateConsentViews();
}

export async function updateConsentRecord(
  consentId: string,
  updates: ConsentUpdateInput
): Promise<void> {
  await updateConsent(consentId, updates);
  revalidateConsentViews();
}

export async function grantConsentRecord(
  consentId: string
): Promise<void> {
  await grantConsent(consentId);
  revalidateConsentViews();
}

export async function revokeConsentRecord(
  consentId: string,
  reason?: string
): Promise<void> {
  await revokeConsent(consentId, reason);
  revalidateConsentViews();
}

export async function expireConsentRecord(
  consentId: string
): Promise<void> {
  await expireConsent(consentId);
  revalidateConsentViews();
}

export async function deleteConsentRecord(
  consentId: string
): Promise<void> {
  await deleteConsent(consentId);
  revalidateConsentViews();
}
