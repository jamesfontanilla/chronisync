import { evaluateClinicalRules } from "../lib/rules/engine";
import { buildClinicalAlertInputs } from "../lib/rules/engine";
import type { Vital } from "../types/vital";
import type { Disease } from "../types/disease";

const patientId = "patient-cusum-test";
const physicianId = "physician-cusum-test";

const diseases: Disease[] = [
  {
    id: "cond-t2d",
    patientId,
    name: "Type 2 Diabetes",
    status: "active",
    diagnosedAt: new Date("2020-01-01T00:00:00.000Z"),
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    id: "cond-ckd",
    patientId,
    name: "Chronic Kidney Disease",
    status: "active",
    diagnosedAt: new Date("2021-01-01T00:00:00.000Z"),
    createdAt: new Date(),
    updatedAt: new Date()
  }
];

const today = new Date();
today.setHours(12, 0, 0, 0);

const vitals: Vital[] = [];

for (let day = 1; day <= 30; day++) {
  const recordDate = new Date(today);
  recordDate.setDate(today.getDate() - (30 - day));
  
  let bpSys = 130 + (Math.random() * 4 - 2); 
  let bpDia = 82 + (Math.random() * 4 - 2);
  let glucose = 105 + (Math.random() * 5 - 2.5);
  let egfr = 85 + (Math.random() * 4 - 2);
  
  // Subtle drift starting day 20
  if (day > 20) {
     bpSys += (day - 20) * 1.5; 
     bpDia += (day - 20) * 1; 
     glucose += (day - 20) * 3; 
     egfr -= (day - 20) * 2;
  }

  const bpVital: Vital = {
    id: `vital-bp-${day}`,
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

  const glVital: Vital = {
    id: `vital-gl-${day}`,
    patientId,
    type: "blood_glucose",
    value: glucose,
    unit: "mg/dL",
    recordedAt: recordDate,
    createdAt: recordDate,
    updatedAt: recordDate,
    recordedByRole: "patient"
  };

  vitals.push(bpVital, glVital);

  console.log(`Day ${day} (${recordDate.toISOString().split('T')[0]}): BP=${bpSys.toFixed(1)}/${bpDia.toFixed(1)}, GL=${glucose.toFixed(1)}, eGFR=${egfr.toFixed(1)}`);
  
  // Evaluate sequentially up to this day
  const currentVitals = vitals.slice();
  const findings = evaluateClinicalRules({
    vitals: currentVitals,
    diseases,
    physicianId,
    evaluatedAt: recordDate,
  });

  if (findings.length > 0) {
    console.log(`  -> Findings on Day ${day}:`);
    findings.forEach(f => console.log(`     [${f.ruleId}] ${f.message}`));
  }
}
