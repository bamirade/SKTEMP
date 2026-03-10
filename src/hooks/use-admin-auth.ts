/**
 * Custom hook for managing admin authentication and session
 */

import { useState, useCallback, useEffect } from "react";
import { useToast } from "./use-toast";
import type { Survey } from "@/shared/schema";
import { transformApiSurveysToSurveys, type ApiSurveyResponse } from "@/lib/transformSurveyData";
import {
  getAdminPassword,
  saveAdminPassword,
  clearAdminSession,
  getCachedSurveys,
  cacheSurveys,
} from "@/lib/adminStorage";
import {
  getAdminSurveysUrl,
  getDeleteSurveyUrl,
  makeAuthenticatedRequest,
  ApiError,
} from "@/lib/api";

interface UseAdminAuthReturn {
  isAuthenticated: boolean;
  isCheckingSession: boolean;
  surveys: Survey[];
  password: string;
  errorMsg: string;
  showPassword: boolean;
  hasError: boolean;
  isLoggingIn: boolean;
  setPassword: (value: string) => void;
  setShowPassword: (value: boolean) => void;
  login: (password: string) => Promise<void>;
  logout: () => void;
  refreshSurveys: () => Promise<void>;
  deleteSurvey: (surveyId: number) => Promise<void>;
  clearError: () => void;
}

/**
 * Hook for managing admin authentication state and operations
 */
export function useAdminAuth(): UseAdminAuthReturn {
  const { toast } = useToast();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isCheckingSession, setIsCheckingSession] = useState(true);
  const [surveys, setSurveys] = useState<Survey[]>([]);
  const [password, setPassword] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [hasError, setHasError] = useState(false);
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [authToken, setAuthToken] = useState<string | null>(null);

  /**
   * Auto-authenticate on mount if session exists
   */
  useEffect(() => {
    const checkSession = async () => {
      const savedPassword = getAdminPassword();
      const cachedSurveys = getCachedSurveys<Survey[]>();

      if (savedPassword) {
        setAuthToken(savedPassword);
        // Show cached data immediately for better UX
        if (cachedSurveys) {
          setSurveys(cachedSurveys);
          setIsAuthenticated(true);
        }
        // Fetch fresh data from server
        try {
          await authenticateWithPassword(savedPassword);
        } catch {
          // Auth failed, session will be cleared
        }
      }
      setIsCheckingSession(false);
    };

    checkSession();
  }, []);

  /**
   * Authenticate with password and fetch surveys
   */
  const authenticateWithPassword = useCallback(
    async (pwd: string): Promise<void> => {
      try {
        const url = getAdminSurveysUrl();
        const data = await makeAuthenticatedRequest<ApiSurveyResponse[]>(
          url,
          pwd,
          { method: "GET" }
        );

        const transformedSurveys = transformApiSurveysToSurveys(data);
        setSurveys(transformedSurveys);
        cacheSurveys(transformedSurveys);
        setIsAuthenticated(true);
        setAuthToken(pwd);
        setPassword("");
        setErrorMsg("");
      } catch (err) {
        clearAdminSession();
        setIsAuthenticated(false);
        setAuthToken(null);
        const message =
          err instanceof ApiError && err.status === 401
            ? "Invalid password. Please try again."
            : "Authentication failed. Please try again.";
        setErrorMsg(message);
        setHasError(true);
        setTimeout(() => setHasError(false), 600);
        throw err;
      }
    },
    []
  );

  /**
   * Login with password
   */
  const login = useCallback(
    async (pwd: string): Promise<void> => {
      if (!pwd) return;
      setIsLoggingIn(true);
      setErrorMsg("");
      setHasError(false);

      try {
        await authenticateWithPassword(pwd);
        saveAdminPassword(pwd);
      } finally {
        setIsLoggingIn(false);
      }
    },
    [authenticateWithPassword]
  );

  /**
   * Logout and clear session
   */
  const logout = useCallback((): void => {
    clearAdminSession();
    setIsAuthenticated(false);
    setSurveys([]);
    setAuthToken(null);
    setPassword("");
  }, []);

  /**
   * Refresh surveys from server
   */
  const refreshSurveys = useCallback(async (): Promise<void> => {
    const token = authToken || getAdminPassword();
    if (!token) return;

    try {
      const url = getAdminSurveysUrl();
      const data = await makeAuthenticatedRequest<ApiSurveyResponse[]>(
        url,
        token,
        { method: "GET" }
      );

      const transformedSurveys = transformApiSurveysToSurveys(data);
      setSurveys(transformedSurveys);
      cacheSurveys(transformedSurveys);
    } catch (err) {
      console.error("Failed to refresh surveys:", err);
      toast({
        title: "Error",
        description: "Failed to refresh surveys",
        variant: "destructive",
      });
    }
  }, [authToken, toast]);

  /**
   * Delete a survey
   */
  const deleteSurvey = useCallback(
    async (surveyId: number): Promise<void> => {
      const token = authToken || getAdminPassword();
      if (!token) {
        toast({
          title: "Error",
          description: "Missing admin session. Please log in again.",
          variant: "destructive",
        });
        return;
      }

      try {
        const url = getDeleteSurveyUrl(surveyId);
        await makeAuthenticatedRequest(url, token, { method: "DELETE" });

        setSurveys((prev) => prev.filter((s) => s.id !== surveyId));
        cacheSurveys(surveys.filter((s) => s.id !== surveyId));

        toast({
          title: "Success",
          description: "Survey deleted successfully",
        });
      } catch (err) {
        console.error("Failed to delete survey:", err);
        toast({
          title: "Error",
          description:
            err instanceof ApiError && err.status === 401
              ? "Session expired. Please log in again."
              : "Failed to delete survey",
          variant: "destructive",
        });
        throw err;
      }
    },
    [authToken, surveys, toast]
  );

  /**
   * Clear error message
   */
  const clearError = useCallback((): void => {
    setErrorMsg("");
    setHasError(false);
  }, []);

  return {
    isAuthenticated,
    isCheckingSession,
    surveys,
    password,
    errorMsg,
    showPassword,
    hasError,
    isLoggingIn,
    setPassword,
    setShowPassword,
    login,
    logout,
    refreshSurveys,
    deleteSurvey,
    clearError,
  };
}
