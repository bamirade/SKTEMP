/**
 * Table utilities for survey data display
 * Includes column definitions, data extractors, and export helpers
 */

import type { Survey } from "@/shared/schema";
import { COLUMN_LABELS as COLUMN_LABEL_MAP } from "@/constants/surveyOptions";

/**
 * Extracts data from survey object for table display
 * Handles null/undefined values gracefully
 */
export const COLUMN_DATA_EXTRACTORS: Record<string, (survey: Survey) => string> = {
  name: (s) => `${s.firstName} ${s.lastName}`,
  firstName: (s) => s.firstName || "-",
  lastName: (s) => s.lastName || "-",
  age: (s) => (s.age ? String(s.age) : "-"),
  youthAgeGroup: (s) => s.youthAgeGroup || "-",
  sex: (s) => s.sex || "-",
  civilStatus: (s) => s.civilStatus || "-",
  workStatus: (s) => s.workStatus || "-",
  youthClassification: (s) => s.youthClassification || "-",
  educationalBackground: (s) => s.educationalBackground || "-",
  specialNeedsType: (s) => s.specialNeedsType || "-",
  registeredSkVoter: (s) => (s.registeredSkVoter ? "Yes" : "No"),
  registeredNationalVoter: (s) => (s.registeredNationalVoter ? "Yes" : "No"),
  votedLastElection: (s) => (s.votedLastElection ? "Yes" : "No"),
  attendedKkAssembly: (s) => (s.attendedKkAssembly ? "Yes" : "No"),
  kkAssemblyFrequency: (s) =>
    s.attendedKkAssembly ? (s.kkAssemblyFrequency || "-") : "-",
  kkAssemblyReasonNo: (s) =>
    !s.attendedKkAssembly ? (s.kkAssemblyReasonNo || "-") : "-",
  location: (s) => s.location || "-",
};

/**
 * Re-export column labels from constants
 */
export const COLUMN_LABELS = COLUMN_LABEL_MAP;

/**
 * Defines which columns should be visible by default in the table
 */
export const DEFAULT_VISIBLE_COLUMNS = new Set([
  "name",
  "sex",
  "civilStatus",
  "youthClassification",
  "workStatus",
  "attendedKkAssembly",
  "actions",
]);

/**
 * Sortable columns with their display labels
 */
export const SORTABLE_COLUMNS = [
  { id: "firstName", label: "First Name" },
  { id: "lastName", label: "Last Name" },
  { id: "age", label: "Age" },
  { id: "youthAgeGroup", label: "Age Group" },
  { id: "sex", label: "Sex" },
  { id: "civilStatus", label: "Status" },
  { id: "workStatus", label: "Work" },
  { id: "youthClassification", label: "Classification" },
  { id: "educationalBackground", label: "Education" },
  { id: "specialNeedsType", label: "Special Needs" },
  { id: "registeredSkVoter", label: "SK Voter" },
  { id: "registeredNationalVoter", label: "National Voter" },
  { id: "votedLastElection", label: "Voted" },
  { id: "location", label: "Location" },
] as const;

/**
 * Get page size options for table pagination
 */
export const PAGE_SIZE_OPTIONS = [10, 20, 30, 50, 100] as const;

/**
 * Organization info for PDF exports
 */
export const ORGANIZATION_INFO = {
  name: "Sangguniang Kabataan ng Barangay Rizal",
  city: "Lungsod ng Santiago",
  color: { r: 201, g: 24, b: 42 },
  logoUrl: "/favicon.png",
} as const;

/**
 * PDF export configuration
 */
export const PDF_CONFIG = {
  filename: "youth_surveys_filtered.pdf",
  pageMargin: 14,
  headerHeight: 40,
  footerHeight: 20,
  minY: 35,
} as const;
