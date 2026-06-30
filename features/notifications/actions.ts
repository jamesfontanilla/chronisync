/**
 * =============================================================================
 * ChroniSync
 * Notification Server Actions
 * =============================================================================
 */

"use server";

import { revalidatePath } from "next/cache";

import { ROUTES } from "@/config/route";

import {
  archiveNotification,
  createNotification,
  deleteNotification,
  markNotificationRead,
  markNotificationUnread,
  updateNotification,
} from "./service";
import type {
  NotificationCreateInput,
  NotificationUpdateInput,
} from "./types";

function revalidateNotificationViews(): void {
  revalidatePath(ROUTES.PATIENT.DASHBOARD);
  revalidatePath(ROUTES.PHYSICIAN.DASHBOARD);
  revalidatePath(ROUTES.ADMIN.DASHBOARD);
}

export async function createNotificationAction(
  data: NotificationCreateInput
): Promise<void> {
  await createNotification(data);
  revalidateNotificationViews();
}

export async function updateNotificationAction(
  notificationId: string,
  updates: NotificationUpdateInput
): Promise<void> {
  await updateNotification(notificationId, updates);
  revalidateNotificationViews();
}

export async function markNotificationReadAction(
  notificationId: string
): Promise<void> {
  await markNotificationRead(notificationId);
  revalidateNotificationViews();
}

export async function markNotificationUnreadAction(
  notificationId: string
): Promise<void> {
  await markNotificationUnread(notificationId);
  revalidateNotificationViews();
}

export async function archiveNotificationAction(
  notificationId: string
): Promise<void> {
  await archiveNotification(notificationId);
  revalidateNotificationViews();
}

export async function deleteNotificationAction(
  notificationId: string
): Promise<void> {
  await deleteNotification(notificationId);
  revalidateNotificationViews();
}
