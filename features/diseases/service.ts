import { COLLECTIONS } from "@/config/firebase";
import {
  createDocument as createFirestoreDocument,
  deleteDocument as deleteFirestoreDocument,
  getDocument as getFirestoreDocument,
  queryDocuments,
  updateDocument as updateFirestoreDocument,
  whereEquals,
} from "@/lib/firebase/firestore";
import type { ExportSection } from "@/features/exports/types";
import type { Disease } from "@/types/disease";
import type { InteroperabilityStandard } from "@/types/user";

import type { DiseaseFormValues } from "./validation";

const COLLECTION = COLLECTIONS.DISEASES;

export type DiseaseRecord = Disease;

export type DiseaseCreateInput = Omit<
  DiseaseRecord,
  "id" | "createdAt" | "updatedAt"
>;

export type DiseaseUpdateInput = Partial<
  Omit<
    DiseaseRecord,
    "id" | "patientId" | "createdAt" | "updatedAt"
  >
>;

function createRecordId(): string {
  return typeof globalThis.crypto?.randomUUID === "function"
    ? globalThis.crypto.randomUUID()
    : `dis_${Date.now()}_${Math.random().toString(36).slice(2, 10)}`;
}

function createTimestamp(): Date {
  return new Date();
}

const trimOrUndefined = (value: string | undefined): string | undefined => {
  if (typeof value !== "string") {
    return undefined;
  }

  const trimmed = value.trim();
  return trimmed === "" ? undefined : trimmed;
};

export type DiseaseKnowledgeDomain =
  | "diabetes"
  | "hypertension"
  | "ckd"
  | "copd";

export interface DiseaseKnowledgePack {
  domain: DiseaseKnowledgeDomain;
  label: string;
  guideline: string;
  supportedMetrics: string[];
  defaultWindows: {
    bloodGlucoseDays?: number;
    bloodPressureDays?: number;
    adherenceDays?: number;
  };
  summaryFocus: string[];
}

export interface DiseaseInteropMapping {
  standard: InteroperabilityStandard;
  resourceType: string;
  localFields: string[];
  exportSections: ExportSection[];
  notes: string;
}

export interface DiseaseInteroperabilityProfile {
  domain: DiseaseKnowledgeDomain;
  label: string;
  standards: InteroperabilityStandard[];
  mappings: DiseaseInteropMapping[];
}

const DISEASE_KNOWLEDGE_PACKS: Record<
  DiseaseKnowledgeDomain,
  DiseaseKnowledgePack
> = {
  diabetes: {
    domain: "diabetes",
    label: "Type 2 diabetes",
    guideline: "ADA Standards of Care",
    supportedMetrics: ["blood_glucose", "blood_pressure", "weight"],
    defaultWindows: {
      bloodGlucoseDays: 14,
      bloodPressureDays: 7,
      adherenceDays: 14,
    },
    summaryFocus: [
      "time in range",
      "time below range",
      "GMI",
      "before and after meal trends",
    ],
  },
  hypertension: {
    domain: "hypertension",
    label: "Hypertension",
    guideline: "AHA / ACC Blood Pressure Guideline",
    supportedMetrics: ["blood_pressure", "weight", "blood_glucose"],
    defaultWindows: {
      bloodGlucoseDays: 7,
      bloodPressureDays: 30,
      adherenceDays: 14,
    },
    summaryFocus: [
      "rolling blood pressure averages",
      "repeated elevated readings",
      "weight and lifestyle trends",
    ],
  },
  ckd: {
    domain: "ckd",
    label: "Chronic kidney disease",
    guideline: "KDIGO",
    supportedMetrics: ["blood_pressure", "weight", "blood_glucose"],
    defaultWindows: {
      bloodGlucoseDays: 14,
      bloodPressureDays: 30,
      adherenceDays: 14,
    },
    summaryFocus: [
      "blood pressure control",
      "weight swings",
      "medication adherence",
    ],
  },
  copd: {
    domain: "copd",
    label: "COPD",
    guideline: "GOLD",
    supportedMetrics: ["oxygen_saturation", "heart_rate", "blood_pressure"],
    defaultWindows: {
      bloodPressureDays: 30,
      adherenceDays: 14,
    },
    summaryFocus: [
      "oxygen saturation",
      "rescue medication adherence",
      "exertional symptom trends",
    ],
  },
};

const DISEASE_INTEROPERABILITY_PROFILES: Record<
  DiseaseKnowledgeDomain,
  DiseaseInteroperabilityProfile
