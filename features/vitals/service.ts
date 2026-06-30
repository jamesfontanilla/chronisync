import type { VitalCreateInput } from "@/services/vital.service";

export {
  buildVitalRecord,
  createVital,
  deleteVital,
  getVitalById,
  listVitalsByPatient,
  listVitalsByType,
  updateVital,
} from "@/services/vital.service";

import type { VitalFormValues } from "./validation";

const trimOrUndefined = (value: string | undefined): string | undefined => {
  if (typeof value !== "string") {
    return undefined;
  }

  const trimmed = value.trim();
  return trimmed === "" ? undefined : trimmed;
};

function toDate(value: string): Date {
  const parsed = new Date(value);

  if (Number.isNaN(parsed.getTime())) {
    throw new Error(`Invalid date value: ${value}`);
  }

  return parsed;
}

function toNumber(value: string, fieldName: string): number {
  const parsed = Number(value);

  if (Number.isNaN(parsed)) {
    throw new Error(`Invalid ${fieldName} value: ${value}`);
  }

  return parsed;
}

const numericUnitByType = {
  heart_rate: "bpm",
  blood_glucose: "mg/dL",
  weight: "kg",
  temperature: "C",
  oxygen_saturation: "%",
} as const;

export function buildVitalCreateInput(
  values: VitalFormValues
): VitalCreateInput {
  const base = {
    patientId: values.patientId.trim(),
    recordedAt: toDate(values.recordedAt),
  } as const;
  const source = values.source;
  const notes = trimOrUndefined(values.notes);

  if (values.type === "blood_pressure") {
    return {
      ...base,
      type: "blood_pressure",
      systolic: toNumber(values.systolic, "systolic"),
      diastolic: toNumber(values.diastolic, "diastolic"),
      unit: "mmHg",
      ...(source ? { source } : {}),
      ...(notes ? { notes } : {}),
    };
  }

  return {
    ...base,
    type: values.type,
    value: toNumber(values.value, "value"),
    unit: numericUnitByType[values.type],
    ...(source ? { source } : {}),
    ...(notes ? { notes } : {}),
  };
}
