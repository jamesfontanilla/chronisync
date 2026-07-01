/**
 * =============================================================================
 * ChroniSync
 * Consent Feature Types
 * =============================================================================
 */

import type {
  ConsentChannel,
  ConsentStatus,
} from "@/lib/privacy/consent";
import type { PrivacyScope } from "@/lib/privacy/policy";

export type ConsentScope = PrivacyScope;

export type ConsentTargetType =
  | "caregiver"
  | "physician"
  | "service"
  | "organization"
  | "ai";

export interface ConsentRecord {
  id: string;
  patientId: string;
  scope: ConsentScope;
  status: ConsentStatus;
  targetType?: ConsentTargetType;
  targetId?: string;
  targetLabel?: string;
  purpose?: string;
  channel: ConsentChannel;
  grantedBy?: string;
  grantedAt?: Date;
  effectiveAt: Date;
  expiresAt?: Date;
  revokedAt?: Date;
  revokedBy?: string;
  evidence?: string;
  notes?: string;
  metadata?: Record<string, unknown>;
  createdAt: Date;
  updatedAt: Date;
}

export interface ConsentCreateInput {
  patientId: string;
  scope: ConsentScope;
  status?: ConsentStatus;
  targetType?: ConsentTargetType;
  targetId?: string;
  targetLabel?: string;
  purpose?: string;
  channel?: ConsentChannel;
  grantedBy?: string;
  grantedAt?: Date;
  effectiveAt?: Date;
  expiresAt?: Date;
  revokedAt?: Date;
  revokedBy?: string;
  evidence?: string;
  notes?: string;
  metadata?: Record<string, unknown>;
}

export type ConsentUpdateInput = Partial<
  Omit<ConsentRecord, "id" | "patientId" | "createdAt" | "updatedAt">
>;

export type ConsentSortOrder =
  | "newest"
  | "oldest"
  | "status"
  | "scope";

export interface ConsentFilters {
  patientId?: string;
  scope?: ConsentScope;
  status?: ConsentStatus;
  targetType?: ConsentTargetType;
  query?: string;
  limit?: number;
  sort?: ConsentSortOrder;
}

export interface ConsentSummary {
  total: number;
  active: number;
  pending: number;
  revoked: number;
  expired: number;
  scopeCount: number;
  lastUpdated: Date | null;
}

export interface ConsentViewModel {
  consent: ConsentRecord;
  scopeLabel: string;
  statusLabel: string;
  targetLabel: string;
  timeLabel: string;
  summary: string;
  isActive: boolean;
  isExpired: boolean;
}

export interface ConsentActionState {
  consentId: string;
  reason?: string;
}
