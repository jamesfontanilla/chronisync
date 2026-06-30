import { pathToFileURL } from "node:url";

import type { Alert } from "../types/alert";
import type { Allergy } from "../types/allergy";
import type { Document as ClinicalDocument } from "../types/document";
import type { Disease } from "../types/disease";
import type { Medication } from "../types/medication";
import type { Patient } from "../types/patient";
import type { Physician } from "../types/physician";
import type { Summary } from "../types/summary";
import type { Symptom } from "../types/symptom";
import type { Vital } from "../types/vital";
import type { User } from "../types/user";

export interface MockDataSnapshot {
  generatedAt: Date;
  users: User[];
  physicians: Physician[];
  patients: Patient[];
  medications: Medication[];
  allergies: Allergy[];
  vitals: Vital[];
  symptoms: Symptom[];
  diseases: Disease[];
  alerts: Alert[];
  documents: ClinicalDocument[];
  summaries: Summary[];
}

function createTimestamp(daysAgo = 0, hoursAgo = 0): Date {
  const offsetMs = (daysAgo * 24 + hoursAgo) * 60 * 60 * 1000;
  return new Date(Date.now() - offsetMs);
}

export function generateMockData(): MockDataSnapshot {
  const generatedAt = new Date();
  const physician: Physician = {
    id: "physician-demo-1",
    email: "doctor@example.com",
    fullName: "Dr. Sofia Reyes",
    role: "physician",
    status: "active",
    emailVerified: true,
    phoneNumber: "+63 917 000 1001",
    timezone: "Asia/Manila",
    language: "en",
    createdAt: createTimestamp(90),
    updatedAt: createTimestamp(1),
    lastLoginAt: createTimestamp(),
    licenseNumber: "PRC-2026-1001",
    specialty: "Family Medicine",
    organization: "ChroniSync Community Clinic",
    department: "Primary Care",
    yearsOfExperience: 11,
    biography:
      "Provides long-term chronic disease care with a focus on patient education and follow-up.",
    availability: "available",
    activePatientCount: 2,
  };

  const patientOne: Patient = {
    id: "patient-demo-1",
    email: "patient1@example.com",
    fullName: "Juan Dela Cruz",
    role: "patient",
    status: "active",
    emailVerified: true,
    phoneNumber: "+63 912 345 6789",
    timezone: "Asia/Manila",
    language: "en",
    createdAt: createTimestamp(60),
    updatedAt: createTimestamp(1),
    lastLoginAt: createTimestamp(),
    dateOfBirth: new Date("1985-04-12T00:00:00.000Z"),
    biologicalSex: "male",
    bloodType: "O+",
    heightCm: 172,
    weightKg: 78,
    chronicConditions: [
      {
        id: "condition-diabetes",
        name: "Type 2 Diabetes",
        diagnosedAt: new Date("2021-08-20T00:00:00.000Z"),
        notes: "Managed with lifestyle changes and medication support.",
      },
    ],
    emergencyContact: {
      fullName: "Maria Dela Cruz",
      relationship: "Spouse",
      phoneNumber: "+63 917 111 2233",
    },
    physicianId: physician.id,
  };

  const patientTwo: Patient = {
    id: "patient-demo-2",
    email: "patient2@example.com",
    fullName: "Ana Santos",
    role: "patient",
    status: "active",
    emailVerified: true,
    phoneNumber: "+63 918 222 3344",
    timezone: "Asia/Manila",
    language: "en",
    createdAt: createTimestamp(45),
    updatedAt: createTimestamp(2),
    lastLoginAt: createTimestamp(0, 4),
    dateOfBirth: new Date("1990-11-03T00:00:00.000Z"),
    biologicalSex: "female",
    bloodType: "A+",
    heightCm: 160,
    weightKg: 64,
    chronicConditions: [
      {
        id: "condition-hypertension",
        name: "Hypertension",
        diagnosedAt: new Date("2022-02-14T00:00:00.000Z"),
        notes: "Monitoring blood pressure at home twice daily.",
      },
    ],
    emergencyContact: {
      fullName: "Ramon Santos",
      relationship: "Brother",
      phoneNumber: "+63 917 555 8899",
    },
    physicianId: physician.id,
  };

  const admin: User = {
    id: "admin-demo-1",
    email: "admin@chronisync.app",
    fullName: "ChroniSync Admin",
    role: "admin",
    status: "active",
    emailVerified: true,
    phoneNumber: "+63 917 900 1000",
    timezone: "Asia/Manila",
    language: "en",
    createdAt: createTimestamp(120),
    updatedAt: createTimestamp(1),
    lastLoginAt: createTimestamp(0, 2),
  };

  const medications: Medication[] = [
    {
      id: "medication-metformin",
      patientId: patientOne.id,
      prescribedBy: physician.id,
      name: "Metformin",
      genericName: "metformin hydrochloride",
      dosage: "500 mg",
      strength: "500 mg tablet",
      route: "oral",
      frequency: "twice_daily",
      instructions: "Take with meals to reduce stomach upset.",
      startDate: createTimestamp(30),
      status: "active",
      refillRemaining: 2,
      notes: "Monitor fasting glucose trends.",
      createdAt: createTimestamp(30),
      updatedAt: createTimestamp(1),
    },
    {
      id: "medication-amlodipine",
      patientId: patientTwo.id,
      prescribedBy: physician.id,
      name: "Amlodipine",
      dosage: "5 mg",
      route: "oral",
      frequency: "once_daily",
      instructions: "Take in the morning.",
      startDate: createTimestamp(20),
      status: "active",
      refillRemaining: 1,
      notes: "Track blood pressure response.",
      createdAt: createTimestamp(20),
      updatedAt: createTimestamp(1),
    },
  ];

  const allergies: Allergy[] = [
    {
      id: "allergy-penicillin",
      patientId: patientOne.id,
      allergen: "Penicillin",
      type: "drug",
      reaction: "Rash and itching",
      severity: "moderate",
      firstObservedAt: new Date("2019-06-01T00:00:00.000Z"),
      lastReactionAt: new Date("2024-09-12T00:00:00.000Z"),
      status: "active",
      recordedBy: physician.id,
      notes: "Avoid beta-lactam antibiotics when possible.",
      createdAt: createTimestamp(400),
      updatedAt: createTimestamp(10),
    },
  ];

  const vitals: Vital[] = [
    {
      id: "vital-bp-1",
      patientId: patientOne.id,
      type: "blood_pressure",
      systolic: 156,
      diastolic: 98,
      unit: "mmHg",
      recordedAt: createTimestamp(1, 2),
      source: "device",
      notes: "Morning reading after breakfast.",
      createdAt: createTimestamp(1, 2),
      updatedAt: createTimestamp(1, 2),
    },
    {
      id: "vital-glucose-1",
      patientId: patientOne.id,
      type: "blood_glucose",
      value: 152,
      unit: "mg/dL",
      recordedAt: createTimestamp(1, 1),
      source: "device",
      notes: "Fasting reading.",
      createdAt: createTimestamp(1, 1),
      updatedAt: createTimestamp(1, 1),
    },
    {
      id: "vital-hr-1",
      patientId: patientTwo.id,
      type: "heart_rate",
      value: 82,
      unit: "bpm",
      recordedAt: createTimestamp(0, 6),
      source: "manual",
      notes: "Resting check during follow-up.",
      createdAt: createTimestamp(0, 6),
      updatedAt: createTimestamp(0, 6),
    },
  ];

  const symptoms: Symptom[] = [
    {
      id: "symptom-headache",
      patientId: patientOne.id,
      name: "Headache",
      description: "Intermittent dull ache in the afternoon.",
      severity: "moderate",
      frequency: "daily",
      onsetAt: new Date("2026-06-18T00:00:00.000Z"),
      status: "worsening",
      triggers: ["stress", "dehydration"],
      recordedBy: physician.id,
      notes: "Reinforce hydration and follow-up monitoring.",
      createdAt: createTimestamp(12),
      updatedAt: createTimestamp(1),
    },
    {
      id: "symptom-fatigue",
      patientId: patientTwo.id,
      name: "Fatigue",
      description: "Low energy toward the end of the day.",
      severity: "mild",
      frequency: "intermittent",
      onsetAt: new Date("2026-06-20T00:00:00.000Z"),
      status: "improving",
      triggers: ["poor sleep"],
      recordedBy: physician.id,
      notes: "Sleep schedule discussed during review.",
      createdAt: createTimestamp(10),
      updatedAt: createTimestamp(2),
    },
  ];

  const diseases: Disease[] = [
    {
      id: "disease-diabetes",
      patientId: patientOne.id,
      name: "Type 2 Diabetes",
      icd10Code: "E11.9",
      diagnosedAt: new Date("2021-08-20T00:00:00.000Z"),
      severity: "moderate",
      status: "active",
      managedByPhysicianId: physician.id,
      isChronic: true,
      notes: "Track glucose trends and medication adherence.",
      createdAt: createTimestamp(400),
      updatedAt: createTimestamp(1),
    },
    {
      id: "disease-hypertension",
      patientId: patientTwo.id,
      name: "Hypertension",
      icd10Code: "I10",
      diagnosedAt: new Date("2022-02-14T00:00:00.000Z"),
      severity: "mild",
      status: "active",
      managedByPhysicianId: physician.id,
      isChronic: true,
      notes: "Home blood pressure monitoring encouraged.",
      createdAt: createTimestamp(300),
      updatedAt: createTimestamp(2),
    },
  ];

  const alerts: Alert[] = [
    {
      id: "alert-bp-1",
      patientId: patientOne.id,
      physicianId: physician.id,
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
      patientId: patientOne.id,
      physicianId: physician.id,
      title: "High Blood Glucose Alert",
      message: "Blood glucose is above the fasting threshold.",
      level: "warning",
      status: "acknowledged",
      source: "rules_engine",
      ruleId: "blood_glucose.high",
      metric: "blood_glucose",
      threshold: ">= 126 mg/dL",
      actualValue: "152 mg/dL",
      notes: "Patient reported a late meal before the reading.",
      acknowledgedBy: physician.id,
      acknowledgedAt: createTimestamp(1),
      createdAt: createTimestamp(2),
      updatedAt: createTimestamp(1),
    },
    {
      id: "alert-adherence-1",
      patientId: patientTwo.id,
      physicianId: physician.id,
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
      createdAt: createTimestamp(0, 12),
      updatedAt: createTimestamp(0, 12),
    },
  ];

  const documents: ClinicalDocument[] = [
    {
      id: "document-lab-1",
      patientId: patientOne.id,
      title: "June Lab Results",
      fileName: "juan-labs-june.pdf",
      filePath: "patients/patient-demo-1/documents/juan-labs-june.pdf",
      contentType: "application/pdf",
      sizeBytes: 1_024_000,
      category: "lab_result",
      status: "review_required",
      source: "patient_upload",
      downloadUrl: "https://example.com/juan-labs-june.pdf",
      extractedText: "HbA1c 7.8%, fasting glucose 152 mg/dL.",
      summary: "Lab report shows elevated glucose control markers.",
      uploadedBy: patientOne.id,
      createdAt: createTimestamp(1),
      updatedAt: createTimestamp(1),
    },
    {
      id: "document-referral-1",
      patientId: patientTwo.id,
      title: "Referral Note",
      fileName: "ana-referral.pdf",
      filePath: "patients/patient-demo-2/documents/ana-referral.pdf",
      contentType: "application/pdf",
      sizeBytes: 860_000,
      category: "referral",
      status: "approved",
      source: "physician_upload",
      downloadUrl: "https://example.com/ana-referral.pdf",
      extractedText: "Follow-up referral to endocrinology.",
      summary: "Referral note for specialist follow-up.",
      uploadedBy: physician.id,
      reviewedBy: physician.id,
      reviewedAt: createTimestamp(2),
      createdAt: createTimestamp(3),
      updatedAt: createTimestamp(2),
    },
  ];

  const summaries: Summary[] = [
    {
      id: "summary-visit-1",
      patientId: patientOne.id,
      physicianId: physician.id,
      encounterId: "encounter-2026-06-30",
      title: "Visit Summary - Juan Dela Cruz",
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
      patientId: patientTwo.id,
      physicianId: physician.id,
      encounterId: "encounter-2026-06-28",
      title: "Visit Summary - Ana Santos",
      type: "visit",
      source: "manual",
      status: "pending_review",
      content:
        "Follow-up visit focused on medication timing and support at home. No new symptoms reported today.",
      highlights: ["Medication timing reviewed", "Family support discussed"],
      recommendations: [
        "Confirm refill schedule",
        "Recheck vitals in one week",
      ],
      generatedBy: physician.id,
      metadata: {
        confidence: 0.67,
      },
      createdAt: createTimestamp(3),
      updatedAt: createTimestamp(2),
    },
  ];

  return {
    generatedAt,
    users: [admin, physician, patientOne, patientTwo],
    physicians: [physician],
    patients: [patientOne, patientTwo],
    medications,
    allergies,
    vitals,
    symptoms,
    diseases,
    alerts,
    documents,
    summaries,
  };
}

async function main(): Promise<void> {
  const snapshot = generateMockData();
  console.log(JSON.stringify(snapshot, null, 2));
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  main().catch((error: unknown) => {
    console.error("Mock data generation failed.");
    if (error instanceof Error) {
      console.error(error.message);
    } else {
      console.error(error);
    }
    process.exitCode = 1;
  });
}
