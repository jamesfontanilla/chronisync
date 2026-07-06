import assert from "node:assert/strict";
import test from "node:test";

import { medicationFormSchema } from "@/features/medications/validation";

const firebaseTestEnv = {
  NEXT_PUBLIC_FIREBASE_API_KEY: "unit-test-api-key",
  NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN: "unit-test.example.com",
  NEXT_PUBLIC_FIREBASE_PROJECT_ID: "unit-test-project",
  NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET: "unit-test-bucket",
  NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID: "1234567890",
  NEXT_PUBLIC_FIREBASE_APP_ID: "1:1234567890:web:unit-test",
} as const;

for (const [key, value] of Object.entries(firebaseTestEnv)) {
  process.env[key] ??= value;
}

const medicationModulesPromise = Promise.all([
  import("@/features/medications/service"),
  import("@/services/medication.service"),
]);

test("medication form values convert into a firestore-ready record", async () => {
  const [{ buildMedicationCreateInput }, { buildMedicationRecord }] =
    await medicationModulesPromise;

  const formValues = medicationFormSchema.parse({
    patientId: "patient-demo-1",
    recordedByRole: "caregiver",
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
  assert.equal(input.recordedByRole, "caregiver");
  assert.equal(input.route, "oral");
  assert.equal(input.customFrequency, "with meals");
  assert.ok(input.startDate instanceof Date);
  assert.ok(input.endDate instanceof Date);
  assert.ok(
    record.id.startsWith("med_") ||
      /^[0-9a-f-]{36}$/i.test(record.id),
    "Expected a generated record ID"
  );
  assert.equal(record.status, "active");
  assert.equal(record.recordedByRole, "caregiver");
  assert.equal(record.createdAt instanceof Date, true);
  assert.equal(record.updatedAt instanceof Date, true);
});
