/**
 * =============================================================================
 * ChroniSync
 * Device Sync Feature Service
 * =============================================================================
 */

import { logger } from "@/lib/logger";
import {
  createDocument,
  deleteDocument,
  getDocument,
  queryDocuments,
  updateDocument,
  whereEquals,
} from "@/lib/firebase/firestore";
import { formatDateTime, humanize } from "@/lib/utils";

import type {
  DeviceConnection,
  DeviceConnectionCreateInput,
  DeviceConnectionFilters,
  DeviceConnectionUpdateInput,
  DeviceConnectionViewModel,
  DeviceImportCreateInput,
  DeviceImportFilters,
  DeviceImportRecord,
  DeviceImportUpdateInput,
  DeviceImportViewModel,
  DeviceSyncSummary,
} from "./types";

export type {
  DeviceConnection,
  DeviceConnectionCreateInput,
  DeviceConnectionFilters,
  DeviceConnectionStatus,
  DeviceConnectionUpdateInput,
  DeviceConnectionViewModel,
  DeviceImportCreateInput,
  DeviceImportFilters,
  DeviceImportRecord,
  DeviceImportStatus,
  DeviceImportUpdateInput,
  DeviceImportViewModel,
  DeviceSyncSummary,
} from "./types";

const CONNECTIONS_COLLECTION = "deviceConnections";
const IMPORTS_COLLECTION = "deviceImports";
const DEMO_PATIENT_ID = "demo-patient";
const DEMO_REFERENCE_TIMESTAMP = Date.parse("2026-07-01T00:08:00.000Z");

function createRecordId(prefix: string): string {
  return typeof globalThis.crypto?.randomUUID === "function"
    ? globalThis.crypto.randomUUID()
    : `${prefix}_${Date.now()}_${Math.random().toString(36).slice(2, 10)}`;
}

function createTimestamp(minutesAgo = 0): Date {
  return new Date(DEMO_REFERENCE_TIMESTAMP - minutesAgo * 60_000);
}

function normalizeDate(value: unknown): Date {
  if (value instanceof Date) {
    return value;
  }

  if (typeof value === "string" || typeof value === "number") {
    return new Date(value);
  }

  if (
    value &&
    typeof value === "object" &&
    "toDate" in value &&
    typeof (value as { toDate: () => Date }).toDate === "function"
  ) {
    return (value as { toDate: () => Date }).toDate();
  }

  return createTimestamp();
}

function normalizeConnection(connection: DeviceConnection): DeviceConnection {
  return {
    ...connection,
    supportedMetrics: [...(connection.supportedMetrics ?? [])],
    ...(connection.externalId ? { externalId: connection.externalId } : {}),
    ...(connection.lastSyncedAt
      ? { lastSyncedAt: normalizeDate(connection.lastSyncedAt) }
      : {}),
    ...(connection.lastSeenAt
      ? { lastSeenAt: normalizeDate(connection.lastSeenAt) }
      : {}),
    ...(connection.notes ? { notes: connection.notes } : {}),
    ...(connection.metadata ? { metadata: connection.metadata } : {}),
    createdAt: normalizeDate(connection.createdAt),
    updatedAt: normalizeDate(connection.updatedAt),
  };
}

function normalizeImport(record: DeviceImportRecord): DeviceImportRecord {
  return {
    ...record,
    ...(record.connectionId ? { connectionId: record.connectionId } : {}),
    ...(record.fileName ? { fileName: record.fileName } : {}),
    ...(record.primaryMetric
      ? { primaryMetric: record.primaryMetric }
      : {}),
    ...(record.lastSyncedAt
      ? { lastSyncedAt: normalizeDate(record.lastSyncedAt) }
      : {}),
    ...(record.notes ? { notes: record.notes } : {}),
    ...(record.metadata ? { metadata: record.metadata } : {}),
    capturedAt: normalizeDate(record.capturedAt),
    createdAt: normalizeDate(record.createdAt),
    updatedAt: normalizeDate(record.updatedAt),
  };
}

function matchesConnectionQuery(
  connection: DeviceConnection,
  query: string
): boolean {
  const normalized = query.trim().toLowerCase();

  if (!normalized) {
    return true;
  }

  const haystack = [
    connection.deviceName,
    connection.provider,
    connection.externalId,
    connection.status,
    connection.notes,
    connection.supportedMetrics.join(" "),
  ]
    .filter((value): value is string => Boolean(value))
    .join(" ")
    .toLowerCase();

  return haystack.includes(normalized);
}

