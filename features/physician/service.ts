/**
 * =============================================================================
 * ChroniSync
 * Physician Feature Service
 * =============================================================================
 */

import { COLLECTIONS } from "@/config/firebase";
import { type DashboardMetric, type DashboardTrendSeries } from "@/features/dashboard/service";
import { listAlertsByPhysician } from "@/features/alerts/service";
import { getInitials } from "@/lib/utils";
import { logger } from "@/lib/logger";
import { queryDocuments, whereEquals } from "@/lib/firebase/firestore";
import type { Alert } from "@/types/alert";
import type { Document as ClinicalDocument } from "@/types/document";
import type {
  Patient,
  PatientSummary,
} from "@/types/patient";
import type { Summary } from "@/types/summary";
import type {
  BloodPressureVital,
  NumericVital,
  Vital,
} from "@/types/vital";

import {
  listActiveMedicationsByPatient,
  type MedicationRecord,
} from "@/services/medication.service";
import { listDocumentsByPatient } from "@/services/document.service";
import { listSummariesByPatient } from "@/services/summary.service";
import { listVitalsByPatient } from "@/services/vital.service";
import { listOpenAlertsByPatient } from "@/services/alert.service";

export interface PhysicianPatientCard {
  patient: Patient;
  summary: PatientSummary;
}

export interface PhysicianWorkspaceSnapshot {
  physicianId?: string;
  generatedAt: Date;
  metrics: DashboardMetric[];
  trends: DashboardTrendSeries[];
  patientCards: PhysicianPatientCard[];
  alerts: Alert[];
  documents: ClinicalDocument[];
  summaries: Summary[];
}

const DEMO_PHYSICIAN_ID = "demo-physician";

function createTimestamp(daysAgo = 0): Date {
  return new Date(Date.now() - daysAgo * 24 * 60 * 60 * 1000);
}

function createDemoPatients(
  physicianId: string
): Patient[] {
  return [
    {
      id: "patient-anna-cruz",
      email: "anna.cruz@example.com",
      fullName: "Anna Cruz",
      role: "patient",
      status: "active",
      emailVerified: true,
      dateOfBirth: new Date("1982-04-18"),
      biologicalSex: "female",
      bloodType: "O+",
      chronicConditions: [
        { id: "condition-diabetes", name: "Type 2 Diabetes" },
        { id: "condition-hypertension", name: "Hypertension" },
      ],
      emergencyContact: {
        fullName: "Marco Cruz",
        relationship: "Spouse",
        phoneNumber: "+63 917 555 0101",
      },
      physicianId,
      phoneNumber: "+63 917 555 0100",
      timezone: "Asia/Manila",
      language: "en",
      createdAt: createTimestamp(90),
      updatedAt: createTimestamp(1),
    },
    {
      id: "patient-jon-reyes",
      email: "jon.reyes@example.com",
      fullName: "Jon Reyes",
      role: "patient",
      status: "active",
      emailVerified: true,
      dateOfBirth: new Date("1976-09-02"),
      biologicalSex: "male",
      bloodType: "A+",
      chronicConditions: [
        { id: "condition-hypertension", name: "Hypertension" },
      ],
      emergencyContact: {
        fullName: "Lia Reyes",
        relationship: "Daughter",
        phoneNumber: "+63 920 555 0144",
      },
      physicianId,
      phoneNumber: "+63 917 555 0111",
      timezone: "Asia/Manila",
      language: "en",
      createdAt: createTimestamp(75),
      updatedAt: createTimestamp(2),
    },
  ];
}

function createDemoAlerts(
  physicianId: string
): Alert[] {
  return [
    {
      id: "alert-bp-1",
      patientId: "patient-anna-cruz",
      physicianId,
      title: "High Blood Pressure Alert",
      message: "Blood pressure exceeded the configured threshold.",
      level: "warning",
      status: "open",
      source: "rules_engine",
      ruleId: "blood_pressure.high",
      metric: "blood_pressure",
      threshold: "140/90 mmHg",
      actualValue: "156/98 mmHg",
      notes: "Review recent blood pressure trend and follow up.",
      createdAt: createTimestamp(1),
      updatedAt: createTimestamp(1),
    },
    {
      id: "alert-glucose-1",
      patientId: "patient-anna-cruz",
      physicianId,
      title: "High Blood Glucose Alert",
      message: "Blood glucose is above the fasting threshold.",
      level: "warning",
      status: "acknowledged",
      source: "rules_engine",
      ruleId: "blood_glucose.high",
      metric: "blood_glucose",
      threshold: ">= 126 mg/dL",
      actualValue: "152 mg/dL",
      notes: "Patient reported late-night meals before reading.",
      acknowledgedBy: "physician-1",
      acknowledgedAt: createTimestamp(1),
      createdAt: createTimestamp(2),
      updatedAt: createTimestamp(1),
    },
    {
      id: "alert-adherence-1",
      patientId: "patient-jon-reyes",
      physicianId,
      title: "Medication Adherence Alert",
      message: "Three medication doses were missed this week.",
      level: "critical",
      status: "open",
      source: "rules_engine",
      ruleId: "medication_adherence.critical",
      metric: "medication_adherence",
      threshold: ">= 75% adherence",
      actualValue: "62.5% adherence",
      notes: "Patient should be contacted to review missed doses.",
      createdAt: createTimestamp(0),
      updatedAt: createTimestamp(0),
    },
  ];
}

