import { z } from "zod";

export const SEX_OPTIONS = ["Male", "Female", "Non-binary"] as const;
export const CIVIL_STATUS_OPTIONS = ["Single", "Married", "Widowed", "Separated"] as const;
export const EDUCATION_OPTIONS = ["No Formal Education", "Elementary", "High School Level", "College"] as const;
export const YOUTH_CLASSIFICATION_OPTIONS = ["In School Youth", "Out of School Youth", "Working Youth"] as const;
export const WORK_STATUS_OPTIONS = ["Employed", "Unemployed", "Student"] as const;

export const insertSurveySchema = z.object({
  id: z.number().optional(),
  name: z.string(),
  age: z.number().optional(),
  youthAgeGroup: z.string(),
  registeredSkVoter: z.boolean().optional(),
  registeredNationalVoter: z.boolean().optional(),
  votedLastElection: z.boolean().optional(),
  attendedKkAssembly: z.boolean().optional(),
  civilStatus: z.string(),
  sex: z.string(),
  educationalBackground: z.string(),
  youthClassification: z.string(),
  workStatus: z.string(),
});

export type Survey = z.infer<typeof insertSurveySchema>;
export type CreateSurveyInput = Omit<Survey, "id">;

export { z };
