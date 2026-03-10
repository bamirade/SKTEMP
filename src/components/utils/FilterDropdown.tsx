/**
 * Filter dropdown component for survey table columns
 */

import { useMemo } from "react";
import type { Column } from "@tanstack/react-table";
import {
  CIVIL_STATUS_OPTIONS,
  SEX_OPTIONS,
  WORK_STATUS_OPTIONS,
  YOUTH_CLASSIFICATION_OPTIONS,
  EDUCATION_OPTIONS,
  SPECIAL_NEEDS_TYPE_OPTIONS,
  KK_ASSEMBLY_FREQUENCY_OPTIONS,
  KK_ASSEMBLY_REASON_NO_OPTIONS,
  LOCATION_OPTIONS,
} from "@/shared/schema";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

/**
 * Props for FilterDropdown component
 */
interface FilterDropdownProps {
  column: Column<any, unknown>;
}

/**
 * Boolean column identifiers
 */
const BOOLEAN_COLUMNS = [
  "attendedKkAssembly",
  "registeredSkVoter",
  "registeredNationalVoter",
  "votedLastElection",
];

/**
 * Get filter options based on column ID
 */
function getFilterOptions(columnId: string): readonly string[] | string[] {
  const optionsMap: Record<string, readonly string[] | string[]> = {
    sex: SEX_OPTIONS,
    civilStatus: CIVIL_STATUS_OPTIONS,
    youthAgeGroup: ["Child Youth", "Core Youth", "Young Adult"],
    workStatus: WORK_STATUS_OPTIONS,
    youthClassification: YOUTH_CLASSIFICATION_OPTIONS,
    educationalBackground: EDUCATION_OPTIONS,
    specialNeedsType: SPECIAL_NEEDS_TYPE_OPTIONS,
    attendedKkAssembly: ["Yes", "No"],
    registeredSkVoter: ["Yes", "No"],
    registeredNationalVoter: ["Yes", "No"],
    votedLastElection: ["Yes", "No"],
    kkAssemblyFrequency: KK_ASSEMBLY_FREQUENCY_OPTIONS,
    kkAssemblyReasonNo: KK_ASSEMBLY_REASON_NO_OPTIONS,
    location: LOCATION_OPTIONS,
  };

  return optionsMap[columnId] || [];
}

/**
 * Convert filter value to display string
 */
function getDisplayValue(
  columnId: string,
  columnFilterValue: unknown
): string {
  if (columnFilterValue === undefined) return "all";
  if (BOOLEAN_COLUMNS.includes(columnId)) {
    return columnFilterValue === true ? "Yes" : columnFilterValue === false ? "No" : "all";
  }
  return (columnFilterValue as string) ?? "all";
}

/**
 * FilterDropdown Component
 *
 * Renders a dropdown filter for a table column with appropriate options
 * based on the column type (boolean, select, etc.)
 */
export function FilterDropdown({ column }: FilterDropdownProps) {
  const columnFilterValue = column.getFilterValue();
  const { id } = column;

  const options = useMemo(() => getFilterOptions(id), [id]);

  if (options.length === 0) return null;

  const displayValue = getDisplayValue(id, columnFilterValue);

  /**
   * Handle filter value change
   */
  const handleValueChange = (value: string) => {
    if (value === "all") {
      column.setFilterValue(undefined);
    } else if (BOOLEAN_COLUMNS.includes(id)) {
      column.setFilterValue(value === "Yes");
    } else {
      column.setFilterValue(value);
    }
  };

  return (
    <Select value={displayValue} onValueChange={handleValueChange}>
      <SelectTrigger className="h-7 w-full text-[10px] px-2 bg-white/50 border-slate-200">
        <SelectValue placeholder="All" />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="all">All</SelectItem>
        {options.map((option) => (
          <SelectItem key={option} value={option}>
            {option}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
