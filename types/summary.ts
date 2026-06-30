/**
 * =============================================================================
 * ChroniSync
 * Summary Types
 * =============================================================================
 */

/* -------------------------------------------------------------------------- */
/*                              Enumerations                                  */
/* -------------------------------------------------------------------------- */

export type SummaryType =
  | "visit"
  | "document"
  | "care_plan"
  | "discharge"
  | "other";

export type SummaryStatus =
  | "draft"
  | "pending_review"
  | "approved"
  | "rejected"
  | "published";

export type SummarySource =
  | "ai"
  | "manual";

/* -------------------------------------------------------------------------- */
/*                                 Summary                                   */
/* -------------------------------------------------------------------------- */

export interface Summary {
  id: string;

  /**
   * Associated patient UID.
   */
  patientId: string;

  /**
   * Optional physician UID connected to the summary.
   */
  physicianId?: string;

  /**
   * Optional encounter or visit UID.
   */
  encounterId?: string;

  /**
   * Display title.
   */
  title: string;

  /**
   * Summary classification.
   */
  type: SummaryType;

  /**
   * Source of the summary content.
   */
  source: SummarySource;

  /**
   * Current workflow state.
   */
  status: SummaryStatus;

  /**
   * Full summary text.
   */
  content: string;

  /**
   * Short bullet-point highlights.
   */
  highlights?: string[];

  /**
   * Recommended follow-up actions.
   */
  recommendations?: string[];

  /**
   * UID of the user or service that generated the summary.
   */
  generatedBy?: string;

  /**
   * Optional model name when AI-assisted.
   */
  model?: string;

  /**
   * UID of the user who reviewed the summary.
   */
  reviewedBy?: string;

  /**
   * When the summary was reviewed.
   */
  reviewedAt?: Date;

  /**
   * When the summary was published.
   */
  publishedAt?: Date;

  /**
   * Free-form structured metadata.
   */
  metadata?: Record<string, unknown>;

  /**
   * Creation timestamp.
   */
  createdAt: Date;

  /**
   * Last update timestamp.
   */
  updatedAt: Date;
}
