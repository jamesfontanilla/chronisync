

import { getAdminDb } from "../lib/firebase/admin";
import { evaluateAndPersistAlertsForPatient } from "../lib/rules/pipeline";
import { COLLECTIONS } from "../config/firebase";
import type { User } from "../types/user";
import type { Patient } from "../types/patient";
import type { Physician } from "../types/physician";
import type { Vital } from "../types/vital";

async function writeDocument(db: any, collectionName: string, documentId: string, data: any) {
  await db.collection(collectionName).doc(documentId).set(data, { merge: true });
}

async function delay(ms: number) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function run() {
  const db = getAdminDb();
  const seededAt = new Date();

  // 1. Create Physician
  const physicianId = "physician-cusum-test";
  const physicianUser: User = {
    id: physicianId,
    email: "cusum-tester@example.com",
    fullName: "Dr. Cusum Tester",
    role: "physician",
    status: "active",
    emailVerified: true,
    timezone: "Asia/Manila",
    language: "en",
    createdAt: seededAt,
    updatedAt: seededAt,
    lastLoginAt: seededAt,
  };
  const physicianProfile: Physician = {
    id: physicianId,
    email: "cusum-tester@example.com",
    fullName: "Dr. Cusum Tester",
    role: "physician",
    status: "active",
    emailVerified: true,
    timezone: "Asia/Manila",
    language: "en",
    createdAt: seededAt,
    updatedAt: seededAt,
    lastLoginAt: seededAt,
    licenseNumber: "PRC-TEST",
    specialty: "Endocrinology",
    organization: "ChroniSync",
    department: "Research",
    yearsOfExperience: 5,
    biography: "Testing CUSUM bug.",
    availability: "available",
    activePatientCount: 1,
  };
  await writeDocument(db, COLLECTIONS.USERS, physicianId, physicianUser);
  await writeDocument(db, COLLECTIONS.PHYSICIANS, physicianId, physicianProfile);

  // 2. Create Patient
  const patientId = "patient-cusum-test";
  const patientUser: User = {
    id: patientId,
    email: "patient-cusum@example.com",
    fullName: "Demo Patient (CKD+T2D)",
    role: "patient",
    status: "active",
    emailVerified: true,
    timezone: "Asia/Manila",
    language: "en",
    createdAt: seededAt,
    updatedAt: seededAt,
    lastLoginAt: seededAt,
  };
  const patientProfile: Patient = {
    id: patientId,
    email: "patient-cusum@example.com",
    fullName: "Demo Patient (CKD+T2D)",
    role: "patient",
    status: "active",
    emailVerified: true,
    timezone: "Asia/Manila",
    language: "en",
    createdAt: seededAt,
    updatedAt: seededAt,
    lastLoginAt: seededAt,
    dateOfBirth: new Date("1980-01-01T00:00:00.000Z"),
    biologicalSex: "male",
    bloodType: "O+",
    heightCm: 175,
    weightKg: 80,
    physicianId: physicianId,
    chronicConditions: [
      {
        id: "cond-t2d",
        name: "Type 2 Diabetes",
        diagnosedAt: new Date("2020-01-01T00:00:00.000Z"),
        notes: "T2D",
      },
      {
        id: "cond-ckd",
        name: "Chronic Kidney Disease",
        diagnosedAt: new Date("2021-01-01T00:00:00.000Z"),
        notes: "CKD",
      }
    ],
    emergencyContact: {
      fullName: "None",
      relationship: "None",
      phoneNumber: "000",
    }
  };
  await writeDocument(db, COLLECTIONS.USERS, patientId, patientUser);
  await writeDocument(db, COLLECTIONS.PATIENTS, patientId, patientProfile);

  console.log("Seeded patient and physician.");

  // 3. Generate 30 days of data
  // Base Date: 30 days ago from today
  const today = new Date();
  today.setHours(12, 0, 0, 0);

  // We want drift:
  // BP systolic: starts at 120, drifts up by 1.5 per day after day 20. Wait, 30 days total. Let's make it drift up by 2/day after day 15.
  // Glucose: starts at 100, drifts up by 3 per day after day 15.
  // eGFR (using 'other' maybe? wait, eGFR is not in the schema explicitly. We'll use 'blood_pressure' and 'blood_glucose' since those are evaluated by engine).
  
  for (let day = 1; day <= 30; day++) {
    const recordDate = new Date(today);
    recordDate.setDate(today.getDate() - (30 - day));
    
    // Stable phase
    let bpSys = 120 + (Math.random() * 4 - 2); 
    let bpDia = 80 + (Math.random() * 4 - 2);
    let glucose = 100 + (Math.random() * 5 - 2.5);
    
    if (day > 15) {
       bpSys += (day - 15) * 2; // day 30: +30 => 150
       bpDia += (day - 15) * 1; // day 30: +15 => 95
       glucose += (day - 15) * 5; // day 30: +75 => 175
    }

    const bpId = `vital-bp-${day}`;
    const bpVital: Vital = {
      id: bpId,
      patientId,
      type: "blood_pressure",
      systolic: bpSys,
      diastolic: bpDia,
      unit: "mmHg",
      recordedAt: recordDate,
      createdAt: recordDate,
      updatedAt: recordDate,
      recordedByRole: "patient"
    };

    const glId = `vital-gl-${day}`;
    const glVital: Vital = {
      id: glId,
      patientId,
      type: "blood_pressure", // Wait, need to fix
      value: glucose,
      unit: "mg/dL",
      recordedAt: recordDate,
      createdAt: recordDate,
      updatedAt: recordDate,
      recordedByRole: "patient"
    } as any;
    glVital.type = "blood_glucose";

    await writeDocument(db, COLLECTIONS.VITALS, bpId, bpVital);
    await writeDocument(db, COLLECTIONS.VITALS, glId, glVital);

    console.log(`Day ${day} (${recordDate.toISOString().split('T')[0]}): BP=${bpSys.toFixed(1)}/${bpDia.toFixed(1)}, GL=${glucose.toFixed(1)}`);
    
    // Evaluate engine sequentially
    try {
      const alerts = await evaluateAndPersistAlertsForPatient(patientId, { evaluatedAt: recordDate });
      if (alerts.length > 0) {
        console.log(`*** ALERT FIRED ON DAY ${day} ***`);
        alerts.forEach(a => console.log(`   Alert: [${a.ruleId}] ${a.message}`));
      }
    } catch (e: any) {
      console.error(`Error on Day ${day} evaluation:`, e.message);
    }
  }

  console.log("Done.");
}

run().catch(console.error);
