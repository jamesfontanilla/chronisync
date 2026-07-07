/**
 * =============================================================================
 * ChroniSync
 * Deterministic Trend Engine
 * =============================================================================
 */

export type TrendDirection = "up" | "down" | "steady";

export interface TrendObservation {
  recordedAt: Date;
  value: number;
}

export interface TrendAnalysisOptions {
  evaluatedAt?: Date;
  ewmaAlpha?: number;
  slopeThreshold?: number;
  tauThreshold?: number;
  cusumThreshold?: number;
}

export interface TrendAnalysis {
  sampleCount: number;
  firstRecordedAt: Date;
  lastRecordedAt: Date;
  mean: number;
  median: number;
  minimum: number;
  maximum: number;
  range: number;
  standardDeviation: number;
  slopePerDay: number;
  intercept: number;
  ewma: number;
  cusumPositive: number;
  cusumNegative: number;
  cusumSignal: number;
  mannKendallTau: number;
  direction: TrendDirection;
  directionScore: number;
}

const DAY_MS = 24 * 60 * 60 * 1000;

function sortObservations(
  observations: readonly TrendObservation[]
): TrendObservation[] {
  return [...observations].sort(
    (left, right) => left.recordedAt.getTime() - right.recordedAt.getTime()
  );
}

function calculateMean(values: readonly number[]): number {
  if (values.length === 0) {
    return 0;
  }

  return values.reduce((sum, value) => sum + value, 0) / values.length;
}

function calculateMedian(values: readonly number[]): number {
  if (values.length === 0) {
    return 0;
  }

  const ordered = [...values].sort((left, right) => left - right);
  const middle = Math.floor(ordered.length / 2);

  if (ordered.length % 2 === 0) {
    const left = ordered[middle - 1] ?? 0;
    const right = ordered[middle] ?? left;
    return (left + right) / 2;
  }

  return ordered[middle] ?? 0;
}

function calculateStandardDeviation(
  values: readonly number[],
  mean: number
): number {
  if (values.length < 2) {
    return 0;
  }

  const variance =
    values.reduce((sum, value) => sum + (value - mean) ** 2, 0) /
    values.length;

  return Math.sqrt(variance);
}

function calculateSlopePerDay(
  observations: readonly TrendObservation[]
): number {
  if (observations.length < 2) {
    return 0;
  }

  const firstRecordedAt = observations[0]?.recordedAt.getTime() ?? 0;
  const xValues = observations.map(
    (observation) =>
      (observation.recordedAt.getTime() - firstRecordedAt) / DAY_MS
  );
  const yValues = observations.map((observation) => observation.value);
  const xMean = calculateMean(xValues);
  const yMean = calculateMean(yValues);

  const numerator = observations.reduce((sum, observation, index) => {
    const x = xValues[index] ?? 0;
    const y = yValues[index] ?? 0;
    return sum + (x - xMean) * (y - yMean);
  }, 0);
  const denominator = xValues.reduce(
    (sum, value) => sum + (value - xMean) ** 2,
    0
  );

  if (denominator === 0) {
    return 0;
  }

  return numerator / denominator;
}

function calculateIntercept(
  observations: readonly TrendObservation[],
  slopePerDay: number
): number {
  if (observations.length === 0) {
    return 0;
  }

  const firstRecordedAt = observations[0]?.recordedAt.getTime() ?? 0;
  const xValues = observations.map(
    (observation) =>
      (observation.recordedAt.getTime() - firstRecordedAt) / DAY_MS
  );
  const yValues = observations.map((observation) => observation.value);
  const xMean = calculateMean(xValues);
  const yMean = calculateMean(yValues);

  return yMean - slopePerDay * xMean;
}

function calculateEwma(
  values: readonly number[],
  alpha: number
): number {
  if (values.length === 0) {
    return 0;
  }

  let ewma = values[0] ?? 0;

  for (let index = 1; index < values.length; index += 1) {
    const value = values[index] ?? ewma;
    ewma = alpha * value + (1 - alpha) * ewma;
  }

  return ewma;
}

function calculateMannKendallTau(
  values: readonly number[]
): number {
  if (values.length < 2) {
    return 0;
  }

  let score = 0;

  for (let leftIndex = 0; leftIndex < values.length - 1; leftIndex += 1) {
    for (let rightIndex = leftIndex + 1; rightIndex < values.length; rightIndex += 1) {
      const left = values[leftIndex] ?? 0;
      const right = values[rightIndex] ?? 0;

      if (right > left) {
        score += 1;
      } else if (right < left) {
        score -= 1;
      }
    }
  }

  const comparisonCount = (values.length * (values.length - 1)) / 2;

  return comparisonCount > 0 ? score / comparisonCount : 0;
}

