/**
 * Table toolbar component
 * Contains search, column visibility, sorting controls, and export buttons
 */

import type { Table } from "@tanstack/react-table";
import { Search, Columns, X, FileDown, Loader2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { SORTABLE_COLUMNS, DEFAULT_VISIBLE_COLUMNS, COLUMN_LABELS } from "@/utils/tableUtils";
import type { SortingState } from "@tanstack/react-table";

interface TableToolbarProps<T> {
  table: Table<T>;
  sorting: SortingState;
  onSortingChange: (sorting: SortingState) => void;
  activeFiltersCount: number;
  onClearFilters: () => void;
  onExportExcel: () => void;
  onExportPDF: () => void;
  isExporting: boolean;
  hasData: boolean;
}

export function TableToolbar<T>({
  table,
  sorting,
  onSortingChange,
  activeFiltersCount,
  onClearFilters,
  onExportExcel,
  onExportPDF,
  isExporting,
  hasData,
}: TableToolbarProps<T>) {
  const currentSort = sorting[0] || { id: "", desc: false };
  const nameColumn = table.getColumn("name");

  return (
    <div className="flex min-w-0 flex-col items-start justify-between gap-4 rounded-xl border bg-white p-4 shadow-sm sm:flex-row sm:items-center">
      <div className="flex min-w-0 w-full flex-wrap items-center gap-2 sm:w-auto">
        {/* Search input */}
        <div className="relative min-w-0 flex-1 sm:w-64">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-slate-400" />
          <Input
            placeholder="Search by first or last name..."
            value={(nameColumn?.getFilterValue() as string) ?? ""}
            onChange={(event) => nameColumn?.setFilterValue(event.target.value)}
            className="pl-9 h-10"
          />
        </div>

        {/* Active filters badge */}
        {activeFiltersCount > 0 && (
          <Badge variant="secondary" className="h-10 px-3 gap-2">
            {activeFiltersCount} {activeFiltersCount === 1 ? "Filter" : "Filters"} Active
            <Button
              variant="ghost"
              size="sm"
              className="h-4 w-4 p-0 hover:bg-transparent"
              onClick={onClearFilters}
              title="Clear all filters"
            >
              <X className="h-3 w-3" />
            </Button>
          </Badge>
        )}

        {/* Column visibility dropdown */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" className="h-10 gap-2">
              <Columns className="h-4 w-4" /> Columns
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuLabel>Toggle Columns</DropdownMenuLabel>
            <DropdownMenuSeparator />
            {table
              .getAllColumns()
              .filter((column) => column.getCanHide())
              .map((column) => {
                const isDefault = DEFAULT_VISIBLE_COLUMNS.has(column.id);
                const label = COLUMN_LABELS[column.id] || column.id;
                const defaultLabel = isDefault ? " (default)" : "";

                return (
                  <DropdownMenuCheckboxItem
                    key={column.id}
                    checked={column.getIsVisible()}
                    onCheckedChange={(value) => column.toggleVisibility(!!value)}
                    className="text-sm"
                  >
                    <span>
                      {label}
                      {defaultLabel && (
                        <span className="text-xs text-slate-500">{defaultLabel}</span>
                      )}
                    </span>
                  </DropdownMenuCheckboxItem>
                );
              })}
          </DropdownMenuContent>
        </DropdownMenu>

        {/* Sort dropdown */}
        <Select
          value={
            currentSort.id ? `${currentSort.id}:${currentSort.desc ? "desc" : "asc"}` : "none"
          }
          onValueChange={(val) => {
            if (val === "none") return onSortingChange([]);
            const [id, dir] = val.split(":");
            onSortingChange([{ id, desc: dir === "desc" }]);
          }}
        >
          <SelectTrigger className="h-10 w-44 text-[14px] ml-2">
            <SelectValue placeholder="Sort by..." />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="none">No Sort</SelectItem>
            {SORTABLE_COLUMNS.map((col) => [
              <SelectItem key={`${col.id}:asc`} value={`${col.id}:asc`}>
                {col.label} (Ascending)
              </SelectItem>,
              <SelectItem key={`${col.id}:desc`} value={`${col.id}:desc`}>
                {col.label} (Descending)
              </SelectItem>,
            ])}
          </SelectContent>
        </Select>
      </div>

      {/* Export buttons */}
      <div className="flex gap-2 w-full sm:w-auto justify-end">
        <Button
          variant="outline"
          onClick={onExportExcel}
          className="h-10 gap-2"
          disabled={isExporting || !hasData}
          title="Export to Excel"
        >
          {isExporting ? <Loader2 className="h-4 w-4 animate-spin" /> : <FileDown className="h-4 w-4" />}
          Excel
        </Button>
        <Button
          variant="outline"
          onClick={onExportPDF}
          className="h-10 gap-2"
          disabled={isExporting || !hasData}
          title="Export to PDF"
        >
          {isExporting ? <Loader2 className="h-4 w-4 animate-spin" /> : <FileDown className="h-4 w-4" />}
          PDF
        </Button>
      </div>
    </div>
  );
}
