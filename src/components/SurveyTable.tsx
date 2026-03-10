/**
 * Survey Table Component - REFACTORED
 * Displays survey data in an interactive table with filtering, sorting, and export capabilities
 * Extracted common logic into reusable sub-components
 */

import { useState, useMemo } from "react";
import {
  useReactTable,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  flexRender,
  type SortingState,
  type ColumnFiltersState,
} from "@tanstack/react-table";
import { Search } from "lucide-react";
import { TooltipProvider } from "@/components/ui/tooltip";
import type { Survey } from "@shared/schema";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Input } from "@/components/ui/input";

// Table utilities and components
import { DEFAULT_VISIBLE_COLUMNS } from "@/utils/tableUtils";
import { FilterDropdown } from "./table/FilterDropdown";
import { TablePagination } from "./table/TablePagination";
import { TableRowActions } from "./table/TableRowActions";
import { TableToolbar } from "./table/TableToolbar";

// Modals
import { IdCardModal } from "./IdCardModal";
import { HealthcardModal } from "./HealthcardModal";
import { EditSurveyModal } from "./EditSurveyModal";

// Hooks and utilities
import { useDeleteSurvey } from "@/hooks/use-surveys";
import { useToast } from "@/hooks/use-toast";
import { exportToExcel, exportToPDF } from "@/utils/exportUtils";

interface SurveyTableProps {
  data: Survey[];
  onDelete?: (id: number) => Promise<void>;
  onRefresh?: () => Promise<void>;
}

