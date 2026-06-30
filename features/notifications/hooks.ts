"use client";

import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";

import { humanize } from "@/lib/utils";

import {
  buildNotificationViewModel,
  listNotificationsByFilters,
  listUnreadNotificationsByRecipient,
  summarizeNotifications,
  type NotificationFilters,
  type NotificationRecord,
  type NotificationStatus,
  type NotificationType,
  type NotificationViewModel,
} from "./service";

export function useNotificationsQuery(
  recipientId?: string,
  filters: Omit<NotificationFilters, "recipientId"> = {}
) {
  const queryFilters: NotificationFilters = {
    ...(recipientId ? { recipientId } : {}),
    ...(filters.status ? { status: filters.status } : {}),
    ...(filters.type ? { type: filters.type } : {}),
    ...(filters.query ? { query: filters.query } : {}),
    ...(filters.limit ? { limit: filters.limit } : {}),
  };

  return useQuery<NotificationRecord[]>({
    queryKey: ["notifications", queryFilters],
    queryFn: async () => {
      try {
        return await listNotificationsByFilters(queryFilters);
      } catch {
        return [];
      }
    },
    staleTime: 45_000,
    placeholderData: [],
  });
}

export function useUnreadNotificationsQuery(recipientId?: string) {
  return useQuery<NotificationRecord[]>({
    queryKey: ["notifications", recipientId ?? "all", "unread"],
    queryFn: async () => {
      if (!recipientId) {
        return [];
      }

      try {
        return await listUnreadNotificationsByRecipient(recipientId);
      } catch {
        return [];
      }
    },
    enabled: Boolean(recipientId),
    staleTime: 45_000,
    placeholderData: [],
  });
}

export function useNotificationViewModelsQuery(
  recipientId?: string,
  filters: Omit<NotificationFilters, "recipientId"> = {}
) {
  const query = useNotificationsQuery(recipientId, filters);

  return useMemo(
    () => ({
      ...query,
      data: query.data ? query.data.map(buildNotificationViewModel) : [],
    }),
    [query]
  );
}

export function useNotificationSummaryQuery(
  recipientId?: string,
  filters: Omit<NotificationFilters, "recipientId"> = {}
) {
  const query = useNotificationsQuery(recipientId, filters);

  return useMemo(
    () => ({
      ...query,
      data: summarizeNotifications(query.data ?? []),
    }),
    [query]
  );
}

export function useNotificationTypeLabel(
  type: NotificationType
): string {
  return useMemo(() => humanize(type), [type]);
}

export function useNotificationStatusLabel(
  status: NotificationStatus
): string {
  return useMemo(() => humanize(status), [status]);
}

export function useNotificationViewModel(
  notification: NotificationRecord
): NotificationViewModel {
  return useMemo(
    () => buildNotificationViewModel(notification),
    [notification]
  );
}
