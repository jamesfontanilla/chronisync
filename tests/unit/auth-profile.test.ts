import assert from "node:assert/strict";
import test from "node:test";

import { buildRoleProfileData } from "../../lib/firebase/auth-profile";

test("buildRoleProfileData creates a patient profile payload for patient signups", () => {
  const payload = buildRoleProfileData(
    {
      uid: "user-123",
      email: "jane@example.com",
      displayName: "Jane Doe",
      photoURL: null,
      emailVerified: true,
    },
    {
      fullName: "Jane Doe",
      email: "jane@example.com",
      password: "Secret123",
      confirmPassword: "Secret123",
      role: "patient",
    }
  );

  assert.equal(payload.collectionName, "patients");
  assert.equal(payload.data.id, "user-123");
  assert.equal(payload.data.email, "jane@example.com");
  assert.equal(payload.data.fullName, "Jane Doe");
  assert.equal(payload.data.role, "patient");
  assert.equal(payload.data.status, "active");
  assert.equal(payload.data["biologicalSex"], "female");
  assert.deepEqual(payload.data["chronicConditions"], []);
  assert.deepEqual(payload.data["emergencyContact"], {
    fullName: "",
    relationship: "",
    phoneNumber: "",
  });
  assert.equal(payload.data["heightCm"], 160);
  assert.equal(payload.data["weightKg"], 64);
  assert.equal(payload.data["preferredInteropStandard"], "fhir");

  const interop = payload.data["interop"] as
    | Record<string, unknown>
    | undefined;
  assert.equal(interop?.["primaryStandard"], "fhir");
});