function calculateCusum(values: readonly number[], target: number): {
  positive: number;
  negative: number;
} {
  let positive = 0;
  let negative = 0;
  let maxPositive = 0;
  let minNegative = 0;

  for (const value of values) {
    const delta = value - target;
    positive = Math.max(0, positive + delta);
    negative = Math.min(0, negative + delta);
    maxPositive = Math.max(maxPositive, positive);
    minNegative = Math.min(minNegative, negative);
  }

  return {
    positive: maxPositive,
    negative: minNegative,
  };
}

function getTrendDirection(params: {
  slopePerDay: number;
  mannKendallTau: number;
  cusumPositive: number;
  cusumNegative: number;
  slopeThreshold: number;
  tauThreshold: number;
  cusumThreshold: number;
}): TrendDirection {
  const upward =
    params.slopePerDay >= params.slopeThreshold &&
    params.mannKendallTau >= params.tauThreshold &&
    params.cusumPositive >= params.cusumThreshold;
  const downward =
    params.slopePerDay <= -params.slopeThreshold &&
    params.mannKendallTau <= -params.tauThreshold &&
    Math.abs(params.cusumNegative) >= params.cusumThreshold;

  if (upward) {
    return "up";
  }

  if (downward) {
    return "down";
  }

  return "steady";
}

export function analyzeNumericTrend(
  observations: readonly TrendObservation[],
  options: TrendAnalysisOptions = {}
): TrendAnalysis | null {
  const ordered = sortObservations(
    observations.filter(
      (observation) =>
        Number.isFinite(observation.value) &&
        observation.recordedAt instanceof Date
    )
  );

  if (ordered.length === 0) {
    return null;
  }

  const values = ordered.map((observation) => observation.value);
  const mean = calculateMean(values);
  const median = calculateMedian(values);
  const minimum = Math.min(...values);
  const maximum = Math.max(...values);
  const range = maximum - minimum;
  const standardDeviation = calculateStandardDeviation(values, mean);
  const slopePerDay = calculateSlopePerDay(ordered);
  const intercept = calculateIntercept(ordered, slopePerDay);
  const ewma = calculateEwma(values, options.ewmaAlpha ?? 0.35);
  const cusum = calculateCusum(values, mean);
  const cusumPositive = cusum.positive;
  const cusumNegative = cusum.negative;
  const cusumSignal = Math.max(cusumPositive, Math.abs(cusumNegative));
  const mannKendallTau = calculateMannKendallTau(values);
  const slopeThreshold = options.slopeThreshold ?? Math.max(0.5, standardDeviation * 0.05);
  const tauThreshold = options.tauThreshold ?? 0.25;
  const cusumThreshold = options.cusumThreshold ?? Math.max(standardDeviation, 1);
  const direction = getTrendDirection({
    slopePerDay,
    mannKendallTau,
    cusumPositive,
    cusumNegative,
    slopeThreshold,
    tauThreshold,
    cusumThreshold,
  });
  const directionScore = Math.min(
    1,
    (Math.abs(slopePerDay) / Math.max(slopeThreshold, 1) +
      Math.abs(mannKendallTau) / Math.max(tauThreshold, 0.01) +
      Math.abs(cusumSignal) / Math.max(cusumThreshold, 1)) / 3
  );

  return {
    sampleCount: ordered.length,
    firstRecordedAt: ordered[0]?.recordedAt ?? new Date(),
    lastRecordedAt: ordered[ordered.length - 1]?.recordedAt ?? new Date(),
    mean,
    median,
    minimum,
    maximum,
    range,
    standardDeviation,
    slopePerDay,
    intercept,
    ewma,
    cusumPositive,
    cusumNegative,
    cusumSignal,
    mannKendallTau,
    direction,
    directionScore,
  };
}

export function describeTrendDirection(
  direction: TrendDirection
): string {
  switch (direction) {
    case "up":
      return "upward";
    case "down":
      return "downward";
    case "steady":
    default:
      return "steady";
  }
}

export function buildTrendAnalysisMetadata(
  analysis: TrendAnalysis
): TrendAnalysis {
  return {
    sampleCount: analysis.sampleCount,
    firstRecordedAt: analysis.firstRecordedAt,
    lastRecordedAt: analysis.lastRecordedAt,
    mean: analysis.mean,
    median: analysis.median,
    minimum: analysis.minimum,
    maximum: analysis.maximum,
    range: analysis.range,
    standardDeviation: analysis.standardDeviation,
    slopePerDay: analysis.slopePerDay,
    intercept: analysis.intercept,
    ewma: analysis.ewma,
    cusumPositive: analysis.cusumPositive,
    cusumNegative: analysis.cusumNegative,
    cusumSignal: analysis.cusumSignal,
    mannKendallTau: analysis.mannKendallTau,
    direction: analysis.direction,
    directionScore: analysis.directionScore,
  };
}
