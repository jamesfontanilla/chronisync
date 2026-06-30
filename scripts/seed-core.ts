import type { DocumentData, Firestore } from "firebase-admin/firestore";

import { COLLECTIONS } from "../config/firebase";
import { getAdminDb } from "../lib/firebase/admin";
import type { Patient } from "../types/patient";
import type { Physician } from "../types/physician";
import type { User } from "../types/user";

type SeedRecord<TProfile> = {
  userId: string;
  user: User;
  profile: TProfile;
};

const seededAt = new Date();

const PHYSICIAN_SEEDS: Array<SeedRecord<Physician>> = [
  {
    userId: "physician-demo-1",
    user: {
      id: "physician-demo-1",
      email: "doctor@example.com",
      fullName: "Dr. Sofia Reyes",
      role: "physician",
      status: "active",
      emailVerified: true,
      timezone: "Asia/Manila",
      language: "en",
      createdAt: seededAt,
      updatedAt: seededAt,
      lastLoginAt: seededAt,
    },
    profile: {
      id: "physician-demo-1",
      email: "doctor@example.com",
      fullName: "Dr. Sofia Reyes",
      role: "physician",
      status: "active",
      emailVerified: true,
      timezone: "Asia/Manila",
      language: "en",
      createdAt: seededAt,
      updatedAt: seededAt,
      lastLoginAt: seededAt,
      licenseNumber: "PRC-2026-1001",
      specialty: "Family Medicine",
      organization: "ChroniSync Community Clinic",
      department: "Primary Care",
      yearsOfExperience: 11,
      biography:
        "Provides long-term chronic disease care with a focus on patient education and follow-up.",
      availability: "available",
      activePatientCount: 2,
    },
  },
];

const PATIENT_SEEDS: Array<SeedRecord<Patient>> = [
  {
    userId: "patient-demo-1",
    user: {
      id: "patient-demo-1",
      email: "patient1@example.com",
      fullName: "Juan Dela Cruz",
      role: "patient",
      status: "active",
      emailVerified: true,
      phoneNumber: "+63 912 345 6789",
      timezone: "Asia/Manila",
      language: "en",
      createdAt: seededAt,
      updatedAt: seededAt,
      lastLoginAt: seededAt,
    },
    profile: {
      id: "patient-demo-1",
      email: "patient1@example.com",
      fullName: "Juan Dela Cruz",
      role: "patient",
      status: "active",
      emailVerified: true,
      phoneNumber: "+63 912 345 6789",
      timezone: "Asia/Manila",
      language: "en",
      createdAt: seededAt,
      updatedAt: seededAt,
      lastLoginAt: seededAt,
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
          notes: "Currently managed with diet, activity, and medication.",
        },
      ],
      emergencyContact: {
        fullName: "Maria Dela Cruz",
        relationship: "Spouse",
        phoneNumber: "+63 917 111 2233",
      },
      physicianId: "physician-demo-1",
    },
  },
  {
    userId: "patient-demo-2",
    user: {
      id: "patient-demo-2",
      email: "patient2@example.com",
      fullName: "Ana Santos",
      role: "patient",
      status: "active",
      emailVerified: true,
      phoneNumber: "+63 918 222 3344",
      timezone: "Asia/Manila",
      language: "en",
      createdAt: seededAt,
      updatedAt: seededAt,
      lastLoginAt: seededAt,
    },
    profile: {
      id: "patient-demo-2",
      email: "patient2@example.com",
      fullName: "Ana Santos",
      role: "patient",
      status: "active",
      emailVerified: true,
      phoneNumber: "+63 918 222 3344",
      timezone: "Asia/Manila",
      language: "en",
      createdAt: seededAt,
      updatedAt: seededAt,
      lastLoginAt: seededAt,
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
      physicianId: "physician-demo-1",
    },
  },
];

async function writeDocument(
  db: Firestore,
  collectionName: string,
  documentId: string,
  data: unknown
): Promise<void> {
  await db
    .collection(collectionName)
    .doc(documentId)
    .set(data as DocumentData, {
    merge: true,
    });
}

async function seedRecords<TProfile>(
  db: Firestore,
  collectionName: string,
  records: Array<SeedRecord<TProfile>>
): Promise<void> {
  await Promise.all(
    records.map(async ({ userId, user, profile }) => {
      await Promise.all([
        writeDocument(db, COLLECTIONS.USERS, userId, user),
        writeDocument(db, collectionName, userId, profile),
      ]);
    })
  );
}

export async function seedDoctors(): Promise<void> {
  const db = getAdminDb();
  await seedRecords(db, COLLECTIONS.PHYSICIANS, PHYSICIAN_SEEDS);
  console.log(`Seeded ${PHYSICIAN_SEEDS.length} physician record(s).`);
}

export async function seedPatients(): Promise<void> {
  const db = getAdminDb();
  await seedRecords(db, COLLECTIONS.PATIENTS, PATIENT_SEEDS);
  console.log(`Seeded ${PATIENT_SEEDS.length} patient record(s).`);
}

export async function seedAll(): Promise<void> {
  await seedDoctors();
  await seedPatients();
}
