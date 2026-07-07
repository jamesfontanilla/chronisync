/**
 * =============================================================================
 * ChroniSync
 * Alert Types
 * =============================================================================
 */

/* -------------------------------------------------------------------------- */
/*                              Enumerations                                  */
/* -------------------------------------------------------------------------- */

export type AlertLevel =
  | "info"
  | "warning"
  | "critical";

export type AlertStatus =
  | "open"
  | "acknowledged"
  | "resolved"
  | "dismissed";

export type AlertSource =
  | "rules_engine"
  | "manual"
  | "system"
  | "demo";

/* -------------------------------------------------------------------------- */
/*                                  Alert                                     */
/* -------------------------------------------------------------------------- */

export interface Alert {
  id: string;

  /**
   * Associated patient UID.
   */
  patientId: string;

  /**
   * Optional physician UID assigned to review the alert.
   */
  physicianId?: string;

  /**
   * Short title shown in the UI.
   */
  title: string;

  /**
   * Detailed alert message.
   */
  message: string;

  /**
   * Alert severity.
   */
  level: AlertLevel;

  /**
   * Current alert state.
   */
  status: AlertStatus;

  /**
   * Origin of the alert.
   */
  source?: AlertSource;

  /**
   * Rule or trigger identifier.
   */
  ruleId?: string;

  /**
   * Metric name that triggered the alert.
   */
  metric?: string;

  /**
   * Threshold used by the rule.
   */
  threshold?: string;

  /**
   * Observed value that triggered the rule.
   */
  actualValue?: string;

  /**
   * UID of the user who acknowledged the alert.
   */
  acknowledgedBy?: string;

  /**
   * When the alert was acknowledged.
   */
  acknowledgedAt?: Date;

  /**
   * When the alert was resolved.
   */
  resolvedAt?: Date;

  /**
   * Additional notes.
   */
  notes?: string;

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
