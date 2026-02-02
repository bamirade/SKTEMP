import {
  useReactTable,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  flexRender,
  type SortingState,
  type ColumnFiltersState,
  type Column
} from "@tanstack/react-table";
import { useState, useMemo } from "react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuCheckboxItem, DropdownMenuContent, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { IdCardModal } from "./IdCardModal";
import { HealthcardModal } from "./HealthcardModal";
import { EditSurveyModal } from "./EditSurveyModal";
import type { Survey } from "@shared/schema";
import {
  CIVIL_STATUS_OPTIONS,
  SEX_OPTIONS,
  WORK_STATUS_OPTIONS,
  YOUTH_CLASSIFICATION_OPTIONS
} from "@shared/schema";
import { Search, SlidersHorizontal, CreditCard, ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight, Trash2, Edit3, Heart } from "lucide-react";
import { useDeleteSurvey } from "@/hooks/use-surveys";
import { useToast } from "@/hooks/use-toast";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { saveAs } from 'file-saver';

function FilterDropdown({ column }: { column: Column<any, unknown> }) {
  const columnFilterValue = column.getFilterValue();
  const { id } = column;

  const options = useMemo(() => {
    switch (id) {
      case "sex": return SEX_OPTIONS;
      case "civilStatus": return CIVIL_STATUS_OPTIONS;
      case "youthAgeGroup": return ["Child Youth", "Core Youth", "Young Adult"];
      case "workStatus": return WORK_STATUS_OPTIONS;
      case "youthClassification": return YOUTH_CLASSIFICATION_OPTIONS;
      default: return [];
    }
  }, [id]);

  if (options.length === 0) return null;

  return (
    <Select
      value={(columnFilterValue as string) ?? "all"}
      onValueChange={(value) => column.setFilterValue(value === "all" ? undefined : value)}
    >
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

interface SurveyTableProps {
  data: Survey[];
}

export function SurveyTable({ data }: SurveyTableProps) {
  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [selectedSurvey, setSelectedSurvey] = useState<Survey | null>(null);
  const [isIdModalOpen, setIsIdModalOpen] = useState(false);
  const [isHealthModalOpen, setIsHealthModalOpen] = useState(false);
  const [editSurvey, setEditSurvey] = useState<Survey | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  const deleteSurvey = useDeleteSurvey();
  const { toast } = useToast();

  const table = useReactTable({
    data,
    columns: [
      {
        accessorKey: "name",
        header: "Name",
        cell: ({ row }) => <div className="font-medium">{row.getValue("name")}</div>,
      },
      {
        accessorKey: "age",
        header: "Age",
      },
      {
        accessorKey: "youthAgeGroup",
        header: "Age Group",
      },
      {
        accessorKey: "sex",
        header: "Sex",
      },
      {
        accessorKey: "civilStatus",
        header: "Status",
      },
      {
        accessorKey: "workStatus",
        header: "Work",
      },
      {
        accessorKey: "youthClassification",
        header: "Classification",
      },
      {
        id: "actions",
        header: "Actions",
        cell: ({ row }) => {
          const survey = row.original;
          return (
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                className="h-8 w-8 p-0"
                onClick={() => {
                  setSelectedSurvey(survey);
                  setIsIdModalOpen(true);
                }}
              >
                <CreditCard className="h-4 w-4 text-indigo-600" />
              </Button>

              <Button
                variant="outline"
                size="sm"
                className="h-8 w-8 p-0"
                onClick={() => {
                  setSelectedSurvey(survey);
                  setIsHealthModalOpen(true);
                }}
              >
                <Heart className="h-4 w-4 text-red-600" />
              </Button>

              <Button
                variant="outline"
                size="sm"
                className="h-8 w-8 p-0"
                onClick={() => {
                  setEditSurvey(survey);
                  setIsEditModalOpen(true);
                }}
              >
                <Edit3 className="h-4 w-4 text-slate-700" />
              </Button>

              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button variant="outline" size="sm" className="h-8 w-8 p-0 hover:bg-red-50 hover:text-red-600 border-slate-200">
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Delete Record</AlertDialogTitle>
                    <AlertDialogDescription>
                      Are you sure you want to delete the record for {survey.name}? This action cannot be undone.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction className="bg-red-600 hover:bg-red-700" onClick={() => handleDelete(survey.id)}>
                      Delete
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </div>
          )
        }
      }
    ],
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    state: {
      sorting,
      columnFilters,
    },
  });

  const filteredData = table.getFilteredRowModel().rows.map(row => row.original);

  const handleExportExcel = () => {
    const ws = XLSX.utils.json_to_sheet(filteredData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Surveys");
    const excelBuffer = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
    const dataBlob = new Blob([excelBuffer], {type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8'});
    saveAs(dataBlob, 'youth_surveys_filtered.xlsx');
  };

  const handleExportPDF = () => {
    const doc = new jsPDF();
    doc.text("Youth Survey Report (Filtered)", 14, 15);

    autoTable(doc, {
      head: [['Name', 'Age', 'Sex', 'Classification', 'Work Status']],
      body: filteredData.map(s => [s.name, s.age, s.sex, s.youthClassification, s.workStatus]),
      startY: 20,
    });

    doc.save('youth_surveys_filtered.pdf');
  };

  const handleDelete = async (id: number) => {
    try {
      await deleteSurvey.mutateAsync(id);
      toast({ title: "Deleted", description: "Survey record deleted successfully." });
    } catch (err) {
      toast({ title: "Error", description: "Failed to delete record.", variant: "destructive" });
    }
  };


  return (
    <div className="space-y-4">
      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center bg-white p-4 rounded-xl border shadow-sm">
        <div className="flex gap-2 w-full sm:w-auto">
          <div className="relative flex-1 sm:w-64">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-slate-400" />
            <Input
              placeholder="Search names..."
              value={(table.getColumn("name")?.getFilterValue() as string) ?? ""}
              onChange={(event) =>
                table.getColumn("name")?.setFilterValue(event.target.value)
              }
              className="pl-9 h-10"
            />
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="h-10 gap-2">
                <SlidersHorizontal className="h-4 w-4" /> Filter
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              {table.getAllColumns()
                .filter((column) => column.getCanHide())
                .map((column) => {
                  return (
                    <DropdownMenuCheckboxItem
                      key={column.id}
                      className="capitalize"
                      checked={column.getIsVisible()}
                      onCheckedChange={(value) => column.toggleVisibility(!!value)}
                    >
                      {column.id}
                    </DropdownMenuCheckboxItem>
                  )
                })}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        <div className="flex gap-2 w-full sm:w-auto justify-end">
          <Button variant="outline" onClick={handleExportExcel} className="h-10">Export Excel</Button>
          <Button variant="outline" onClick={handleExportPDF} className="h-10">Export PDF</Button>
        </div>
      </div>

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
                          : flexRender(
                              header.column.columnDef.header,
                              header.getContext()
                            )}
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
                              type="number"
                              value={(header.column.getFilterValue() as string) ?? ""}
                              onChange={(event) =>
                                header.column.setFilterValue(event.target.value)
                              }
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
                <TableCell colSpan={table.getAllColumns().length} className="h-24 text-center">
                  No results.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {/* Pagination */}
      <div className="flex items-center justify-between px-2">
        <div className="flex-1 text-sm text-slate-500">
          Showing {table.getRowModel().rows.length} of {data.length} records
        </div>
        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            className="h-8 w-8 p-0"
            onClick={() => table.setPageIndex(0)}
            disabled={!table.getCanPreviousPage()}
          >
            <ChevronsLeft className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            className="h-8 w-8 p-0"
            onClick={() => table.previousPage()}
            disabled={!table.getCanPreviousPage()}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            className="h-8 w-8 p-0"
            onClick={() => table.nextPage()}
            disabled={!table.getCanNextPage()}
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            className="h-8 w-8 p-0"
            onClick={() => table.setPageIndex(table.getPageCount() - 1)}
            disabled={!table.getCanNextPage()}
          >
            <ChevronsRight className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <IdCardModal
        survey={selectedSurvey}
        open={isIdModalOpen}
        onOpenChange={setIsIdModalOpen}
      />
      <HealthcardModal
        survey={selectedSurvey}
        open={isHealthModalOpen}
        onOpenChange={setIsHealthModalOpen}
      />
      <EditSurveyModal
        survey={editSurvey}
        open={isEditModalOpen}
        onOpenChange={setIsEditModalOpen}
        onUpdated={() => {
          setIsEditModalOpen(false);
        }}
      />
    </div>
  );
}
