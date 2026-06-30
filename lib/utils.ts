import { type ClassValue, clsx } from "clsx";
import { format } from "date-fns";
import { twMerge } from "tailwind-merge";

/* -------------------------------------------------------------------------- */
/*                                Tailwind CSS                                */
/* -------------------------------------------------------------------------- */

/**
 * Merge Tailwind CSS classes.
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/* -------------------------------------------------------------------------- */
/*                              Date Formatting                               */
/* -------------------------------------------------------------------------- */

/**
 * Format a date.
 */
export function formatDate(
  date: Date | string | number,
  pattern = "MMM dd, yyyy"
) {
  return format(new Date(date), pattern);
}

/**
 * Format date and time.
 */
export function formatDateTime(date: Date | string | number) {
  return format(new Date(date), "MMM dd, yyyy • hh:mm a");
}

/**
 * Format time only.
 */
export function formatTime(date: Date | string | number) {
  return format(new Date(date), "hh:mm a");
}

/* -------------------------------------------------------------------------- */
/*                                 Strings                                    */
/* -------------------------------------------------------------------------- */

/**
 * Capitalize the first letter of a string.
 */
export function capitalize(value: string): string {
  if (!value) return "";

  return value.charAt(0).toUpperCase() + value.slice(1);
}

/**
 * Convert snake_case or kebab-case into Title Case.
 */
export function humanize(value: string): string {
  return value
    .replace(/[-_]/g, " ")
    .replace(/\b\w/g, (char) => char.toUpperCase());
}

/**
 * Get initials from a person's name.
 */
export function getInitials(name: string): string {
  return name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("");
}

/* -------------------------------------------------------------------------- */
/*                                Numbers                                     */
/* -------------------------------------------------------------------------- */

/**
 * Clamp a number between a minimum and maximum.
 */
export function clamp(
  value: number,
  min: number,
  max: number
): number {
  return Math.min(Math.max(value, min), max);
}

/**
 * Round a number to a fixed number of decimal places.
 */
export function round(
  value: number,
  decimals = 2
): number {
  return Number(value.toFixed(decimals));
}

/* -------------------------------------------------------------------------- */
/*                                 Arrays                                     */
/* -------------------------------------------------------------------------- */

/**
 * Remove duplicate values from an array.
 */
export function unique<T>(array: T[]): T[] {
  return [...new Set(array)];
}

/* -------------------------------------------------------------------------- */
/*                                Validation                                  */
/* -------------------------------------------------------------------------- */

/**
 * Determine whether a value is null, undefined, or an empty string.
 */
export function isEmpty(value: unknown): boolean {
  return (
    value === null ||
    value === undefined ||
    value === ""
  );
}

/* -------------------------------------------------------------------------- */
/*                                   Misc                                     */
/* -------------------------------------------------------------------------- */

/**
 * Generate a random identifier.
 * Suitable for UI keys only—not database IDs.
 */
export function generateId(length = 12): string {
  return crypto.randomUUID().replace(/-/g, "").slice(0, length);
}