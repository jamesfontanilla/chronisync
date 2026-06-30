/**
 * =============================================================================
 * ChroniSync
 * Notification Feature Types
 * =============================================================================
 */

import { NOTIFICATION_TYPES } from "@/config/constants";

export type NotificationType =
  (typeof NOTIFICATION_TYPES)[keyof typeof NOTIFICATION_TYPES];

export type NotificationStatus = "unread" | "read" | "archived";

export interface NotificationRecord {
  id: string;
  recipientId: string;
  title: string;
  message: string;
  type: NotificationType;
  status: NotificationStatus;
  link?: string;
  source?: string;
  metadata?: Record<string, unknown>;
  deliveredAt?: Date;
  readAt?: Date;
  archivedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export type NotificationCreateInput = {
  recipientId: string;
  title: string;
  message: string;
  type: NotificationType;
  status?: NotificationStatus;
  link?: string;
  source?: string;
  metadata?: Record<string, unknown>;
  deliveredAt?: Date;
  readAt?: Date;
  archivedAt?: Date;
};

export type NotificationUpdateInput = Partial<
  Omit<
    NotificationRecord,
    "id" | "recipientId" | "createdAt" | "updatedAt"
  >
>;

export interface NotificationFilters {
  recipientId?: string;
  status?: NotificationStatus;
  type?: NotificationType;
  query?: string;
  limit?: number;
}

export interface NotificationSummary {
  total: number;
  unread: number;
  read: number;
  archived: number;
}

export interface NotificationViewModel {
  notification: NotificationRecord;
  typeLabel: string;
  statusLabel: string;
  timeLabel: string;
  summary: string;
  isUnread: boolean;
}
