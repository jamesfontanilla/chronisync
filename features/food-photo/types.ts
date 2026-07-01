/**
 * =============================================================================
 * ChroniSync
 * Food Photo Feature Types
 * =============================================================================
 */

export type FoodPhotoMealType =
  | "breakfast"
  | "lunch"
  | "dinner"
  | "snack"
  | "drink"
  | "other";

export type FoodPhotoStatus =
  | "draft"
  | "needs_review"
  | "confirmed"
  | "rejected";

export type FoodPhotoSource =
  | "photo"
  | "manual"
  | "ai";

export interface FoodPhotoRecord {
  id: string;
  patientId: string;
  mealType: FoodPhotoMealType;
  mealLabel: string;
  portionLabel?: string;
  imageName: string;
  imageUrl?: string;
  source: FoodPhotoSource;
  status: FoodPhotoStatus;
  confidence: number;
  estimatedCalories: number;
  estimatedCarbsG: number;
  estimatedProteinG: number;
  estimatedFatG: number;
  notes?: string;
  suggestedEdits?: string[];
  capturedAt: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface FoodPhotoCreateInput {
  patientId: string;
  mealType: FoodPhotoMealType;
  mealLabel: string;
  portionLabel?: string;
  imageName: string;
  imageUrl?: string;
  source?: FoodPhotoSource;
  status?: FoodPhotoStatus;
  confidence?: number;
  estimatedCalories?: number;
  estimatedCarbsG?: number;
  estimatedProteinG?: number;
  estimatedFatG?: number;
  notes?: string;
  suggestedEdits?: string[];
  capturedAt?: Date;
}

export type FoodPhotoUpdateInput = Partial<
  Omit<FoodPhotoRecord, "id" | "patientId" | "createdAt" | "updatedAt">
>;

export interface FoodPhotoFilters {
  patientId?: string;
  status?: FoodPhotoStatus;
  mealType?: FoodPhotoMealType;
  query?: string;
  limit?: number;
}

export interface FoodPhotoSummary {
  total: number;
  draft: number;
  needsReview: number;
  confirmed: number;
  rejected: number;
  averageConfidence: number;
  lastUpdated: Date;
}

export interface FoodPhotoViewModel {
  record: FoodPhotoRecord;
  mealTypeLabel: string;
  statusLabel: string;
  confidenceLabel: string;
  timeLabel: string;
  preview: string;
}
