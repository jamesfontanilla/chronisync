/**
 * =============================================================================
 * ChroniSync
 * Diary Feature Types
 * =============================================================================
 */

import type { RecordOriginRole } from "@/types/provenance";

export type DiaryEntryType =
  | "glucose"
  | "pressure"
  | "weight"
  | "medication"
  | "diet"
  | "exercise"
  | "voice_note"
  | "note";

export type DiaryEntrySource =
  | "manual"
  | "voice"
  | "photo"
  | "device"
  | "imported";

export type DiarySyncState =
  | "queued"
  | "syncing"
  | "synced"
  | "conflict";

export interface DiaryEntry {
  id: string;
  patientId: string;
  recordedByRole?: RecordOriginRole;
  type: DiaryEntryType;
  title: string;
  content: string;
  valueLabel?: string;
  source: DiaryEntrySource;
  syncState: DiarySyncState;
  recordedAt: Date;
  tags?: string[];
  createdAt: Date;
  updatedAt: Date;
}

export interface DiaryCreateInput {
  patientId: string;
  recordedByRole?: RecordOriginRole;
  type: DiaryEntryType;
  title: string;
  content: string;
  valueLabel?: string;
  source?: DiaryEntrySource;
  syncState?: DiarySyncState;
  recordedAt?: Date;
  tags?: string[];
}

export type DiaryUpdateInput = Partial<
  Omit<DiaryEntry, "id" | "patientId" | "createdAt" | "updatedAt">
>;

export interface DiaryFilters {
  patientId?: string;
  type?: DiaryEntryType;
  syncState?: DiarySyncState;
  query?: string;
  limit?: number;
}

export interface DiarySummary {
  total: number;
  quickLogs: number;
  photos: number;
  voiceEntries: number;
  notes: number;
  queued: number;
  syncing: number;
  synced: number;
  conflict: number;
  lastUpdated: Date;
}

export interface DiaryViewModel {
  entry: DiaryEntry;
  typeLabel: string;
  syncStateLabel: string;
  timeLabel: string;
  preview: string;
}
