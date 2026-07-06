import type { AllergyCreateInput } from "@/services/allergy.service";

export {
  buildAllergyRecord,
  createAllergy,
  deleteAllergy,
  getAllergyById,
  listActiveAllergiesByPatient,
  listAllergiesByPatient,
  updateAllergy,
} from "@/services/allergy.service";

import type { AllergyFormValues } from "./validation";

const trimOrUndefined = (value: string | undefined): string | undefined => {
  if (typeof value !== "string") {
    return undefined;
  }

  const trimmed = value.trim();
  return trimmed === "" ? undefined : trimmed;
};

export function buildAllergyCreateInput(
  values: AllergyFormValues
): AllergyCreateInput {
  const reaction = trimOrUndefined(values.reaction);
  const notes = trimOrUndefined(values.notes);

  return {
    patientId: values.patientId.trim(),
    recordedByRole: values.recordedByRole,
    allergen: values.allergen.trim(),
    type: values.type,
    severity: values.severity,
    status: values.status,
    ...(reaction ? { reaction } : {}),
    ...(notes ? { notes } : {}),
  };
}
