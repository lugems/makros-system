import type ExcelJS from 'exceljs';
import { format } from 'date-fns';
import { DateRange } from 'react-day-picker';
import { Invoice } from '@/types/invoice';
import { Payment } from '@/types/payment';
import { JobCard } from '@/types/job-card';
import { InventoryItem } from '@/types/inventory';

interface ExportAccountingDataOptions {
  invoices: Invoice[];
  payments: Payment[];
  jobCards?: JobCard[];
  inventory?: InventoryItem[];
  dateRange?: DateRange;
  userRole?: string;
  activeTab?: string;
}

const formatSafeDate = (value: unknown, formatPattern: string = 'yyyy-MM-dd'): string => {
  if (!value) return 'N/A';
  try {
    if (value instanceof Date) return format(value, formatPattern);
    if (typeof value === 'object' && value !== null && 'toDate' in value && typeof (value as { toDate: () => Date }).toDate === 'function') {
      return format((value as { toDate: () => Date }).toDate(), formatPattern);
    }
    const d = new Date(value as string | number);
    if (isNaN(d.getTime())) return 'N/A';
    return format(d, formatPattern);
  } catch {
    return 'N/A';
  }
};

const getDateRangeLabel = (dateRange?: DateRange): string => {
  if (dateRange?.from) {
    if (dateRange.to) {
      return `${format(dateRange.from, 'MMM dd, yyyy')} - ${format(dateRange.to, 'MMM dd, yyyy')}`;
    }
    return `From ${format(dateRange.from, 'MMM dd, yyyy')}`;
  }
  return 'Global Archive (All Time)';
};

const getFileDateSuffix = (dateRange?: DateRange): string => {
  if (dateRange?.from) {
    if (dateRange.to) {
      return `${format(dateRange.from, 'yyyyMMdd')}_${format(dateRange.to, 'yyyyMMdd')}`;
    }
    return `${format(dateRange.from, 'yyyyMMdd')}`;
  }
  return 'All_Time';
};

/**
 * Enterprise Excel Export (.xlsx) for Accounting and Intelligence Ledger.
 * Uses exceljs browser bundle with custom formatting, auto-widths, styles, and multi-sheet consolidation.
 */
