import assert from "node:assert/strict";
import test from "node:test";

import {
  buildClinicalAlertInputs,
  buildClinicalAlertRecords,
  evaluateClinicalRules,
} from "@/lib/rules/engine";
import { evaluateBloodPressureRule } from "@/lib/rules/bloodPressure";
import { evaluateBloodGlucoseRule } from "@/lib/rules/glucose";
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

test("blood pressure and glucose rules produce the expected severity", () => {
  const severe = evaluateBloodPressureRule(severeBloodPressure, "physician-demo-1");
  const glucose = evaluateBloodGlucoseRule(elevatedGlucose, "physician-demo-1");

  assert.equal(severe[0]?.level, "critical");
  assert.equal(glucose[0]?.level, "warning");
  assert.match(severe[0]?.ruleId ?? "", /^blood_pressure\./);
  assert.equal(glucose[0]?.metric, "blood_glucose");
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
