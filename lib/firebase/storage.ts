/**
 * =============================================================================
 * ChroniSync
 * Firebase Storage Service
 * =============================================================================
 */

import {
  deleteObject,
  getDownloadURL,
  getMetadata,
  ref,
  uploadBytes,
  type FullMetadata,
  type UploadMetadata,
} from "firebase/storage";

import { storage } from "@/lib/firebase/client";

/* -------------------------------------------------------------------------- */
/*                                Upload                                      */
/* -------------------------------------------------------------------------- */

/**
 * Upload a file to Firebase Storage.
 *
 * Returns the download URL.
 */
export async function uploadFile(
  path: string,
  file: File,
  metadata?: UploadMetadata,
): Promise<string> {
  const storageRef = ref(storage, path);

  await uploadBytes(storageRef, file, metadata);

  return getDownloadURL(storageRef);
}

/* -------------------------------------------------------------------------- */
/*                              Download URL                                  */
/* -------------------------------------------------------------------------- */

/**
 * Retrieve the download URL of a file.
 */
export async function getFileUrl(path: string): Promise<string> {
  return getDownloadURL(ref(storage, path));
}

/* -------------------------------------------------------------------------- */
/*                                Metadata                                    */
/* -------------------------------------------------------------------------- */

/**
 * Retrieve metadata for a file.
 */
export async function getFileMetadata(path: string): Promise<FullMetadata> {
  return getMetadata(ref(storage, path));
}

/* -------------------------------------------------------------------------- */
/*                                 Delete                                     */
/* -------------------------------------------------------------------------- */

/**
 * Delete a file from Firebase Storage.
 */
export async function deleteFile(path: string): Promise<void> {
  await deleteObject(ref(storage, path));
}

/* -------------------------------------------------------------------------- */
/*                              Path Helpers                                  */
/* -------------------------------------------------------------------------- */

/**
 * Build a storage path for a patient's uploaded document.
 *
 * Example:
 * patients/{patientId}/documents/lab-result.pdf
 */
export function buildPatientDocumentPath(
  patientId: string,
  fileName: string,
): string {
  return `patients/${patientId}/documents/${fileName}`;
}

/**
 * Build a storage path for a patient's meal photo.
 *
 * Example:
 * patients/{patientId}/food-photos/meal-photo.jpg
 */
export function buildPatientFoodPhotoPath(
  patientId: string,
  fileName: string,
): string {
  return `patients/${patientId}/food-photos/${fileName}`;
}

/**
 * Build a storage path for a user's profile photo.
 *
 * Example:
 * users/{userId}/profile/avatar.png
 */
export function buildProfilePhotoPath(
  userId: string,
  fileName: string,
): string {
  return `users/${userId}/profile/${fileName}`;
}
