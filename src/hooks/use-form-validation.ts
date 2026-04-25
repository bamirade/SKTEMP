/**
 * Custom hook for form validation
 * Provides consistent form validation and error handling
 */

import { useState, useCallback } from "react";
import type { FieldValues, Path } from "react-hook-form";

interface UseFormValidationOptions {
  validateOnChange?: boolean;
  validateOnBlur?: boolean;
}

/**
 * Hook for managing form validation state and errors
 */
export function useFormValidation<T extends FieldValues>(
  _options: UseFormValidationOptions = {}
) {
  const [validationErrors, setValidationErrors] = useState<Partial<Record<string, string>>>({});
  const [touched, setTouched] = useState<Partial<Record<string, boolean>>>({});

  const resetValidation = useCallback(() => {
    setValidationErrors({});
    setTouched({});
  }, []);

  const setFieldError = useCallback((field: Path<T>, message: string) => {
    setValidationErrors((prev) => ({
      ...prev,
      [field]: message,
    }));
  }, []);

  const clearFieldError = useCallback((field: Path<T>) => {
    setValidationErrors((prev) => {
      const newErrors = { ...prev };
      delete newErrors[field as string];
      return newErrors;
    });
  }, []);

  const markFieldTouched = useCallback((field: Path<T>) => {
    setTouched((prev) => ({
      ...prev,
      [field]: true,
    }));
  }, []);

  return {
    validationErrors,
    touched,
    resetValidation,
    setFieldError,
    clearFieldError,
    markFieldTouched,
  };
}

/**
 * Hook for async form submission with loading state
 */
export function useAsyncFormSubmit() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const submit = useCallback(
    async <T,>(
      onSubmit: () => Promise<T>,
      options: {
        onSuccess?: (data: T) => void;
        onError?: (error: Error) => void;
      } = {}
    ) => {
      setIsSubmitting(true);
      setSubmitError(null);

      try {
        const result = await onSubmit();
        options.onSuccess?.(result);
        return result;
      } catch (error) {
        const message = error instanceof Error ? error.message : "Submission failed";
        setSubmitError(message);
        options.onError?.(error as Error);
        throw error;
      } finally {
        setIsSubmitting(false);
      }
    },
    []
  );

  const reset = useCallback(() => {
    setIsSubmitting(false);
    setSubmitError(null);
  }, []);

  return {
    isSubmitting,
    submitError,
    submit,
    reset,
  };
}
