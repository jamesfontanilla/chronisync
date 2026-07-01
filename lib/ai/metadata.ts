/**
 * =============================================================================
 * ChroniSync
 * AI Metadata Helpers
 * =============================================================================
 */

export const AI_DRAFT_DISCLAIMER =
  "AI-generated draft. Review source data before making clinical decisions.";

function compactMetadataValue(value: unknown): unknown | undefined {
  if (value === undefined) {
    return undefined;
  }

  if (Array.isArray(value)) {
    const compacted = value
      .map((item) => compactMetadataValue(item))
      .filter((item): item is unknown => item !== undefined);

    return compacted.length > 0 ? compacted : undefined;
  }

  if (value && typeof value === "object" && !(value instanceof Date)) {
    const compactedEntries = Object.entries(value as Record<string, unknown>)
      .flatMap(([key, entry]) => {
        const compacted = compactMetadataValue(entry);
        return compacted === undefined ? [] : [[key, compacted] as const];
      });

    return compactedEntries.length > 0
      ? Object.fromEntries(compactedEntries)
      : undefined;
  }

  return value;
}

export function compactAiMetadata(
  value: Record<string, unknown>
): Record<string, unknown> {
  const compacted = compactMetadataValue(value);

  return compacted &&
    typeof compacted === "object" &&
    !Array.isArray(compacted)
    ? (compacted as Record<string, unknown>)
    : {};
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}

export function getAiMetadataRecord(
  metadata: Record<string, unknown> | undefined,
  key: string
): Record<string, unknown> | undefined {
  const value = metadata?.[key];
  return isRecord(value) ? value : undefined;
}

export function getAiMetadataString(
  metadata: Record<string, unknown> | undefined,
  key: string
): string | undefined {
  const value = metadata?.[key];

  return typeof value === "string" && value.trim().length > 0
    ? value.trim()
    : undefined;
}

export function getAiMetadataNumber(
  metadata: Record<string, unknown> | undefined,
  key: string
): number | undefined {
  const value = metadata?.[key];

  return typeof value === "number" && Number.isFinite(value)
    ? value
    : undefined;
}
