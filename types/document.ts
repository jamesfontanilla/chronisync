/**
 * =============================================================================
 * ChroniSync
 * Document Types
 * =============================================================================
 */

/* -------------------------------------------------------------------------- */
/*                              Enumerations                                  */
/* -------------------------------------------------------------------------- */

export type DocumentCategory =
  | "lab_result"
  | "prescription"
  | "imaging"
  | "referral"
  | "discharge_summary"
  | "consultation_note"
  | "other";

export type DocumentStatus =
  | "pending"
  | "processing"
  | "review_required"
  | "approved"
  | "rejected";

export type DocumentSource =
  | "patient_upload"
  | "physician_upload"
  | "system";

/* -------------------------------------------------------------------------- */
/*                                Document                                    */
/* -------------------------------------------------------------------------- */

export interface Document {
  id: string;

  /**
   * Associated patient UID.
   */
  patientId: string;

  /**
   * Display title for the document.
   */
  title: string;

  /**
   * Uploaded file name.
   */
  fileName: string;

  /**
   * Firestore or storage path used for the file.
   */
  filePath: string;

  /**
   * MIME content type.
   */
  contentType: string;

  /**
   * File size in bytes.
   */
  sizeBytes: number;

  /**
   * Document category.
   */
  category: DocumentCategory;

  /**
   * Current document review status.
   */
  status: DocumentStatus;

  /**
   * Source of the upload.
   */
  source?: DocumentSource;

  /**
   * Download URL when the file has been made available.
   */
  downloadUrl?: string;

  /**
   * Text extracted from the uploaded file.
   */
  extractedText?: string;

  /**
   * Short summary of the document.
   */
  summary?: string;

  /**
   * UID of the user who uploaded the document.
   */
  uploadedBy?: string;

  /**
   * UID of the user who reviewed the document.
   */
  reviewedBy?: string;

  /**
   * When the review was completed.
   */
  reviewedAt?: Date;

  /**
   * Creation timestamp.
   */
  createdAt: Date;

  /**
   * Last update timestamp.
   */
  updatedAt: Date;
}
