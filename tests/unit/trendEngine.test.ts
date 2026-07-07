import assert from "node:assert/strict";
import test from "node:test";

import {
  analyzeNumericTrend,
  buildTrendAnalysisMetadata,
  describeTrendDirection,
} from "@/lib/rules/trendEngine";

const start = new Date("2026-07-01T00:00:00.000Z");

function buildObservation(offsetDays: number, value: number) {
  return {
    recordedAt: new Date(start.getTime() + offsetDays * 24 * 60 * 60 * 1000),
    value,
  };
}

test("deterministic trend analysis detects rising and falling patterns", () => {
  const rising = analyzeNumericTrend([
    buildObservation(0, 100),
    buildObservation(1, 104),
    buildObservation(2, 108),
    buildObservation(3, 111),
    buildObservation(4, 115),
  ]);
  const falling = analyzeNumericTrend([
    buildObservation(0, 120),
    buildObservation(1, 116),
    buildObservation(2, 113),
    buildObservation(3, 109),
    buildObservation(4, 104),
  ]);

  assert.ok(rising);
  assert.ok(falling);
  assert.equal(rising.direction, "up");
  assert.equal(falling.direction, "down");
  assert.ok(rising.slopePerDay > 0);
  assert.ok(falling.slopePerDay < 0);
  assert.ok(rising.mannKendallTau > 0);
  assert.ok(falling.mannKendallTau < 0);
  assert.equal(describeTrendDirection(rising.direction), "upward");
});

test("trend metadata stays serializable for alert payloads", () => {
  const analysis = analyzeNumericTrend([
    buildObservation(0, 140),
    buildObservation(1, 144),
    buildObservation(2, 146),
    buildObservation(3, 149),
  ]);

  assert.ok(analysis);

  const metadata = buildTrendAnalysisMetadata(analysis);

  assert.equal(metadata.sampleCount, 4);
  assert.equal(metadata.direction, "up");
  assert.equal(typeof metadata.slopePerDay, "number");
  assert.ok(metadata.firstRecordedAt instanceof Date);
  assert.ok(metadata.lastRecordedAt instanceof Date);
});
