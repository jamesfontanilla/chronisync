/**
 * =============================================================================
 * ChroniSync
 * Alert Server Actions
 * =============================================================================
 */

"use server";

import { revalidatePath } from "next/cache";

import { ROUTES } from "@/config/route";

import {
  acknowledgeAlert,
  createAlert,
  deleteAlert,
  dismissAlert,
  resolveAlert,
  updateAlert,
} from "./service";
import type { AlertCreateInput, AlertUpdateInput } from "./service";

function revalidateAlertViews(): void {
  revalidatePath(ROUTES.PHYSICIAN.ALERTS);
  revalidatePath(ROUTES.PHYSICIAN.DASHBOARD);
}

export async function createAlertAction(
  data: AlertCreateInput
) {
  const alert = await createAlert(data);
  revalidateAlertViews();
  return alert;
}

export async function updateAlertAction(
  alertId: string,
  updates: AlertUpdateInput
) {
  const alert = await updateAlert(alertId, updates);
  revalidateAlertViews();
  return alert;
}

export async function acknowledgeAlertAction(
  alertId: string,
  acknowledgedBy?: string
) {
  const alert = await acknowledgeAlert(alertId, acknowledgedBy);
  revalidateAlertViews();
  return alert;
}

export async function resolveAlertAction(
  alertId: string,
  notes?: string
) {
  const alert = await resolveAlert(alertId, notes);
  revalidateAlertViews();
  return alert;
}

export async function dismissAlertAction(
  alertId: string,
  notes?: string
) {
  const alert = await dismissAlert(alertId, notes);
  revalidateAlertViews();
  return alert;
}

export async function deleteAlertAction(
  alertId: string
): Promise<void> {
  await deleteAlert(alertId);
  revalidateAlertViews();
}