export async function exportAccountingExcel({
  invoices,
  payments,
  jobCards = [],
  inventory = [],
  dateRange,
  userRole = 'Authorized User',
}: ExportAccountingDataOptions): Promise<void> {
  const ExcelJSModule = await import('exceljs/dist/exceljs.min.js');
  const ExcelJSClass = (ExcelJSModule.default || ExcelJSModule) as unknown as typeof ExcelJS;
  const workbook = new ExcelJSClass.Workbook();
  workbook.creator = 'Makros System';
  workbook.lastModifiedBy = 'Makros Intelligence Ledger';
  workbook.created = new Date();
  workbook.modified = new Date();

  const dateIntervalLabel = getDateRangeLabel(dateRange);

  // 1. EXECUTIVE SUMMARY SHEET
  const summarySheet = workbook.addWorksheet('Executive Summary', {
    views: [{ showGridLines: true }],
  });

  // Title Banner
  summarySheet.mergeCells('A1:E1');
  const titleCell = summarySheet.getCell('A1');
  titleCell.value = 'MAKROS SYSTEM • FORENSIC ACCOUNTING & INTELLIGENCE LEDGER';
  titleCell.font = { name: 'Arial', size: 14, bold: true, color: { argb: 'FFFFFFFF' } };
  titleCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF0F172A' } };
  titleCell.alignment = { vertical: 'middle', horizontal: 'center' };
  summarySheet.getRow(1).height = 36;

  // Metadata Info
  summarySheet.getCell('A3').value = 'Date Interval:';
  summarySheet.getCell('B3').value = dateIntervalLabel;
  summarySheet.getCell('A4').value = 'Generated At:';
  summarySheet.getCell('B4').value = format(new Date(), 'yyyy-MM-dd HH:mm:ss');
  summarySheet.getCell('A5').value = 'Export Authority:';
  summarySheet.getCell('B5').value = userRole;

  ['A3', 'A4', 'A5'].forEach(cellId => {
    const c = summarySheet.getCell(cellId);
    c.font = { bold: true, color: { argb: 'FF475569' }, size: 10 };
  });
  ['B3', 'B4', 'B5'].forEach(cellId => {
    const c = summarySheet.getCell(cellId);
    c.font = { bold: true, color: { argb: 'FF0F172A' }, size: 10 };
  });

  // Calculate Metrics
  const grossBilled = invoices.reduce((sum, inv) => sum + (Number(inv.grandTotal) || 0), 0);
  const netCollected = payments.reduce((sum, pay) => sum + (Number(pay.amount) || 0), 0);
  const totalTax = invoices.reduce((sum, inv) => sum + (Number(inv.tax) || 0), 0);
  const partsOutlay = invoices.reduce((sum, inv) => sum + (Number(inv.partsTotal) || 0), 0);
  const laborProfit = invoices.reduce((sum, inv) => sum + (Number(inv.laborTotal) || 0), 0);
  const totalOutstanding = invoices.reduce((sum, inv) => sum + (Number(inv.balance) || 0), 0);
  const activeBays = jobCards.filter(j => !['Completed', 'Cancelled', 'Delivered', 'Paid'].includes(j.status)).length;
  const completedJobs = jobCards.filter(j => j.status === 'Completed').length;
  const totalJobs = jobCards.length || 1;
  const efficiency = Math.round((completedJobs / totalJobs) * 100);

  // Table Headers
  const summaryHeaderRow = summarySheet.getRow(7);
  summaryHeaderRow.values = ['Financial & Operational Metric', 'Value (UGX / Count)', 'Metric Category', 'Status / Audit Note'];
  summaryHeaderRow.height = 26;
  summaryHeaderRow.eachCell((cell) => {
    cell.font = { bold: true, color: { argb: 'FFFFFFFF' }, size: 11 };
    cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF1E293B' } };
    cell.alignment = { vertical: 'middle', horizontal: 'left' };
    cell.border = {
      top: { style: 'thin', color: { argb: 'FFCBD5E1' } },
      bottom: { style: 'medium', color: { argb: 'FF0F172A' } },
    };
  });

  const summaryData = [
    ['Gross Authorized Billings', grossBilled, 'Fiscal Invoicing', 'Total authorized client invoice values'],
    ['Net Realized Revenue', netCollected, 'Fiscal Treasury', 'Verified collections into accounts'],
    ['Tax Provision (VAT)', totalTax, 'Fiscal Compliance', 'Cumulative tax liability'],
    ['Inventory Cost of Parts', partsOutlay, 'Operational Outlay', 'Material capital allocated'],
    ['Operational Labor Margin', laborProfit, 'Operational Profit', 'Labor gross margin'],
    ['Total Outstanding Debt', totalOutstanding, 'Credit & Risk', 'Unsettled receivables at risk'],
    ['Job Completion Efficiency', `${efficiency}%`, 'Operational Throughput', `${completedJobs} of ${jobCards.length} jobs completed`],
    ['Active Bay Capacity Load', activeBays, 'Shop Operations', 'Vehicles actively in service bays'],
  ];

  summaryData.forEach((row, idx) => {
    const r = summarySheet.getRow(8 + idx);
    r.values = row;
    r.height = 22;
    r.eachCell((cell, colNum) => {
      cell.border = {
        bottom: { style: 'thin', color: { argb: 'FFE2E8F0' } },
        left: { style: 'thin', color: { argb: 'FFE2E8F0' } },
        right: { style: 'thin', color: { argb: 'FFE2E8F0' } },
      };
      if (idx % 2 === 1) {
        cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFF8FAFC' } };
      }
      if (colNum === 2 && typeof row[1] === 'number') {
        cell.numFmt = '#,##0';
        cell.alignment = { horizontal: 'right' };
        cell.font = { bold: true };
      }
    });
  });

  summarySheet.columns = [
    { width: 34 },
    { width: 26 },
    { width: 24 },
    { width: 44 },
  ];

  // 2. INVOICES LEDGER SHEET
  const invSheet = workbook.addWorksheet('Invoices Ledger', {
    views: [{ showGridLines: true }],
  });

  invSheet.mergeCells('A1:L1');
  const invTitle = invSheet.getCell('A1');
  invTitle.value = `INVOICES LEDGER • INTERVAL: ${dateIntervalLabel.toUpperCase()}`;
  invTitle.font = { name: 'Arial', size: 12, bold: true, color: { argb: 'FFFFFFFF' } };
  invTitle.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF0F172A' } };
  invTitle.alignment = { vertical: 'middle', horizontal: 'center' };
  invSheet.getRow(1).height = 30;

  const invHeaders = [
    'Invoice #',
    'Issue Date',
    'Due Date',
    'Customer Ref',
    'Job Card Ref',
    'Labor (UGX)',
    'Parts (UGX)',
    'Discount (UGX)',
    'Tax (UGX)',
    'Grand Total (UGX)',
    'Amount Paid (UGX)',
    'Balance Due (UGX)',
    'Payment Status',
  ];

  const invHeaderRow = invSheet.getRow(3);
  invHeaderRow.values = invHeaders;
  invHeaderRow.height = 24;
  invHeaderRow.eachCell((cell) => {
    cell.font = { bold: true, color: { argb: 'FFFFFFFF' }, size: 10 };
    cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF334155' } };
    cell.alignment = { vertical: 'middle', horizontal: 'center' };
  });

  let invRowIdx = 4;
  invoices.forEach((inv) => {
    const row = invSheet.getRow(invRowIdx);
    row.values = [
      inv.invoiceNumber || inv.invoiceId,
      formatSafeDate(inv.issuedAt),
      formatSafeDate(inv.dueDate),
      inv.customerId || 'N/A',
      inv.jobCardId || 'N/A',
      inv.laborTotal || 0,
      inv.partsTotal || 0,
      inv.discount || 0,
      inv.tax || 0,
      inv.grandTotal || 0,
      inv.amountPaid || 0,
      inv.balance || 0,
      inv.paymentStatus || 'Unpaid',
    ];
    row.height = 20;

    row.eachCell((cell, colNum) => {
      cell.border = {
        bottom: { style: 'thin', color: { argb: 'FFE2E8F0' } },
        left: { style: 'thin', color: { argb: 'FFE2E8F0' } },
        right: { style: 'thin', color: { argb: 'FFE2E8F0' } },
      };
      // Format monetary columns (6 through 12)
      if (colNum >= 6 && colNum <= 12) {
        cell.numFmt = '#,##0';
        cell.alignment = { horizontal: 'right' };
      }
      if (colNum === 13) {
        cell.alignment = { horizontal: 'center' };
        if (inv.paymentStatus === 'Paid') {
          cell.font = { color: { argb: 'FF16A34A' }, bold: true };
        } else if (inv.paymentStatus === 'Overdue') {
          cell.font = { color: { argb: 'FFDC2626' }, bold: true };
        }
      }
    });

    invRowIdx++;
  });

  // Total Row for Invoices
  if (invoices.length > 0) {
    const totalRow = invSheet.getRow(invRowIdx);
    totalRow.values = [
      'TOTALS',
      '',
      '',
      '',
      `${invoices.length} Invoices`,
      { formula: `SUM(F4:F${invRowIdx - 1})` },
      { formula: `SUM(G4:G${invRowIdx - 1})` },
      { formula: `SUM(H4:H${invRowIdx - 1})` },
      { formula: `SUM(I4:I${invRowIdx - 1})` },
      { formula: `SUM(J4:J${invRowIdx - 1})` },
      { formula: `SUM(K4:K${invRowIdx - 1})` },
      { formula: `SUM(L4:L${invRowIdx - 1})` },
      '',
    ];
    totalRow.height = 24;
    totalRow.eachCell((cell, colNum) => {
      cell.font = { bold: true, size: 10, color: { argb: 'FF0F172A' } };
      cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFE2E8F0' } };
      cell.border = {
        top: { style: 'medium', color: { argb: 'FF0F172A' } },
        bottom: { style: 'double', color: { argb: 'FF0F172A' } },
      };
      if (colNum >= 6 && colNum <= 12) {
        cell.numFmt = '#,##0';
        cell.alignment = { horizontal: 'right' };
      }
    });
  }

  invSheet.columns = [
    { width: 18 }, // Invoice #
    { width: 14 }, // Issue Date
    { width: 14 }, // Due Date
    { width: 18 }, // Customer
    { width: 18 }, // Job Card
    { width: 15 }, // Labor
    { width: 15 }, // Parts
    { width: 14 }, // Discount
    { width: 14 }, // Tax
    { width: 18 }, // Grand Total
    { width: 18 }, // Amount Paid
    { width: 18 }, // Balance Due
    { width: 16 }, // Status
  ];

  // 3. PAYMENTS LEDGER SHEET
  const paySheet = workbook.addWorksheet('Payments Ledger', {
    views: [{ showGridLines: true }],
  });

  paySheet.mergeCells('A1:G1');
  const payTitle = paySheet.getCell('A1');
  payTitle.value = `PAYMENTS LEDGER • INTERVAL: ${dateIntervalLabel.toUpperCase()}`;
  payTitle.font = { name: 'Arial', size: 12, bold: true, color: { argb: 'FFFFFFFF' } };
  payTitle.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF0F172A' } };
  payTitle.alignment = { vertical: 'middle', horizontal: 'center' };
  paySheet.getRow(1).height = 30;

  const payHeaders = [
    'Receipt / Payment ID',
    'Payment Date',
    'Invoice Ref',
    'Customer Ref',
    'Payment Method',
    'Amount Settled (UGX)',
    'Status',
  ];

  const payHeaderRow = paySheet.getRow(3);
  payHeaderRow.values = payHeaders;
  payHeaderRow.height = 24;
  payHeaderRow.eachCell((cell) => {
    cell.font = { bold: true, color: { argb: 'FFFFFFFF' }, size: 10 };
    cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF15803D' } };
    cell.alignment = { vertical: 'middle', horizontal: 'center' };
  });

  let payRowIdx = 4;
  payments.forEach((pay) => {
    const row = paySheet.getRow(payRowIdx);
    row.values = [
      pay.receiptNumber || pay.paymentId,
      formatSafeDate(pay.paidAt, 'yyyy-MM-dd HH:mm'),
      pay.invoiceId || 'N/A',
      pay.customerId || 'N/A',
      pay.method || 'Cash',
      pay.amount || 0,
      pay.status || 'Completed',
    ];
    row.height = 20;

    row.eachCell((cell, colNum) => {
      cell.border = {
        bottom: { style: 'thin', color: { argb: 'FFE2E8F0' } },
        left: { style: 'thin', color: { argb: 'FFE2E8F0' } },
        right: { style: 'thin', color: { argb: 'FFE2E8F0' } },
      };
      if (colNum === 6) {
        cell.numFmt = '#,##0';
        cell.alignment = { horizontal: 'right' };
        cell.font = { bold: true };
      }
    });

    payRowIdx++;
  });

  // Total Row for Payments
  if (payments.length > 0) {
    const totalRow = paySheet.getRow(payRowIdx);
    totalRow.values = [
      'TOTAL SETTLED',
      '',
      '',
      '',
      `${payments.length} Transactions`,
      { formula: `SUM(F4:F${payRowIdx - 1})` },
      '',
    ];
    totalRow.height = 24;
    totalRow.eachCell((cell, colNum) => {
      cell.font = { bold: true, size: 10, color: { argb: 'FF0F172A' } };
      cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFE2E8F0' } };
      cell.border = {
        top: { style: 'medium', color: { argb: 'FF0F172A' } },
        bottom: { style: 'double', color: { argb: 'FF0F172A' } },
      };
      if (colNum === 6) {
        cell.numFmt = '#,##0';
        cell.alignment = { horizontal: 'right' };
      }
    });
  }

  paySheet.columns = [
    { width: 24 }, // Payment ID
    { width: 20 }, // Date
    { width: 20 }, // Invoice
    { width: 20 }, // Customer
    { width: 18 }, // Method
    { width: 22 }, // Amount
    { width: 14 }, // Status
  ];

  // 4. DEBT LEDGER (OUTSTANDING INVOICES) SHEET
  const debtInvoices = invoices.filter(inv => (inv.balance || 0) > 0 && inv.paymentStatus !== 'Cancelled');
  if (debtInvoices.length > 0) {
    const debtSheet = workbook.addWorksheet('Debt Ledger', {
      views: [{ showGridLines: true }],
    });

    debtSheet.mergeCells('A1:G1');
    const debtTitle = debtSheet.getCell('A1');
    debtTitle.value = `OUTSTANDING RECEIVABLES & DEBT LEDGER • ${dateIntervalLabel.toUpperCase()}`;
    debtTitle.font = { name: 'Arial', size: 12, bold: true, color: { argb: 'FFFFFFFF' } };
    debtTitle.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFC2410C' } };
    debtTitle.alignment = { vertical: 'middle', horizontal: 'center' };
    debtSheet.getRow(1).height = 30;

    const debtHeaders = [
      'Invoice #',
      'Issue Date',
      'Due Date',
      'Customer Ref',
      'Billed Total (UGX)',
      'Balance Due (UGX)',
      'Status',
    ];

    const debtHeaderRow = debtSheet.getRow(3);
    debtHeaderRow.values = debtHeaders;
    debtHeaderRow.height = 24;
    debtHeaderRow.eachCell((cell) => {
      cell.font = { bold: true, color: { argb: 'FFFFFFFF' }, size: 10 };
      cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF9A3412' } };
      cell.alignment = { vertical: 'middle', horizontal: 'center' };
    });

    let debtRowIdx = 4;
    debtInvoices.forEach((inv) => {
      const row = debtSheet.getRow(debtRowIdx);
      row.values = [
        inv.invoiceNumber || inv.invoiceId,
        formatSafeDate(inv.issuedAt),
        formatSafeDate(inv.dueDate),
        inv.customerId || 'N/A',
        inv.grandTotal || 0,
        inv.balance || 0,
        inv.paymentStatus || 'Unpaid',
      ];
      row.height = 20;

      row.eachCell((cell, colNum) => {
        cell.border = {
          bottom: { style: 'thin', color: { argb: 'FFE2E8F0' } },
          left: { style: 'thin', color: { argb: 'FFE2E8F0' } },
          right: { style: 'thin', color: { argb: 'FFE2E8F0' } },
        };
        if (colNum === 5 || colNum === 6) {
          cell.numFmt = '#,##0';
          cell.alignment = { horizontal: 'right' };
          if (colNum === 6) {
            cell.font = { bold: true, color: { argb: 'FFDC2626' } };
          }
        }
      });

      debtRowIdx++;
    });

    const totalDebtRow = debtSheet.getRow(debtRowIdx);
    totalDebtRow.values = [
      'TOTAL DEBT AT RISK',
      '',
      '',
      `${debtInvoices.length} Pending Invoices`,
      { formula: `SUM(E4:E${debtRowIdx - 1})` },
      { formula: `SUM(F4:F${debtRowIdx - 1})` },
      '',
    ];
    totalDebtRow.height = 24;
    totalDebtRow.eachCell((cell, colNum) => {
      cell.font = { bold: true, size: 10, color: { argb: 'FF0F172A' } };
      cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFE2E8F0' } };
      cell.border = {
        top: { style: 'medium', color: { argb: 'FF0F172A' } },
        bottom: { style: 'double', color: { argb: 'FF0F172A' } },
      };
      if (colNum === 5 || colNum === 6) {
        cell.numFmt = '#,##0';
        cell.alignment = { horizontal: 'right' };
      }
    });

    debtSheet.columns = [
      { width: 20 },
      { width: 14 },
      { width: 14 },
      { width: 22 },
      { width: 20 },
      { width: 22 },
      { width: 16 },
    ];
  }

  // 5. INVENTORY REGISTRY SHEET (If inventory exists)
  if (inventory.length > 0) {
    const invStockSheet = workbook.addWorksheet('Inventory Stock', {
      views: [{ showGridLines: true }],
    });

    invStockSheet.mergeCells('A1:G1');
    const stockTitle = invStockSheet.getCell('A1');
    stockTitle.value = 'INVENTORY & SKU REPLENISHMENT REGISTRY';
    stockTitle.font = { name: 'Arial', size: 12, bold: true, color: { argb: 'FFFFFFFF' } };
    stockTitle.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF0F172A' } };
    stockTitle.alignment = { vertical: 'middle', horizontal: 'center' };
    invStockSheet.getRow(1).height = 30;

    const stockHeaders = [
      'SKU / Item Ref',
      'Item Name',
      'Category',
      'Stock Qty',
      'Reorder Level',
      'Purchase Price (UGX)',
      'Selling Price (UGX)',
    ];

    const stockHeaderRow = invStockSheet.getRow(3);
    stockHeaderRow.values = stockHeaders;
    stockHeaderRow.height = 24;
    stockHeaderRow.eachCell((cell) => {
      cell.font = { bold: true, color: { argb: 'FFFFFFFF' }, size: 10 };
      cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF475569' } };
      cell.alignment = { vertical: 'middle', horizontal: 'center' };
    });

    let stockRowIdx = 4;
    inventory.forEach((item) => {
      const row = invStockSheet.getRow(stockRowIdx);
      row.values = [
        item.itemId,
        item.itemName,
        item.category || 'General',
        item.quantity || 0,
        item.reorderLevel || 0,
        item.purchasePrice || 0,
        item.sellingPrice || 0,
      ];
      row.height = 20;

      row.eachCell((cell, colNum) => {
        cell.border = {
          bottom: { style: 'thin', color: { argb: 'FFE2E8F0' } },
          left: { style: 'thin', color: { argb: 'FFE2E8F0' } },
          right: { style: 'thin', color: { argb: 'FFE2E8F0' } },
        };
        if (colNum === 4 && item.quantity <= item.reorderLevel) {
          cell.font = { color: { argb: 'FFDC2626' }, bold: true };
        }
        if (colNum === 6 || colNum === 7) {
          cell.numFmt = '#,##0';
          cell.alignment = { horizontal: 'right' };
        }
      });

      stockRowIdx++;
    });

    invStockSheet.columns = [
      { width: 22 },
      { width: 30 },
      { width: 18 },
      { width: 14 },
      { width: 14 },
      { width: 22 },
      { width: 22 },
    ];
  }

  // Generate Excel Buffer and Download
  const buffer = await workbook.xlsx.writeBuffer();
  const blob = new Blob([buffer], {
    type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  });
  const url = window.URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = `Makros_Accounting_Report_${getFileDateSuffix(dateRange)}.xlsx`;
  document.body.appendChild(anchor);
  anchor.click();
  document.body.removeChild(anchor);
  window.URL.revokeObjectURL(url);
}

