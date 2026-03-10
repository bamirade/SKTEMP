import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api, type CreateSurveyInput } from "@shared/routes";
import { supabase } from "@/lib/supabase";
import { transformApiSurveyToSurvey, transformApiSurveysToSurveys, type ApiSurveyResponse } from "@/lib/transformSurveyData";
import type { Survey } from "@/shared/schema";
import { getAdminPassword, clearAdminPassword } from "@/lib/adminStorage";

/**
 * Custom error class for API errors
 */
class SurveyError extends Error {
  status: number;
  code?: string;

  constructor(
    status: number,
    message: string,
    code?: string
  ) {
    super(message);
    this.name = "SurveyError";
    this.status = status;
    this.code = code;
  }
}

/**
 * Hook to fetch all surveys
 * Attempts admin endpoint first if authenticated, falls back to public endpoint
 */
export function useSurveys() {
  return useQuery({
    queryKey: [api.surveys.list.path],
    queryFn: async (): Promise<Survey[]> => {
      const adminPassword = getAdminPassword();

      if (adminPassword) {
        return fetchAdminSurveys(adminPassword);
      } else {
        return fetchPublicSurveys();
      }
    },
  });
}

/**
 * Hook to fetch a single survey by ID
 */
export function useSurvey(id: number) {
  return useQuery({
    queryKey: [api.surveys.get.path, id],
    queryFn: async (): Promise<Survey | null> => {
      const { data, error } = await supabase
        .from("surveys")
        .select()
        .eq("id", id)
        .single();

      if (error) {
        if (error.code === "PGRST116") return null; // Not found
        throw new SurveyError(500, error.message || "Failed to fetch survey");
      }

      return transformApiSurveyToSurvey(data as ApiSurveyResponse);
    },
  });
}

/**
 * Hook to create a new survey
 */
export function useCreateSurvey() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: CreateSurveyInput): Promise<Survey> => {
      const response = await createSurveyInSupabase(data);
      return response;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [api.surveys.list.path] });
    },
  });
}

/**
 * Hook to delete a survey
 */
export function useDeleteSurvey() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: number): Promise<void> => {
      const adminPassword = getAdminPassword();

      if (adminPassword) {
        await deleteAdminSurvey(id, adminPassword);
      } else {
        await deletePublicSurvey(id);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [api.surveys.list.path] });
    },
  });
}

/**
 * Hook to update a survey
 */
export function useUpdateSurvey() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, data }: { id: number; data: Partial<CreateSurveyInput> }): Promise<Survey> => {
      const adminPassword = getAdminPassword();

      if (adminPassword) {
        return updateAdminSurvey(id, data, adminPassword);
      } else {
        return updatePublicSurvey(id, data);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [api.surveys.list.path] });
    },
  });
}

/**
 * Fetch surveys from admin endpoint
 */
async function fetchAdminSurveys(token: string): Promise<Survey[]> {
  const functionUrl = import.meta.env.VITE_EDGE_FUNCTION_URL;
  if (!functionUrl) {
    throw new SurveyError(500, "Function URL not configured");
  }

  const response = await fetch(`${functionUrl}/functions/v1/dynamic-responder/admin/surveys`, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
  });

  if (!response.ok) {
    if (response.status === 401) {
      clearAdminPassword();
      throw new SurveyError(401, "Admin session expired. Please login again.");
    }
    throw new SurveyError(response.status, "Failed to fetch admin surveys");
  }

  const data = (await response.json()) as ApiSurveyResponse[];
  return transformApiSurveysToSurveys(data);
}

/**
 * Fetch surveys from public endpoint
 */
async function fetchPublicSurveys(): Promise<Survey[]> {
  const { data, error } = await supabase.from("surveys").select();

  if (error) {
    throw new SurveyError(500, error.message || "Failed to fetch surveys");
  }

  return transformApiSurveysToSurveys((data || []) as ApiSurveyResponse[]);
}

/**
 * Create survey in Supabase
 */
async function createSurveyInSupabase(data: CreateSurveyInput): Promise<Survey> {
  const dbData = convertToDatabaseFormat(data);

  const response = await fetch(
    `${import.meta.env.VITE_SUPABASE_URL}/rest/v1/surveys`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        apikey: import.meta.env.VITE_SUPABASE_ANON_KEY,
      },
      body: JSON.stringify(dbData),
    }
  );

  if (!response.ok) {
    const errorMessage = await parseErrorResponse(response);
    throw new SurveyError(response.status, errorMessage);
  }

  const text = await response.text();
  if (!text) {
    return data as Survey;
  }

  const inserted = JSON.parse(text) as ApiSurveyResponse[];
  return transformApiSurveyToSurvey(inserted[0]);
}