function matchesImportQuery(
  record: DeviceImportRecord,
  query: string
): boolean {
  const normalized = query.trim().toLowerCase();

  if (!normalized) {
    return true;
  }

  const haystack = [
    record.sourceName,
    record.fileName,
    record.provider,
    record.status,
    record.primaryMetric,
    record.connectionId,
    record.notes,
    record.recordCount.toString(),
    record.acceptedCount.toString(),
    record.rejectedCount.toString(),
  ]
    .filter((value): value is string => Boolean(value))
    .join(" ")
    .toLowerCase();

  return haystack.includes(normalized);
}

function sortConnections(
  connections: DeviceConnection[]
): DeviceConnection[] {
  return [...connections].sort(
    (left, right) => right.updatedAt.getTime() - left.updatedAt.getTime()
  );
}

function sortImports(records: DeviceImportRecord[]): DeviceImportRecord[] {
  return [...records].sort(
    (left, right) =>
      (right.lastSyncedAt ?? right.capturedAt).getTime() -
      (left.lastSyncedAt ?? left.capturedAt).getTime()
  );
}

function createDemoConnections(
  patientId: string = DEMO_PATIENT_ID
): DeviceConnection[] {
  return [
    normalizeConnection({
      id: "device-connection-dexcom",
      patientId,
      provider: "bluetooth",
      deviceName: "Dexcom G7",
      externalId: "dexcom-g7-01",
      status: "connected",
      autoSyncEnabled: true,
      syncIntervalMinutes: 15,
      supportedMetrics: ["blood_glucose"],
      lastSyncedAt: createTimestamp(18),
      lastSeenAt: createTimestamp(15),
      notes: "Continuous glucose monitor with live sync enabled.",
      metadata: { vendor: "Dexcom" },
      createdAt: createTimestamp(90),
      updatedAt: createTimestamp(15),
    }),
    normalizeConnection({
      id: "device-connection-omron",
      patientId,
      provider: "usb",
      deviceName: "Omron BP Monitor",
      externalId: "omron-bp-02",
      status: "paused",
      autoSyncEnabled: false,
      syncIntervalMinutes: 60,
      supportedMetrics: ["blood_pressure", "heart_rate"],
      lastSyncedAt: createTimestamp(240),
      lastSeenAt: createTimestamp(240),
      notes: "USB import paused until the next clinic visit.",
      metadata: { vendor: "Omron" },
      createdAt: createTimestamp(120),
      updatedAt: createTimestamp(90),
    }),
  ];
}

function createDemoImports(
  patientId: string = DEMO_PATIENT_ID
): DeviceImportRecord[] {
  return [
    normalizeImport({
      id: "device-import-glucose",
      patientId,
      provider: "bluetooth",
      connectionId: "device-connection-dexcom",
      sourceName: "Dexcom sync window",
      fileName: "dexcom-weekly-export.json",
      primaryMetric: "blood_glucose",
      status: "synced",
      recordCount: 96,
      acceptedCount: 96,
      rejectedCount: 0,
      lastSyncedAt: createTimestamp(18),
      capturedAt: createTimestamp(18),
      notes: "Imported CGM readings for the last 24 hours.",
      metadata: { window: "24h" },
      createdAt: createTimestamp(18),
      updatedAt: createTimestamp(18),
    }),
    normalizeImport({
      id: "device-import-pressure",
      patientId,
      provider: "csv",
      sourceName: "Home BP export",
      fileName: "bp-readings.csv",
      primaryMetric: "blood_pressure",
      status: "queued",
      recordCount: 12,
      acceptedCount: 0,
      rejectedCount: 0,
      capturedAt: createTimestamp(45),
      notes: "Awaiting reconnect to complete the import.",
      metadata: { format: "csv" },
      createdAt: createTimestamp(45),
      updatedAt: createTimestamp(45),
    }),
  ];
}

