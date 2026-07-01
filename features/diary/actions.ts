/**
 * =============================================================================
 * ChroniSync
 * Diary Server Actions
 * =============================================================================
 */

"use server";

import { revalidatePath } from "next/cache";

import {
  createDiaryEntry,
  deleteDiaryEntry,
  updateDiaryEntry,
  type DiaryCreateInput,
  type DiaryUpdateInput,
} from "./service";

const PATIENT_DIARY_ROUTES = [
  "/patient/dashboard",
  "/patient/diary",
  "/patient/add",
  "/patient/partners",
  "/patient/more",
  "/patient/settings",
] as const;

function revalidateDiaryViews(): void {
  for (const route of PATIENT_DIARY_ROUTES) {
    revalidatePath(route);
  }
}

export async function createDiaryEntryAction(
  input: DiaryCreateInput
): Promise<void> {
  await createDiaryEntry(input);
  revalidateDiaryViews();
}

export async function updateDiaryEntryAction(
  diaryId: string,
  updates: DiaryUpdateInput
): Promise<void> {
  await updateDiaryEntry(diaryId, updates);
  revalidateDiaryViews();
}

export async function deleteDiaryEntryAction(
  diaryId: string
): Promise<void> {
  await deleteDiaryEntry(diaryId);
  revalidateDiaryViews();
}
