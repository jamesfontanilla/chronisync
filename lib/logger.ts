/**
 * =============================================================================
 * ChroniSync
 * Application Logger
 * =============================================================================
 */

const isDevelopment = process.env.NODE_ENV === "development";

type LogContext = Record<string, unknown>;

class Logger {
  /**
   * Log debug information.
   * Only outputs in development mode.
   */
  debug(message: string, context?: LogContext) {
    if (!isDevelopment) return;

    console.debug(
      `[DEBUG] ${message}`,
      context ? this.sanitize(context) : ""
    );
  }

  /**
   * Log general information.
   */
  info(message: string, context?: LogContext) {
    console.info(
      `[INFO] ${message}`,
      context ? this.sanitize(context) : ""
    );
  }

  /**
   * Log warnings.
   */
  warn(message: string, context?: LogContext) {
    console.warn(
      `[WARN] ${message}`,
      context ? this.sanitize(context) : ""
    );
  }

  /**
   * Log errors.
   */
  error(
    message: string,
    error?: unknown,
    context?: LogContext
  ) {
    console.error(
      `[ERROR] ${message}`,
      error,
      context ? this.sanitize(context) : ""
    );
  }

  /**
   * Remove common sensitive fields before logging.
   */
  private sanitize(data: LogContext): LogContext {
    const sensitiveKeys = [
      "password",
      "confirmPassword",
      "token",
      "accessToken",
      "refreshToken",
      "idToken",
      "authorization",
      "cookie",
      "ssn",
      "medicalRecord",
      "medicalRecordNumber",
      "diagnosis",
      "notes",
    ];

    return Object.fromEntries(
      Object.entries(data).map(([key, value]) => [
        key,
        sensitiveKeys.includes(key)
          ? "[REDACTED]"
          : value,
      ])
    );
  }
}

export const logger = new Logger();

export default logger;