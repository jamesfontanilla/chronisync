import { z } from "zod";

const emptyToUndefined = (value: unknown) => {
  if (typeof value !== "string") {
    return value;
  }

  const trimmed = value.trim();
  return trimmed === "" ? undefined : trimmed;
};

const optionalText = z.preprocess(
  emptyToUndefined,
  z.string().trim().optional()
);

export const foodPhotoMealTypeSchema = z.enum([
  "breakfast",
  "lunch",
  "dinner",
  "snack",
  "drink",
  "other",
]);

export const foodPhotoStatusSchema = z.enum([
  "draft",
  "needs_review",
  "confirmed",
  "rejected",
]);

export const foodPhotoSourceSchema = z.enum([
  "photo",
  "manual",
  "ai",
]);

export const foodPhotoFormSchema = z.object({
  patientId: z.string().trim().min(1, "Patient ID is required."),
  mealType: foodPhotoMealTypeSchema,
  mealLabel: z.string().trim().min(1, "Meal label is required."),
  portionLabel: optionalText,
  imageName: z.string().trim().min(1, "Image name is required."),
  imageUrl: optionalText,
  source: foodPhotoSourceSchema.default("photo"),
  status: foodPhotoStatusSchema.default("draft"),
  confidence: z.coerce.number().min(0).max(1).default(0.65),
  estimatedCalories: z.coerce.number().int().min(0).optional(),
  estimatedCarbsG: z.coerce.number().min(0).optional(),
  estimatedProteinG: z.coerce.number().min(0).optional(),
  estimatedFatG: z.coerce.number().min(0).optional(),
  notes: optionalText,
  capturedAt: z.string().trim().optional(),
});

export type FoodPhotoFormValues = z.infer<typeof foodPhotoFormSchema>;

export const foodPhotoFiltersSchema = z.object({
  patientId: z.string().trim().optional(),
  status: foodPhotoStatusSchema.optional(),
  mealType: foodPhotoMealTypeSchema.optional(),
  query: z.string().trim().optional(),
  limit: z.coerce.number().int().min(1).max(100).default(20),
});

export type FoodPhotoFiltersData = z.infer<typeof foodPhotoFiltersSchema>;
