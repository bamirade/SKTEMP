/**
 * Centralized API configuration and URL management
 */

/**
 * Get the base API URL from environment variables
 */
function getFormattedApiUrl(): string {
  const functionUrl = import.meta.env.VITE_EDGE_FUNCTION_URL;
  if (!functionUrl) {
    throw new Error("VITE_EDGE_FUNCTION_URL is not defined");
  }
  return functionUrl.replace(/\/$/, "");
}

/**
 * Get the admin surveys endpoint URL
 */
export function getAdminSurveysUrl(): string {
  const baseUrl = getFormattedApiUrl();
  return `${baseUrl}/functions/v1/dynamic-responder/admin/surveys`;
}

/**
 * Get the delete survey endpoint URL
 */
export function getDeleteSurveyUrl(surveyId: number): string {
  const baseUrl = getFormattedApiUrl();
  return `${baseUrl}/functions/v1/dynamic-responder/admin/surveys/${surveyId}`;
}

/**
 * Create authorization headers for admin requests
 */
export function createAuthHeaders(token: string): HeadersInit {
  return {
    Authorization: `Bearer ${token}`,
    "Content-Type": "application/json",
  };
}

/**
 * API error handler
 */
export class ApiError extends Error {
  status: number;
  details?: unknown;

  constructor(
    status: number,
    message: string,
    details?: unknown
  ) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.details = details;
  }
}

/**
 * Make an authenticated API request
 */
export async function makeAuthenticatedRequest<T>(
  url: string,
  token: string,
  options?: RequestInit
): Promise<T> {
  const response = await fetch(url, {
    ...options,
    headers: createAuthHeaders(token),
  });

  if (!response.ok) {
    const message = `API request failed with status ${response.status}`;
    throw new ApiError(response.status, message);
  }

  try {
    return (await response.json()) as T;
  } catch {
    throw new ApiError(response.status, "Failed to parse API response");
  }
}
