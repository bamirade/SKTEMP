/**
 * Error handling utilities
 * Provides consistent error handling patterns throughout the application
 */

import type { ApiErrorResponse } from "@/types";

/**
 * Custom application error class
 */
export class AppError extends Error {
  public readonly code: string;
  public readonly statusCode: number;
  public readonly details?: Record<string, unknown>;

  constructor(
    message: string,
    code: string = "UNKNOWN_ERROR",
    statusCode: number = 500,
    details?: Record<string, unknown>
  ) {
    super(message);
    this.name = "AppError";
    this.code = code;
    this.statusCode = statusCode;
    this.details = details;
  }

  /**
   * Convert error to API response format
   */
  toResponse(): ApiErrorResponse {
    return {
      status: this.statusCode,
      message: this.message,
      details: this.details,
    };
  }
}

/**
 * Validation error
 */
export class ValidationError extends AppError {
  constructor(message: string, details?: Record<string, unknown>) {
    super(message, "VALIDATION_ERROR", 400, details);
    this.name = "ValidationError";
  }
}

/**
 * Authentication error
 */
export class AuthenticationError extends AppError {
  constructor(message: string = "Authentication failed") {
    super(message, "AUTH_ERROR", 401);
    this.name = "AuthenticationError";
  }
}

/**
 * Authorization error
 */
export class AuthorizationError extends AppError {
  constructor(message: string = "Access denied") {
    super(message, "AUTHZ_ERROR", 403);
    this.name = "AuthorizationError";
  }
}

/**
 * Not found error
 */
export class NotFoundError extends AppError {
  constructor(message: string = "Resource not found") {
    super(message, "NOT_FOUND", 404);
    this.name = "NotFoundError";
  }
}

/**
 * Network/Request error
 */
export class NetworkError extends AppError {
  constructor(message: string = "Network request failed") {
    super(message, "NETWORK_ERROR", 0);
    this.name = "NetworkError";
  }
}

/**
 * Get user-friendly error message
 */
export function getUserFriendlyMessage(error: unknown): string {
  if (error instanceof ValidationError) {
    return "Please check your input and try again.";
  }
  if (error instanceof AuthenticationError) {
    return "Your session has expired. Please log in again.";
  }
  if (error instanceof AuthorizationError) {
    return "You do not have permission to perform this action.";
  }
  if (error instanceof NotFoundError) {
    return "The requested resource was not found.";
  }
  if (error instanceof NetworkError) {
    return "Network error. Please check your connection and try again.";
  }
  if (error instanceof AppError) {
    return error.message;
  }
  if (error instanceof Error) {
    return error.message || "An unexpected error occurred.";
  }
  return "An unexpected error occurred.";
}

/**
 * Parse error response from fetch
 */
export async function parseErrorResponse(response: Response): Promise<AppError> {
  try {
    const data = await response.json();
    const message = data.message || `HTTP ${response.status}`;

    switch (response.status) {
      case 400:
        return new ValidationError(message, data.details);
      case 401:
        return new AuthenticationError(message);
      case 403:
        return new AuthorizationError(message);
      case 404:
        return new NotFoundError(message);
      default:
        return new AppError(message, `HTTP_${response.status}`, response.status, data.details);
    }
  } catch {
    return new AppError(`HTTP ${response.status}`, `HTTP_${response.status}`, response.status);
  }
}

/**
 * Retry logic helper
 */
export async function retryAsync<T>(
  fn: () => Promise<T>,
  options: {
    maxRetries?: number;
    delayMs?: number;
    backoffMultiplier?: number;
  } = {}
): Promise<T> {
  const { maxRetries = 3, delayMs = 1000, backoffMultiplier = 2 } = options;

  let lastError: Error | undefined;
  let delay = delayMs;

  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error as Error;

      if (attempt < maxRetries - 1) {
        await new Promise((resolve) => setTimeout(resolve, delay));
        delay *= backoffMultiplier;
      }
    }
  }

  throw lastError || new Error("Max retries exceeded");
}

/**
 * Safe async wrapper for error handling
 */
export async function safeAsync<T>(
  fn: () => Promise<T>,
  fallback?: T
): Promise<T | typeof fallback> {
  try {
    return await fn();
  } catch (error) {
    console.error("Error in safeAsync:", error);
    return fallback;
  }
}