function filterConnections(
  connections: DeviceConnection[],
  filters: Omit<DeviceConnectionFilters, "patientId"> = {}
): DeviceConnection[] {
  return connections.filter((connection) => {
    if (filters.provider && connection.provider !== filters.provider) {
      return false;
    }

    if (filters.status && connection.status !== filters.status) {
      return false;
    }

    if (filters.query && !matchesConnectionQuery(connection, filters.query)) {
      return false;
    }

    return true;
  });
}

function filterImports(
  records: DeviceImportRecord[],
  filters: Omit<DeviceImportFilters, "patientId"> = {}
): DeviceImportRecord[] {
  return records.filter((record) => {
    if (filters.connectionId && record.connectionId !== filters.connectionId) {
      return false;
    }

    if (filters.provider && record.provider !== filters.provider) {
      return false;
    }

    if (filters.status && record.status !== filters.status) {
      return false;
    }

    if (
      filters.primaryMetric &&
      record.primaryMetric !== filters.primaryMetric
    ) {
      return false;
    }

    if (filters.query && !matchesImportQuery(record, filters.query)) {
      return false;
    }

    return true;
  });
}

function getSummaryTimestamp(
  connections: DeviceConnection[],
  imports: DeviceImportRecord[]
): Date {
  const candidates = [
    ...connections.map((connection) => connection.updatedAt),
    ...connections
      .map((connection) => connection.lastSyncedAt)
      .filter((value): value is Date => Boolean(value)),
    ...imports.map((record) => record.updatedAt),
    ...imports
      .map((record) => record.lastSyncedAt ?? record.capturedAt)
      .filter((value): value is Date => Boolean(value)),
  ];

  return candidates.reduce(
    (latest, current) =>
      current.getTime() > latest.getTime() ? current : latest,
    createTimestamp()
  );
}

export function buildDeviceConnectionRecord(
  data: DeviceConnectionCreateInput
): DeviceConnection {
  const timestamp = new Date();

  return normalizeConnection({
    id: createRecordId("device_connection"),
    patientId: data.patientId.trim(),
    provider: data.provider,
    deviceName: data.deviceName.trim(),
    status: data.status,
    autoSyncEnabled: data.autoSyncEnabled,
    syncIntervalMinutes: data.syncIntervalMinutes,
    supportedMetrics: [...data.supportedMetrics],
    createdAt: timestamp,
    updatedAt: timestamp,
    ...(data.externalId ? { externalId: data.externalId.trim() } : {}),
    ...(data.lastSyncedAt ? { lastSyncedAt: data.lastSyncedAt } : {}),
    ...(data.lastSeenAt ? { lastSeenAt: data.lastSeenAt } : {}),
    ...(data.notes ? { notes: data.notes.trim() } : {}),
    ...(data.metadata ? { metadata: data.metadata } : {}),
  });
}

export function buildDeviceImportRecord(
  data: DeviceImportCreateInput
): DeviceImportRecord {
  const timestamp = new Date();
  const capturedAt = data.capturedAt ?? timestamp;

  return normalizeImport({
    id: createRecordId("device_import"),
    patientId: data.patientId.trim(),
    provider: data.provider,
    sourceName: data.sourceName.trim(),
    status: data.status,
    recordCount: data.recordCount,
    acceptedCount: data.acceptedCount,
    rejectedCount: data.rejectedCount,
    capturedAt,
    createdAt: timestamp,
    updatedAt: timestamp,
    ...(data.connectionId ? { connectionId: data.connectionId.trim() } : {}),
    ...(data.fileName ? { fileName: data.fileName.trim() } : {}),
    ...(data.primaryMetric ? { primaryMetric: data.primaryMetric } : {}),
    ...(data.lastSyncedAt ? { lastSyncedAt: data.lastSyncedAt } : {}),
    ...(data.notes ? { notes: data.notes.trim() } : {}),
    ...(data.metadata ? { metadata: data.metadata } : {}),
  });
}

export function buildDeviceConnectionViewModel(
  connection: DeviceConnection
): DeviceConnectionViewModel {
  const metricCount = connection.supportedMetrics.length;
  const lastTouched = connection.lastSyncedAt ?? connection.lastSeenAt ?? connection.updatedAt;

  return {
    connection,
    providerLabel: humanize(connection.provider),
    statusLabel: humanize(connection.status),
    timeLabel: formatDateTime(lastTouched),
    summary: `${metricCount} ${
      metricCount === 1 ? "metric" : "metrics"
    } • sync every ${connection.syncIntervalMinutes} min`,
  };
}

