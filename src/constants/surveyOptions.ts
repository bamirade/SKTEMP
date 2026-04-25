/**
 * Survey options and enumerations
 * Centralized constants for all dropdown and select field options
 */

export const SEX_OPTIONS = ["Male", "Female"] as const;

export const CIVIL_STATUS_OPTIONS = [
  "Single",
  "Married",
  "Widowed",
  "Divorced",
  "Separated",
  "Annulled",
  "Unknown",
  "Live in",
] as const;

export const EDUCATION_OPTIONS = [
  "Elementary Level",
  "Elementary Graduate",
  "High School Level",
  "High School Graduate",
  "Vocational Graduate",
  "College Level",
  "College Graduate",
  "Masters Level",
  "Masters Graduate",
  "Doctorate Level",
  "Doctorate Graduate",
] as const;

export const YOUTH_CLASSIFICATION_OPTIONS = [
  "In School Youth",
  "Out of School Youth",
  "Working Youth",
  "Youth with Special Needs",
] as const;

export const SPECIAL_NEEDS_TYPE_OPTIONS = [
  "Person with Disability",
  "Children in Conflict with Law",
  "Indigenous People",
] as const;

export const WORK_STATUS_OPTIONS = [
  "Student",
  "Employed",
  "Unemployed",
  "Self-employed",
  "Currently Looking for a Job",
  "Not interested in looking for a Job",
] as const;

export const YOUTH_AGE_GROUPS = ["Child Youth", "Core Youth", "Young Adult"] as const;

export const KK_ASSEMBLY_FREQUENCY_OPTIONS = [
  "1-2 times",
  "3-4 times",
  "5 and above",
] as const;

export const KK_ASSEMBLY_REASON_NO_OPTIONS = [
  "There was no KK Assembly Meeting",
  "Not interested to attend",
] as const;

export const LOCATION_OPTIONS = [
  "Purok 1",
  "Purok 2",
  "Purok 3",
  "Purok 4",
  "Purok 5",
  "Purok 6",
  "Purok 7",
  "Others (Outside Rizal)",
] as const;

export const BOOLEAN_COLUMN_IDS = [
  "attendedKkAssembly",
  "registeredSkVoter",
  "registeredNationalVoter",
  "votedLastElection",
] as const;

/**
 * Type definitions for options
 */
export type SexOption = (typeof SEX_OPTIONS)[number];
export type CivilStatusOption = (typeof CIVIL_STATUS_OPTIONS)[number];
export type EducationOption = (typeof EDUCATION_OPTIONS)[number];
export type YouthClassificationOption = (typeof YOUTH_CLASSIFICATION_OPTIONS)[number];
export type SpecialNeedsOption = (typeof SPECIAL_NEEDS_TYPE_OPTIONS)[number];
export type WorkStatusOption = (typeof WORK_STATUS_OPTIONS)[number];
export type YouthAgeGroup = (typeof YOUTH_AGE_GROUPS)[number];
export type KkFrequencyOption = (typeof KK_ASSEMBLY_FREQUENCY_OPTIONS)[number];
export type KkReasonOption = (typeof KK_ASSEMBLY_REASON_NO_OPTIONS)[number];
export type LocationOption = (typeof LOCATION_OPTIONS)[number];

/**
 * Get options for a specific column
 */
export function getColumnOptions(columnId: string): readonly string[] {
  switch (columnId) {
    case "sex":
      return SEX_OPTIONS;
    case "civilStatus":
      return CIVIL_STATUS_OPTIONS;
    case "youthAgeGroup":
      return YOUTH_AGE_GROUPS;
    case "workStatus":
      return WORK_STATUS_OPTIONS;
    case "youthClassification":
      return YOUTH_CLASSIFICATION_OPTIONS;
    case "educationalBackground":
      return EDUCATION_OPTIONS;
    case "specialNeedsType":
      return SPECIAL_NEEDS_TYPE_OPTIONS;
    case "attendedKkAssembly":
    case "registeredSkVoter":
    case "registeredNationalVoter":
    case "votedLastElection":
      return ["Yes", "No"];
    case "kkAssemblyFrequency":
      return KK_ASSEMBLY_FREQUENCY_OPTIONS;
    case "kkAssemblyReasonNo":
      return KK_ASSEMBLY_REASON_NO_OPTIONS;
    case "location":
      return LOCATION_OPTIONS;
    default:
      return [];
  }
}

/**
 * Get friendly label for a column
 */
export const COLUMN_LABELS: Record<string, string> = {
  name: "Full Name",
  firstName: "First Name",
  lastName: "Last Name",
  age: "Age",
  youthAgeGroup: "Age Group",
  sex: "Sex",
  civilStatus: "Civil Status",
  workStatus: "Work Status",
  youthClassification: "Classification",
  educationalBackground: "Educational Background",
  specialNeedsType: "Special Needs Type",
  registeredSkVoter: "SK Voter Registration",
  registeredNationalVoter: "National Voter Registration",
  votedLastElection: "Voted Last Election",
  attendedKkAssembly: "KK Assembly",
  kkAssemblyFrequency: "KK Frequency",
  kkAssemblyReasonNo: "KK Reason (if No)",
  location: "Location",
  actions: "Actions",
};
