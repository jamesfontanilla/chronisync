/**
 * =============================================================================
 * ChroniSync
 * Device Sync Feature Types
 * =============================================================================
 */

import type { VitalType } from "@/types/vital";

/* -------------------------------------------------------------------------- */
/*                               Enumerations                                 */
/* -------------------------------------------------------------------------- */

export type DeviceSyncProvider =
  | "bluetooth"
  | "usb"
  | "vendor_import"
  | "csv"
  | "apple_health"
  | "google_fit"
  | "manual";

export type DeviceConnectionStatus =
  | "connected"
  | "connecting"
  | "syncing"
  | "paused"
  | "disconnected"
  | "error";

export type DeviceImportStatus =
  | "queued"
  | "syncing"
  | "synced"
  | "failed"
  | "conflict";

/* -------------------------------------------------------------------------- */
/*                            Device Connections                              */
/* -------------------------------------------------------------------------- */

export interface DeviceConnection {
  id: string;
  patientId: string;
  provider: DeviceSyncProvider;
  deviceName: string;
  externalId?: string;
  status: DeviceConnectionStatus;
  autoSyncEnabled: boolean;
  syncIntervalMinutes: number;
  supportedMetrics: VitalType[];
  lastSyncedAt?: Date;
  lastSeenAt?: Date;
  notes?: string;
  metadata?: Record<string, unknown>;
  createdAt: Date;
  updatedAt: Date;
}

export interface DeviceConnectionCreateInput {
  patientId: string;
  provider: DeviceSyncProvider;
  deviceName: string;
  externalId?: string;
  status: DeviceConnectionStatus;
  autoSyncEnabled: boolean;
  syncIntervalMinutes: number;
  supportedMetrics: VitalType[];
  lastSyncedAt?: Date;
  lastSeenAt?: Date;
  notes?: string;
  metadata?: Record<string, unknown>;
}

export interface DeviceConnectionUpdateInput {
  provider?: DeviceSyncProvider;
  deviceName?: string;
  externalId?: string;
  status?: DeviceConnectionStatus;
  autoSyncEnabled?: boolean;
  syncIntervalMinutes?: number;
  supportedMetrics?: VitalType[];
  lastSyncedAt?: Date;
  lastSeenAt?: Date;
  notes?: string;
  metadata?: Record<string, unknown>;
}

export interface DeviceConnectionFilters {
  patientId?: string;
  provider?: DeviceSyncProvider;
  status?: DeviceConnectionStatus;
  query?: string;
  limit?: number;
}

export interface DeviceConnectionViewModel {
  connection: DeviceConnection;
  providerLabel: string;
  statusLabel: string;
  timeLabel: string;
  summary: string;
}

/* -------------------------------------------------------------------------- */
/*                              Device Imports                                */
/* -------------------------------------------------------------------------- */

export interface DeviceImportRecord {
  id: string;
  patientId: string;
  provider: DeviceSyncProvider;
  connectionId?: string;
  sourceName: string;
  fileName?: string;
  primaryMetric?: VitalType;
  status: DeviceImportStatus;
  recordCount: number;
  acceptedCount: number;
  rejectedCount: number;
  lastSyncedAt?: Date;
  capturedAt: Date;
  notes?: string;
  metadata?: Record<string, unknown>;
  createdAt: Date;
  updatedAt: Date;
}

export interface DeviceImportCreateInput {
  patientId: string;
  provider: DeviceSyncProvider;
  connectionId?: string;
  sourceName: string;
  fileName?: string;
  primaryMetric?: VitalType;
  status: DeviceImportStatus;
  recordCount: number;
  acceptedCount: number;
  rejectedCount: number;
  lastSyncedAt?: Date;
  capturedAt?: Date;
  notes?: string;
  metadata?: Record<string, unknown>;
}

export interface DeviceImportUpdateInput {
  provider?: DeviceSyncProvider;
  connectionId?: string;
  sourceName?: string;
  fileName?: string;
  primaryMetric?: VitalType;
  status?: DeviceImportStatus;
  recordCount?: number;
  acceptedCount?: number;
  rejectedCount?: number;
  lastSyncedAt?: Date;
  capturedAt?: Date;
  notes?: string;
  metadata?: Record<string, unknown>;
}

export interface DeviceImportFilters {
  patientId?: string;
  connectionId?: string;
  provider?: DeviceSyncProvider;
  status?: DeviceImportStatus;
  primaryMetric?: VitalType;
  query?: string;
  limit?: number;
}

export interface DeviceImportViewModel {
  record: DeviceImportRecord;
  providerLabel: string;
  statusLabel: string;
  timeLabel: string;
  summary: string;
}

/* -------------------------------------------------------------------------- */
/*                               Device Sync                                  */
/* -------------------------------------------------------------------------- */

export interface DeviceSyncSummary {
  totalConnections: number;
  connected: number;
  connecting: number;
  syncing: number;
  paused: number;
  disconnected: number;
  error: number;
  totalImports: number;
  queuedImports: number;
  syncingImports: number;
  syncedImports: number;
  failedImports: number;
  conflictImports: number;
  lastSyncedAt: Date | null;
  lastUpdatedAt: Date;
}