export function buildDeviceImportViewModel(
  record: DeviceImportRecord
): DeviceImportViewModel {
  const lastTouched = record.lastSyncedAt ?? record.capturedAt;

  return {
    record,
    providerLabel: humanize(record.provider),
    statusLabel: humanize(record.status),
    timeLabel: formatDateTime(lastTouched),
    summary: `${record.recordCount} readings • ${record.acceptedCount} accepted • ${record.rejectedCount} rejected`,
  };
}

export function summarizeDeviceSyncState(
  connections: DeviceConnection[],
  imports: DeviceImportRecord[]
): DeviceSyncSummary {
  const normalizedConnections = sortConnections(
    connections.map(normalizeConnection)
  );
  const normalizedImports = sortImports(imports.map(normalizeImport));

  return {
    totalConnections: normalizedConnections.length,
    connected: normalizedConnections.filter(
      (connection) => connection.status === "connected"
    ).length,
    connecting: normalizedConnections.filter(
      (connection) => connection.status === "connecting"
    ).length,
    syncing: normalizedConnections.filter(
      (connection) => connection.status === "syncing"
    ).length,
    paused: normalizedConnections.filter(
      (connection) => connection.status === "paused"
    ).length,
    disconnected: normalizedConnections.filter(
      (connection) => connection.status === "disconnected"
    ).length,
    error: normalizedConnections.filter(
      (connection) => connection.status === "error"
    ).length,
    totalImports: normalizedImports.length,
    queuedImports: normalizedImports.filter(
      (record) => record.status === "queued"
    ).length,
    syncingImports: normalizedImports.filter(
      (record) => record.status === "syncing"
    ).length,
    syncedImports: normalizedImports.filter(
      (record) => record.status === "synced"
    ).length,
    failedImports: normalizedImports.filter(
      (record) => record.status === "failed"
    ).length,
    conflictImports: normalizedImports.filter(
      (record) => record.status === "conflict"
    ).length,
    lastSyncedAt:
      [
        ...normalizedConnections
          .map((connection) => connection.lastSyncedAt)
          .filter((value): value is Date => Boolean(value)),
        ...normalizedImports
          .map((record) => record.lastSyncedAt)
          .filter((value): value is Date => Boolean(value)),
      ].reduce<Date | null>(
        (latest, current) =>
          !latest || current.getTime() > latest.getTime() ? current : latest,
        null
      ),
    lastUpdatedAt: getSummaryTimestamp(
      normalizedConnections,
      normalizedImports
    ),
  };
}

export async function createDeviceConnection(
  data: DeviceConnectionCreateInput
): Promise<DeviceConnection> {
  const record = buildDeviceConnectionRecord(data);

  try {
    await createDocument<DeviceConnection>(
      CONNECTIONS_COLLECTION,
      record.id,
      record
    );
  } catch (error) {
    logger.warn("Could not persist the device connection.", {
      patientId: record.patientId,
      connectionId: record.id,
      error: error instanceof Error ? error.message : String(error),
    });
    throw error;
  }

  return record;
}

export async function getDeviceConnectionById(
  connectionId: string
): Promise<DeviceConnection | null> {
  try {
    const record = await getDocument<DeviceConnection>(
      CONNECTIONS_COLLECTION,
      connectionId
    );

    if (record) {
      return normalizeConnection(record);
    }
  } catch {
    // Fall back to demo data below.
  }

  const demoConnection = createDemoConnections().find(
    (connection) => connection.id === connectionId
  );

  return demoConnection ? normalizeConnection(demoConnection) : null;
}

export async function listDeviceConnectionsByPatient(
  patientId: string,
  filters: Omit<DeviceConnectionFilters, "patientId"> = {}
): Promise<DeviceConnection[]> {
  const queryFilters: DeviceConnectionFilters = {
    patientId,
    ...(filters.provider ? { provider: filters.provider } : {}),
    ...(filters.status ? { status: filters.status } : {}),
    ...(filters.query ? { query: filters.query } : {}),
    ...(filters.limit ? { limit: filters.limit } : {}),
  };

  try {
    const records = await queryDocuments<DeviceConnection>(
      CONNECTIONS_COLLECTION,
      whereEquals("patientId", patientId)
    );

    const filtered = sortConnections(
      records.map(normalizeConnection).filter((connection) =>
        filterConnections([connection], queryFilters).length > 0
      )
    );

    if (filtered.length > 0) {
      return filtered.slice(0, queryFilters.limit ?? 20);
    }
  } catch (error) {
    logger.warn("Falling back to demo device connections.", {
      patientId,
      error: error instanceof Error ? error.message : String(error),
    });
  }

  return sortConnections(
    filterConnections(createDemoConnections(patientId), queryFilters)
  ).slice(0, queryFilters.limit ?? 20);
}