export function SurveyTable({ data, onDelete, onRefresh }: SurveyTableProps) {
  // State management
  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [columnVisibility, setColumnVisibility] = useState<Record<string, boolean>>(
    Object.fromEntries(
      [
        "name",
        "firstName",
        "lastName",
        "age",
        "youthAgeGroup",
        "sex",
        "civilStatus",
        "workStatus",
        "youthClassification",
        "educationalBackground",
        "specialNeedsType",
        "registeredSkVoter",
        "registeredNationalVoter",
        "votedLastElection",
        "attendedKkAssembly",
        "kkAssemblyFrequency",
        "kkAssemblyReasonNo",
        "location",
        "actions",
      ].map((col) => [col, DEFAULT_VISIBLE_COLUMNS.has(col)])
    )
  );

  // Modal state
  const [selectedSurvey, setSelectedSurvey] = useState<Survey | null>(null);
  const [isIdModalOpen, setIsIdModalOpen] = useState(false);
  const [isHealthModalOpen, setIsHealthModalOpen] = useState(false);
  const [editSurvey, setEditSurvey] = useState<Survey | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  // Export state
  const [isExporting, setIsExporting] = useState(false);

  // Hooks
  const deleteSurvey = useDeleteSurvey();
  const { toast } = useToast();

  // Define table columns
  const columns = useMemo(
    () => [
      {
        id: "name",
        accessorFn: (row: Survey) => `${row.firstName} ${row.lastName}`,
        header: "Full Name",
        filterFn: (row: any, _id: string, value: string) => {
          if (!value) return true;
          const name = `${row.original.firstName} ${row.original.lastName}`.toLowerCase();
          return name.includes(value.toLowerCase());
        },
      },
      {
        accessorKey: "firstName",
        header: "First Name",
        enableHiding: true,
      },
      {
        accessorKey: "lastName",
        header: "Last Name",
        enableHiding: true,
      },
      {
        accessorKey: "age",
        header: "Age",
        filterFn: (row: any, id: string, value: number) => {
          if (!value) return true;
          return row.getValue(id) === value;
        },
      },
      {
        accessorKey: "youthAgeGroup",
        header: "Age Group",
        filterFn: (row: any, id: string, value: string) => {
          if (value === undefined) return true;
          return String(row.getValue(id)) === String(value);
        },
      },
      {
        accessorKey: "sex",
        header: "Sex",
        filterFn: (row: any, id: string, value: string) => {
          if (value === undefined) return true;
          return String(row.getValue(id)) === String(value);
        },
      },
      {
        accessorKey: "civilStatus",
        header: "Status",
        filterFn: (row: any, id: string, value: string) => {
          if (value === undefined) return true;
          return String(row.getValue(id)) === String(value);
        },
      },
      {
        accessorKey: "workStatus",
        header: "Work",
        filterFn: (row: any, id: string, value: string) => {
          if (value === undefined) return true;
          return String(row.getValue(id)) === String(value);
        },
      },
      {
        accessorKey: "youthClassification",
        header: "Classification",
        filterFn: (row: any, id: string, value: string) => {
          if (value === undefined) return true;
          return String(row.getValue(id)) === String(value);
        },
      },
      {
        accessorKey: "attendedKkAssembly",
        header: "KK Assembly",
        filterFn: (row: any, id: string, value: boolean) => {
          if (value === undefined) return true;
          return row.getValue(id) === value;
        },
        cell: ({ row }: any) => {
          const attended = row.getValue("attendedKkAssembly");
          return (
            <div className={`text-sm font-medium ${attended ? "text-green-600" : "text-red-600"}`}>
              {attended ? "Yes" : "No"}
            </div>
          );
        },
      },
      {
        accessorKey: "kkAssemblyFrequency",
        header: "Frequency",
        filterFn: (row: any, id: string, value: string) => {
          if (value === undefined) return true;
          return String(row.getValue(id)) === String(value);
        },
        cell: ({ row }: any) => {
          const attended = row.original.attendedKkAssembly;
          const frequency = row.getValue("kkAssemblyFrequency");
          return attended ? <div className="text-sm">{String(frequency)}</div> : <div className="text-sm text-slate-400">-</div>;
        },
      },
      {
        accessorKey: "kkAssemblyReasonNo",
        header: "Reason (if No)",
        filterFn: (row: any, id: string, value: string) => {
          if (value === undefined) return true;
          return String(row.getValue(id)) === String(value);
        },
        cell: ({ row }: any) => {
          const attended = row.original.attendedKkAssembly;
          const reason = row.getValue("kkAssemblyReasonNo");
          return !attended ? <div className="text-sm">{String(reason)}</div> : <div className="text-sm text-slate-400">-</div>;
        },
      },
      {
        accessorKey: "educationalBackground",
        header: "Education",
        filterFn: (row: any, id: string, value: string) => {
          if (value === undefined) return true;
          return String(row.getValue(id)) === String(value);
        },
      },
      {
        accessorKey: "specialNeedsType",
        header: "Special Needs",
        filterFn: (row: any, id: string, value: string) => {
          if (value === undefined) return true;
          return String(row.getValue(id)) === String(value);
        },
        cell: ({ row }: any) => {
          const classification = row.original.youthClassification;
          const specialNeeds = row.getValue("specialNeedsType");
          return classification === "Youth with Special Needs" ? (
            <div className="text-sm">{String(specialNeeds)}</div>
          ) : (
            <div className="text-sm text-slate-400">-</div>
          );
        },
      },
      {
        accessorKey: "registeredSkVoter",
        header: "SK Voter",
        filterFn: (row: any, id: string, value: boolean) => {
          if (value === undefined) return true;
          return row.getValue(id) === value;
        },
        cell: ({ row }: any) => {
          const registered = row.getValue("registeredSkVoter");
          return (
            <div className={`text-sm font-medium ${registered ? "text-green-600" : "text-slate-500"}`}>
              {registered ? "Yes" : "No"}
            </div>
          );
        },
      },
      {
        accessorKey: "registeredNationalVoter",
        header: "National Voter",
        filterFn: (row: any, id: string, value: boolean) => {
          if (value === undefined) return true;
          return row.getValue(id) === value;
        },
        cell: ({ row }: any) => {
          const registered = row.getValue("registeredNationalVoter");
          return (
            <div className={`text-sm font-medium ${registered ? "text-green-600" : "text-slate-500"}`}>
              {registered ? "Yes" : "No"}
            </div>
          );
        },
      },
      {
        accessorKey: "votedLastElection",
        header: "Voted Last Election",
        filterFn: (row: any, id: string, value: boolean) => {
          if (value === undefined) return true;
          return row.getValue(id) === value;
        },
        cell: ({ row }: any) => {
          const voted = row.getValue("votedLastElection");
          return (
            <div className={`text-sm font-medium ${voted ? "text-green-600" : "text-slate-500"}`}>
              {voted ? "Yes" : "No"}
            </div>
          );
        },
      },
      {
        accessorKey: "location",
        header: "Location",
        filterFn: (row: any, id: string, value: string) => {
          if (value === undefined) return true;
          return String(row.getValue(id)) === String(value);
        },
      },
      {
        id: "actions",
        header: "Actions",
        cell: ({ row }: any) => (
          <TableRowActions
            survey={row.original}
            onDelete={onDelete || deleteSurvey.mutateAsync}
            onEdit={(survey) => {
              setEditSurvey(survey);
              setIsEditModalOpen(true);
            }}
            onViewIdCard={(survey) => {
              setSelectedSurvey(survey);
              setIsIdModalOpen(true);
            }}
            onViewHealthCard={(survey) => {
              setSelectedSurvey(survey);
              setIsHealthModalOpen(true);
            }}
          />
        ),
      },
    ],
    [onDelete, deleteSurvey]
  );

  // Initialize table
  const table = useReactTable({
    data,
    columns,
    state: {
      sorting,
      columnFilters,
      columnVisibility,
    },
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    onColumnVisibilityChange: setColumnVisibility,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
  });

  // Calculate active filters count
  const activeFiltersCount = columnFilters.length;

  // Helper functions
  const clearAllFilters = () => {
    setColumnFilters([]);
  };

  const handleExportExcel = async () => {
    setIsExporting(true);
    try {
      // Use getSortedRowModel to get both filtered AND sorted data
      const sortedFilteredData = table.getSortedRowModel().rows.map((row) => row.original);
      await exportToExcel(sortedFilteredData, columnVisibility);
      toast({
        title: "Success",
        description: "Excel file exported successfully!",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to export Excel file.",
        variant: "destructive",
      });
    } finally {
      setIsExporting(false);
    }
  };

  const handleExportPDF = async () => {
    setIsExporting(true);
    try {
      // Use getSortedRowModel to get both filtered AND sorted data
      const sortedFilteredData = table.getSortedRowModel().rows.map((row) => row.original);
      await exportToPDF(sortedFilteredData, columnFilters, columnVisibility);
      toast({
        title: "Success",
        description: "PDF file exported successfully!",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to export PDF file.",
        variant: "destructive",
      });
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="space-y-4">
      {/* Toolbar */}
      <TableToolbar
        table={table}
        sorting={sorting}
        onSortingChange={setSorting}
        activeFiltersCount={activeFiltersCount}
        onClearFilters={clearAllFilters}
        onExportExcel={handleExportExcel}
        onExportPDF={handleExportPDF}
        isExporting={isExporting}
        hasData={data.length > 0}
      />

      {/* Table */}
      <div className="rounded-xl border bg-white shadow-sm overflow-hidden">
        <Table>
          <TableHeader className="bg-slate-50">
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id} className="hover:bg-slate-50 border-b-2">
                {headerGroup.headers.map((header) => (
                  <TableHead key={header.id} className="py-3 px-4 font-bold text-slate-700">
                    <div className="flex flex-col gap-2">
                      <div className="flex items-center gap-1">
                        {header.isPlaceholder
                          ? null
                          : flexRender(header.column.columnDef.header, header.getContext())}
                      </div>
                      {header.column.getCanFilter() ? (
                        <div className="font-normal">
                          {header.column.id === "name" ? (
                            <Input
                              placeholder="Search..."
                              value={(header.column.getFilterValue() as string) ?? ""}
                              onChange={(event) =>
                                header.column.setFilterValue(event.target.value)
                              }
                              className="h-7 text-[10px] px-2 bg-white/50"
                            />
                          ) : header.column.id === "age" ? (
                            <Input
                              placeholder="Age..."
                              type="text"
                              inputMode="numeric"
                              value={(header.column.getFilterValue() ?? "") as string}
                              onChange={(event) => {
                                const value = event.target.value;
                                if (value === "") {
                                  header.column.setFilterValue(undefined);
                                } else if (/^\d+$/.test(value)) {
                                  header.column.setFilterValue(Number(value));
                                }
                              }}
                              className="h-7 text-[10px] px-2 bg-white/50"
                            />
                          ) : (
                            <FilterDropdown column={header.column} />
                          )}
                        </div>
                      ) : null}
                    </div>
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow
                  key={row.id}
                  data-state={row.getIsSelected() && "selected"}
                  className="hover:bg-slate-50/50"
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id} className="py-3">
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={table.getAllColumns().length} className="h-32 text-center">
                  <div className="flex flex-col items-center justify-center gap-2 text-slate-500">
                    <Search className="h-8 w-8 text-slate-300" />
                    <p className="font-medium">No records found</p>
                    {activeFiltersCount > 0 && (
                      <p className="text-sm">Try adjusting or clearing your filters</p>
                    )}
                  </div>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {/* Pagination */}
      <TablePagination table={table} />

      {/* Modals */}
      <TooltipProvider>
        <IdCardModal survey={selectedSurvey} open={isIdModalOpen} onOpenChange={setIsIdModalOpen} />
        <HealthcardModal
          survey={selectedSurvey}
          open={isHealthModalOpen}
          onOpenChange={setIsHealthModalOpen}
        />
        <EditSurveyModal
          survey={editSurvey}
          open={isEditModalOpen}
          onOpenChange={setIsEditModalOpen}
          onUpdated={async () => {
            setIsEditModalOpen(false);
            await onRefresh?.();
          }}
        />
      </TooltipProvider>
    </div>
  );
}
