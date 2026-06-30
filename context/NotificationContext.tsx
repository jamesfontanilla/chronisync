"use client";

import {
  createContext,
  useContext,
  useMemo,
  type ReactNode,
} from "react";
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
  const notifications = notificationsQuery.data ?? [];

  const unreadCount = useMemo(
    () =>
      notifications.reduce(
        (count, notification) =>
          notification.status === "unread" ? count + 1 : count,
        0
      ),
    [notifications]
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

  const value = useMemo<NotificationContextValue>(
    () => ({
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
    }),
    [
      archive,
      create,
      markAsRead,
      markAsUnread,
      notifications,
      notificationsQuery.error,
      notificationsQuery.isLoading,
      recipientId,
      refresh,
      unreadCount,
    ]
  );

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