/**
 * Delete survey from admin endpoint
 */
async function deleteAdminSurvey(id: number, token: string): Promise<void> {
  const functionUrl = import.meta.env.VITE_EDGE_FUNCTION_URL;
  if (!functionUrl) {
    throw new SurveyError(500, "Function URL not configured");
  }

  const response = await fetch(
    `${functionUrl}/functions/v1/dynamic-responder/admin/surveys/${id}`,
    {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    }
  );

  if (!response.ok) {
    throw new SurveyError(response.status, `Failed to delete survey: ${response.statusText}`);
  }
}

/**
 * Delete survey from public endpoint
 */
async function deletePublicSurvey(id: number): Promise<void> {
  const { error } = await supabase.from("surveys").delete().eq("id", id);

  if (error) {
    throw new SurveyError(500, error.message || "Failed to delete survey");
  }
}

/**
 * Update survey on admin endpoint
 */
async function updateAdminSurvey(
  id: number,
  data: Partial<CreateSurveyInput>,
  token: string
): Promise<Survey> {
  const dbData = convertToDatabaseFormat(data);
  const functionUrl = import.meta.env.VITE_EDGE_FUNCTION_URL;
  if (!functionUrl) {
    throw new SurveyError(500, "Function URL not configured");
  }

  const response = await fetch(`${functionUrl}/functions/v1/dynamic-responder/admin/surveys/${id}`, {
    method: "PATCH",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(dbData),
  });

  if (!response.ok) {
    throw new SurveyError(response.status, `Failed to update survey: ${response.statusText}`);
  }

  const text = await response.text();
  if (!text) return data as Survey;

  const parsed = JSON.parse(text) as ApiSurveyResponse | ApiSurveyResponse[];
  const row = Array.isArray(parsed) ? parsed[0] : parsed;
  return transformApiSurveyToSurvey(row);
}

/**
 * Update survey on public endpoint
 */
async function updatePublicSurvey(
  id: number,
  data: Partial<CreateSurveyInput>
): Promise<Survey> {
  const dbData = convertToDatabaseFormat(data);

  const { data: updated, error } = await supabase
    .from("surveys")
    .update(dbData)
    .eq("id", id)
    .select()
    .single();

  if (error) {
    throw new SurveyError(500, error.message || "Failed to update survey");
  }

  return transformApiSurveyToSurvey(updated as ApiSurveyResponse);
}

/**
 * Convert survey data from camelCase to snake_case for database
 */
function convertToDatabaseFormat(data: CreateSurveyInput | Partial<CreateSurveyInput>): Record<string, unknown> {
  const mapping: Record<string, string> = {
    firstName: "first_name",
    lastName: "last_name",
    middleName: "middle_name",
    suffix: "suffix",
    birthdate: "birthdate",
    email: "email",
    contactNumber: "contact_number",
    age: "age",
    youthAgeGroup: "youth_age_group",
    registeredSkVoter: "registered_sk_voter",
    registeredNationalVoter: "registered_national_voter",
    votedLastElection: "voted_last_election",
    attendedKkAssembly: "attended_kk_assembly",
    kkAssemblyFrequency: "kk_assembly_frequency",
    kkAssemblyReasonNo: "kk_assembly_reason_no",
    civilStatus: "civil_status",
    sex: "sex",
    educationalBackground: "educational_background",
    youthClassification: "youth_classification",
    specialNeedsType: "special_needs_type",
    workStatus: "work_status",
    location: "location",
    otherLocation: "other_location",
  };

  const dbData: Record<string, unknown> = {};

  Object.entries(data).forEach(([key, value]) => {
    const dbKey = mapping[key] || key;
    const processedValue = value === undefined || value === "" ? null : value;
    dbData[dbKey] = processedValue;
  });

  // Handle conditional nullification
  if (data.attendedKkAssembly === true) {
    dbData.kk_assembly_reason_no = null;
  }
  if (data.attendedKkAssembly === false) {
    dbData.kk_assembly_frequency = null;
  }

  return dbData;
}

/**
 * Parse error response from API
 */
async function parseErrorResponse(response: Response): Promise<string> {
  const responseText = await response.text();

  // Handle duplicate constraint error
  if (responseText.includes("duplicate key value violates unique constraint")) {
    return "A survey for this person (same name and birthdate) has already been submitted. Please check or contact support if you believe this is an error.";
  }

  try {
    const error = JSON.parse(responseText) as { message?: string };
    return error.message || `Failed to create survey: ${response.status}`;
  } catch {
    return responseText || `Failed to create survey: ${response.status}`;
  }
}

