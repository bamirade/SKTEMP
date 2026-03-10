/**
 * Filter dropdown component for table columns
 * Handles select/filter UI for both regular and boolean columns
 */

import { useMemo } from "react";
import type { Column } from "@tanstack/react-table";
import { getColumnOptions } from "@/constants/surveyOptions";
import { isBooleanColumn, stringToBoolean } from "@/lib/surveyUtils";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface FilterDropdownProps {
  column: Column<any, unknown>;
}

export function FilterDropdown({ column }: FilterDropdownProps) {
  const columnFilterValue = column.getFilterValue();
  const { id } = column;

  const options = useMemo(() => {
    return getColumnOptions(id);
  }, [id]);

  if (options.length === 0) return null;

  const getDisplayValue = () => {
    if (columnFilterValue === undefined) return "all";
    if (isBooleanColumn(id)) {
      return columnFilterValue === true ? "Yes" : columnFilterValue === false ? "No" : "all";
    }
    return (columnFilterValue as string) ?? "all";
  };

  const handleChange = (value: string) => {
    if (value === "all") {
      column.setFilterValue(undefined);
    } else if (isBooleanColumn(id)) {
      column.setFilterValue(stringToBoolean(value));
    } else {
      column.setFilterValue(value);
    }
  };

  return (
    <Select value={getDisplayValue()} onValueChange={handleChange}>
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
