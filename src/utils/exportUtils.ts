/**
 * Export utility functions for survey data
 * Handles Excel and PDF export functionality
 */

import type { Survey } from "@/shared/schema";
import type { ColumnFiltersState } from "@tanstack/react-table";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { COLUMN_DATA_EXTRACTORS, COLUMN_LABELS } from "@/utils/tableUtils";
import { ORGANIZATION_INFO, PDF_CONFIG } from "@/utils/tableUtils";

/**
 * Export survey data to Excel format with statistics
 */
export async function exportToExcel(
  data: Survey[],
  _columnVisibility: Record<string, boolean>
): Promise<void> {
  // Get ALL columns (excluding actions) for statistics
  // Note: columnVisibility is intentionally not used - we export all fields for complete statistics
  const allColumns = Object.keys(COLUMN_DATA_EXTRACTORS);

  // Build headers and rows based on all columns
  const headers = allColumns.map((colId) => COLUMN_LABELS[colId] || colId);
  const rows = data.map((survey) =>
    allColumns.map((colId) => COLUMN_DATA_EXTRACTORS[colId]?.(survey) || "-")
  );

  // Calculate statistics for each column (excluding name fields as they're not meaningful for stats)
  const statisticsRows: (string | number)[][] = [[], ["STATISTICS"], []];

  allColumns.filter((colId) => !['name', 'firstName', 'lastName'].includes(colId)).forEach((colId) => {
    const columnValues = data
      .map((s) => COLUMN_DATA_EXTRACTORS[colId]?.(s))
      .filter((v) => v !== "-");
    const totalCount = columnValues.length;

    if (totalCount === 0) return;

    statisticsRows.push([COLUMN_LABELS[colId] || colId]);

    // Group by value and count
    const valueCounts: Record<string, number> = {};
    columnValues.forEach((val) => {
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
    statisticsRows.push(["  TOTAL", totalCount, "100%"]);
    statisticsRows.push([]);
  });

  // Build sheet with filter info header, then data
  const wsWithFilter = XLSX.utils.aoa_to_sheet([
    ["SK RIZAL YOUTH SURVEY DATA"],
    [],
    ["Export Information"],
    ["Export Date:", new Date().toLocaleString()],
    ["Total Records:", data.length],
    ["Data Fields:", allColumns.length],
    ["Applied Filters:", "Export includes all data fields"],
    [],
    headers,
  ]);

  XLSX.utils.sheet_add_aoa(wsWithFilter, rows, { origin: "A10" });

  // Auto-fit column widths
  const colWidths = headers.map((header, i) => {
    const headerLen = header.toString().length;
    const maxDataLen = Math.max(
      ...rows.slice(0, 100).map((row) => (row[i]?.toString() || "").length),
      headerLen
    );
    return { wch: Math.min(Math.max(maxDataLen + 2, 10), 50) };
  });
  wsWithFilter["!cols"] = colWidths;

  // Freeze header row (row 9 - the headers)
  wsWithFilter["!freeze"] = { xSplit: 0, ySplit: 9, topLeftCell: "A10" };

  // Enable Excel filters on the data table
  if (data.length > 0) {
    wsWithFilter["!autofilter"] = {
      ref: `A9:${XLSX.utils.encode_col(headers.length - 1)}${9 + data.length}`,
    };
  }

  // Style the workbook cells
  // Style title (A1)
  if (wsWithFilter["A1"]) {
    wsWithFilter["A1"].s = {
      font: { bold: true, sz: 16, color: { rgb: "C9182A" } },
      alignment: { horizontal: "center", vertical: "center" },
      fill: { fgColor: { rgb: "F8F9FA" } },
    };
  }

  // Merge title cell across all columns
  if (!wsWithFilter["!merges"]) wsWithFilter["!merges"] = [];
  wsWithFilter["!merges"].push({
    s: { r: 0, c: 0 },
    e: { r: 0, c: headers.length - 1 },
  });

  // Style "Export Information" header (A3)
  if (wsWithFilter["A3"]) {
    wsWithFilter["A3"].s = {
      font: { bold: true, sz: 12, color: { rgb: "C9182A" } },
      fill: { fgColor: { rgb: "F8F9FA" } },
      border: {
        bottom: { style: "medium", color: { rgb: "C9182A" } },
      },
    };
  }
  wsWithFilter["!merges"].push({
    s: { r: 2, c: 0 },
    e: { r: 2, c: headers.length - 1 },
  });

  // Style info labels (A4:A7)
  ["A4", "A5", "A6", "A7"].forEach((cell) => {
    if (wsWithFilter[cell]) {
      wsWithFilter[cell].s = {
        font: { bold: true, sz: 10 },
        fill: { fgColor: { rgb: "F1F3F5" } },
      };
    }
  });

  // Style header row (row 9)
  for (let col = 0; col < headers.length; col++) {
    const cellAddr = XLSX.utils.encode_cell({ r: 8, c: col });
    if (wsWithFilter[cellAddr]) {
      wsWithFilter[cellAddr].s = {
        font: { bold: true, color: { rgb: "FFFFFF" }, sz: 11 },
        fill: { fgColor: { rgb: "C9182A" } },
        alignment: { horizontal: "center", vertical: "center", wrapText: true },
        border: {
          top: { style: "thin", color: { rgb: "000000" } },
          bottom: { style: "thin", color: { rgb: "000000" } },
          left: { style: "thin", color: { rgb: "000000" } },
          right: { style: "thin", color: { rgb: "000000" } },
        },
      };
    }
  }

  // Style data rows with alternating colors
  for (let row = 9; row < 9 + data.length; row++) {
    const isEven = (row - 9) % 2 === 0;
    for (let col = 0; col < headers.length; col++) {
      const cellAddr = XLSX.utils.encode_cell({ r: row, c: col });
      if (wsWithFilter[cellAddr]) {
        wsWithFilter[cellAddr].s = {
          alignment: {
            horizontal: col === 0 ? "left" : "center",
            vertical: "center",
            wrapText: false,
          },
          fill: { fgColor: { rgb: isEven ? "FFFFFF" : "F8F9FA" } },
          border: {
            top: { style: "thin", color: { rgb: "E9ECEF" } },
            bottom: { style: "thin", color: { rgb: "E9ECEF" } },
            left: { style: "thin", color: { rgb: "E9ECEF" } },
            right: { style: "thin", color: { rgb: "E9ECEF" } },
          },
        };
      }
    }
  }

  // Set row heights
  wsWithFilter["!rows"] = [
    { hpt: 30 }, // Title row
    { hpt: 10 }, // Empty row
    { hpt: 20 }, // "Export Information"
    { hpt: 18 }, // Export Date
    { hpt: 18 }, // Total Records
    { hpt: 18 }, // Data Fields
    { hpt: 18 }, // Applied Filters
    { hpt: 10 }, // Empty row
    { hpt: 25 }, // Header row
  ];

  // Create statistics sheet with improved formatting
  const statsSheet = XLSX.utils.aoa_to_sheet([
    ["SK RIZAL SURVEY STATISTICS"],
    [],
    ["Report Information"],
    ["Export Date:", new Date().toLocaleString()],
    ["Total Records:", data.length],
    ["Data Fields Analyzed:", allColumns.filter((c) => !['name', 'firstName', 'lastName'].includes(c)).length],
    [],
    ...statisticsRows,
  ]);

  // Auto-fit columns for statistics sheet
  const statsColWidths = [
    { wch: 35 }, // Field names
    { wch: 15 }, // Count
    { wch: 12 }, // Percentage
  ];
  statsSheet["!cols"] = statsColWidths;

  // Style statistics sheet
  // Title
  if (statsSheet["A1"]) {
    statsSheet["A1"].s = {
      font: { bold: true, sz: 16, color: { rgb: "C9182A" } },
      alignment: { horizontal: "center", vertical: "center" },
      fill: { fgColor: { rgb: "F8F9FA" } },
    };
  }
  if (!statsSheet["!merges"]) statsSheet["!merges"] = [];
  statsSheet["!merges"].push({ s: { r: 0, c: 0 }, e: { r: 0, c: 2 } });

  // "Report Information" header
  if (statsSheet["A3"]) {
    statsSheet["A3"].s = {
      font: { bold: true, sz: 12, color: { rgb: "C9182A" } },
      fill: { fgColor: { rgb: "F8F9FA" } },
      border: { bottom: { style: "medium", color: { rgb: "C9182A" } } },
    };
  }
  statsSheet["!merges"].push({ s: { r: 2, c: 0 }, e: { r: 2, c: 2 } });

  // Info labels
  ["A4", "A5", "A6"].forEach((cell) => {
    if (statsSheet[cell]) {
      statsSheet[cell].s = {
        font: { bold: true, sz: 10 },
        fill: { fgColor: { rgb: "F1F3F5" } },
      };
    }
  });

  // Style statistics data
  const statsRange = XLSX.utils.decode_range(statsSheet["!ref"] || "A1");
  for (let row = 7; row <= statsRange.e.r; row++) {
    for (let col = 0; col <= statsRange.e.c; col++) {
      const cellAddr = XLSX.utils.encode_cell({ r: row, c: col });
      if (statsSheet[cellAddr]) {
        const cellValue = statsSheet[cellAddr].v;
        const isHeader =
          typeof cellValue === "string" &&
          !cellValue.startsWith("  ") &&
          cellValue !== "STATISTICS" &&
          cellValue.trim().length > 0;
        const isTotal = typeof cellValue === "string" && cellValue.includes("TOTAL");
        const isSectionTitle = cellValue === "STATISTICS";

        if (isSectionTitle) {
          statsSheet[cellAddr].s = {
            font: { bold: true, sz: 14, color: { rgb: "C9182A" } },
            alignment: { horizontal: "center", vertical: "center" },
            fill: { fgColor: { rgb: "F8F9FA" } },
          };
        } else if (isHeader && !isTotal) {
          statsSheet[cellAddr].s = {
            font: { bold: true, sz: 11, color: { rgb: "FFFFFF" } },
            fill: { fgColor: { rgb: "495057" } },
            alignment: { horizontal: "left", vertical: "center" },
            border: {
              top: { style: "thin", color: { rgb: "000000" } },
              bottom: { style: "thin", color: { rgb: "000000" } },
              left: { style: "thin", color: { rgb: "000000" } },
              right: { style: "thin", color: { rgb: "000000" } },
            },
          };
        } else if (isTotal) {
          statsSheet[cellAddr].s = {
            font: { bold: true, sz: 10, color: { rgb: "C9182A" } },
            fill: { fgColor: { rgb: "FFF3CD" } },
            alignment: { horizontal: col === 0 ? "left" : "center", vertical: "center" },
            border: {
              top: { style: "medium", color: { rgb: "C9182A" } },
              bottom: { style: "thin", color: { rgb: "000000" } },
            },
          };
        } else {
          statsSheet[cellAddr].s = {
            alignment: { horizontal: col === 0 ? "left" : "center", vertical: "center" },
            fill: { fgColor: { rgb: row % 2 === 0 ? "FFFFFF" : "F8F9FA" } },
            border: {
              top: { style: "thin", color: { rgb: "E9ECEF" } },
              bottom: { style: "thin", color: { rgb: "E9ECEF" } },
            },
          };
        }
      }
    }
  }

  // Set row heights for statistics
  if (!statsSheet["!rows"]) statsSheet["!rows"] = [];
  statsSheet["!rows"][0] = { hpt: 30 }; // Title
  statsSheet["!rows"][2] = { hpt: 20 }; // "Report Information"

  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, wsWithFilter, "Survey Data");
  XLSX.utils.book_append_sheet(wb, statsSheet, "Statistics");
  const excelBuffer = XLSX.write(wb, { bookType: "xlsx", type: "array" });
  const dataBlob = new Blob([excelBuffer], {
    type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8",
  });
  saveAs(dataBlob, "youth_surveys_filtered.xlsx");
}

/**
 * Export survey data to PDF format
 */
export async function exportToPDF(
  data: Survey[],
  columnFilters: ColumnFiltersState,
  columnVisibility: Record<string, boolean>
): Promise<void> {
  // Get visible columns
  const visibleColumns = Object.entries(columnVisibility)
    .filter(([colId, isVisible]) => isVisible && colId !== "actions")
    .map(([colId]) => colId);

  const visiblePdfColumns = visibleColumns.slice(0, 6);

  // Build table data
  const headers = visiblePdfColumns.map((colId) => COLUMN_LABELS[colId] || colId);
  const body = data.map((s) =>
    visiblePdfColumns.map((colId) => COLUMN_DATA_EXTRACTORS[colId]?.(s) || "-")
  );

  // Create PDF
  const doc = new jsPDF();

  // Load logo
  let logoDataUrl: string | null = null;
  try {
    const logoImg = new Image();
    logoImg.crossOrigin = "anonymous";

    await new Promise<void>((resolve) => {
      logoImg.onload = () => {
        const canvas = document.createElement("canvas");
        canvas.width = logoImg.width;
        canvas.height = logoImg.height;
        const ctx = canvas.getContext("2d");
        if (ctx) {
          ctx.drawImage(logoImg, 0, 0);
          logoDataUrl = canvas.toDataURL("image/png");
        }
        resolve();
      };
      logoImg.onerror = () => resolve();
      logoImg.src = ORGANIZATION_INFO.logoUrl;
      setTimeout(() => resolve(), 2000);
    });
  } catch (e) {
    console.warn("Logo could not be loaded:", e);
  }

  // Cover Page
  if (logoDataUrl) {
    try {
      doc.addImage(logoDataUrl, "PNG", doc.internal.pageSize.width / 2 - 15, 15, 30, 30);
    } catch (e) {
      console.warn("Could not add logo to PDF:", e);
    }
  }

  // Header
  doc.setTextColor(ORGANIZATION_INFO.color.r, ORGANIZATION_INFO.color.g, ORGANIZATION_INFO.color.b);
  doc.setFontSize(10);
  doc.text(ORGANIZATION_INFO.name, doc.internal.pageSize.width / 2, 52, { align: "center" });
  doc.text(ORGANIZATION_INFO.city, doc.internal.pageSize.width / 2, 58, { align: "center" });

  // Title
  doc.setFontSize(22);
  doc.setFont(undefined, "bold");
  doc.setTextColor(0);
  doc.text("Youth Survey Report", doc.internal.pageSize.width / 2, 72, { align: "center" });

  // Decorative line
  doc.setDrawColor(ORGANIZATION_INFO.color.r, ORGANIZATION_INFO.color.g, ORGANIZATION_INFO.color.b);
  doc.setLineWidth(0.5);
  doc.line(50, 77, doc.internal.pageSize.width - 50, 77);

  // Date
  doc.setTextColor(100);
  doc.setFontSize(10);
  doc.setFont(undefined, "normal");
  doc.text(new Date().toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" }), doc.internal.pageSize.width / 2, 85, { align: "center" });

  // Summary boxes
  const boxY = 100;
  const boxWidth = 85;
  const boxHeight = 35;
  const boxGap = 10;

  // Box 1: Total Records
  doc.setDrawColor(ORGANIZATION_INFO.color.r, ORGANIZATION_INFO.color.g, ORGANIZATION_INFO.color.b);
  doc.setLineWidth(0.75);
  doc.roundedRect(14, boxY, boxWidth, boxHeight, 3, 3, "S");
  doc.setFontSize(9);
  doc.setFont(undefined, "normal");
  doc.setTextColor(100);
  doc.text("Total Records", 14 + boxWidth / 2, boxY + 12, { align: "center" });
  doc.setFontSize(20);
  doc.setFont(undefined, "bold");
  doc.setTextColor(ORGANIZATION_INFO.color.r, ORGANIZATION_INFO.color.g, ORGANIZATION_INFO.color.b);
  doc.text(String(data.length), 14 + boxWidth / 2, boxY + 26, { align: "center" });

  // Box 2: Data Fields
  doc.setDrawColor(ORGANIZATION_INFO.color.r, ORGANIZATION_INFO.color.g, ORGANIZATION_INFO.color.b);
  doc.setLineWidth(0.75);
  doc.roundedRect(14 + boxWidth + boxGap, boxY, boxWidth, boxHeight, 3, 3, "S");
  doc.setFont(undefined, "normal");
  doc.setFontSize(9);
  doc.setTextColor(100);
  doc.text("Data Fields", 14 + boxWidth + boxGap + boxWidth / 2, boxY + 12, { align: "center" });
  doc.setFontSize(20);
  doc.setFont(undefined, "bold");
  doc.setTextColor(ORGANIZATION_INFO.color.r, ORGANIZATION_INFO.color.g, ORGANIZATION_INFO.color.b);
  doc.text(String(visiblePdfColumns.length), 14 + boxWidth + boxGap + boxWidth / 2, boxY + 26, { align: "center" });

  // Filters section
  doc.setFont(undefined, "bold");
  doc.setFontSize(11);
  doc.setTextColor(0);
  doc.text("Applied Filters", 14, boxY + boxHeight + 18);
  doc.setDrawColor(200);
  doc.setLineWidth(0.3);
  doc.line(14, boxY + boxHeight + 20, 85, boxY + boxHeight + 20);

  doc.setFont(undefined, "normal");
  doc.setFontSize(10);
  doc.setTextColor(100);
  if (columnFilters.length > 0) {
    let filterY = boxY + boxHeight + 28;
    columnFilters.forEach((filter) => {
      const filterLabel = COLUMN_LABELS[filter.id] || filter.id;
      const filterValue = Array.isArray(filter.value) ? filter.value.join(", ") : filter.value;
      doc.setTextColor(ORGANIZATION_INFO.color.r, ORGANIZATION_INFO.color.g, ORGANIZATION_INFO.color.b);
      doc.text("•", 16, filterY);
      doc.setTextColor(60);
      doc.text(`${filterLabel}: ${filterValue}`, 20, filterY);
      filterY += 6;
    });
  } else {
    doc.text("No filters applied - showing all records", 14, boxY + boxHeight + 28);
  }

  // Data table page
  doc.addPage();
  doc.setTextColor(0);

  // Table header
  doc.setDrawColor(ORGANIZATION_INFO.color.r, ORGANIZATION_INFO.color.g, ORGANIZATION_INFO.color.b);
  doc.setLineWidth(1);
  doc.line(14, 20, doc.internal.pageSize.width - 14, 20);
  doc.setFontSize(9);
  doc.setFont(undefined, "normal");
  doc.setTextColor(100);
  doc.text(`${ORGANIZATION_INFO.name} - ${ORGANIZATION_INFO.city}`, 14, 12);
  doc.setFontSize(14);
  doc.setFont(undefined, "bold");
  doc.setTextColor(0);
  doc.text("Survey Data", 14, 18);

  // Generate table
  autoTable(doc, {
    head: [headers],
    body: body,
    startY: 25,
    theme: "grid",
    headStyles: {
      fillColor: [255, 255, 255],
      textColor: [0, 0, 0],
      fontSize: 9,
      fontStyle: "bold",
      halign: "center",
      lineWidth: 0.5,
      lineColor: [ORGANIZATION_INFO.color.r, ORGANIZATION_INFO.color.g, ORGANIZATION_INFO.color.b],
    },
    bodyStyles: {
      fontSize: 8,
      cellPadding: 3,
      lineWidth: 0.1,
      lineColor: [200, 200, 200],
    },
    columnStyles: {
      0: { cellWidth: "auto", fontStyle: "bold" }, // Name column
    },
    margin: { top: 25, bottom: 20 },
    didDrawPage: (tableData) => {
      // Add section header on each page after the first two pages
      if (tableData.pageNumber > 2) {
        doc.setDrawColor(ORGANIZATION_INFO.color.r, ORGANIZATION_INFO.color.g, ORGANIZATION_INFO.color.b);
        doc.setLineWidth(1);
        doc.line(14, 20, doc.internal.pageSize.width - 14, 20);
        doc.setFontSize(9);
        doc.setFont(undefined, "normal");
        doc.setTextColor(100);
        doc.text(`${ORGANIZATION_INFO.name} - ${ORGANIZATION_INFO.city}`, 14, 12);
        doc.setFontSize(14);
        doc.setFont(undefined, "bold");
        doc.setTextColor(0);
        doc.text("Survey Data (continued)", 14, 18);
      }
    },
  });

  // Add new page for statistics
  doc.addPage();

  // Statistics page header
  doc.setDrawColor(ORGANIZATION_INFO.color.r, ORGANIZATION_INFO.color.g, ORGANIZATION_INFO.color.b);
  doc.setLineWidth(1);
  doc.line(14, 20, doc.internal.pageSize.width - 14, 20);
  doc.setFontSize(9);
  doc.setFont(undefined, "normal");
  doc.setTextColor(100);
  doc.text(`${ORGANIZATION_INFO.name} - ${ORGANIZATION_INFO.city}`, 14, 12);
  doc.setFontSize(14);
  doc.setFont(undefined, "bold");
  doc.setTextColor(0);
  doc.text("Complete Statistics Report", 14, 18);

  // Get all columns for statistics
  const allColumns = Object.keys(COLUMN_DATA_EXTRACTORS);

  let statsY = 35;
  const pageHeight = doc.internal.pageSize.height;
  const leftMargin = 14;
  const rightMargin = doc.internal.pageSize.width - 14;
  const contentWidth = rightMargin - leftMargin;

  // Helper function to draw a print-friendly progress bar
  const drawProgressBar = (x: number, y: number, width: number, percentage: number) => {
    // Background border
    doc.setDrawColor(200, 200, 200);
    doc.setLineWidth(0.3);
    doc.rect(x, y - 3, width, 5, "S");

    // Foreground fill (minimal)
    const fillWidth = (width * percentage) / 100;
    if (fillWidth > 0) {
      doc.setFillColor(220, 220, 220);
      doc.rect(x, y - 3, fillWidth, 5, "F");
    }
  };

  // Calculate statistics for ALL columns (excluding name fields)
  allColumns
    .filter((colId) => !['name', 'firstName', 'lastName'].includes(colId))
    .forEach((colId) => {
      const columnValues = data
        .map((s) => COLUMN_DATA_EXTRACTORS[colId]?.(s))
        .filter((v) => v !== "-");

      if (columnValues.length === 0) return;

      const valueCounts: Record<string, number> = {};
      columnValues.forEach((val) => {
        const strVal = String(val);
        valueCounts[strVal] = (valueCounts[strVal] || 0) + 1;
      });

      // Check if we need a new page before starting this section
      const estimatedHeight = 25 + Object.keys(valueCounts).length * 10;
      if (statsY + estimatedHeight > pageHeight - 30) {
        doc.addPage();
        // Add header on new page
        doc.setDrawColor(ORGANIZATION_INFO.color.r, ORGANIZATION_INFO.color.g, ORGANIZATION_INFO.color.b);
        doc.setLineWidth(1);
        doc.line(14, 20, doc.internal.pageSize.width - 14, 20);
        doc.setFontSize(9);
        doc.setFont(undefined, "normal");
        doc.setTextColor(100);
        doc.text(`${ORGANIZATION_INFO.name} - ${ORGANIZATION_INFO.city}`, 14, 12);
        doc.setFontSize(14);
        doc.setFont(undefined, "bold");
        doc.setTextColor(0);
        doc.text("Complete Statistics Report (continued)", 14, 18);
        statsY = 35;
      }

      // Draw section border (no background fill)
      doc.setDrawColor(220, 220, 220);
      doc.setLineWidth(0.3);
      const sectionHeight = 12 + Object.keys(valueCounts).length * 8 + 8;
      doc.roundedRect(leftMargin, statsY - 2, contentWidth, sectionHeight, 2, 2, "S");

      // Column header with icon
      doc.setTextColor(ORGANIZATION_INFO.color.r, ORGANIZATION_INFO.color.g, ORGANIZATION_INFO.color.b);
      doc.setFont(undefined, "bold");
      doc.setFontSize(11);
      doc.text(`▸ ${COLUMN_LABELS[colId] || colId}`, leftMargin + 3, statsY + 5);

      // Total count text (no badge fill)
      const badge = `${data.filter((s) => COLUMN_DATA_EXTRACTORS[colId]?.(s) !== "-").length} responses`;
      doc.setFontSize(8);
      doc.setFont(undefined, "normal");
      doc.setTextColor(100);
      doc.text(badge, rightMargin, statsY + 4.5, { align: "right" });

      statsY += 12;

      // Draw values with progress bars
      doc.setFont(undefined, "normal");
      doc.setFontSize(9);
      doc.setTextColor(60);

      const sortedValues = Object.entries(valueCounts).sort((a, b) => b[1] - a[1]);

      sortedValues.forEach(([value, count]) => {
        const percentage = (count / data.length) * 100;

        // Value label
        const maxLabelWidth = 80;
        const truncatedValue = value.length > 30 ? value.substring(0, 27) + "..." : value;
        doc.text(truncatedValue, leftMargin + 6, statsY);

        // Progress bar
        const barX = leftMargin + maxLabelWidth;
        const barWidth = contentWidth - maxLabelWidth - 40;
        drawProgressBar(barX, statsY, barWidth, percentage);

        // Count and percentage
        doc.setFont(undefined, "bold");
        doc.setTextColor(ORGANIZATION_INFO.color.r, ORGANIZATION_INFO.color.g, ORGANIZATION_INFO.color.b);
        doc.text(`${count}`, rightMargin - 25, statsY);
        doc.setFont(undefined, "normal");
        doc.setTextColor(100);
        doc.setFontSize(8);
        doc.text(`${percentage.toFixed(1)}%`, rightMargin - 1, statsY, { align: "right" });
        doc.setFontSize(9);

        statsY += 8;

        // Add new page if content goes beyond page height
        if (statsY > pageHeight - 20) {
          doc.addPage();
          doc.setDrawColor(ORGANIZATION_INFO.color.r, ORGANIZATION_INFO.color.g, ORGANIZATION_INFO.color.b);
          doc.setLineWidth(1);
          doc.line(14, 20, doc.internal.pageSize.width - 14, 20);
          doc.setFontSize(9);
          doc.setFont(undefined, "normal");
          doc.setTextColor(100);
          doc.text(`${ORGANIZATION_INFO.name} - ${ORGANIZATION_INFO.city}`, 14, 12);
          doc.setFontSize(14);
          doc.setFont(undefined, "bold");
          doc.setTextColor(0);
          doc.text("Complete Statistics Report (continued)", 14, 18);
          statsY = 35;
        }
      });

      statsY += 6;
    });

  // Add comprehensive summary section
  if (statsY > pageHeight - 80) {
    doc.addPage();
    statsY = 35;
  }

  // Summary section - Print-friendly
  doc.setDrawColor(ORGANIZATION_INFO.color.r, ORGANIZATION_INFO.color.g, ORGANIZATION_INFO.color.b);
  doc.setLineWidth(0.75);
  doc.line(14, statsY, doc.internal.pageSize.width - 14, statsY);
  statsY += 8;
  doc.setTextColor(0);
  doc.setFont(undefined, "bold");
  doc.setFontSize(13);
  doc.text("Report Summary", doc.internal.pageSize.width / 2, statsY, { align: "center" });
  doc.setLineWidth(0.75);
  doc.line(14, statsY + 2, doc.internal.pageSize.width - 14, statsY + 2);
  statsY += 12;

  // Summary boxes
  const summaryBoxY = statsY;
  const summaryBoxWidth = (contentWidth - 10) / 2;

  // Left box
  doc.setDrawColor(ORGANIZATION_INFO.color.r, ORGANIZATION_INFO.color.g, ORGANIZATION_INFO.color.b);
  doc.setLineWidth(0.5);
  doc.roundedRect(leftMargin, summaryBoxY, summaryBoxWidth, 40, 3, 3, "S");

  doc.setFontSize(10);
  doc.setTextColor(100);
  doc.text("Dataset Information", leftMargin + summaryBoxWidth / 2, summaryBoxY + 8, {
    align: "center",
  });

  doc.setFontSize(9);
  doc.setTextColor(60);
  doc.setFont(undefined, "normal");
  doc.text(`Total Records: ${data.length}`, leftMargin + 5, summaryBoxY + 18);
  doc.text(`Data Fields: ${allColumns.filter((c) => !['name', 'firstName', 'lastName'].includes(c)).length}`, leftMargin + 5, summaryBoxY + 26);
  doc.text(`Export Date: ${new Date().toLocaleDateString()}`, leftMargin + 5, summaryBoxY + 34);

  // Right box
  doc.setDrawColor(ORGANIZATION_INFO.color.r, ORGANIZATION_INFO.color.g, ORGANIZATION_INFO.color.b);
  doc.setLineWidth(0.5);
  doc.roundedRect(leftMargin + summaryBoxWidth + 10, summaryBoxY, summaryBoxWidth, 40, 3, 3, "S");

  doc.setFontSize(10);
  doc.setTextColor(100);
  doc.setFont(undefined, "bold");
  doc.text(
    "Filter Status",
    leftMargin + summaryBoxWidth + 10 + summaryBoxWidth / 2,
    summaryBoxY + 8,
    { align: "center" }
  );

  doc.setFontSize(9);
  doc.setTextColor(60);
  doc.setFont(undefined, "normal");

  if (columnFilters.length > 0) {
    doc.text(`Active Filters: ${columnFilters.length}`, leftMargin + summaryBoxWidth + 15, summaryBoxY + 18);
    let filterTextY = summaryBoxY + 26;
    columnFilters.slice(0, 2).forEach((filter) => {
      const filterLabel = COLUMN_LABELS[filter.id] || filter.id;
      doc.text(`• ${filterLabel}`, leftMargin + summaryBoxWidth + 15, filterTextY);
      filterTextY += 6;
    });
    if (columnFilters.length > 2) {
      doc.text(
        `... and ${columnFilters.length - 2} more`,
        leftMargin + summaryBoxWidth + 15,
        filterTextY
      );
    }
  } else {
    doc.text("No filters applied", leftMargin + summaryBoxWidth + 15, summaryBoxY + 18);
    doc.text("Showing all records", leftMargin + summaryBoxWidth + 15, summaryBoxY + 26);
  }

  // Add page numbers
  const pageCount = doc.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setFontSize(9);
    doc.setTextColor(150);
    doc.text(
      `Page ${i} of ${pageCount}`,
      doc.internal.pageSize.width / 2,
      doc.internal.pageSize.height - 10,
      { align: "center" }
    );
  }

  // Save PDF
  doc.save(PDF_CONFIG.filename);
}

/**
 * Export a card (ID or Health card) as PNG with proper CSS support
 * @param elementId - The ID of the element to capture
 * @param fileName - The name for the downloaded file (without extension)
 * @returns Promise<void>
 */
/**
 * Export card element as high-quality PNG
 * Uses modern-screenshot for superior CSS compatibility
 */
export async function exportCardAsPNG(
  elementId: string,
  fileName: string
): Promise<void> {
  const targetElement = document.getElementById(elementId);
  if (!targetElement) {
    throw new Error(`Element with ID "${elementId}" not found`);
  }

  // Wait for images to load
  const images = Array.from(targetElement.querySelectorAll("img"));
  await Promise.all(
    images.map((img) => {
      if (img.complete) return Promise.resolve();
      return new Promise<void>((resolve) => {
        const onLoad = () => resolve();
        img.addEventListener("load", onLoad, { once: true });
        img.addEventListener("error", onLoad, { once: true });
        setTimeout(resolve, 5000);
      });
    })
  );

  // Wait for fonts
  if (document.fonts) {
    await document.fonts.ready;
  }

  // Allow layout to stabilize
  await new Promise((resolve) => setTimeout(resolve, 300));

  // Import modern-screenshot - handles modern CSS better
  const { domToPng } = await import("modern-screenshot");

  // Generate PNG with modern-screenshot
  const dataUrl = await domToPng(targetElement, {
    scale: 2, // 2x for high quality
    backgroundColor: "#ffffff",
    filter: (node: Element) => {
      return !node.classList?.contains("no-print");
    },
    // modern-screenshot has better handling of:
    // - CSS gradients
    // - Flexbox/Grid layouts
    // - Transforms and positioning
    // - Modern CSS features
  });

  // Convert data URL to blob
  const response = await fetch(dataUrl);
  const blob = await response.blob();

  // Download
  saveAs(blob, `${fileName}.png`);
}
