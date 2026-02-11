import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api, type CreateSurveyInput } from "@shared/routes";
import { supabase } from "@/lib/supabase";
import { transformApiSurveyToSurvey, type ApiSurveyResponse } from "@/lib/transformSurveyData";

export function useSurveys() {
  return useQuery({
    queryKey: [api.surveys.list.path],
    queryFn: async () => {
      // Check if admin is authenticated
      const adminPassword = localStorage.getItem('admin_password');

      if (adminPassword) {
        // Use edge function for authenticated admin requests
        const functionUrl = import.meta.env.VITE_EDGE_FUNCTION_URL;

        const response = await fetch(`${functionUrl}/functions/v1/dynamic-responder/admin/surveys`, {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${adminPassword}`,
            'Content-Type': 'application/json',
          },
        });

        if (response.ok) {
          const data = await response.json();
          return data as any;
        } else {
          // If admin auth fails, clear stored password and fallback to regular query
          localStorage.removeItem('admin_password');
          throw new Error('Admin session expired. Please login again.');
        }
      } else {
        // Regular Supabase query for non-admin access
        const { data, error } = await supabase.from("surveys").select();
        if (error) throw new Error(error.message || "Failed to fetch surveys");
        return data as any;
      }
    },
  });
}

export function useSurvey(id: number) {
  return useQuery({
    queryKey: [api.surveys.get.path, id],
    queryFn: async () => {
      const { data, error } = await supabase.from("surveys").select().eq("id", id).single();
      if (error) {
        if (error.code === "PGRST116") return null; // Not found
        throw new Error(error.message || "Failed to fetch survey");
      }
      return data as any;
    },
  });
}

export function useCreateSurvey() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: CreateSurveyInput) => {
      try {
        // Convert camelCase to snake_case for Supabase
        const dbData = {
          first_name: data.firstName,
          last_name: data.lastName,
          middle_name: data.middleName,
          suffix: data.suffix,
          birthdate: data.birthdate,
          email: data.email,
          contact_number: data.contactNumber,
          age: data.age,
          youth_age_group: data.youthAgeGroup,
          registered_sk_voter: data.registeredSkVoter,
          registered_national_voter: data.registeredNationalVoter,
          voted_last_election: data.votedLastElection,
          attended_kk_assembly: data.attendedKkAssembly,
          kk_assembly_frequency: data.kkAssemblyFrequency || null,
          kk_assembly_reason_no: data.kkAssemblyReasonNo || null,
          civil_status: data.civilStatus,
          sex: data.sex,
          educational_background: data.educationalBackground,
          youth_classification: data.youthClassification,
          special_needs_type: data.specialNeedsType || null,
          work_status: data.workStatus,
          location: data.location,
          other_location: data.otherLocation || null,
        };

        // Use fetch with explicit apikey header (matching Postman format)
        const res = await fetch(
          `${import.meta.env.VITE_SUPABASE_URL}/rest/v1/surveys`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              "apikey": import.meta.env.VITE_SUPABASE_ANON_KEY,
            },
            body: JSON.stringify(dbData),
          }
        );

        if (!res.ok) {
          const responseText = await res.text();
          let errorMessage = `Failed to create survey: ${res.status}`;

          try {
            const error = JSON.parse(responseText);
            errorMessage = error.message || errorMessage;

            // Handle duplicate constraint error
            if (error.message?.includes("duplicate key value violates unique constraint")) {
              errorMessage = "A survey for this person (same name and birthdate) has already been submitted. Please check or contact support if you believe this is an error.";
            }
          } catch {
            // If response isn't JSON, use the plain text
            if (responseText) {
              errorMessage = responseText;
            }
          }

          throw new Error(errorMessage);
        }

        // Supabase returns array of inserted rows, return the first or the data itself
        const text = await res.text();
        if (!text) {
          // Success with no body content, return the original data
          return data as any;
        }
        const inserted = JSON.parse(text);
        return Array.isArray(inserted) ? inserted[0] : inserted;
      } catch (err) {
        throw err;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [api.surveys.list.path] });
    },
  });
}

export function useDeleteSurvey() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: number) => {
      const adminPassword = localStorage.getItem('admin_password');

      if (adminPassword) {
        // Use edge function for authenticated admin requests
        const functionUrl = import.meta.env.VITE_EDGE_FUNCTION_URL;

        const response = await fetch(`${functionUrl}/functions/v1/dynamic-responder/admin/surveys/${id}`, {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${adminPassword}`,
            'Content-Type': 'application/json',
          },
        });

        if (!response.ok) {
          throw new Error(`Failed to delete survey: ${response.statusText}`);
        }
        return;
      } else {
        // Regular Supabase delete for non-admin access
        const { error } = await supabase.from("surveys").delete().eq("id", id);
        if (error) throw new Error(error.message || "Failed to delete survey");
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [api.surveys.list.path] });
    },
  });
}

export function useUpdateSurvey() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, data }: { id: number; data: Partial<CreateSurveyInput> }) => {
      const adminPassword = localStorage.getItem('admin_password');

      // Convert camelCase to snake_case for Supabase
      const dbData = Object.entries(data).reduce((acc, [key, value]) => {
        const snakeKey = key.replace(/[A-Z]/g, (m) => `_${m.toLowerCase()}`);
        acc[snakeKey] = value;
        return acc;
      }, {} as Record<string, any>);

      const nullableKeys = new Set([
        "middle_name",
        "suffix",
        "birthdate",
        "email",
        "contact_number",
        "kk_assembly_frequency",
        "kk_assembly_reason_no",
        "special_needs_type",
        "other_location",
      ]);

      Object.keys(dbData).forEach((key) => {
        const value = dbData[key];
        if ((value === undefined || value === "") && nullableKeys.has(key)) {
          dbData[key] = null;
        }
      });

      if (dbData.attended_kk_assembly === true) {
        dbData.kk_assembly_reason_no = null;
      }
      if (dbData.attended_kk_assembly === false) {
        dbData.kk_assembly_frequency = null;
      }

      if (adminPassword) {
        const functionUrl = import.meta.env.VITE_EDGE_FUNCTION_URL;
        const normalizedBaseUrl = functionUrl.replace(/\/$/, "");
        const adminSurveysUrl = normalizedBaseUrl.endsWith("/admin/surveys")
          ? normalizedBaseUrl
          : `${normalizedBaseUrl}/admin/surveys`;

        const response = await fetch(`${adminSurveysUrl}/${id}`, {
          method: "PATCH",
          headers: {
            'Authorization': `Bearer ${adminPassword}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(dbData),
        });

        if (!response.ok) {
          throw new Error(`Failed to update survey: ${response.statusText}`);
        }

        const text = await response.text();
        if (!text) return data as any;
        try {
          const parsed = JSON.parse(text) as ApiSurveyResponse | ApiSurveyResponse[];
          const row = Array.isArray(parsed) ? parsed[0] : parsed;
          if (row && typeof row === "object" && "first_name" in row) {
            return transformApiSurveyToSurvey(row as ApiSurveyResponse) as any;
          }
          return parsed as any;
        } catch {
          return data as any;
        }
      }

      const { data: updated, error } = await supabase
        .from("surveys")
        .update(dbData)
        .eq("id", id)
        .select()
        .single();

      if (error) throw new Error(error.message || "Failed to update survey");
      return updated as any;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [api.surveys.list.path] });
    },
  });
}
