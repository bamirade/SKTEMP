/**
 * Comprehensive type definitions for the application
 * Centralizes all custom types and interfaces for better maintainability
 */

import type { Survey } from "@/shared/schema";

/**
 * Filter change event
 */
export interface FilterChangeEvent {
  columnId: string;
  value: unknown;
}

/**
 * Sort change event
 */
export interface SortChangeEvent {
  columnId: string;
  direction: "asc" | "desc" | null;
}

/**
 * Pagination state
 */
export interface PaginationState {
  pageIndex: number;
  pageSize: number;
}

/**
 * Table state
 */
export interface TableState {
  sorting: Array<{ id: string; desc: boolean }>;
  filters: Array<{ id: string; value: unknown }>;
  columnVisibility: Record<string, boolean>;
  pagination: PaginationState;
}

/**
 * API error response
 */
export interface ApiErrorResponse {
  status: number;
  message: string;
  details?: Record<string, unknown>;
}

/**
 * Survey form submission result
 */
export interface SubmissionResult {
  success: boolean;
  data?: Survey;
  error?: string;
}

/**
 * Admin authentication state
 */
export interface AdminAuthState {
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  surveys: Survey[];
}

/**
 * Export options
 */
export interface ExportOptions {
  columns: string[];
  format: "excel" | "pdf";
  fileName?: string;
  includeFilters?: boolean;
}

/**
 * Column definition with metadata
 */
export interface ColumnMetadata {
  id: string;
  label: string;
  filterable: boolean;
  sortable: boolean;
  visible: boolean;
}

/**
 * Notification/Toast message
 */
export interface ToastMessage {
  title: string;
  description?: string;
  variant?: "default" | "destructive";
  duration?: number;
}
