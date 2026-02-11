import type { Survey } from "@/shared/schema";

export interface ApiSurveyResponse {
  id: number;
  first_name: string;
  last_name: string;
  middle_name?: string | null;
  suffix?: string | null;
  birthdate?: string | null;
  email?: string | null;
  contact_number?: string | null;
  age?: number | null;
  youth_age_group: string;
  registered_sk_voter?: boolean | null;
  registered_national_voter?: boolean | null;
  voted_last_election?: boolean | null;
  attended_kk_assembly?: boolean | null;
  kk_assembly_frequency?: string | null;
  kk_assembly_reason_no?: string | null;
  civil_status: string;
  sex: string;
  educational_background: string;
  youth_classification: string;
  special_needs_type?: string | null;
  work_status: string;
  location: string;
  other_location?: string | null;
  created_at?: string;
  updated_at?: string;
}

export function transformApiSurveyToSurvey(apiData: ApiSurveyResponse): Survey {
  return {
    id: apiData.id,
    firstName: apiData.first_name,
    lastName: apiData.last_name,
    middleName: apiData.middle_name || "",
    suffix: apiData.suffix || "",
    birthdate: apiData.birthdate || "",
    email: apiData.email || "",
    contactNumber: apiData.contact_number || "",
    age: apiData.age || undefined,
    youthAgeGroup: apiData.youth_age_group,
    registeredSkVoter: apiData.registered_sk_voter ?? false,
    registeredNationalVoter: apiData.registered_national_voter ?? false,
    votedLastElection: apiData.voted_last_election ?? false,
    attendedKkAssembly: apiData.attended_kk_assembly ?? false,
    kkAssemblyFrequency: apiData.kk_assembly_frequency || "",
    kkAssemblyReasonNo: apiData.kk_assembly_reason_no || "",
    civilStatus: apiData.civil_status,
    sex: apiData.sex,
    educationalBackground: apiData.educational_background,
    youthClassification: apiData.youth_classification,
    specialNeedsType: apiData.special_needs_type || "",
    workStatus: apiData.work_status,
    location: apiData.location,
    otherLocation: apiData.other_location || "",
  };
}

export function transformApiSurveysToSurveys(apiDataArray: ApiSurveyResponse[]): Survey[] {
  return apiDataArray.map(transformApiSurveyToSurvey);
}
