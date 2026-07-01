/**
 * =============================================================================
 * ChroniSync
 * Offline Sync Feature Types
 * =============================================================================
 */

import type {
  DiaryCreateInput,
  DiaryUpdateInput,
} from "@/features/diary/types";
import type {
  FoodPhotoCreateInput,
  FoodPhotoUpdateInput,
} from "@/features/food-photo/types";
import type {
  DeviceConnectionCreateInput,
  DeviceConnectionUpdateInput,
  DeviceImportCreateInput,
} from "@/features/device-sync/types";
import type {
  SummaryCreateInput,
  SummaryUpdateInput,
} from "@/services/summary.service";
import type {
  OfflineQueueKind,
  OfflineQueueRecord,
  OfflineQueueStatus,
  OfflineQueueSummary,
} from "@/lib/offline/queue";
import type { OfflineSyncState as OfflineControllerState } from "@/lib/offline/sync";

/* -------------------------------------------------------------------------- */
/*                               Enumerations                                 */
/* -------------------------------------------------------------------------- */

export type OfflineSyncKind = OfflineQueueKind;

export type OfflineSyncStatus = OfflineQueueStatus;

export type OfflineDiaryAction = "create" | "update" | "delete";

export type OfflineFoodPhotoAction = "create" | "update" | "delete";

export type OfflineDeviceSyncAction =
  | "connect"
  | "update"
  | "delete"
  | "import";

export type OfflineSummaryAction =
  | "create"
  | "update"
  | "publish"
  | "delete";

/* -------------------------------------------------------------------------- */
/*                                 Payloads                                   */
/* -------------------------------------------------------------------------- */

export interface OfflineSyncBasePayload extends Record<string, unknown> {
  patientId: string;
  source?: string;
  optimisticId?: string;
}

export interface OfflineDiaryCreatePayload
  extends OfflineSyncBasePayload {
  kind: "diary";
  action: "create";
  input: DiaryCreateInput;
}

export interface OfflineDiaryUpdatePayload
  extends OfflineSyncBasePayload {
  kind: "diary";
  action: "update";
  entryId: string;
  updates: DiaryUpdateInput;
}

export interface OfflineDiaryDeletePayload
  extends OfflineSyncBasePayload {
  kind: "diary";
  action: "delete";
  entryId: string;
}

export type OfflineDiaryPayload =
  | OfflineDiaryCreatePayload
  | OfflineDiaryUpdatePayload
  | OfflineDiaryDeletePayload;

export interface OfflineFoodPhotoCreatePayload
  extends OfflineSyncBasePayload {
  kind: "food_photo";
  action: "create";
  input: FoodPhotoCreateInput;
}

export interface OfflineFoodPhotoUpdatePayload
  extends OfflineSyncBasePayload {
  kind: "food_photo";
  action: "update";
  recordId: string;
  updates: FoodPhotoUpdateInput;
}

export interface OfflineFoodPhotoDeletePayload
  extends OfflineSyncBasePayload {
  kind: "food_photo";
  action: "delete";
  recordId: string;
}

export type OfflineFoodPhotoPayload =
  | OfflineFoodPhotoCreatePayload
  | OfflineFoodPhotoUpdatePayload
  | OfflineFoodPhotoDeletePayload;

export interface OfflineDeviceConnectionCreatePayload
  extends OfflineSyncBasePayload {
  kind: "device_sync";
  action: "connect";
  input: DeviceConnectionCreateInput;
}

export interface OfflineDeviceConnectionUpdatePayload
  extends OfflineSyncBasePayload {
  kind: "device_sync";
  action: "update";
  connectionId: string;
  updates: DeviceConnectionUpdateInput;
}

export interface OfflineDeviceConnectionDeletePayload
  extends OfflineSyncBasePayload {
  kind: "device_sync";
  action: "delete";
  connectionId: string;
}

export interface OfflineDeviceImportPayload
  extends OfflineSyncBasePayload {
  kind: "device_sync";
  action: "import";
  input: DeviceImportCreateInput;
}

export type OfflineDeviceSyncPayload =
  | OfflineDeviceConnectionCreatePayload
  | OfflineDeviceConnectionUpdatePayload
  | OfflineDeviceConnectionDeletePayload
  | OfflineDeviceImportPayload;

export interface OfflineSummaryCreatePayload
  extends OfflineSyncBasePayload {
  kind: "summary";
  action: "create";
  input: SummaryCreateInput;
}

export interface OfflineSummaryUpdatePayload
  extends OfflineSyncBasePayload {
  kind: "summary";
  action: "update";
  summaryId: string;
  updates: SummaryUpdateInput;
}

export interface OfflineSummaryPublishPayload
  extends OfflineSyncBasePayload {
  kind: "summary";
  action: "publish";
  summaryId: string;
}

export interface OfflineSummaryDeletePayload
  extends OfflineSyncBasePayload {
  kind: "summary";
  action: "delete";
  summaryId: string;
}

export type OfflineSummaryPayload =
  | OfflineSummaryCreatePayload
  | OfflineSummaryUpdatePayload
  | OfflineSummaryPublishPayload
  | OfflineSummaryDeletePayload;

export type OfflineSyncPayload =
  | OfflineDiaryPayload
  | OfflineFoodPhotoPayload
  | OfflineDeviceSyncPayload
  | OfflineSummaryPayload;

/* -------------------------------------------------------------------------- */
/*                               Queue Records                                */
/* -------------------------------------------------------------------------- */

export type OfflineSyncRecord = OfflineQueueRecord<OfflineSyncPayload>;

export interface OfflineSyncFilters {
  kind?: OfflineSyncKind;
  status?: OfflineSyncStatus;
  patientId?: string;
  query?: string;
}

export interface OfflineSyncViewModel {
  record: OfflineSyncRecord;
  kindLabel: string;
  actionLabel: string;
  statusLabel: string;
  timeLabel: string;
  summary: string;
  isPending: boolean;
  isFailed: boolean;
  isConflicted: boolean;
}

export type OfflineSyncState = OfflineControllerState;

export type OfflineSyncQueueSummary = OfflineQueueSummary;