function createDemoSummaries(
  physicianId: string
): Summary[] {
  return [
    {
      id: "summary-visit-1",
      patientId: "patient-anna-cruz",
      physicianId,
      encounterId: "encounter-2026-06-30",
      title: "Visit Summary - Anna Cruz",
      type: "visit",
      source: "ai",
      status: "draft",
      content:
        "Patient reports recent headaches and occasional dizziness. Blood pressure remains elevated. Reviewed adherence, diet, and home monitoring.",
      highlights: [
        "Elevated blood pressure trend",
        "Home monitoring reinforced",
      ],
      recommendations: [
        "Review readings at next follow-up",
        "Confirm medication adherence",
      ],
      generatedBy: "chronisync-ai",
      model: "gemini-2.5-flash",
      metadata: {
        confidence: 0.84,
      },
      createdAt: createTimestamp(1),
      updatedAt: createTimestamp(1),
    },
    {
      id: "summary-visit-2",
      patientId: "patient-jon-reyes",
      physicianId,
      encounterId: "encounter-2026-06-28",
      title: "Visit Summary - Jon Reyes",
      type: "visit",
      source: "manual",
      status: "pending_review",
      content:
        "Follow-up visit focused on medication timing and support at home. No new symptoms reported today.",
      highlights: ["Medication timing reviewed", "Family support discussed"],
      recommendations: ["Confirm refill schedule", "Recheck vitals in one week"],
      generatedBy: "physician-1",
      metadata: {
        confidence: 0.67,
      },
      createdAt: createTimestamp(3),
      updatedAt: createTimestamp(2),
    },
  ];
}

function createDemoDocuments(
  physicianId: string
): ClinicalDocument[] {
  return [
    {
      id: "document-lab-1",
      patientId: "patient-anna-cruz",
      title: "June Lab Results",
      fileName: "anna-labs-june.pdf",
      filePath: "patients/patient-anna-cruz/documents/anna-labs-june.pdf",
      contentType: "application/pdf",
      sizeBytes: 1_024_000,
      category: "lab_result",
      status: "review_required",
      source: "patient_upload",
      downloadUrl: "https://example.com/anna-labs-june.pdf",
      extractedText: "HbA1c 7.8%, fasting glucose 152 mg/dL.",
      summary: "Lab report shows elevated glucose control markers.",
      uploadedBy: "patient-anna-cruz",
      createdAt: createTimestamp(1),
      updatedAt: createTimestamp(1),
    },
    {
      id: "document-referral-1",
      patientId: "patient-jon-reyes",
      title: "Referral Note",
      fileName: "jon-referral.pdf",
      filePath: "patients/patient-jon-reyes/documents/jon-referral.pdf",
      contentType: "application/pdf",
      sizeBytes: 860_000,
      category: "referral",
      status: "approved",
      source: "physician_upload",
      downloadUrl: "https://example.com/jon-referral.pdf",
      extractedText: "Follow-up referral to endocrinology.",
      summary: "Referral note for specialist follow-up.",
      uploadedBy: physicianId,
      reviewedBy: physicianId,
      reviewedAt: createTimestamp(2),
      createdAt: createTimestamp(3),
      updatedAt: createTimestamp(2),
    },
  ];
}

