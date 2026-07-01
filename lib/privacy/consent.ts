/**
 * =============================================================================
 * ChroniSync
 * Consent Helpers
 * =============================================================================
 */

import { humanize } from "@/lib/utils";

import {
  getPrivacyScopeLabel,
  normalizePrivacyScopes,
  type PrivacyScope,
} from "./policy";

import { z } from "zod";

export const CONSENT_STATUS_VALUES = [
  "pending",
  "granted",
  "revoked",
  "expired",
] as const;

export const consentStatusSchema = z.enum(CONSENT_STATUS_VALUES);

export type ConsentStatus = z.infer<typeof consentStatusSchema>;

export const CONSENT_CHANNEL_VALUES = [
  "app",
  "paper",
  "verbal",
  "email",
  "system",
] as const;

export const consentChannelSchema = z.enum(CONSENT_CHANNEL_VALUES);

export type ConsentChannel = z.infer<typeof consentChannelSchema>;

export interface ConsentLike {
  scope: PrivacyScope;
  status: ConsentStatus;
  effectiveAt?: Date;
  expiresAt?: Date;
  updatedAt?: Date;
}

export interface ConsentSnapshot {
  total: number;
  pending: number;
  granted: number;
  revoked: number;
  expired: number;
  activeScopes: PrivacyScope[];
  lastUpdated: Date | null;
}

export function isConsentActive(
  consent: ConsentLike,
  at: Date = new Date()
): boolean {
  if (consent.status !== "granted") {
    return false;
  }

  if (consent.effectiveAt && consent.effectiveAt.getTime() > at.getTime()) {
    return false;
  }

  if (consent.expiresAt && consent.expiresAt.getTime() < at.getTime()) {
    return false;
  }

  return true;
}

export function isConsentExpired(
  consent: ConsentLike,
  at: Date = new Date()
): boolean {
  return Boolean(
    consent.expiresAt && consent.expiresAt.getTime() < at.getTime()
  );
}

export function hasActiveConsentForScope(
  consents: readonly ConsentLike[],
  scope: PrivacyScope,
  at: Date = new Date()
): boolean {
  return consents.some(
    (consent) => consent.scope === scope && isConsentActive(consent, at)
  );
}

export function getActiveConsentScopes(
  consents: readonly ConsentLike[],
  at: Date = new Date()
): PrivacyScope[] {
  return normalizePrivacyScopes(
    consents
      .filter((consent) => isConsentActive(consent, at))
      .map((consent) => consent.scope)
  );
}

export function summarizeConsentRecords(
  consents: readonly ConsentLike[]
): ConsentSnapshot {
  const lastUpdated = consents.reduce<Date | null>((latest, consent) => {
    if (!consent.updatedAt) {
      return latest;
    }

    if (!latest) {
      return consent.updatedAt;
    }

    return consent.updatedAt.getTime() > latest.getTime()
      ? consent.updatedAt
      : latest;
  }, null);

  const snapshot = consents.reduce<ConsentSnapshot>(
    (accumulator, consent) => {
      accumulator.total += 1;

      switch (consent.status) {
        case "pending":
          accumulator.pending += 1;
          break;
        case "granted":
          accumulator.granted += 1;
          break;
        case "revoked":
          accumulator.revoked += 1;
          break;
        case "expired":
          accumulator.expired += 1;
          break;
        default:
          break;
      }

      return accumulator;
    },
    {
      total: 0,
      pending: 0,
      granted: 0,
      revoked: 0,
      expired: 0,
      activeScopes: [],
      lastUpdated,
    }
  );

  snapshot.activeScopes = getActiveConsentScopes(consents);
  snapshot.lastUpdated = lastUpdated;
  return snapshot;
}

export function getConsentStatusLabel(status: ConsentStatus): string {
  return humanize(status);
}

export function getConsentChannelLabel(channel: ConsentChannel): string {
  return humanize(channel);
}

export function describeConsentScope(scope: PrivacyScope): string {
  return getPrivacyScopeLabel(scope);
}
