"use client";

import { createContext, useContext, type ReactNode } from "react";
import { useQueryClient } from "@tanstack/react-query";

import {
  archiveNotification,
  createNotification,
  deleteNotification,
  markNotificationRead,
  markNotificationUnread,
  type NotificationCreateInput,
  type NotificationRecord,
} from "@/features/notifications/service";
import { useNotificationsQuery } from "@/features/notifications/hooks";

const EMPTY_NOTIFICATIONS: NotificationRecord[] = [];

export interface NotificationContextValue {
  recipientId: string | null;
  notifications: NotificationRecord[];
  unreadCount: number;
  isLoading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
  create: (
    input: NotificationCreateInput
  ) => Promise<NotificationRecord>;
  markAsRead: (
    notificationId: string
  ) => Promise<NotificationRecord>;
  markAsUnread: (
    notificationId: string
  ) => Promise<NotificationRecord>;
  archive: (
    notificationId: string
  ) => Promise<NotificationRecord>;
  remove: (notificationId: string) => Promise<void>;
}

export const NotificationContext = createContext<NotificationContextValue | null>(
  null
);

export function NotificationContextProvider({
  children,
  recipientId,
}: {
  children: ReactNode;
  recipientId?: string;
}) {
  const queryClient = useQueryClient();
  const notificationsQuery = useNotificationsQuery(recipientId);
  const notifications = notificationsQuery.data ?? EMPTY_NOTIFICATIONS;
  const unreadCount = notifications.reduce(
    (count, notification) =>
      notification.status === "unread" ? count + 1 : count,
    0
  );

  async function refresh(): Promise<void> {
    await queryClient.invalidateQueries({
      queryKey: ["notifications"],
    });
  }

  async function create(
    input: NotificationCreateInput
  ): Promise<NotificationRecord> {
    const notification = await createNotification(input);
    await refresh();
    return notification;
  }

  async function markAsRead(
    notificationId: string
  ): Promise<NotificationRecord> {
    const notification = await markNotificationRead(notificationId);
    await refresh();
    return notification;
  }

  async function markAsUnread(
    notificationId: string
  ): Promise<NotificationRecord> {
    const notification = await markNotificationUnread(notificationId);
    await refresh();
    return notification;
  }

  async function archive(
    notificationId: string
  ): Promise<NotificationRecord> {
    const notification = await archiveNotification(notificationId);
    await refresh();
    return notification;
  }

  async function remove(notificationId: string): Promise<void> {
    await deleteNotification(notificationId);
    await refresh();
  }

  const value: NotificationContextValue = {
    recipientId: recipientId ?? null,
    notifications,
    unreadCount,
    isLoading: notificationsQuery.isLoading,
    error:
      notificationsQuery.error instanceof Error
        ? notificationsQuery.error.message
        : null,
    refresh,
    create,
    markAsRead,
    markAsUnread,
    archive,
    remove,
  };

  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  );
}

export function useNotificationContext(): NotificationContextValue {
  const context = useContext(NotificationContext);

  if (!context) {
    throw new Error(
      "useNotificationContext must be used within a NotificationContextProvider."
    );
  }

  return context;
}
