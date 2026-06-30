import assert from "node:assert/strict";
import test from "node:test";

import { buildAlertRecord } from "@/services/alert.service";
import {
  buildDocumentPath,
  buildDocumentRecord,
} from "@/services/document.service";
import { buildSummaryRecord } from "@/services/summary.service";
import { buildNotificationRecord } from "@/features/notifications/service";
import { generateMockData } from "@/scripts/generateMockData";

test("mock data keeps collection references aligned", () => {
  const snapshot = generateMockData();
  const patientIds = new Set(snapshot.patients.map((patient) => patient.id));
  const physicianIds = new Set(snapshot.physicians.map((physician) => physician.id));

  assert.equal(snapshot.users.length, 4);
  assert.ok(snapshot.medications.every((medication) => patientIds.has(medication.patientId)));
  assert.ok(snapshot.allergies.every((allergy) => patientIds.has(allergy.patientId)));
  assert.ok(snapshot.vitals.every((vital) => patientIds.has(vital.patientId)));
  assert.ok(snapshot.symptoms.every((symptom) => patientIds.has(symptom.patientId)));
  assert.ok(snapshot.diseases.every((disease) => patientIds.has(disease.patientId)));
  assert.ok(snapshot.alerts.every((alert) => patientIds.has(alert.patientId)));
  assert.ok(snapshot.documents.every((document) => patientIds.has(document.patientId)));
  assert.ok(snapshot.summaries.every((summary) => patientIds.has(summary.patientId)));
  assert.ok(snapshot.patients.every((patient) => physicianIds.has(patient.physicianId ?? "")));
});

test("firestore-ready record builders emit stable document shapes", () => {
  const patientId = "patient-demo-1";
  const documentPath = buildDocumentPath(patientId, "lab-results.pdf");

  const alertRecord = buildAlertRecord({
    patientId,
    physicianId: "physician-demo-1",
    title: "High Blood Pressure Alert",
    message: "Blood pressure exceeded the threshold.",
    level: "warning",
    status: "open",
    source: "rules_engine",
    ruleId: "blood_pressure.high",
    metric: "blood_pressure",
    threshold: "140/90 mmHg",
    actualValue: "156/98 mmHg",
    notes: "Review the blood pressure trend.",
  });

  const documentRecord = buildDocumentRecord({
    patientId,
    title: "Lab Results",
    fileName: "lab-results.pdf",
    filePath: documentPath,
    contentType: "application/pdf",
    sizeBytes: 1_024_000,
    category: "lab_result",
    status: "review_required",
    source: "patient_upload",
  });

  const summaryRecord = buildSummaryRecord({
    patientId,
    physicianId: "physician-demo-1",
    title: "Visit Summary",
    type: "visit",
    source: "ai",
    status: "draft",
    content: "Patient reviewed blood pressure, glucose, and medication adherence.",
    highlights: ["Blood pressure remains elevated"],
    recommendations: ["Review readings at follow-up"],
  });

  const notificationRecord = buildNotificationRecord({
    recipientId: patientId,
    title: "New summary ready",
    message: "Your physician published a new visit summary.",
    type: "info",
  });

  assert.equal(documentPath, "patients/patient-demo-1/documents/lab-results.pdf");
  assert.match(alertRecord.id, /^alt_/);
  assert.match(documentRecord.id, /^doc_/);
  assert.match(summaryRecord.id, /^sum_/);
  assert.match(notificationRecord.id, /^not_/);
  assert.equal(notificationRecord.status, "unread");
  assert.ok(alertRecord.createdAt instanceof Date);
  assert.ok(documentRecord.createdAt instanceof Date);
  assert.ok(summaryRecord.createdAt instanceof Date);
});
