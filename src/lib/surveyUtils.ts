/**
 * Utility functions for survey calculations and validations
 */

import { BOOLEAN_COLUMN_IDS, type YouthAgeGroup } from "@/constants/surveyOptions";

/**
 * Calculate age from birthdate string
 * Returns null if invalid date or negative age
 */
export function calculateAgeFromBirthdate(birthdateString: string): number | null {
  if (!birthdateString) return null;

  try {
    const today = new Date();
    const birthDate = new Date(birthdateString);

    if (isNaN(birthDate.getTime())) return null;

    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();

    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }

    return age >= 0 ? age : null;
  } catch {
    return null;
  }
}

/**
 * Determine youth age group based on age
 */
export function getYouthAgeGroup(age: number): YouthAgeGroup {
  if (age <= 17) return "Child Youth";
  if (age >= 18 && age <= 24) return "Core Youth";
  return "Young Adult";
}

/**
 * Validate age is within acceptable survey range (14-30)
 */
export function isValidSurveyAge(age: number): boolean {
  return age >= 14 && age <= 30;
}

/**
 * Normalize whitespace in text input
 * Removes leading/trailing spaces and collapses multiple spaces to single space
 */
export function normalizeWhitespace(text: string): string {
  return String(text || "")
    .replace(/\s+/g, " ")
    .trim();
}

/**
 * Format full name from component parts
 * Handles optional middle name and suffix
 */
export function formatFullName(
  firstName: string,
  lastName: string,
  middleName?: string,
  suffix?: string
): string {
  const parts = [firstName, lastName];
  if (middleName?.trim()) parts.push(middleName);
  if (suffix?.trim()) parts.push(suffix);
  return parts.filter(Boolean).join(" ");
}

/**
 * Check if a column ID represents a boolean field
 */
export function isBooleanColumn(columnId: string): boolean {
  return BOOLEAN_COLUMN_IDS.includes(columnId as any);
}

/**
 * Convert boolean value to display string
 */
export function booleanToString(value: boolean | undefined | null): string {
  if (value === true) return "Yes";
  if (value === false) return "No";
  return "Not specified";
}

/**
 * Convert display string to boolean value
 */
export function stringToBoolean(value: string): boolean | undefined {
  if (value === "Yes" || value === "true") return true;
  if (value === "No" || value === "false") return false;
  return undefined;
}

/**
 * Truncate long text with ellipsis
 */
export function truncateText(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength - 3) + "...";
}

/**
 * Validate email format
 */
export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

/**
 * Validate phone number (basic check for digits and common formatting)
 */
export function isValidPhoneNumber(phone: string): boolean {
  const phoneRegex = /^[0-9+\-\s()]*$/;
  return phoneRegex.test(phone) && phone.replace(/\D/g, "").length >= 7;
}
