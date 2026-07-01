import assert from "node:assert/strict";
import test from "node:test";

import {
  buildClinicalAlertInputs,
  buildClinicalAlertRecords,
  evaluateClinicalRules,
} from "@/lib/rules/engine";
import {
  createClinicalAlertInput,
  getClinicalAlertFamilyLabel,
  isInteractionClinicalFinding,
} from "@/lib/rules/alerts";
import { evaluateBloodPressureRule } from "@/lib/rules/bloodPressure";
import {
  evaluateBloodGlucoseRule,
  evaluateBloodGlucoseTrendRules,
} from "@/lib/rules/glucose";
import { evaluateBloodPressureTrendRules } from "@/lib/rules/bloodPressure";
import {
  evaluateMedicationAdherenceRules,
  type MedicationAdherenceObservation,
} from "@/lib/rules/adherence";
import type { Medication } from "@/types/medication";
import type { BloodPressureVital, NumericVital } from "@/types/vital";

const evaluatedAt = new Date("2026-07-01T08:00:00.000Z");

const severeBloodPressure: BloodPressureVital = {
  id: "vital-bp-severe",
  patientId: "patient-demo-1",
  type: "blood_pressure",
  systolic: 190,
  diastolic: 125,
  unit: "mmHg",
  recordedAt: evaluatedAt,
  source: "device",
  createdAt: evaluatedAt,
  updatedAt: evaluatedAt,
};

const elevatedGlucose: NumericVital = {
  id: "vital-glucose-high",
  patientId: "patient-demo-1",
  type: "blood_glucose",
  value: 152,
  unit: "mg/dL",
  recordedAt: evaluatedAt,
  source: "device",
  createdAt: evaluatedAt,
  updatedAt: evaluatedAt,
};

const trackedMedication: Medication = {
  id: "med-metformin",
  patientId: "patient-demo-1",
  prescribedBy: "physician-demo-1",
  name: "Metformin",
  dosage: "500 mg",
  route: "oral",
  frequency: "twice_daily",
  startDate: new Date("2026-06-01T00:00:00.000Z"),
  status: "active",
  refillRemaining: 2,
  createdAt: evaluatedAt,
  updatedAt: evaluatedAt,
};

const adherenceObservation: MedicationAdherenceObservation = {
  medicationId: trackedMedication.id,
  expectedDoses: 14,
  takenDoses: 8,
  missedDoses: 6,
  lastTakenAt: new Date("2026-06-29T08:00:00.000Z"),
  lastLoggedAt: new Date("2026-06-30T08:00:00.000Z"),
};

const bloodPressureTrendReadings: BloodPressureVital[] = [
  {
    id: "vital-bp-trend-1",
    patientId: "patient-demo-1",
    type: "blood_pressure",
    systolic: 152,
    diastolic: 96,
    unit: "mmHg",
    recordedAt: new Date("2026-06-25T08:00:00.000Z"),
    source: "manual",
    createdAt: evaluatedAt,
    updatedAt: evaluatedAt,
  },
  {
    id: "vital-bp-trend-2",
    patientId: "patient-demo-1",
    type: "blood_pressure",
    systolic: 148,
    diastolic: 94,
    unit: "mmHg",
    recordedAt: new Date("2026-06-27T08:00:00.000Z"),
    source: "manual",
    createdAt: evaluatedAt,
    updatedAt: evaluatedAt,
  },
  {
    id: "vital-bp-trend-3",
    patientId: "patient-demo-1",
    type: "blood_pressure",
    systolic: 154,
    diastolic: 98,
    unit: "mmHg",
    recordedAt: new Date("2026-06-29T08:00:00.000Z"),
    source: "manual",
    createdAt: evaluatedAt,
    updatedAt: evaluatedAt,
  },
];

