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
import { DropdownMenu, DropdownMenuCheckboxItem, DropdownMenuContent, DropdownMenuTrigger, DropdownMenuLabel, DropdownMenuSeparator } from "@/components/ui/dropdown-menu";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { IdCardModal } from "./IdCardModal";
import { HealthcardModal } from "./HealthcardModal";
import { EditSurveyModal } from "./EditSurveyModal";
import type { Survey } from "@shared/schema";
import {
  CIVIL_STATUS_OPTIONS,
  SEX_OPTIONS,
  WORK_STATUS_OPTIONS,
  YOUTH_CLASSIFICATION_OPTIONS,
  KK_ASSEMBLY_FREQUENCY_OPTIONS,
  KK_ASSEMBLY_REASON_NO_OPTIONS,
  EDUCATION_OPTIONS,
  SPECIAL_NEEDS_TYPE_OPTIONS,
  LOCATION_OPTIONS
} from "@shared/schema";
import { Search, CreditCard, ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight, Trash2, Edit3, Heart, ArrowUp, ArrowDown, Columns, X, FileDown, Loader2 } from "lucide-react";
import { useDeleteSurvey } from "@/hooks/use-surveys";
import { useToast } from "@/hooks/use-toast";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Badge } from "@/components/ui/badge";
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
      case "educationalBackground": return EDUCATION_OPTIONS;
      case "specialNeedsType": return SPECIAL_NEEDS_TYPE_OPTIONS;
      case "attendedKkAssembly": return ["Yes", "No"];
      case "registeredSkVoter": return ["Yes", "No"];
      case "registeredNationalVoter": return ["Yes", "No"];
      case "votedLastElection": return ["Yes", "No"];
      case "kkAssemblyFrequency": return KK_ASSEMBLY_FREQUENCY_OPTIONS;
      case "kkAssemblyReasonNo": return KK_ASSEMBLY_REASON_NO_OPTIONS;
      case "location": return LOCATION_OPTIONS;
      default: return [];
    }
  }, [id]);

  if (options.length === 0) return null;

  const getDisplayValue = () => {
    if (columnFilterValue === undefined) return "all";
    if (["attendedKkAssembly", "registeredSkVoter", "registeredNationalVoter", "votedLastElection"].includes(id)) {
      return columnFilterValue === true ? "Yes" : columnFilterValue === false ? "No" : "all";
    }
    return (columnFilterValue as string) ?? "all";
  };

  return (
    <Select
      value={getDisplayValue()}
      onValueChange={(value) => {
        if (value === "all") {
          column.setFilterValue(undefined);
        } else if (["attendedKkAssembly", "registeredSkVoter", "registeredNationalVoter", "votedLastElection"].includes(id)) {
          column.setFilterValue(value === "Yes");
        } else {
          column.setFilterValue(value);
        }
      }}
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

// Define which columns should be visible by default
const DEFAULT_VISIBLE_COLUMNS = new Set([
  'name',
  'sex',
  'civilStatus',
  'youthClassification',
  'workStatus',
  'attendedKkAssembly',
  'actions',
]);

export function SurveyTable({ data }: SurveyTableProps) {
  const [sorting, setSorting] = useState<SortingState>([]);
  // Define sortable columns and labels
  const sortableColumns = [
    { id: 'firstName', label: 'First Name' },
    { id: 'lastName', label: 'Last Name' },
    { id: 'age', label: 'Age' },
    { id: 'youthAgeGroup', label: 'Age Group' },
    { id: 'sex', label: 'Sex' },
    { id: 'civilStatus', label: 'Status' },
    { id: 'workStatus', label: 'Work' },
    { id: 'youthClassification', label: 'Classification' },
    { id: 'educationalBackground', label: 'Education' },
    { id: 'specialNeedsType', label: 'Special Needs' },
    { id: 'registeredSkVoter', label: 'SK Voter' },
    { id: 'registeredNationalVoter', label: 'National Voter' },
    { id: 'votedLastElection', label: 'Voted' },
    { id: 'location', label: 'Location' },
  ];
  const currentSort = sorting[0] || { id: '', desc: false };
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [columnVisibility, setColumnVisibility] = useState({
    name: true,
    firstName: false,
    lastName: false,
    age: false,
    youthAgeGroup: false,
    sex: true,
    civilStatus: true,
    workStatus: true,
    youthClassification: true,
    educationalBackground: false,
    specialNeedsType: false,
    registeredSkVoter: false,
    registeredNationalVoter: false,
    votedLastElection: false,
    attendedKkAssembly: true,
    kkAssemblyFrequency: false,
    kkAssemblyReasonNo: false,
    location: false,
    actions: true,
  });
  const [selectedSurvey, setSelectedSurvey] = useState<Survey | null>(null);
  const [isIdModalOpen, setIsIdModalOpen] = useState(false);
  const [isHealthModalOpen, setIsHealthModalOpen] = useState(false);
  const [editSurvey, setEditSurvey] = useState<Survey | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [deletingId, setDeletingId] = useState<number | null>(null);

  const deleteSurvey = useDeleteSurvey();
  const { toast } = useToast();

  // Count active filters
  const activeFiltersCount = columnFilters.filter(f => f.value !== undefined && f.value !== '').length;

  // Clear all filters function
  const clearAllFilters = () => {
    setColumnFilters([]);
    table.resetColumnFilters();
  };

  const table = useReactTable({
    data,
    columns: [
      {
        id: "name",
        header: "Name",
        accessorFn: (row) => `${row.firstName} ${row.lastName}`,
        filterFn: (row, _id, value) => {
          if (!value) return true;
          const fullName = `${row.original.firstName} ${row.original.lastName}`.toLowerCase();
          return fullName.includes(value.toLowerCase());
        },
        cell: ({ row }) => <div className="font-medium">{`${row.original.firstName} ${row.original.lastName}`}</div>,
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
        filterFn: (row, id, value) => {
          if (!value) return true;
          return row.getValue(id) === value;
        },
      },
      {
        accessorKey: "youthAgeGroup",
        header: "Age Group",
        filterFn: (row, id, value) => {
          if (value === undefined) return true;
          return String(row.getValue(id)) === String(value);
        },
      },
      {
        accessorKey: "sex",
        header: "Sex",
        filterFn: (row, id, value) => {
          if (value === undefined) return true;
          return String(row.getValue(id)) === String(value);
        },
      },
      {
        accessorKey: "civilStatus",
        header: "Status",
        filterFn: (row, id, value) => {
          if (value === undefined) return true;
          return String(row.getValue(id)) === String(value);
        },
      },
      {
        accessorKey: "workStatus",
        header: "Work",
        filterFn: (row, id, value) => {
          if (value === undefined) return true;
          return String(row.getValue(id)) === String(value);
        },
      },
      {
        accessorKey: "youthClassification",
        header: "Classification",
        filterFn: (row, id, value) => {
          if (value === undefined) return true;
          return String(row.getValue(id)) === String(value);
        },
      },
      {
        accessorKey: "attendedKkAssembly",
        header: "KK Assembly",
        filterFn: (row, id, value) => {
          if (value === undefined) return true;
          return row.getValue(id) === value;
        },
        cell: ({ row }) => {
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
        filterFn: (row, id, value) => {
          if (value === undefined) return true;
          return String(row.getValue(id)) === String(value);
        },
        cell: ({ row }) => {
          const attended = row.original.attendedKkAssembly;
          const frequency = row.getValue("kkAssemblyFrequency");
          return attended ? <div className="text-sm">{String(frequency)}</div> : <div className="text-sm text-slate-400">-</div>;
        },
      },
      {
        accessorKey: "kkAssemblyReasonNo",
        header: "Reason (if No)",
        filterFn: (row, id, value) => {
          if (value === undefined) return true;
          return String(row.getValue(id)) === String(value);
        },
        cell: ({ row }) => {
          const attended = row.original.attendedKkAssembly;
          const reason = row.getValue("kkAssemblyReasonNo");
          return !attended ? <div className="text-sm">{String(reason)}</div> : <div className="text-sm text-slate-400">-</div>;
        },
      },
      {
        accessorKey: "educationalBackground",
        header: "Education",
        filterFn: (row, id, value) => {
          if (value === undefined) return true;
          return String(row.getValue(id)) === String(value);
        },
      },
      {
        accessorKey: "specialNeedsType",
        header: "Special Needs",
        filterFn: (row, id, value) => {
          if (value === undefined) return true;
          return String(row.getValue(id)) === String(value);
        },
        cell: ({ row }) => {
          const classification = row.original.youthClassification;
          const specialNeeds = row.getValue("specialNeedsType");
          return classification === "Youth with Special Needs" ? <div className="text-sm">{String(specialNeeds)}</div> : <div className="text-sm text-slate-400">-</div>;
        },
      },
      {
        accessorKey: "registeredSkVoter",
        header: "SK Voter",
        filterFn: (row, id, value) => {
          if (value === undefined) return true;
          return row.getValue(id) === value;
        },
        cell: ({ row }) => {
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
        filterFn: (row, id, value) => {
          if (value === undefined) return true;
          return row.getValue(id) === value;
        },
        cell: ({ row }) => {
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
        header: "Voted",
        filterFn: (row, id, value) => {
          if (value === undefined) return true;
          return row.getValue(id) === value;
        },
        cell: ({ row }) => {
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
        filterFn: (row, id, value) => {
          if (value === undefined) return true;
          return String(row.getValue(id)) === String(value);
        },
      },
      {
        id: "actions",
        header: "Actions",
        cell: ({ row }) => {
          const survey = row.original;
          return (
            <TooltipProvider>
              <div className="flex items-center gap-2">
                <Tooltip>
                  <TooltipTrigger asChild>
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
                  </TooltipTrigger>
                  <TooltipContent>View ID Card</TooltipContent>
                </Tooltip>

                <Tooltip>
                  <TooltipTrigger asChild>
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
                  </TooltipTrigger>
                  <TooltipContent>View Health Card</TooltipContent>
                </Tooltip>

                <Tooltip>
                  <TooltipTrigger asChild>
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
                  </TooltipTrigger>
                  <TooltipContent>Edit Record</TooltipContent>
                </Tooltip>

                  <Tooltip>
                  <AlertDialog>
                    <TooltipTrigger asChild>
                      <AlertDialogTrigger asChild>
                        <Button
                          variant="outline"
                          size="sm"
                          className="h-8 w-8 p-0 hover:bg-red-50 hover:text-red-600 border-slate-200"
                          disabled={deletingId === survey.id}
                        >
                          {deletingId === survey.id ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            <Trash2 className="h-4 w-4" />
                          )}
                        </Button>
                      </AlertDialogTrigger>
                    </TooltipTrigger>
                    <TooltipContent>Delete Record</TooltipContent>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Delete Record</AlertDialogTitle>
                        <AlertDialogDescription>
                          Are you sure you want to delete the record for {survey.firstName} {survey.lastName}? This action cannot be undone.
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
                </Tooltip>
              </div>
            </TooltipProvider>
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
    onColumnVisibilityChange: setColumnVisibility,
    state: {
      sorting,
      columnFilters,
      columnVisibility,
    },
  });

  const filteredData = table.getFilteredRowModel().rows.map(row => row.original);

  // Apply sorting to data
  const getSortedData = (data: Survey[]) => {
    if (sorting.length === 0) return data;

    const sortBy = sorting[0];
    return [...data].sort((a, b) => {
      let aValue = (a as any)[sortBy.id];
      let bValue = (b as any)[sortBy.id];

      // Handle null/undefined values
      if (aValue === null || aValue === undefined) aValue = '';
      if (bValue === null || bValue === undefined) bValue = '';

      // Handle string comparison (case-insensitive)
      if (typeof aValue === 'string' && typeof bValue === 'string') {
        aValue = aValue.toLowerCase();
        bValue = bValue.toLowerCase();
      }

      // Compare values
      if (aValue < bValue) return sortBy.desc ? 1 : -1;
      if (aValue > bValue) return sortBy.desc ? -1 : 1;
      return 0;
    });
  };

  const handleExportExcel = async () => {
    setIsExporting(true);
    try {
      const sortedFilteredData = getSortedData(filteredData);
    const filterInfo = columnFilters.length > 0
      ? columnFilters.map(f => `${f.id}: ${Array.isArray(f.value) ? f.value.join(', ') : f.value}`).join(' | ')
      : 'No filters applied';

    // Define column data extractors
    const columnDataExtractors: Record<string, (survey: Survey) => string | number> = {
      name: (s) => `${s.firstName} ${s.lastName}`,
      age: (s) => s.age || '-',
      youthAgeGroup: (s) => s.youthAgeGroup || '-',
      sex: (s) => s.sex || '-',
      civilStatus: (s) => s.civilStatus || '-',
      workStatus: (s) => s.workStatus || '-',
      youthClassification: (s) => s.youthClassification || '-',
      educationalBackground: (s) => s.educationalBackground || '-',
      specialNeedsType: (s) => s.youthClassification === 'Youth with Special Needs' ? (s.specialNeedsType || '-') : '-',
      registeredSkVoter: (s) => s.registeredSkVoter ? 'Yes' : 'No',
      registeredNationalVoter: (s) => s.registeredNationalVoter ? 'Yes' : 'No',
      votedLastElection: (s) => s.votedLastElection ? 'Yes' : 'No',
      attendedKkAssembly: (s) => s.attendedKkAssembly ? 'Yes' : 'No',
      kkAssemblyFrequency: (s) => s.attendedKkAssembly ? (s.kkAssemblyFrequency || '-') : '-',
      kkAssemblyReasonNo: (s) => !s.attendedKkAssembly ? (s.kkAssemblyReasonNo || '-') : '-',
      location: (s) => s.location || '-',
    };

    // Define friendly column labels
    const columnLabels: Record<string, string> = {
      name: 'Full Name',
      age: 'Age',
      youthAgeGroup: 'Age Group',
      sex: 'Sex',
      civilStatus: 'Civil Status',
      workStatus: 'Work Status',
      youthClassification: 'Classification',
      educationalBackground: 'Educational Background',
      specialNeedsType: 'Special Needs Type',
      registeredSkVoter: 'SK Voter',
      registeredNationalVoter: 'National Voter',
      votedLastElection: 'Voted Last Election',
      attendedKkAssembly: 'KK Assembly',
      kkAssemblyFrequency: 'KK Frequency',
      kkAssemblyReasonNo: 'KK Reason (if No)',
      location: 'Location',
    };

    // Get ALL columns (excluding actions)
    const allColumns = Object.keys(columnDataExtractors);

    // Build headers and rows based on all columns
    const headers = allColumns.map(colId => columnLabels[colId] || colId);
    const rows = sortedFilteredData.map(s =>
      allColumns.map(colId => columnDataExtractors[colId]?.(s) || '-')
    );

// Calculate statistics for each column (excluding name as it's not meaningful for stats)
    const statisticsRows: (string | number)[][] = [[], ['STATISTICS'], []];

    allColumns.filter(colId => colId !== 'name').forEach(colId => {
      const columnValues = sortedFilteredData.map(s => columnDataExtractors[colId]?.(s)).filter(v => v !== '-');
      const totalCount = columnValues.length;

      if (totalCount === 0) return;

      statisticsRows.push([columnLabels[colId] || colId]);

      // Group by value and count
      const valueCounts: Record<string, number> = {};
      columnValues.forEach(val => {
        const strVal = String(val);
        valueCounts[strVal] = (valueCounts[strVal] || 0) + 1;
      });

      // Sort by count descending and show top values
      Object.entries(valueCounts)
        .sort((a, b) => b[1] - a[1])
        .forEach(([value, count]) => {
          const percentage = ((count / totalCount) * 100).toFixed(2);
          statisticsRows.push([`  ${value}`, count, `${percentage}%`]);
        });

      // Add total row
      statisticsRows.push(['  TOTAL', totalCount, '100%']);
      statisticsRows.push([]);
    });

    // Build sheet with filter info header, then data
    const wsWithFilter = XLSX.utils.aoa_to_sheet([
      ['Export Filters:', filterInfo],
      ['Total Records:', sortedFilteredData.length],
      ['Export Date:', new Date().toLocaleString()],
      ['Total Columns:', allColumns.length],
      [],
      headers
    ]);

    XLSX.utils.sheet_add_aoa(wsWithFilter, rows, { origin: 'A7' });

    // Create statistics sheet
    const statsSheet = XLSX.utils.aoa_to_sheet([
      ['Survey Statistics Report'],
      ['Export Date:', new Date().toLocaleString()],
      ['Total Records:', sortedFilteredData.length],
      [],
      ...statisticsRows
    ]);

    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, wsWithFilter, "Survey Data");
    XLSX.utils.book_append_sheet(wb, statsSheet, "Statistics");
    const excelBuffer = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
    const dataBlob = new Blob([excelBuffer], {type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8'});
    saveAs(dataBlob, 'youth_surveys_filtered.xlsx');
    toast({ title: "Success", description: "Excel file exported successfully!" });
    } catch (error) {
      toast({ title: "Error", description: "Failed to export Excel file.", variant: "destructive" });
    } finally {
      setIsExporting(false);
    }
  };

  const handleExportPDF = async () => {
    setIsExporting(true);
    try {
      const sortedFilteredData = getSortedData(filteredData);
    const filterInfo = columnFilters.length > 0
      ? columnFilters.map(f => `${f.id}: ${Array.isArray(f.value) ? f.value.join(', ') : f.value}`).join(' | ')
      : 'No filters applied';

    // Define column data extractors
    const columnDataExtractors: Record<string, (survey: Survey) => string | number> = {
      name: (s) => `${s.firstName} ${s.lastName}`,
      age: (s) => s.age || '-',
      youthAgeGroup: (s) => s.youthAgeGroup || '-',
      sex: (s) => s.sex || '-',
      civilStatus: (s) => s.civilStatus || '-',
      workStatus: (s) => s.workStatus || '-',
      youthClassification: (s) => s.youthClassification || '-',
      educationalBackground: (s) => s.educationalBackground || '-',
      specialNeedsType: (s) => s.youthClassification === 'Youth with Special Needs' ? (s.specialNeedsType || '-') : '-',
      registeredSkVoter: (s) => s.registeredSkVoter ? 'Yes' : 'No',
      registeredNationalVoter: (s) => s.registeredNationalVoter ? 'Yes' : 'No',
      votedLastElection: (s) => s.votedLastElection ? 'Yes' : 'No',
      attendedKkAssembly: (s) => s.attendedKkAssembly ? 'Yes' : 'No',
      kkAssemblyFrequency: (s) => s.attendedKkAssembly ? (s.kkAssemblyFrequency || '-') : '-',
      kkAssemblyReasonNo: (s) => !s.attendedKkAssembly ? (s.kkAssemblyReasonNo || '-') : '-',
      location: (s) => s.location || '-',
    };

    // Define friendly column labels
    const columnLabels: Record<string, string> = {
      name: 'Full Name',
      age: 'Age',
      youthAgeGroup: 'Age Group',
      sex: 'Sex',
      civilStatus: 'Civil Status',
      workStatus: 'Work Status',
      youthClassification: 'Classification',
      educationalBackground: 'Educational Background',
      specialNeedsType: 'Special Needs Type',
      registeredSkVoter: 'SK Voter',
      registeredNationalVoter: 'National Voter',
      votedLastElection: 'Voted Last Election',
      attendedKkAssembly: 'KK Assembly',
      kkAssemblyFrequency: 'KK Frequency',
      kkAssemblyReasonNo: 'KK Reason (if No)',
      location: 'Location',
    };

    // Get visible columns for PDF
    const allVisibleColumns = Object.entries(columnVisibility)
      .filter(([colId, isVisible]) => isVisible && colId !== 'actions')
      .map(([colId]) => colId);

    // Check if currently visible columns match the default ones (excluding actions)
    const defaultVisibleCols = Array.from(DEFAULT_VISIBLE_COLUMNS).filter(col => col !== 'actions');
    const isDefaultFilters = defaultVisibleCols.length === allVisibleColumns.length &&
      defaultVisibleCols.every(col => allVisibleColumns.includes(col));

    // If using default filters, show all visible columns in stats; otherwise limit to 6
    const visiblePdfColumns = isDefaultFilters ? allVisibleColumns : allVisibleColumns.slice(0, 6);

    // Build headers and body based on visible PDF columns
    const headers = visiblePdfColumns.map(colId => columnLabels[colId] || colId);
    const body = sortedFilteredData.map(s =>
      visiblePdfColumns.map(colId => columnDataExtractors[colId]?.(s) || '-')
    );

    const doc = new jsPDF();

    // Add title and filter/stat information
    doc.setFontSize(14);
    const title = columnFilters.length > 0 ? "Youth Survey Report (Filtered)" : "Youth Survey Report";
    doc.text(title, 14, 15);

    doc.setFontSize(10);
    doc.setTextColor(100);
    doc.text(`Filters Applied: ${filterInfo}`, 14, 25);
    doc.text(`Total Records: ${sortedFilteredData.length} | Export Date: ${new Date().toLocaleString()}`, 14, 32);
    doc.text(`Report Key Columns: ${visiblePdfColumns.length}`, 14, 39);
    doc.setTextColor(0);

    // Generate the table
    autoTable(doc, {
      head: [headers],
      body: body,
      startY: 48,
    });

    // Add new page for statistics
    doc.addPage();
    doc.setFontSize(14);
    doc.setTextColor(0);
    doc.text('Complete Statistics Report', 14, 15);

    doc.setFontSize(10);
    doc.setTextColor(100);
    doc.text(`Report Date: ${new Date().toLocaleString()}`, 14, 25);
    doc.text(`Total Records: ${sortedFilteredData.length}`, 14, 32);
    doc.text(`Filters Applied: ${filterInfo}`, 14, 39);
    doc.setTextColor(0);

    // Get all columns for statistics
    const allColumns = Object.keys(columnDataExtractors);

    doc.setFontSize(9);
    let statsY = 48;
    const pageHeight = doc.internal.pageSize.height;

    // Calculate statistics for ALL columns (excluding name)
    allColumns.filter(colId => colId !== 'name').forEach(colId => {
      const columnValues = sortedFilteredData
        .map(s => columnDataExtractors[colId]?.(s))
        .filter(v => v !== '-');

      if (columnValues.length === 0) return;

      const valueCounts: Record<string, number> = {};
      columnValues.forEach(val => {
        const strVal = String(val);
        valueCounts[strVal] = (valueCounts[strVal] || 0) + 1;
      });

      // Draw separator line
      doc.setDrawColor(220, 220, 220);
      doc.line(14, statsY, 196, statsY);
      statsY += 4;

      // Check if we need a new page before starting this section
      if (statsY > pageHeight - 30) {
        doc.addPage();
        statsY = 10;
      }

      doc.setFont(undefined, 'bold');
      doc.setFontSize(10);
      doc.text(`${columnLabels[colId] || colId}:`, 14, statsY);
      statsY += 6;
      doc.setFont(undefined, 'normal');
      doc.setFontSize(9);

      Object.entries(valueCounts)
        .sort((a, b) => b[1] - a[1])
        .forEach(([value, count]) => {
          const percentage = ((count / sortedFilteredData.length) * 100).toFixed(1);
          doc.text(`  • ${value}`, 14, statsY);
          doc.text(`${count} (${percentage}%)`, 140, statsY);
          statsY += 4;

          // Add new page if content goes beyond page height
          if (statsY > pageHeight - 10) {
            doc.addPage();
            statsY = 10;
          }
        });

      // Add total row for this column
      const columnTotal = sortedFilteredData.filter(s => {
        const val = columnDataExtractors[colId]?.(s);
        return val !== '-';
      }).length;
      doc.setFont(undefined, 'bold');
      doc.text(`  TOTAL`, 14, statsY);
      doc.text(`${columnTotal} (100%)`, 140, statsY);
      doc.setFont(undefined, 'normal');
      statsY += 8;

      // Add new page if needed
      if (statsY > pageHeight - 20) {
        doc.addPage();
        statsY = 10;
      }
    });

    // Add summary section at the end
    doc.setDrawColor(50, 50, 50);
    doc.setLineWidth(0.5);
    doc.line(14, statsY, 196, statsY);
    statsY += 8;

    if (statsY > pageHeight - 30) {
      doc.addPage();
      statsY = 10;
    }

    doc.setFont(undefined, 'bold');
    doc.setFontSize(12);
    doc.text('Report Summary', 14, statsY);
    statsY += 8;

    doc.setFont(undefined, 'normal');
    doc.setFontSize(9);
    doc.text(`Total Records Analyzed: ${sortedFilteredData.length}`, 14, statsY);
    statsY += 5;
    doc.text(`Total Data Fields: ${allColumns.length - 1}`, 14, statsY); // -1 for name
    statsY += 5;
    doc.text(`Export Date: ${new Date().toLocaleString()}`, 14, statsY);
    statsY += 5;

    if (columnFilters.length > 0) {
      doc.text(`Active Filters: ${columnFilters.length}`, 14, statsY);
      statsY += 5;
      columnFilters.forEach(filter => {
        const filterLabel = columnLabels[filter.id] || filter.id;
        const filterValue = Array.isArray(filter.value) ? filter.value.join(', ') : filter.value;
        doc.text(`  • ${filterLabel}: ${filterValue}`, 14, statsY);
        statsY += 4;
      });
    } else {
      doc.text(`Active Filters: None (showing all records)`, 14, statsY);
    }

    doc.save('youth_surveys_filtered.pdf');
    toast({ title: "Success", description: "PDF file exported successfully!" });
    } catch (error) {
      toast({ title: "Error", description: "Failed to export PDF file.", variant: "destructive" });
    } finally {
      setIsExporting(false);
    }
  };

  const handleDelete = async (id: number) => {
    setDeletingId(id);
    try {
      await deleteSurvey.mutateAsync(id);
      toast({ title: "Deleted", description: "Survey record deleted successfully." });
    } catch (err) {
      toast({ title: "Error", description: "Failed to delete record.", variant: "destructive" });
    } finally {
      setDeletingId(null);
    }
  };


  return (
    <div className="space-y-4">
      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center bg-white p-4 rounded-xl border shadow-sm">
        <div className="flex gap-2 w-full sm:w-auto items-center flex-wrap">
          <div className="relative flex-1 sm:w-64">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-slate-400" />
            <Input
              placeholder="Search by first or last name..."
              value={(table.getColumn("name")?.getFilterValue() as string) ?? ""}
              onChange={(event) =>
                table.getColumn("name")?.setFilterValue(event.target.value)
              }
              className="pl-9 h-10"
            />
          </div>

          {/* Active Filters Badge */}
          {activeFiltersCount > 0 && (
            <Badge variant="secondary" className="h-10 px-3 gap-2">
              {activeFiltersCount} {activeFiltersCount === 1 ? 'Filter' : 'Filters'} Active
              <Button
                variant="ghost"
                size="sm"
                className="h-4 w-4 p-0 hover:bg-transparent"
                onClick={clearAllFilters}
              >
                <X className="h-3 w-3" />
              </Button>
            </Badge>
          )}

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="h-10 gap-2">
                <Columns className="h-4 w-4" /> Columns
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuLabel>Toggle Columns</DropdownMenuLabel>
              <DropdownMenuSeparator />
              {table.getAllColumns()
                .filter((column) => column.getCanHide())
                .map((column) => {
                  const isDefault = DEFAULT_VISIBLE_COLUMNS.has(column.id);
                  const columnLabels: Record<string, string> = {
                    name: 'Full Name',
                    firstName: 'First Name',
                    lastName: 'Last Name',
                    age: 'Age',
                    youthAgeGroup: 'Age Group',
                    sex: 'Sex',
                    civilStatus: 'Civil Status',
                    workStatus: 'Work Status',
                    youthClassification: 'Classification',
                    educationalBackground: 'Educational Background',
                    specialNeedsType: 'Special Needs Type',
                    registeredSkVoter: 'SK Voter Registration',
                    registeredNationalVoter: 'National Voter Registration',
                    votedLastElection: 'Voted Last Election',
                    attendedKkAssembly: 'KK Assembly',
                    kkAssemblyFrequency: 'KK Frequency',
                    kkAssemblyReasonNo: 'KK Reason (if No)',
                    location: 'Location',
                    actions: 'Actions',
                  };

                  const label = columnLabels[column.id] || column.id;
                  const defaultLabel = isDefault ? ' (default)' : '';

                  return (
                    <DropdownMenuCheckboxItem
                      key={column.id}
                      checked={column.getIsVisible()}
                      onCheckedChange={(value) => column.toggleVisibility(!!value)}
                      className="text-sm"
                    >
                      <span>{label}{defaultLabel && <span className="text-xs text-slate-500">{defaultLabel}</span>}</span>
                    </DropdownMenuCheckboxItem>
                  )
                })}
            </DropdownMenuContent>
          </DropdownMenu>
          {/* Sort Dropdown */}
          <Select
            value={currentSort.id ? `${currentSort.id}:${currentSort.desc ? 'desc' : 'asc'}` : 'none'}
            onValueChange={val => {
              if (val === 'none') return setSorting([]);
              const [id, dir] = val.split(":");
              setSorting([{ id, desc: dir === 'desc' }]);
            }}
          >
            <SelectTrigger className="h-10 w-44 text-[14px] ml-2">
              <SelectValue placeholder="Sort by..." />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="none">No Sort</SelectItem>
              {sortableColumns
                .filter(col => {
                  // Always include firstName and lastName unless name column is hidden
                  if (col.id === 'firstName' || col.id === 'lastName') {
                    return columnVisibility.name !== false;
                  }
                  // For other columns, use standard visibility check
                  return columnVisibility[col.id as keyof typeof columnVisibility] !== false;
                })
                .map(col => [
                  <SelectItem key={col.id+':asc'} value={`${col.id}:asc`}>{col.label} (Ascending)</SelectItem>,
                  <SelectItem key={col.id+':desc'} value={`${col.id}:desc`}>{col.label} (Descending)</SelectItem>
                ])}
            </SelectContent>
          </Select>
        </div>

        <div className="flex gap-2 w-full sm:w-auto justify-end">
          <Button
            variant="outline"
            onClick={handleExportExcel}
            className="h-10 gap-2"
            disabled={isExporting || data.length === 0}
          >
            {isExporting ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <FileDown className="h-4 w-4" />
            )}
            Excel
          </Button>
          <Button
            variant="outline"
            onClick={handleExportPDF}
            className="h-10 gap-2"
            disabled={isExporting || data.length === 0}
          >
            {isExporting ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <FileDown className="h-4 w-4" />
            )}
            PDF
          </Button>
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
                        {/* Sort indicator */}
                        {sorting[0]?.id === header.column.id && (
                          sorting[0].desc ? (
                            <ArrowDown className="h-3 w-3 text-slate-600" />
                          ) : (
                            <ArrowUp className="h-3 w-3 text-slate-600" />
                          )
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
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 px-2">
        <div className="flex items-center gap-4">
          <div className="text-sm text-slate-500">
            Showing {table.getState().pagination.pageIndex * table.getState().pagination.pageSize + 1} to{' '}
            {Math.min((table.getState().pagination.pageIndex + 1) * table.getState().pagination.pageSize, table.getFilteredRowModel().rows.length)} of{' '}
            {table.getFilteredRowModel().rows.length} {table.getFilteredRowModel().rows.length !== data.length && `(filtered from ${data.length})`} records
          </div>
          <Select
            value={table.getState().pagination.pageSize.toString()}
            onValueChange={(value) => {
              table.setPageSize(Number(value));
            }}
          >
            <SelectTrigger className="h-8 w-[100px]">
              <SelectValue placeholder="Page size" />
            </SelectTrigger>
            <SelectContent side="top">
              {[10, 20, 30, 50, 100].map((pageSize) => (
                <SelectItem key={pageSize} value={pageSize.toString()}>
                  {pageSize} rows
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
