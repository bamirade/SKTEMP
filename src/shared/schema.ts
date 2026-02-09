import { z } from "zod";

export const SEX_OPTIONS = ["Male", "Female", "Non-binary"] as const;
export const CIVIL_STATUS_OPTIONS = ["Single", "Married", "Widowed", "Separated"] as const;
export const EDUCATION_OPTIONS = ["No Formal Education", "Elementary", "High School Level", "College"] as const;
export const YOUTH_CLASSIFICATION_OPTIONS = ["In School Youth", "Out of School Youth", "Working Youth"] as const;
export const WORK_STATUS_OPTIONS = ["Employed", "Unemployed", "Student"] as const;
export const KK_ASSEMBLY_FREQUENCY_OPTIONS = ["1-2 times", "3-4 times", "5 and above"] as const;
export const KK_ASSEMBLY_REASON_NO_OPTIONS = ["There was no KK Assembly Meeting", "Not interested to attend"] as const;

export const insertSurveySchema = z.object({
  id: z.number().optional(),
  name: z.string(),
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
  workStatus: z.string(),
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
);

export type Survey = z.infer<typeof insertSurveySchema>;
export type CreateSurveyInput = Omit<Survey, "id">;

export { z };