function createDemoWorkspaceSnapshot(
  physicianId: string = DEMO_PHYSICIAN_ID
): PhysicianWorkspaceSnapshot {
  const patients = createDemoPatients(physicianId);
  const alerts = createDemoAlerts(physicianId);
  const summaries = createDemoSummaries(physicianId);
  const documents = createDemoDocuments(physicianId);
  const patientCards = patients.map((patient, index) => ({
    patient,
    summary: {
      patientId: patient.id,
      latestBloodPressure:
        index === 0 ? "156/98" : "132/84",
      latestHeartRate: index === 0 ? 96 : 82,
      latestBloodGlucose: index === 0 ? 152 : 118,
      latestWeightKg: index === 0 ? 76.4 : 68.2,
      activeMedicationCount: index === 0 ? 3 : 2,
      activeAlertCount: alerts.filter(
        (alert) => alert.patientId === patient.id && alert.status === "open"
      ).length,
      lastUpdated: patient.updatedAt,
    },
  }));

  return {
    physicianId,
    generatedAt: new Date(),
    metrics: buildPhysicianMetrics({
      patients,
      alerts,
      documents,
      summaries,
    }),
    trends: [
      {
        title: "Blood pressure",
        description: "Recent home and clinic readings",
        color: "#0b6574",
        points: [
          { label: "Mon", value: 148 },
          { label: "Tue", value: 142 },
          { label: "Wed", value: 138 },
          { label: "Thu", value: 140 },
          { label: "Fri", value: 136 },
          { label: "Sat", value: 134 },
          { label: "Sun", value: 132 },
        ],
      },
      {
        title: "Glucose",
        description: "Fasting trend snapshot",
        color: "#19a39a",
        points: [
          { label: "Mon", value: 158 },
          { label: "Tue", value: 150 },
          { label: "Wed", value: 144 },
          { label: "Thu", value: 139 },
          { label: "Fri", value: 136 },
          { label: "Sat", value: 132 },
          { label: "Sun", value: 128 },
        ],
      },
    ],
    patientCards,
    alerts,
    documents,
    summaries,
  };
}

function buildPhysicianMetrics({
  patients,
  alerts,
  documents,
  summaries,
}: {
  patients: Patient[];
  alerts: Alert[];
  documents: ClinicalDocument[];
  summaries: Summary[];
}): DashboardMetric[] {
  const openAlerts = alerts.filter(
    (alert) => alert.status === "open" || alert.status === "acknowledged"
  );
  const pendingDocuments = documents.filter((document) =>
    ["pending", "processing", "review_required"].includes(document.status)
  );
  const draftSummaries = summaries.filter((summary) =>
    ["draft", "pending_review"].includes(summary.status)
  );

  return [
    {
      label: "Assigned patients",
      value: String(patients.length),
      detail: "Patients linked to this physician",
      change: `${patients.length} active panel`,
      direction: "up",
    },
    {
      label: "Open alerts",
      value: String(openAlerts.length),
      detail: "Needs physician review",
      change: openAlerts.length > 0 ? "Review queue active" : "Quiet panel",
      direction: openAlerts.length > 0 ? "up" : "steady",
    },
    {
      label: "Pending documents",
      value: String(pendingDocuments.length),
      detail: "Awaiting verification",
      change:
        pendingDocuments.length > 0
          ? "Documents need attention"
          : "No pending uploads",
      direction: pendingDocuments.length > 0 ? "up" : "steady",
    },
    {
      label: "Draft summaries",
      value: String(draftSummaries.length),
      detail: "AI or manual drafts ready for review",
      change:
        draftSummaries.length > 0
          ? "Review before publish"
          : "No pending drafts",
      direction: draftSummaries.length > 0 ? "up" : "steady",
    },
  ];
}

async function buildPatientCard(
  patient: Patient,
  physicianId?: string
): Promise<PhysicianPatientCard> {
  const [alerts, medications, vitals] = await Promise.all([
    listOpenAlertsByPatient(patient.id).catch(() => [] as Alert[]),
    listActiveMedicationsByPatient(patient.id).catch(
      () => [] as MedicationRecord[]
    ),
    listVitalsByPatient(patient.id).catch(() => [] as Vital[]),
  ]);

  const latestBloodPressure = vitals
    .filter((vital): vital is BloodPressureVital => vital.type === "blood_pressure")
    .sort((left, right) => right.recordedAt.getTime() - left.recordedAt.getTime())[0];

  const latestHeartRate = vitals
    .filter((vital): vital is NumericVital => vital.type === "heart_rate")
    .sort((left, right) => right.recordedAt.getTime() - left.recordedAt.getTime())[0];

  const latestBloodGlucose = vitals
    .filter((vital): vital is NumericVital => vital.type === "blood_glucose")
    .sort((left, right) => right.recordedAt.getTime() - left.recordedAt.getTime())[0];

  const latestWeight = vitals
    .filter((vital): vital is NumericVital => vital.type === "weight")
    .sort((left, right) => right.recordedAt.getTime() - left.recordedAt.getTime())[0];

  const lastUpdatedCandidates = [
    patient.updatedAt,
    ...alerts.map((alert) => alert.updatedAt),
    ...vitals.map((vital) => vital.updatedAt),
  ];

  const lastUpdated = lastUpdatedCandidates.reduce((latest, current) =>
    current.getTime() > latest.getTime() ? current : latest
  );

  const summary: PatientSummary = {
    patientId: patient.id,
    activeMedicationCount: medications.length,
    activeAlertCount: alerts.length,
    lastUpdated,
    ...(latestBloodPressure
      ? {
          latestBloodPressure: `${latestBloodPressure.systolic}/${latestBloodPressure.diastolic}`,
        }
      : {}),
    ...(latestHeartRate ? { latestHeartRate: latestHeartRate.value } : {}),
    ...(latestBloodGlucose
      ? { latestBloodGlucose: latestBloodGlucose.value }
      : {}),
    ...(latestWeight ? { latestWeightKg: latestWeight.value } : {}),
  };

  return {
    patient: {
      ...patient,
      ...(physicianId ? { physicianId } : {}),
    },
    summary,
  };
}

