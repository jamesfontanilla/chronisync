import type { SymptomCreateInput } from "@/services/symptom.service";

export {
  buildSymptomRecord,
  createSymptom,
  deleteSymptom,
  getSymptomById,
  listActiveSymptomsByPatient,
  listSymptomsByPatient,
  updateSymptom,
} from "@/services/symptom.service";

import type { SymptomFormValues } from "./validation";

const trimOrUndefined = (value: string | undefined): string | undefined => {
  if (typeof value !== "string") {
    return undefined;
  }

  const trimmed = value.trim();
  return trimmed === "" ? undefined : trimmed;
};

export function buildSymptomCreateInput(
  values: SymptomFormValues
): SymptomCreateInput {
  const frequency = values.frequency;
  const description = trimOrUndefined(values.description);
  const notes = trimOrUndefined(values.notes);

  return {
    patientId: values.patientId.trim(),
    name: values.name.trim(),
    severity: values.severity,
    status: values.status,
    ...(frequency ? { frequency } : {}),
    ...(description ? { description } : {}),
    ...(notes ? { notes } : {}),
  };
}
