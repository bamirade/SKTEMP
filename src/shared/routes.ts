import { insertSurveySchema } from "./schema";
import { z } from "zod";

export type CreateSurveyInput = z.infer<typeof insertSurveySchema>;

function replaceParams(path: string, params?: Record<string, string | number>) {
  if (!params) return path;
  return Object.entries(params).reduce((p, [k, v]) => p.replace(`:${k}`, String(v)), path);
}

export const api = {
  surveys: {
    list: {
      path: "/api/surveys",
      responses: {
        200: z.array(insertSurveySchema),
      },
    },
    get: {
      path: "/api/surveys/:id",
      responses: {
        200: insertSurveySchema,
        404: z.any(),
      },
    },
    create: {
      path: "/api/surveys",
      method: "POST",
      responses: {
        201: insertSurveySchema,
        400: z.object({ message: z.string() }),
      },
    },
    update: {
      path: "/api/surveys/:id",
      method: "PUT",
      responses: {
        200: insertSurveySchema,
        400: z.object({ message: z.string() }),
        404: z.any(),
      },
    },
    delete: {
      path: "/api/surveys/:id",
      method: "DELETE",
      responses: {
        200: z.any(),
        404: z.any(),
      },
    },
  },
};

export function buildUrl(path: string, params?: Record<string, string | number>) {
  return replaceParams(path, params);
}
