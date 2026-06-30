import assert from "node:assert/strict";
import test from "node:test";

import { buildMedicationCreateInput } from "@/features/medications/service";
import { medicationFormSchema } from "@/features/medications/validation";
import { buildMedicationRecord } from "@/services/medication.service";

test("medication form values convert into a firestore-ready record", () => {
  const formValues = medicationFormSchema.parse({
    patientId: "patient-demo-1",
    name: "Metformin",
    dosage: "500 mg",
    route: "oral",
    frequency: "custom",
    customFrequency: "with meals",
    status: "active",
    startDate: "2026-07-01",
    endDate: "2026-07-31",
    instructions: "Take with meals.",
    notes: "Track fasting glucose.",
  });

  const input = buildMedicationCreateInput(formValues);
  const record = buildMedicationRecord(input);

  assert.equal(input.patientId, "patient-demo-1");
  assert.equal(input.route, "oral");
  assert.equal(input.customFrequency, "with meals");
  assert.ok(input.startDate instanceof Date);
  assert.ok(input.endDate instanceof Date);
  assert.match(record.id, /^med_/);
  assert.equal(record.status, "active");
  assert.equal(record.createdAt instanceof Date, true);
  assert.equal(record.updatedAt instanceof Date, true);
});
