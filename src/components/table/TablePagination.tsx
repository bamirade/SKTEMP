/**
 * Table pagination controls component
 * Handles page navigation and page size selection
 */

import type { Table } from "@tanstack/react-table";
import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { PAGE_SIZE_OPTIONS } from "@/utils/tableUtils";

interface TablePaginationProps<T> {
  table: Table<T>;
}

export function TablePagination<T>({ table }: TablePaginationProps<T>) {
  const { pageIndex, pageSize } = table.getState().pagination;
  const filteredRowCount = table.getFilteredRowModel().rows.length;
  const totalRowCount = table.getCoreRowModel().rows.length;

  const startRow = pageIndex * pageSize + 1;
  const endRow = Math.min((pageIndex + 1) * pageSize, filteredRowCount);

  return (
    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 px-2">
      <div className="flex items-center gap-4">
        <div className="text-sm text-slate-500">
          Showing {startRow} to {endRow} of {filteredRowCount}
          {filteredRowCount !== totalRowCount && ` (filtered from ${totalRowCount})`} records
        </div>
        <Select
          value={pageSize.toString()}
          onValueChange={(value) => table.setPageSize(Number(value))}
        >
          <SelectTrigger className="h-8 w-[100px]">
            <SelectValue placeholder="Page size" />
          </SelectTrigger>
          <SelectContent side="top">
            {PAGE_SIZE_OPTIONS.map((size) => (
              <SelectItem key={size} value={size.toString()}>
                {size} rows
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="flex items-center space-x-2">
        <Button
          variant="outline"
          className="h-8 w-8 p-0"
          onClick={() => table.setPageIndex(0)}
          disabled={!table.getCanPreviousPage()}
          title="First page"
        >
          <ChevronsLeft className="h-4 w-4" />
        </Button>
        <Button
          variant="outline"
          className="h-8 w-8 p-0"
          onClick={() => table.previousPage()}
          disabled={!table.getCanPreviousPage()}
          title="Previous page"
        >
          <ChevronLeft className="h-4 w-4" />
        </Button>
        <Button
          variant="outline"
          className="h-8 w-8 p-0"
          onClick={() => table.nextPage()}
          disabled={!table.getCanNextPage()}
          title="Next page"
        >
          <ChevronRight className="h-4 w-4" />
        </Button>
        <Button
          variant="outline"
          className="h-8 w-8 p-0"
          onClick={() => table.setPageIndex(table.getPageCount() - 1)}
          disabled={!table.getCanNextPage()}
          title="Last page"
        >
          <ChevronsRight className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
