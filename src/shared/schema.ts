import { z } from "zod";

export const SEX_OPTIONS = ["Male", "Female"] as const;
export const CIVIL_STATUS_OPTIONS = ["Single", "Married", "Widowed", "Divorced", "Separated", "Annulled", "Unknown", "Live in"] as const;
export const EDUCATION_OPTIONS = ["Elementary Level", "Elementary Graduate", "High School Level", "High School Graduate", "Vocational Graduate", "College Level", "College Graduate", "Masters Level", "Masters Graduate", "Doctorate Level", "Doctorate Graduate"] as const;
export const YOUTH_CLASSIFICATION_OPTIONS = ["In School Youth", "Out of School Youth", "Working Youth", "Youth with Special Needs"] as const;
export const SPECIAL_NEEDS_TYPE_OPTIONS = ["Person with Disability", "Children in Conflict with Law", "Indigenous People"] as const;
export const WORK_STATUS_OPTIONS = ["Student", "Employed", "Unemployed", "Self-employed", "Currently Looking for a Job", "Not interested in looking for a Job"] as const;
export const KK_ASSEMBLY_FREQUENCY_OPTIONS = ["1-2 times", "3-4 times", "5 and above"] as const;
export const KK_ASSEMBLY_REASON_NO_OPTIONS = ["There was no KK Assembly Meeting", "Not interested to attend"] as const;
export const LOCATION_OPTIONS = ["Purok 1", "Purok 2", "Purok 3", "Purok 4", "Purok 5", "Purok 6", "Purok 7", "Others (Outside Rizal)"] as const;

export const insertSurveySchema = z.object({
  id: z.number().optional(),
  firstName: z.string().min(2, "First name must be at least 2 characters").max(50, "First name must be at most 50 characters"),
  lastName: z.string().min(2, "Last name must be at least 2 characters").max(50, "Last name must be at most 50 characters"),
  middleName: z.string().max(50, "Middle name must be at most 50 characters").optional().or(z.literal("")),
  suffix: z.string().max(20, "Suffix must be at most 20 characters").optional().or(z.literal("")),
  birthdate: z.string().optional().or(z.literal("")),
  email: z.string().email("Invalid email address").optional().or(z.literal("")),
  contactNumber: z.string().regex(/^[0-9+\-\s()]*$/, "Invalid contact number").max(20, "Contact number must be at most 20 characters").optional().or(z.literal("")),
  age: z.number().optional(),
  youthAgeGroup: z.string(),
  registeredSkVoter: z.boolean().optional(),
  registeredNationalVoter: z.boolean().optional(),
  votedLastElection: z.boolean().optional(),
  attendedKkAssembly: z.boolean().optional(),
  kkAssemblyFrequency: z.string().optional(),
  kkAssemblyReasonNo: z.string().optional(),
  civilStatus: z.string(),
  sex: z.string(),
  educationalBackground: z.string(),
  youthClassification: z.string(),
  specialNeedsType: z.string().optional().or(z.literal("")),
  workStatus: z.string(),
  location: z.string(),
  otherLocation: z.string().max(100, "Location must be at most 100 characters").optional().or(z.literal("")),
}).refine(
  (data) => {
    if (data.attendedKkAssembly === true) {
      return !!data.kkAssemblyFrequency;
    }
    return true;
  },
  {
    message: "How many times did you attend is required",
    path: ["kkAssemblyFrequency"],
  }
).refine(
  (data) => {
    if (data.attendedKkAssembly === false) {
      return !!data.kkAssemblyReasonNo;
    }
    return true;
  },
  {
    message: "Reason for not attending is required",
    path: ["kkAssemblyReasonNo"],
  }
).refine(
  (data) => {
    if (data.location === "Others (Outside Rizal)") {
      return !!data.otherLocation && data.otherLocation.trim().length > 0;
    }
    return true;
  },
  {
    message: "Please specify your location",
    path: ["otherLocation"],
  }
).refine(
  (data) => {
    if (data.youthClassification === "Youth with Special Needs") {
      return !!data.specialNeedsType && data.specialNeedsType.trim().length > 0;
    }
    return true;
  },
  {
    message: "Special needs type is required",
    path: ["specialNeedsType"],
  }
);

export type Survey = z.infer<typeof insertSurveySchema>;
export type CreateSurveyInput = Omit<Survey, "id">;

export { z };