> = {
  diabetes: {
    domain: "diabetes",
    label: "Type 2 diabetes",
    standards: ["fhir", "openmrs"],
    mappings: [
      {
        standard: "fhir",
        resourceType: "Condition",
        localFields: ["name", "icd10Code", "status", "severity"],
        exportSections: ["diseases", "summaries", "provenance"],
        notes: "Maps the active diagnosis and disease state into FHIR Condition.",
      },
      {
        standard: "fhir",
        resourceType: "Observation",
        localFields: ["blood_glucose", "a1c", "weight", "symptoms"],
        exportSections: ["vitals", "summaries", "ai_outputs"],
        notes: "Carries glucose and weight readings as FHIR Observation resources.",
      },
      {
        standard: "fhir",
        resourceType: "MedicationStatement",
        localFields: ["medications", "adherence"],
        exportSections: ["medications", "summaries", "audit_trail"],
        notes: "Keeps treatment history and adherence aligned with the chart.",
      },
      {
        standard: "openmrs",
        resourceType: "concept-set:diabetes",
        localFields: ["name", "icd10Code", "blood_glucose", "a1c"],
        exportSections: ["diseases", "summaries"],
        notes: "Mirrors the same diagnosis and metric bundle into OpenMRS-style forms.",
      },
    ],
  },
  hypertension: {
    domain: "hypertension",
    label: "Hypertension",
    standards: ["fhir", "openmrs"],
    mappings: [
      {
        standard: "fhir",
        resourceType: "Condition",
        localFields: ["name", "icd10Code", "status", "severity"],
        exportSections: ["diseases", "summaries", "provenance"],
        notes: "Maps the blood pressure diagnosis to FHIR Condition.",
      },
      {
        standard: "fhir",
        resourceType: "Observation",
        localFields: ["blood_pressure", "weight", "heart_rate"],
        exportSections: ["vitals", "summaries", "alerts"],
        notes: "Keeps pressure and trend readings in Observation.",
      },
      {
        standard: "fhir",
        resourceType: "CarePlan",
        localFields: ["medications", "goals", "notes"],
        exportSections: ["treatment_plan", "summaries"],
        notes: "Captures pressure goals and medication plans for longitudinal care.",
      },
      {
        standard: "openmrs",
        resourceType: "concept-set:hypertension",
        localFields: ["blood_pressure", "weight", "medications"],
        exportSections: ["diseases", "treatment_plan"],
        notes: "Matches the same readings to OpenMRS-style hypertension concepts.",
      },
    ],
  },
  ckd: {
    domain: "ckd",
    label: "Chronic kidney disease",
    standards: ["fhir", "openmrs"],
    mappings: [
      {
        standard: "fhir",
        resourceType: "Condition",
        localFields: ["name", "icd10Code", "status", "severity"],
        exportSections: ["diseases", "summaries", "provenance"],
        notes: "Represents the CKD diagnosis and staging state in FHIR Condition.",
      },
      {
        standard: "fhir",
        resourceType: "Observation",
        localFields: ["blood_pressure", "weight", "fluid_intake", "symptoms"],
        exportSections: ["vitals", "alerts", "summaries"],
        notes: "Stores trendable renal monitoring values as Observation resources.",
      },
      {
        standard: "fhir",
        resourceType: "CarePlan",
        localFields: ["goals", "medications", "notes"],
        exportSections: ["treatment_plan", "summaries"],
        notes: "Tracks fluid, BP, and medication goals in a care plan bundle.",
      },
      {
        standard: "openmrs",
        resourceType: "concept-set:ckd",
        localFields: ["weight", "blood_pressure", "fluid_intake"],
        exportSections: ["diseases", "treatment_plan"],
        notes: "Mirrors the renal monitoring bundle into OpenMRS concepts.",
      },
    ],
  },
  copd: {
    domain: "copd",
    label: "COPD",
    standards: ["fhir", "openmrs"],
    mappings: [
      {
        standard: "fhir",
        resourceType: "Condition",
        localFields: ["name", "status", "severity"],
        exportSections: ["diseases", "summaries"],
        notes: "Represents the chronic airway diagnosis in the external record set.",
      },
      {
        standard: "fhir",
        resourceType: "Observation",
        localFields: ["oxygen_saturation", "heart_rate", "symptoms"],
        exportSections: ["vitals", "alerts", "summaries"],
        notes: "Maps respiratory trends and symptoms to FHIR Observation.",
      },
      {
        standard: "fhir",
        resourceType: "MedicationStatement",
        localFields: ["medications", "adherence"],
        exportSections: ["medications", "summaries"],
        notes: "Carries inhaler and rescue medication history into the export set.",
      },
      {
        standard: "openmrs",
        resourceType: "concept-set:copd",
        localFields: ["oxygen_saturation", "medications"],
        exportSections: ["diseases", "medications"],
        notes: "Mirrors the respiratory bundle into OpenMRS-style concepts.",
      },
    ],
  },
};

const DISEASE_NAME_ALIASES: Record<DiseaseKnowledgeDomain, string[]> = {
  diabetes: ["diabetes", "type 2 diabetes", "t2dm", "type 1 diabetes", "t1dm"],
  hypertension: ["hypertension", "high blood pressure", "bp"],
  ckd: ["chronic kidney disease", "ckd", "kidney disease", "renal disease"],
  copd: ["copd", "chronic obstructive pulmonary disease"],
};

const DISEASE_ICD_PREFIXES: Record<DiseaseKnowledgeDomain, string[]> = {
  diabetes: ["E10", "E11", "E13"],
  hypertension: ["I10", "I11", "I12", "I13", "I15"],
  ckd: ["N18", "N19"],
  copd: ["J44"],
};

