/**
 * =============================================================================
 * ChroniSync
 * Food Photo Server Actions
 * =============================================================================
 */

"use server";

import { revalidatePath } from "next/cache";

import {
  createFoodPhotoRecord,
  deleteFoodPhotoRecord,
  updateFoodPhotoRecord,
  type FoodPhotoCreateInput,
  type FoodPhotoUpdateInput,
} from "./service";

const PATIENT_FOOD_PHOTO_ROUTES = [
  "/patient/dashboard",
  "/patient/diary",
  "/patient/add",
  "/patient/partners",
  "/patient/more",
  "/patient/settings",
] as const;

function revalidateFoodPhotoViews(): void {
  for (const route of PATIENT_FOOD_PHOTO_ROUTES) {
    revalidatePath(route);
  }
}

export async function createFoodPhotoRecordAction(
  input: FoodPhotoCreateInput
): Promise<void> {
  await createFoodPhotoRecord(input);
  revalidateFoodPhotoViews();
}

export async function updateFoodPhotoRecordAction(
  foodPhotoId: string,
  updates: FoodPhotoUpdateInput
): Promise<void> {
  await updateFoodPhotoRecord(foodPhotoId, updates);
  revalidateFoodPhotoViews();
}

export async function deleteFoodPhotoRecordAction(
  foodPhotoId: string
): Promise<void> {
  await deleteFoodPhotoRecord(foodPhotoId);
  revalidateFoodPhotoViews();
}
