import {
  enqueueDiaryOfflineMutation,
  enqueueDeviceSyncOfflineMutation,
  enqueueFoodPhotoOfflineMutation,
  enqueueOfflineSyncMutation,
  enqueueSummaryOfflineMutation,
} from "./service";
import type {
  OfflineDiaryPayload,
  OfflineDeviceSyncPayload,
  OfflineFoodPhotoPayload,
  OfflineSyncPayload,
  OfflineSummaryPayload,
} from "./types";

export {
  buildOfflineSyncDemoState,
  buildOfflineSyncViewModel,
  describeOfflineSyncState,
  flushOfflineSyncQueue,
  getOfflineSyncQueueSummary,
  getOfflineSyncState,
  listOfflineSyncRecords,
  listOfflineSyncViewModels,
  retryOfflineSyncRecord,
  subscribeOfflineSyncState,
  summarizeOfflineSyncRecords,
} from "./service";

export type {
  OfflineDiaryPayload,
  OfflineDeviceSyncPayload,
  OfflineFoodPhotoPayload,
  OfflineSyncPayload,
  OfflineSummaryPayload,
} from "./types";

export async function queueDiaryOfflineRecord(
  payload: OfflineDiaryPayload
) {
  return enqueueDiaryOfflineMutation(payload);
}

export async function queueFoodPhotoOfflineRecord(
  payload: OfflineFoodPhotoPayload
) {
  return enqueueFoodPhotoOfflineMutation(payload);
}

export async function queueDeviceSyncOfflineRecord(
  payload: OfflineDeviceSyncPayload
) {
  return enqueueDeviceSyncOfflineMutation(payload);
}

export async function queueSummaryOfflineRecord(
  payload: OfflineSummaryPayload
) {
  return enqueueSummaryOfflineMutation(payload);
}

export async function queueOfflineSyncRecord(
  payload: OfflineSyncPayload
) {
  return enqueueOfflineSyncMutation(payload);
}
