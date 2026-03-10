/**
 * localStorage abstraction for managing admin session and survey cache
 */

const ADMIN_PASSWORD_KEY = "admin_password";
const ADMIN_SURVEYS_KEY = "admin_surveys";

/**
 * Admin session storage interface
 */
export interface AdminSession {
  password: string;
}

/**
 * Get the stored admin password from localStorage
 */
export function getAdminPassword(): string | null {
  return localStorage.getItem(ADMIN_PASSWORD_KEY);
}

/**
 * Save admin password to localStorage
 */
export function saveAdminPassword(password: string): void {
  localStorage.setItem(ADMIN_PASSWORD_KEY, password);
}

/**
 * Clear admin password from localStorage
 */
export function clearAdminPassword(): void {
  localStorage.removeItem(ADMIN_PASSWORD_KEY);
}

/**
 * Check if admin session exists
 */
export function hasAdminSession(): boolean {
  return getAdminPassword() !== null;
}

/**
 * Get cached surveys from localStorage
 */
export function getCachedSurveys<T>(): T | null {
  try {
    const cached = localStorage.getItem(ADMIN_SURVEYS_KEY);
    return cached ? (JSON.parse(cached) as T) : null;
  } catch {
    clearAdminSurveyCache();
    return null;
  }
}

/**
 * Cache surveys to localStorage
 */
export function cacheSurveys<T>(surveys: T): void {
  try {
    localStorage.setItem(ADMIN_SURVEYS_KEY, JSON.stringify(surveys));
  } catch {
    console.warn("Failed to cache surveys to localStorage");
  }
}

/**
 * Clear cached surveys from localStorage
 */
export function clearAdminSurveyCache(): void {
  localStorage.removeItem(ADMIN_SURVEYS_KEY);
}

/**
 * Clear all admin session data
 */
export function clearAdminSession(): void {
  clearAdminPassword();
  clearAdminSurveyCache();
}