export async function listActiveDeviceConnectionsByPatient(
  patientId: string
): Promise<DeviceConnection[]> {
  const connections = await listDeviceConnectionsByPatient(patientId);

  return connections.filter(
    (connection) =>
      connection.status === "connected" || connection.status === "syncing"
  );
}

export async function updateDeviceConnection(
  connectionId: string,
  updates: DeviceConnectionUpdateInput
): Promise<DeviceConnection> {
  const existing = await getDeviceConnectionById(connectionId);

  if (!existing) {
    throw new Error(`Device connection ${connectionId} was not found.`);
  }

  const next = normalizeConnection({
    ...existing,
    ...updates,
    ...(updates.supportedMetrics
      ? { supportedMetrics: [...updates.supportedMetrics] }
      : existing.supportedMetrics
        ? { supportedMetrics: [...existing.supportedMetrics] }
        : { supportedMetrics: [] }),
    updatedAt: new Date(),
  });

  try {
    await updateDocument<DeviceConnection>(
      CONNECTIONS_COLLECTION,
      connectionId,
      next
    );
  } catch (error) {
    logger.warn("Could not persist the device connection update.", {
      connectionId,
      error: error instanceof Error ? error.message : String(error),
    });
    throw error;
  }

  return next;
}

export async function deleteDeviceConnection(
  connectionId: string
): Promise<void> {
  try {
    await deleteDocument(CONNECTIONS_COLLECTION, connectionId);
  } catch (error) {
    logger.warn("Could not delete the device connection.", {
      connectionId,
      error: error instanceof Error ? error.message : String(error),
    });
    throw error;
  }
}

export async function createDeviceImport(
  data: DeviceImportCreateInput
): Promise<DeviceImportRecord> {
  const record = buildDeviceImportRecord(data);

  try {
    await createDocument<DeviceImportRecord>(
      IMPORTS_COLLECTION,
      record.id,
      record
    );
  } catch (error) {
    logger.warn("Could not persist the device import.", {
      patientId: record.patientId,
      importId: record.id,
      error: error instanceof Error ? error.message : String(error),
    });
    throw error;
  }

  return record;
}

export async function getDeviceImportById(
  importId: string
): Promise<DeviceImportRecord | null> {
  try {
    const record = await getDocument<DeviceImportRecord>(
      IMPORTS_COLLECTION,
      importId
    );

    if (record) {
      return normalizeImport(record);
    }
  } catch {
    // Fall back to demo data below.
  }

  const demoImport = createDemoImports().find(
    (record) => record.id === importId
  );

  return demoImport ? normalizeImport(demoImport) : null;
}

export async function listDeviceImportsByPatient(
  patientId: string,
  filters: Omit<DeviceImportFilters, "patientId"> = {}
): Promise<DeviceImportRecord[]> {
  const queryFilters: DeviceImportFilters = {
    patientId,
    ...(filters.connectionId ? { connectionId: filters.connectionId } : {}),
    ...(filters.provider ? { provider: filters.provider } : {}),
    ...(filters.status ? { status: filters.status } : {}),
    ...(filters.primaryMetric
      ? { primaryMetric: filters.primaryMetric }
      : {}),
    ...(filters.query ? { query: filters.query } : {}),
    ...(filters.limit ? { limit: filters.limit } : {}),
  };

  try {
    const records = await queryDocuments<DeviceImportRecord>(
      IMPORTS_COLLECTION,
      whereEquals("patientId", patientId)
    );

    const filtered = sortImports(
      records.map(normalizeImport).filter((record) =>
        filterImports([record], queryFilters).length > 0
      )
    );

    if (filtered.length > 0) {
      return filtered.slice(0, queryFilters.limit ?? 20);
    }
  } catch (error) {
    logger.warn("Falling back to demo device imports.", {
      patientId,
      error: error instanceof Error ? error.message : String(error),
    });
  }

  return sortImports(filterImports(createDemoImports(patientId), queryFilters)).slice(
    0,
    queryFilters.limit ?? 20
  );
}

