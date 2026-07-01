import {
  createDeviceConnection,
  createDeviceImport,
  deleteDeviceConnection,
  deleteDeviceImport,
  getDeviceConnectionById,
  getDeviceImportById,
  listDeviceConnectionViewModelsByPatient,
  listDeviceConnectionsByPatient,
  listDeviceImportViewModelsByPatient,
  listDeviceImportsByPatient,
  updateDeviceConnection,
  updateDeviceImport,
} from "./service";
import type {
  DeviceConnectionCreateInput,
  DeviceConnectionFilters,
  DeviceConnectionUpdateInput,
  DeviceImportCreateInput,
  DeviceImportFilters,
  DeviceImportUpdateInput,
} from "./types";

export {
  buildDeviceConnectionRecord,
  buildDeviceConnectionViewModel,
  buildDeviceImportRecord,
  buildDeviceImportViewModel,
  buildDeviceSyncDemoSummary,
  describeDeviceSyncSnapshot,
  listActiveDeviceConnectionsByPatient,
  summarizeDeviceConnectionsByPatient,
} from "./service";

export type {
  DeviceConnection,
  DeviceConnectionFilters,
  DeviceConnectionViewModel,
  DeviceImportFilters,
  DeviceImportRecord,
  DeviceImportViewModel,
  DeviceSyncSummary,
} from "./service";

export async function createDeviceConnectionRecord(
  data: DeviceConnectionCreateInput
) {
  return createDeviceConnection(data);
}

export async function updateDeviceConnectionRecord(
  connectionId: string,
  updates: DeviceConnectionUpdateInput
) {
  return updateDeviceConnection(connectionId, updates);
}

export async function deleteDeviceConnectionRecord(
  connectionId: string
): Promise<void> {
  await deleteDeviceConnection(connectionId);
}

export async function getDeviceConnectionRecord(
  connectionId: string
) {
  return getDeviceConnectionById(connectionId);
}

export async function listDeviceConnectionRecordsByPatient(
  patientId: string,
  filters: Omit<DeviceConnectionFilters, "patientId"> = {}
) {
  return listDeviceConnectionsByPatient(patientId, filters);
}

export async function listDeviceConnectionViewModelRecordsByPatient(
  patientId: string,
  filters: Omit<DeviceConnectionFilters, "patientId"> = {}
) {
  return listDeviceConnectionViewModelsByPatient(patientId, filters);
}

export async function createDeviceImportRecord(
  data: DeviceImportCreateInput
) {
  return createDeviceImport(data);
}

export async function updateDeviceImportRecord(
  importId: string,
  updates: DeviceImportUpdateInput
) {
  return updateDeviceImport(importId, updates);
}

export async function deleteDeviceImportRecord(
  importId: string
): Promise<void> {
  await deleteDeviceImport(importId);
}

export async function getDeviceImportRecord(importId: string) {
  return getDeviceImportById(importId);
}

export async function listDeviceImportRecordsByPatient(
  patientId: string,
  filters: Omit<DeviceImportFilters, "patientId"> = {}
) {
  return listDeviceImportsByPatient(patientId, filters);
}

export async function listDeviceImportViewModelRecordsByPatient(
  patientId: string,
  filters: Omit<DeviceImportFilters, "patientId"> = {}
) {
  return listDeviceImportViewModelsByPatient(patientId, filters);
}
