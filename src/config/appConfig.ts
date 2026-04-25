/**
 * Type-safe configuration and constants for the application
 */

export const APP_CONFIG = {
  /** Minimum age for youth survey participation */
  MIN_AGE: 14,

  /** Maximum age for youth survey participation */
  MAX_AGE: 30,

  /** Age group definitions */
  AGE_GROUPS: {
    CHILD_YOUTH: "Child Youth",
    CORE_YOUTH: "Core Youth",
    YOUNG_ADULT: "Young Adult",
  } as const,

  /** Age thresholds for youth groups */
  AGE_THRESHOLDS: {
    CHILD_YOUTH_MAX: 17,
    CORE_YOUTH_MIN: 18,
    CORE_YOUTH_MAX: 24,
    YOUNG_ADULT_MIN: 25,
  } as const,

  /** Application title and branding */
  BRANDING: {
    APP_NAME: "SK Profile",
    SUBTITLE: "Youth Data Management",
    ORGANIZATION: "Sangguniang Kabataan ng Barangay Rizal",
    LOCATION: "Lungsod ng Santiago",
  } as const,

  /** Toast notification durations (ms) */
  TOAST_DURATION: {
    SHORT: 600,
    DEFAULT: 3000,
    LONG: 5000,
  } as const,

  /** UI Component sizes */
  SIZES: {
    ICON_SM: "w-4 h-4",
    ICON_MD: "w-5 h-5",
    ICON_LG: "w-6 h-6",
  } as const,

  /** Export file names */
  EXPORTS: {
    EXCEL_FILE: "youth_surveys_filtered.xlsx",
    PDF_FILE: "youth_surveys_filtered.pdf",
  } as const,
} as const;

/**
 * Get youth age group based on age
 */
export function getYouthAgeGroup(age: number): string {
  if (age <= APP_CONFIG.AGE_THRESHOLDS.CHILD_YOUTH_MAX) {
    return APP_CONFIG.AGE_GROUPS.CHILD_YOUTH;
  } else if (age >= APP_CONFIG.AGE_THRESHOLDS.CORE_YOUTH_MIN && age <= APP_CONFIG.AGE_THRESHOLDS.CORE_YOUTH_MAX) {
    return APP_CONFIG.AGE_GROUPS.CORE_YOUTH;
  } else if (age >= APP_CONFIG.AGE_THRESHOLDS.YOUNG_ADULT_MIN) {
    return APP_CONFIG.AGE_GROUPS.YOUNG_ADULT;
  }
  return APP_CONFIG.AGE_GROUPS.YOUNG_ADULT;
}

/**
 * Validate age for survey participation
 */
export function isValidAge(age: number): { valid: boolean; message?: string } {
  if (age < APP_CONFIG.MIN_AGE) {
    return {
      valid: false,
      message: `You must be at least ${APP_CONFIG.MIN_AGE} years old to participate.`,
    };
  }
  if (age > APP_CONFIG.MAX_AGE) {
    return {
      valid: false,
      message: `This survey is for youth aged ${APP_CONFIG.MIN_AGE}-${APP_CONFIG.MAX_AGE} years old.`,
    };
  }
  return { valid: true };
}