const glucoseTrendReadings: NumericVital[] = [
  {
    id: "vital-glucose-trend-1",
    patientId: "patient-demo-1",
    type: "blood_glucose",
    value: 50,
    unit: "mg/dL",
    recordedAt: new Date("2026-06-17T08:00:00.000Z"),
    source: "device",
    createdAt: evaluatedAt,
    updatedAt: evaluatedAt,
  },
  {
    id: "vital-glucose-trend-2",
    patientId: "patient-demo-1",
    type: "blood_glucose",
    value: 184,
    unit: "mg/dL",
    recordedAt: new Date("2026-06-18T08:00:00.000Z"),
    source: "device",
    createdAt: evaluatedAt,
    updatedAt: evaluatedAt,
  },
  {
    id: "vital-glucose-trend-3",
    patientId: "patient-demo-1",
    type: "blood_glucose",
    value: 178,
    unit: "mg/dL",
    recordedAt: new Date("2026-06-19T08:00:00.000Z"),
    source: "device",
    createdAt: evaluatedAt,
    updatedAt: evaluatedAt,
  },
  {
    id: "vital-glucose-trend-4",
    patientId: "patient-demo-1",
    type: "blood_glucose",
    value: 166,
    unit: "mg/dL",
    recordedAt: new Date("2026-06-20T08:00:00.000Z"),
    source: "device",
    createdAt: evaluatedAt,
    updatedAt: evaluatedAt,
  },
  {
    id: "vital-glucose-before-meal",
    patientId: "patient-demo-1",
    type: "blood_glucose",
    value: 50,
    unit: "mg/dL",
    recordedAt: new Date("2026-06-30T05:30:00.000Z"),
    source: "manual",
    notes: "before meal",
    createdAt: evaluatedAt,
    updatedAt: evaluatedAt,
  },
  {
    id: "vital-glucose-after-meal",
    patientId: "patient-demo-1",
    type: "blood_glucose",
    value: 164,
    unit: "mg/dL",
    recordedAt: new Date("2026-06-30T07:00:00.000Z"),
    source: "manual",
    notes: "after meal",
    createdAt: evaluatedAt,
    updatedAt: evaluatedAt,
  },
];

test("blood pressure and glucose rules produce the expected severity", () => {
  const severe = evaluateBloodPressureRule(severeBloodPressure, "physician-demo-1");
  const glucose = evaluateBloodGlucoseRule(elevatedGlucose, "physician-demo-1");

  assert.equal(severe[0]?.level, "critical");
  assert.equal(glucose[0]?.level, "warning");
  assert.match(severe[0]?.ruleId ?? "", /^blood_pressure\./);
  assert.equal(glucose[0]?.metric, "blood_glucose");
});

test("trend rules compute glucose and blood pressure windows", () => {
  const bloodPressureFindings = evaluateBloodPressureTrendRules(
    bloodPressureTrendReadings,
    "physician-demo-1",
    {
      evaluatedAt,
      shortWindowDays: 7,
      longWindowDays: 30,
    }
  );
  const glucoseFindings = evaluateBloodGlucoseTrendRules(
    glucoseTrendReadings,
    "physician-demo-1",
    {
      evaluatedAt,
      windowDays: 14,
    }
  );

  assert.ok(
    bloodPressureFindings.some((finding) => finding.ruleId === "blood_pressure.trend.7d")
  );
  assert.ok(
    bloodPressureFindings.some((finding) => finding.ruleId === "blood_pressure.trend.30d")
  );
  assert.ok(
    glucoseFindings.some((finding) => finding.ruleId === "blood_glucose.time_in_range")
  );
  assert.ok(
    glucoseFindings.some((finding) => finding.ruleId === "blood_glucose.gmi")
  );
  assert.ok(
    glucoseFindings.some((finding) => finding.ruleId === "blood_glucose.meal_delta")
  );
});

test("medication adherence rules flag missing or poor adherence", () => {
  const findings = evaluateMedicationAdherenceRules({
    medications: [trackedMedication],
    observations: [adherenceObservation],
    physicianId: "physician-demo-1",
    evaluatedAt,
  });

  assert.ok(findings.length > 0);
  assert.equal(findings[0]?.patientId, trackedMedication.patientId);
  assert.equal(findings[0]?.metric, "medication_adherence");
});

test("interaction findings preserve the alert family metadata", () => {
  const interactionFinding = {
    patientId: "patient-demo-1",
    physicianId: "physician-demo-1",
    family: "interaction" as const,
    ruleId: "medication_interaction.major",
    title: "Medication interaction flag",
    message: "Potential medication interaction.",
    level: "warning" as const,
    metric: "medication_interaction",
    threshold: "No known interaction",
    actualValue: "Potential interaction detected",
    recommendation: "Review the active regimen.",
  };

  const alertInput = createClinicalAlertInput(interactionFinding);

  assert.equal(alertInput.metadata?.["alertFamily"], "interaction");
  assert.equal(getClinicalAlertFamilyLabel("interaction"), "Interaction flag");
  assert.equal(isInteractionClinicalFinding(alertInput), true);
});

test("clinical rules can be converted into alert inputs and records", () => {
  const findings = evaluateClinicalRules({
    vitals: [severeBloodPressure, elevatedGlucose],
    medications: [trackedMedication],
    adherenceObservations: [adherenceObservation],
    physicianId: "physician-demo-1",
    evaluatedAt,
  });

  const alertInputs = buildClinicalAlertInputs(findings);
  const alertRecords = buildClinicalAlertRecords(findings, evaluatedAt);

  assert.equal(alertInputs.length, findings.length);
  assert.equal(alertRecords.length, findings.length);
  assert.equal(alertInputs[0]?.status, "open");
  assert.equal(alertRecords[0]?.source, "rules_engine");
});
