import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api, buildUrl, type CreateSurveyInput } from "@shared/routes";

const LOCAL_KEY = "local_surveys";

function readLocalSurveys() {
  try {
    const raw = localStorage.getItem(LOCAL_KEY) || "[]";
    return JSON.parse(raw) as CreateSurveyInput[];
  } catch {
    return [];
  }
}

function writeLocalSurveys(surveys: CreateSurveyInput[]) {
  try {
    localStorage.setItem(LOCAL_KEY, JSON.stringify(surveys));
  } catch {
    // ignore
  }
}

export function useSurveys() {
  return useQuery({
    queryKey: [api.surveys.list.path],
    queryFn: async () => {
      try {
        const res = await fetch(api.surveys.list.path, { credentials: "include" });
        if (!res.ok) throw new Error("Failed to fetch surveys");
        return api.surveys.list.responses[200].parse(await res.json());
      } catch (err) {
        // Fallback to localStorage when backend is unavailable
        return readLocalSurveys();
      }
    },
  });
}

export function useSurvey(id: number) {
  return useQuery({
    queryKey: [api.surveys.get.path, id],
    queryFn: async () => {
      const url = buildUrl(api.surveys.get.path, { id });
      try {
        const res = await fetch(url, { credentials: "include" });
        if (res.status === 404) return null;
        if (!res.ok) throw new Error("Failed to fetch survey");
        return api.surveys.get.responses[200].parse(await res.json());
      } catch (err) {
        const local = readLocalSurveys();
        return local.find((s) => (s as any).id === id) ?? null;
      }
    },
  });
}

export function useCreateSurvey() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: CreateSurveyInput) => {
      try {
        const res = await fetch(api.surveys.create.path, {
          method: api.surveys.create.method,
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(data),
          credentials: "include",
        });

        if (!res.ok) {
          if (res.status === 400) {
            const error = api.surveys.create.responses[400].parse(await res.json());
            throw new Error(error.message);
          }
          throw new Error("Failed to create survey");
        }
        return api.surveys.create.responses[201].parse(await res.json());
      } catch (err) {
        // Backend not available — persist locally and return created object
        const local = readLocalSurveys();
        const created = { ...(data as any), id: Date.now() } as CreateSurveyInput & { id: number };
        local.unshift(created as any);
        writeLocalSurveys(local as any);
        return created as any;
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
      const url = buildUrl(api.surveys.delete.path, { id });
      try {
        const res = await fetch(url, {
          method: api.surveys.delete.method,
          credentials: "include",
        });

        if (!res.ok) {
          if (res.status === 404) throw new Error("Survey not found");
          throw new Error("Failed to delete survey");
        }
        return;
      } catch (err) {
        // Fallback: remove from localStorage
        const local = readLocalSurveys();
        const filtered = local.filter((s: any) => (s as any).id !== id);
        writeLocalSurveys(filtered);
        return;
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
      const url = buildUrl(api.surveys.update.path, { id });
      try {
        const res = await fetch(url, {
          method: (api as any).surveys.update.method,
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(data),
          credentials: "include",
        });

        if (!res.ok) {
          if (res.status === 400) {
            const error = (api as any).surveys.update.responses[400].parse(await res.json());
            throw new Error(error.message);
          }
          if (res.status === 404) throw new Error("Survey not found");
          throw new Error("Failed to update survey");
        }
        return (api as any).surveys.update.responses[200].parse(await res.json());
      } catch (err) {
        // Fallback: update localStorage
        const local = readLocalSurveys();
        const updated = local.map((s: any) => (s.id === id ? { ...s, ...(data as any) } : s));
        writeLocalSurveys(updated as any);
        const found = updated.find((s: any) => s.id === id) ?? null;
        return found;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [api.surveys.list.path] });
    },
  });
}
