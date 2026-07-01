/**
 * =============================================================================
 * ChroniSync
 * Caregiver Feature Types
 * =============================================================================
 */

import type { PrivacyScope } from "@/lib/privacy/policy";

export type CaregiverPermission = PrivacyScope;

export type CaregiverRelationship =
  | "spouse"
  | "partner"
  | "parent"
  | "child"
  | "sibling"
  | "relative"
  | "friend"
  | "guardian"
  | "professional"
  | "other";

export type CaregiverStatus =
  | "invited"
  | "active"
  | "paused"
  | "revoked";

export type CaregiverSortOrder =
  | "newest"
  | "oldest"
  | "relationship"
  | "status";

export interface CaregiverRecord {
  id: string;
  patientId: string;
  fullName: string;
  relationship: CaregiverRelationship;
  email?: string;
  phoneNumber?: string;
  permissions: CaregiverPermission[];
  status: CaregiverStatus;
  isPrimary: boolean;
  notes?: string;
  invitedBy?: string;
  invitedAt?: Date;
  acceptedAt?: Date;
  revokedAt?: Date;
  lastAccessedAt?: Date;
  metadata?: Record<string, unknown>;
  createdAt: Date;
  updatedAt: Date;
}

export interface CaregiverCreateInput {
  patientId: string;
  fullName: string;
  relationship: CaregiverRelationship;
  email?: string;
  phoneNumber?: string;
  permissions: CaregiverPermission[];
  status?: CaregiverStatus;
  isPrimary?: boolean;
  notes?: string;
  invitedBy?: string;
  invitedAt?: Date;
  acceptedAt?: Date;
  revokedAt?: Date;
  lastAccessedAt?: Date;
  metadata?: Record<string, unknown>;
}

export type CaregiverUpdateInput = Partial<
  Omit<
    CaregiverRecord,
    "id" | "patientId" | "createdAt" | "updatedAt"
  >
>;

export interface CaregiverFilters {
  patientId?: string;
  status?: CaregiverStatus;
  relationship?: CaregiverRelationship;
  permission?: CaregiverPermission;
  query?: string;
  limit?: number;
  sort?: CaregiverSortOrder;
}

export interface CaregiverSummary {
  total: number;
  active: number;
  invited: number;
  paused: number;
  revoked: number;
  primary: number;
}

export interface CaregiverViewModel {
  caregiver: CaregiverRecord;
  relationshipLabel: string;
  statusLabel: string;
  permissionLabel: string;
  timeLabel: string;
  summary: string;
  isActive: boolean;
}

export interface CaregiverActionState {
  caregiverId: string;
  reason?: string;
}