async function buildLiveWorkspaceSnapshot(
  physicianId: string
): Promise<PhysicianWorkspaceSnapshot | null> {
  const patients = await queryDocuments<Patient>(
    COLLECTIONS.PATIENTS,
    whereEquals("physicianId", physicianId)
  );

  if (patients.length === 0) {
    return null;
  }

  const patientCards = await Promise.all(
    patients.map((patient) => buildPatientCard(patient, physicianId))
  );

  const [alerts, summaries, documents] = await Promise.all([
    listAlertsByPhysician(physicianId).catch(() => [] as Alert[]),
    listSummariesByPhysician(physicianId).catch(() => [] as Summary[]),
    listDocumentsForPhysicianPatients(patientCards.map((item) => item.patient.id)),
  ]);

  const metrics = buildPhysicianMetrics({
    patients,
    alerts,
    documents,
    summaries,
  });

  return {
    physicianId,
    generatedAt: new Date(),
    metrics,
    trends: createDemoWorkspaceSnapshot(physicianId).trends,
    patientCards,
    alerts,
    documents,
    summaries,
  };
}

async function listSummariesByPhysician(
  physicianId: string
): Promise<Summary[]> {
  const summaries = await listSummariesByPatientIds(
    await listPatientIdsByPhysician(physicianId)
  );

  if (summaries.length > 0) {
    return summaries;
  }

  return queryDocuments<Summary>(
    COLLECTIONS.SUMMARIES,
    whereEquals("physicianId", physicianId)
  );
}

async function listPatientIdsByPhysician(
  physicianId: string
): Promise<string[]> {
  const patients = await queryDocuments<Patient>(
    COLLECTIONS.PATIENTS,
    whereEquals("physicianId", physicianId)
  );

  return patients.map((patient) => patient.id);
}

async function listSummariesByPatientIds(
  patientIds: string[]
): Promise<Summary[]> {
  const summaryLists = await Promise.all(
    patientIds.map((patientId) => listSummariesByPatient(patientId))
  );

  return summaryLists.flat();
}

async function listDocumentsForPhysicianPatients(
  patientIds: string[]
): Promise<ClinicalDocument[]> {
  const documentsByPatient = await Promise.all(
    patientIds.map((patientId) =>
      listDocumentsByPatient(patientId).catch(
        () => [] as ClinicalDocument[]
      )
    )
  );

  return documentsByPatient.flat();
}

export async function getPhysicianWorkspaceSnapshot(
  physicianId?: string
): Promise<PhysicianWorkspaceSnapshot> {
  const normalizedPhysicianId = physicianId?.trim() || DEMO_PHYSICIAN_ID;

  try {
    if (physicianId) {
      const liveSnapshot = await buildLiveWorkspaceSnapshot(normalizedPhysicianId);

      if (liveSnapshot) {
        return liveSnapshot;
      }
    }
  } catch (error) {
    logger.warn("Falling back to the demo physician workspace.", {
      physicianId: normalizedPhysicianId,
      error: error instanceof Error ? error.message : String(error),
    });
  }

  return createDemoWorkspaceSnapshot(normalizedPhysicianId);
}

export function buildPhysicianDemoWorkspaceSnapshot(
  physicianId?: string
): PhysicianWorkspaceSnapshot {
  return createDemoWorkspaceSnapshot(physicianId?.trim() || DEMO_PHYSICIAN_ID);
}

export async function listPhysicianPatientCards(
  physicianId?: string
): Promise<PhysicianPatientCard[]> {
  const snapshot = await getPhysicianWorkspaceSnapshot(physicianId);
  return snapshot.patientCards;
}

export async function listPhysicianAlertsForWorkspace(
  physicianId?: string
): Promise<Alert[]> {
  const snapshot = await getPhysicianWorkspaceSnapshot(physicianId);
  return snapshot.alerts;
}

export async function listPhysicianDocumentsForWorkspace(
  physicianId?: string
): Promise<ClinicalDocument[]> {
  const snapshot = await getPhysicianWorkspaceSnapshot(physicianId);
  return snapshot.documents;
}

export async function listPhysicianSummariesForWorkspace(
  physicianId?: string
): Promise<Summary[]> {
  const snapshot = await getPhysicianWorkspaceSnapshot(physicianId);
  return snapshot.summaries;
}

export function describePhysicianPanel(
  physicianId?: string
): string {
  return physicianId ? `Physician ${getInitials(physicianId)}` : "Demo physician";
}