function normalizeDiseaseKey(value: string): string {
  return value.trim().toLowerCase().replace(/[^a-z0-9]+/g, " ");
}

function matchDiseaseDomain(
  name?: string,
  icd10Code?: string
): DiseaseKnowledgeDomain | null {
  const normalizedName = name ? normalizeDiseaseKey(name) : "";
  const normalizedIcd10 = icd10Code ? icd10Code.trim().toUpperCase() : "";

  for (const [domain, aliases] of Object.entries(DISEASE_NAME_ALIASES) as [
    DiseaseKnowledgeDomain,
    string[]
  ][]) {
    if (
      aliases.some((alias) =>
        normalizedName.includes(normalizeDiseaseKey(alias))
      )
    ) {
      return domain;
    }

    if (
      normalizedIcd10 &&
      DISEASE_ICD_PREFIXES[domain].some((prefix) =>
        normalizedIcd10.startsWith(prefix)
      )
    ) {
      return domain;
    }
  }

  return null;
}

export function resolveDiseaseKnowledgePack(
  disease: Pick<Disease, "name" | "icd10Code"> | string
): DiseaseKnowledgePack | null {
  const resolved =
    typeof disease === "string"
      ? matchDiseaseDomain(disease)
      : matchDiseaseDomain(disease.name, disease.icd10Code);

  return resolved ? DISEASE_KNOWLEDGE_PACKS[resolved] : null;
}

export function listDiseaseKnowledgePacks(): DiseaseKnowledgePack[] {
  return Object.values(DISEASE_KNOWLEDGE_PACKS);
}

export function resolveDiseaseInteroperabilityProfile(
  disease: Pick<Disease, "name" | "icd10Code"> | string
): DiseaseInteroperabilityProfile | null {
  const resolved =
    typeof disease === "string"
      ? matchDiseaseDomain(disease)
      : matchDiseaseDomain(disease.name, disease.icd10Code);

  return resolved ? DISEASE_INTEROPERABILITY_PROFILES[resolved] : null;
}

export function listDiseaseInteroperabilityProfiles(): DiseaseInteroperabilityProfile[] {
  return Object.values(DISEASE_INTEROPERABILITY_PROFILES);
}

export function describeDiseaseInteroperabilityProfile(
  profile: DiseaseInteroperabilityProfile
): string {
  const standards = profile.standards.map((standard) => standard.toUpperCase());
  const resourceTypes = [
    ...new Set(profile.mappings.map((mapping) => mapping.resourceType)),
  ];

  return `${profile.label} maps to ${standards.join(" and ")} resources: ${resourceTypes.join(
    ", "
  )}.`;
}

export function getDiseaseKnowledgePackWindowDays(
  disease: Pick<Disease, "name" | "icd10Code"> | string
): DiseaseKnowledgePack["defaultWindows"] | null {
  return resolveDiseaseKnowledgePack(disease)?.defaultWindows ?? null;
}

export function buildDiseaseRecord(
  data: DiseaseCreateInput
): DiseaseRecord {
  const timestamp = createTimestamp();

  return {
    ...data,
    id: createRecordId(),
    createdAt: timestamp,
    updatedAt: timestamp,
  };
}

export function buildDiseaseCreateInput(
  values: DiseaseFormValues
): DiseaseCreateInput {
  const icd10Code = trimOrUndefined(values.icd10Code);
  const notes = trimOrUndefined(values.notes);

  return {
    patientId: values.patientId.trim(),
    name: values.name.trim(),
    status: values.status,
    ...(icd10Code ? { icd10Code } : {}),
    ...(values.severity ? { severity: values.severity } : {}),
    ...(values.isChronic !== undefined ? { isChronic: values.isChronic } : {}),
    ...(notes ? { notes } : {}),
  };
}

export async function createDisease(
  data: DiseaseCreateInput
): Promise<DiseaseRecord> {
  const record = buildDiseaseRecord(data);
  await createFirestoreDocument<DiseaseRecord>(
    COLLECTION,
    record.id,
    record
  );
  return record;
}

export async function getDiseaseById(
  diseaseId: string
): Promise<DiseaseRecord | null> {
  return getFirestoreDocument<DiseaseRecord>(COLLECTION, diseaseId);
}

export async function listDiseasesByPatient(
  patientId: string
): Promise<DiseaseRecord[]> {
  return queryDocuments<DiseaseRecord>(
    COLLECTION,
    whereEquals("patientId", patientId)
  );
}

export async function updateDisease(
  diseaseId: string,
  updates: DiseaseUpdateInput
): Promise<DiseaseRecord> {
  const current = await getDiseaseById(diseaseId);

  if (!current) {
    throw new Error(`Disease ${diseaseId} was not found.`);
  }

  const next: DiseaseRecord = {
    ...current,
    ...updates,
    updatedAt: createTimestamp(),
  };

  await updateFirestoreDocument<DiseaseRecord>(
    COLLECTION,
    diseaseId,
    next
  );

  return next;
}

export async function deleteDisease(
  diseaseId: string
): Promise<void> {
  await deleteFirestoreDocument(COLLECTION, diseaseId);
}
