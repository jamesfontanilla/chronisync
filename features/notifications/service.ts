/**
 * =============================================================================
 * ChroniSync
 * Notification Feature Service
 * =============================================================================
 */

import { COLLECTIONS } from "@/config/firebase";
import {
  createDocument as createFirestoreDocument,
  deleteDocument as deleteFirestoreDocument,
  getDocument as getFirestoreDocument,
  queryDocuments,
  updateDocument as updateFirestoreDocument,
  whereEquals,
} from "@/lib/firebase/firestore";
import { formatDateTime, humanize } from "@/lib/utils";

import type {
  NotificationCreateInput,
  NotificationFilters,
  NotificationRecord,
  NotificationSummary,
  NotificationUpdateInput,
  NotificationViewModel,
} from "./types";

export type {
  NotificationCreateInput,
  NotificationFilters,
  NotificationRecord,
  NotificationStatus,
  NotificationSummary,
  NotificationUpdateInput,
  NotificationType,
  NotificationViewModel,
} from "./types";

const COLLECTION = COLLECTIONS.NOTIFICATIONS;

function createRecordId(): string {
  return typeof globalThis.crypto?.randomUUID === "function"
    ? globalThis.crypto.randomUUID()
    : `not_${Date.now()}_${Math.random().toString(36).slice(2, 10)}`;
}

function createTimestamp(): Date {
  return new Date();
}

function matchesQuery(notification: NotificationRecord, query: string): boolean {
  const normalized = query.trim().toLowerCase();

  if (!normalized) {
    return true;
  }

  const haystack = [
    notification.title,
    notification.message,
    notification.source,
  ]
    .filter((value): value is string => Boolean(value))
    .join(" ")
    .toLowerCase();

  return haystack.includes(normalized);
}

export function buildNotificationRecord(
  data: NotificationCreateInput
): NotificationRecord {
  const timestamp = createTimestamp();

  return {
    ...data,
    id: createRecordId(),
    status: data.status ?? "unread",
    createdAt: timestamp,
    updatedAt: timestamp,
  };
}

export function buildNotificationViewModel(
  notification: NotificationRecord
): NotificationViewModel {
  return {
    notification,
    typeLabel: humanize(notification.type),
    statusLabel: humanize(notification.status),
    timeLabel: formatDateTime(notification.createdAt),
    summary: notification.message,
    isUnread: notification.status === "unread",
  };
}

export function summarizeNotifications(
  notifications: NotificationRecord[]
): NotificationSummary {
  return notifications.reduce<NotificationSummary>(
    (accumulator, notification) => {
      accumulator.total += 1;

      switch (notification.status) {
        case "read":
          accumulator.read += 1;
          break;
        case "archived":
          accumulator.archived += 1;
          break;
        case "unread":
        default:
          accumulator.unread += 1;
          break;
      }

      return accumulator;
    },
    {
      total: 0,
      unread: 0,
      read: 0,
      archived: 0,
    }
  );
}

export async function createNotification(
  data: NotificationCreateInput
): Promise<NotificationRecord> {
  const record = buildNotificationRecord(data);

  await createFirestoreDocument<NotificationRecord>(
    COLLECTION,
    record.id,
    record
  );

  return record;
}

export async function getNotificationById(
  notificationId: string
): Promise<NotificationRecord | null> {
  return getFirestoreDocument<NotificationRecord>(COLLECTION, notificationId);
}

export async function listNotificationsByRecipient(
  recipientId: string
): Promise<NotificationRecord[]> {
  return queryDocuments<NotificationRecord>(
    COLLECTION,
    whereEquals("recipientId", recipientId)
  );
}

export async function listUnreadNotificationsByRecipient(
  recipientId: string
): Promise<NotificationRecord[]> {
  const records = await listNotificationsByRecipient(recipientId);
  return records.filter((record) => record.status === "unread");
}

export async function listNotificationsByFilters(
  filters: NotificationFilters = {}
): Promise<NotificationRecord[]> {
  const baseRecords = filters.recipientId
    ? await listNotificationsByRecipient(filters.recipientId)
    : await queryDocuments<NotificationRecord>(COLLECTION);

  const filtered = baseRecords.filter((notification) => {
    if (filters.status && notification.status !== filters.status) {
      return false;
    }

    if (filters.type && notification.type !== filters.type) {
      return false;
    }

    if (filters.query && !matchesQuery(notification, filters.query)) {
      return false;
    }

    return true;
  });

  const sorted = [...filtered].sort(
    (left, right) => right.createdAt.getTime() - left.createdAt.getTime()
  );

  return sorted.slice(0, filters.limit ?? 20);
}

export async function listNotificationViewModelsByFilters(
  filters: NotificationFilters = {}
): Promise<NotificationViewModel[]> {
  const records = await listNotificationsByFilters(filters);
  return records.map(buildNotificationViewModel);
}

export async function updateNotification(
  notificationId: string,
  updates: NotificationUpdateInput
): Promise<NotificationRecord> {
  const current = await getNotificationById(notificationId);

  if (!current) {
    throw new Error(`Notification ${notificationId} was not found.`);
  }

  const next: NotificationRecord = {
    ...current,
    ...updates,
    updatedAt: createTimestamp(),
  };

  await updateFirestoreDocument<NotificationRecord>(
    COLLECTION,
    notificationId,
    next
  );

  return next;
}

export async function markNotificationRead(
  notificationId: string
): Promise<NotificationRecord> {
  return updateNotification(notificationId, {
    status: "read",
    readAt: createTimestamp(),
  });
}

export async function markNotificationUnread(
  notificationId: string
): Promise<NotificationRecord> {
  return updateNotification(notificationId, {
    status: "unread",
  });
}

export async function archiveNotification(
  notificationId: string
): Promise<NotificationRecord> {
  const timestamp = createTimestamp();

  return updateNotification(notificationId, {
    status: "archived",
    archivedAt: timestamp,
    readAt: timestamp,
  });
}

export async function deleteNotification(
  notificationId: string
): Promise<void> {
  await deleteFirestoreDocument(COLLECTION, notificationId);
}
