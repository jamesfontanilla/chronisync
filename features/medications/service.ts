import type { MedicationCreateInput } from "@/services/medication.service";

export {
  buildMedicationRecord,
  createMedication,
  deleteMedication,
  getMedicationById,
  listActiveMedicationsByPatient,
  listMedicationsByPatient,
  updateMedication,
} from "@/services/medication.service";

import type { MedicationFormValues } from "./validation";

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

function toOptionalDate(value: string | undefined): Date | undefined {
  const normalized = trimOrUndefined(value);

  return normalized ? toDate(normalized) : undefined;
}

export function buildMedicationCreateInput(
  values: MedicationFormValues
): MedicationCreateInput {
  const route = values.route;
  const customFrequency = trimOrUndefined(values.customFrequency);
  const instructions = trimOrUndefined(values.instructions);
  const endDate = toOptionalDate(values.endDate);
  const notes = trimOrUndefined(values.notes);

  return {
    patientId: values.patientId.trim(),
    name: values.name.trim(),
    dosage: values.dosage.trim(),
    frequency: values.frequency,
    status: values.status,
    startDate: toDate(values.startDate),
    ...(route ? { route } : {}),
    ...(customFrequency ? { customFrequency } : {}),
    ...(endDate ? { endDate } : {}),
    ...(instructions ? { instructions } : {}),
    ...(notes ? { notes } : {}),
  };
}