/**
 * Enterprise CSV Export for Accounting and Invoices Ledger correlating with selected date range.
 */
export async function exportAccountingCSV({
  invoices,
  payments,
  dateRange,
}: ExportAccountingDataOptions): Promise<void> {
  const dateIntervalLabel = getDateRangeLabel(dateRange);

  const escapeCSV = (val: string | number | null | undefined): string => {
    if (val === null || val === undefined) return '""';
    const str = String(val);
    if (str.includes(',') || str.includes('"') || str.includes('\n')) {
      return `"${str.replace(/"/g, '""')}"`;
    }
    return `"${str}"`;
  };

  const csvLines: string[] = [];

  // Metadata block
  csvLines.push('MAKROS SYSTEM - ACCOUNTING & FISCAL INVOICES LEDGER');
  csvLines.push(`Date Interval: ${dateIntervalLabel}`);
  csvLines.push(`Generated At: ${format(new Date(), 'yyyy-MM-dd HH:mm:ss')}`);
  csvLines.push('');

  // Invoices Header
  const headers = [
    'Invoice Number',
    'Issue Date',
    'Due Date',
    'Customer ID',
    'Job Card ID',
    'Labor Total (UGX)',
    'Parts Total (UGX)',
    'Discount (UGX)',
    'Tax (UGX)',
    'Grand Total (UGX)',
    'Amount Paid (UGX)',
    'Balance Due (UGX)',
    'Payment Status',
  ];
  csvLines.push(headers.map(h => `"${h}"`).join(','));

  let totalGrand = 0;
  let totalPaid = 0;
  let totalBalance = 0;

  invoices.forEach((inv) => {
    totalGrand += Number(inv.grandTotal) || 0;
    totalPaid += Number(inv.amountPaid) || 0;
    totalBalance += Number(inv.balance) || 0;

    const row = [
      escapeCSV(inv.invoiceNumber || inv.invoiceId),
      escapeCSV(formatSafeDate(inv.issuedAt)),
      escapeCSV(formatSafeDate(inv.dueDate)),
      escapeCSV(inv.customerId || 'N/A'),
      escapeCSV(inv.jobCardId || 'N/A'),
      inv.laborTotal || 0,
      inv.partsTotal || 0,
      inv.discount || 0,
      inv.tax || 0,
      inv.grandTotal || 0,
      inv.amountPaid || 0,
      inv.balance || 0,
      escapeCSV(inv.paymentStatus || 'Unpaid'),
    ];
    csvLines.push(row.join(','));
  });

  // Summary row
  csvLines.push('');
  csvLines.push([
    '"TOTALS"',
    '""',
    '""',
    '""',
    `"${invoices.length} Invoices"`,
    '""',
    '""',
    '""',
    '""',
    totalGrand,
    totalPaid,
    totalBalance,
    '""',
  ].join(','));

  const csvContent = '\uFEFF' + csvLines.join('\r\n');
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = window.URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = `Makros_Invoices_Ledger_${getFileDateSuffix(dateRange)}.csv`;
  document.body.appendChild(anchor);
  anchor.click();
  document.body.removeChild(anchor);
  window.URL.revokeObjectURL(url);
}