export async function listDeviceConnectionViewModelsByPatient(
  patientId: string,
  filters: Omit<DeviceConnectionFilters, "patientId"> = {}
): Promise<DeviceConnectionViewModel[]> {
  const records = await listDeviceConnectionsByPatient(patientId, filters);
  return records.map(buildDeviceConnectionViewModel);
}

export async function listDeviceImportViewModelsByPatient(
  patientId: string,
  filters: Omit<DeviceImportFilters, "patientId"> = {}
): Promise<DeviceImportViewModel[]> {
  const records = await listDeviceImportsByPatient(patientId, filters);
  return records.map(buildDeviceImportViewModel);
}

export async function updateDeviceImport(
  importId: string,
  updates: DeviceImportUpdateInput
): Promise<DeviceImportRecord> {
  const existing = await getDeviceImportById(importId);

  if (!existing) {
    throw new Error(`Device import ${importId} was not found.`);
  }

  const next = normalizeImport({
    ...existing,
    ...updates,
    ...(updates.connectionId !== undefined
      ? { connectionId: updates.connectionId }
      : existing.connectionId
        ? { connectionId: existing.connectionId }
        : {}),
    ...(updates.fileName !== undefined
      ? { fileName: updates.fileName }
      : existing.fileName
        ? { fileName: existing.fileName }
        : {}),
    ...(updates.primaryMetric !== undefined
      ? { primaryMetric: updates.primaryMetric }
      : existing.primaryMetric
        ? { primaryMetric: existing.primaryMetric }
        : {}),
    ...(updates.lastSyncedAt !== undefined
      ? { lastSyncedAt: updates.lastSyncedAt }
      : existing.lastSyncedAt
        ? { lastSyncedAt: existing.lastSyncedAt }
        : {}),
    ...(updates.capturedAt !== undefined
      ? { capturedAt: updates.capturedAt }
      : existing.capturedAt
        ? { capturedAt: existing.capturedAt }
        : { capturedAt: new Date() }),
    ...(updates.notes !== undefined
      ? { notes: updates.notes }
      : existing.notes
        ? { notes: existing.notes }
        : {}),
    ...(updates.metadata !== undefined
      ? { metadata: updates.metadata }
      : existing.metadata
        ? { metadata: existing.metadata }
        : {}),
    updatedAt: new Date(),
  });

  try {
    await updateDocument<DeviceImportRecord>(
      IMPORTS_COLLECTION,
      importId,
      next
    );
  } catch (error) {
    logger.warn("Could not persist the device import update.", {
      importId,
      error: error instanceof Error ? error.message : String(error),
    });
    throw error;
  }

  return next;
}

export async function deleteDeviceImport(
  importId: string
): Promise<void> {
  try {
    await deleteDocument(IMPORTS_COLLECTION, importId);
  } catch (error) {
    logger.warn("Could not delete the device import.", {
      importId,
      error: error instanceof Error ? error.message : String(error),
    });
    throw error;
  }
}

export function summarizeDeviceConnectionsByPatient(
  patientId: string,
  filters: Omit<DeviceConnectionFilters, "patientId"> = {},
  importsFilters: Omit<DeviceImportFilters, "patientId"> = {}
): Promise<DeviceSyncSummary> {
  return Promise.all([
    listDeviceConnectionsByPatient(patientId, filters),
    listDeviceImportsByPatient(patientId, importsFilters),
  ]).then(([connections, imports]) =>
    summarizeDeviceSyncState(connections, imports)
  );
}

export function buildDeviceSyncDemoSummary(
  patientId: string = DEMO_PATIENT_ID
): DeviceSyncSummary {
  return summarizeDeviceSyncState(
    createDemoConnections(patientId),
    createDemoImports(patientId)
  );
}

export function describeDeviceSyncSnapshot(
  connections: DeviceConnection[],
  imports: DeviceImportRecord[]
): string {
  const summary = summarizeDeviceSyncState(connections, imports);

  return `${summary.totalConnections} connections, ${summary.totalImports} imports`;
}
