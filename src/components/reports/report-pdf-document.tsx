'use client';

import React from 'react';
import { Page, Text, View, Document, StyleSheet, Font, Image } from '@react-pdf/renderer';
import { Invoice } from '@/types/invoice';
import { Payment } from '@/types/payment';
import { JobCard } from '@/types/job-card';
import { WorkshopSettings } from '@/types/settings';
import { DateRange } from 'react-day-picker';
import { format } from 'date-fns';

/**
 * @fileOverview Intelligence Ledger & Forensic Accounting PDF Report Document.
 * Designed with @react-pdf/renderer using the executive design system from invoice-pdf-document.
 */

Font.register({
  family: 'Inter',
  fonts: [
    { src: '/fonts/Inter_18pt-Regular.ttf', fontWeight: 400 },
    { src: '/fonts/Inter_18pt-Italic.ttf', fontWeight: 400, fontStyle: 'italic' },
    { src: '/fonts/Inter_18pt-Bold.ttf', fontWeight: 700 },
    { src: '/fonts/Inter_18pt-Black.ttf', fontWeight: 900 },
  ],
});

const safeText = (value: string | number | undefined | null, maxLength: number = 500) => {
  if (value === undefined || value === null) return '';
  const str = String(value);
  return str.length > maxLength ? str.substring(0, maxLength) + '...' : str;
};

const formatPdfDate = (date: any) => {
  if (!date) return 'N/A';
  let d: Date;

  if (typeof date === 'object' && 'toDate' in date && typeof date.toDate === 'function') {
    d = date.toDate();
  } else if (typeof date === 'object' && 'seconds' in date) {
    d = new Date(date.seconds * 1000);
  } else if (date instanceof Date) {
    d = date;
  } else if (typeof date === 'string' || typeof date === 'number') {
    d = new Date(date);
  } else {
    return 'N/A';
  }

  if (isNaN(d.getTime())) return 'Invalid Date';
  return format(d, 'yyyy-MM-dd');
};

const NAVY = '#102A43';
const INK = '#243B53';
const MUTED = '#627D98';
const BORDER = '#D9E2EC';
const PAPER = '#F7F9FC';
const ACCENT = '#F59E0B';
const SUCCESS = '#138A5B';
const DANGER = '#DC2626';

const styles = StyleSheet.create({
  page: {
    paddingTop: 28,
    paddingRight: 32,
    paddingBottom: 70,
    paddingLeft: 32,
    backgroundColor: '#FFFFFF',
    fontFamily: 'Inter',
    color: INK,
    fontSize: 7.5,
  },
  topRule: {
    height: 4,
    backgroundColor: ACCENT,
    marginBottom: 12,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 14,
  },
  brand: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '56%',
  },
  logoFrame: {
    width: 46,
    height: 46,
    borderWidth: 1,
    borderColor: BORDER,
    backgroundColor: PAPER,
    padding: 3,
    marginRight: 10,
  },
  logo: { width: 38, height: 38, objectFit: 'contain' },
  brandCopy: { flex: 1 },
  workshopName: {
    fontSize: 13,
    fontWeight: 900,
    color: NAVY,
    textTransform: 'uppercase',
    marginBottom: 2,
  },
  legalName: {
    fontSize: 6,
    fontWeight: 700,
    color: MUTED,
    textTransform: 'uppercase',
    marginBottom: 3,
  },
  contactText: { fontSize: 6, color: MUTED, marginBottom: 1.5 },
  titleBlock: {
    width: '42%',
    backgroundColor: NAVY,
    padding: 10,
    minHeight: 72,
  },
  documentTitle: {
    fontSize: 13,
    fontWeight: 900,
    color: '#FFFFFF',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  documentNumber: { marginTop: 4, fontSize: 7.5, fontWeight: 700, color: '#FFFFFF' },
  documentStatus: {
    alignSelf: 'flex-start',
    marginTop: 6,
    paddingVertical: 2,
    paddingHorizontal: 5,
    backgroundColor: ACCENT,
    color: NAVY,
    fontSize: 5.5,
    fontWeight: 900,
    textTransform: 'uppercase',
  },
  summaryBar: {
    flexDirection: 'row',
    borderWidth: 1,
    borderColor: BORDER,
    backgroundColor: PAPER,
    marginBottom: 14,
  },
  summaryCell: {
    flex: 1,
    paddingVertical: 6,
    paddingHorizontal: 8,
    borderRightWidth: 1,
    borderRightColor: BORDER,
  },
  summaryCellLast: { flex: 1, paddingVertical: 6, paddingHorizontal: 8 },
  microLabel: {
    fontSize: 5,
    fontWeight: 900,
    color: MUTED,
    letterSpacing: 0.6,
    textTransform: 'uppercase',
    marginBottom: 2,
  },
  summaryValue: { fontSize: 7.5, fontWeight: 700, color: NAVY },
  kpiGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 14,
  },
  kpiCard: {
    width: '24%',
    borderTopWidth: 3,
    borderTopColor: NAVY,
    borderRightWidth: 1,
    borderBottomWidth: 1,
    borderLeftWidth: 1,
    borderColor: BORDER,
    backgroundColor: PAPER,
    padding: 7,
  },
  kpiLabel: {
    fontSize: 5.5,
    fontWeight: 900,
    color: MUTED,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 4,
  },
  kpiValue: {
    fontSize: 10,
    fontWeight: 900,
    color: NAVY,
    marginBottom: 2,
  },
  kpiSubtext: {
    fontSize: 5,
    color: MUTED,
    textTransform: 'uppercase',
  },
  sectionHeading: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 6,
    marginBottom: 6,
  },
  sectionNumber: {
    width: 16,
    height: 16,
    paddingTop: 4,
    marginRight: 6,
    backgroundColor: NAVY,
    color: '#FFFFFF',
    fontSize: 6,
    fontWeight: 900,
    textAlign: 'center',
  },
  sectionTitle: {
    flex: 1,
    fontSize: 7.5,
    fontWeight: 900,
    color: NAVY,
    letterSpacing: 0.6,
    textTransform: 'uppercase',
  },
  sectionHint: { fontSize: 5.5, color: MUTED },
  table: {
    borderLeftWidth: 1,
    borderRightWidth: 1,
    borderTopWidth: 1,
    borderColor: BORDER,
    marginBottom: 12,
  },
  tableHeader: {
    flexDirection: 'row',
    backgroundColor: '#EAF0F6',
    paddingVertical: 5,
    paddingHorizontal: 6,
    borderBottomWidth: 1,
    borderBottomColor: BORDER,
  },
  tableRow: {
    flexDirection: 'row',
    alignItems: 'center',
    minHeight: 22,
    paddingVertical: 4,
    paddingHorizontal: 6,
    borderBottomWidth: 1,
    borderBottomColor: BORDER,
  },
  tableRowAlt: { backgroundColor: '#FAFCFE' },
  colNo: { width: '6%' },
  colRef: { width: '22%' },
  colDate: { width: '14%' },
  colCustomer: { width: '16%' },
  colAmount: { width: '14%', textAlign: 'right' },
  colPaid: { width: '14%', textAlign: 'right' },
  colBalance: { width: '14%', textAlign: 'right' },
  colStatus: { width: '14%', textAlign: 'center' },
  tableLabel: { fontSize: 5, fontWeight: 900, color: MUTED, letterSpacing: 0.5 },
  cellIndex: { fontSize: 5.5, fontWeight: 700, color: '#9FB3C8' },
  cellText: { fontSize: 6.5, fontWeight: 700, color: INK },
  cellSubtext: { fontSize: 5, color: MUTED },
  totalRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#E2E8F0',
    paddingVertical: 6,
    paddingHorizontal: 6,
    borderBottomWidth: 2,
    borderBottomColor: NAVY,
  },
  totalLabel: { fontSize: 6.5, fontWeight: 900, color: NAVY, textTransform: 'uppercase' },
  authBlock: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderColor: BORDER,
    padding: 10,
    backgroundColor: PAPER,
    marginTop: 8,
    marginBottom: 10,
  },
  authLeft: { width: '58%' },
  authRight: { width: '38%', borderLeftWidth: 1, borderLeftColor: BORDER, paddingLeft: 10 },
  authTitle: { fontSize: 5.5, fontWeight: 900, color: NAVY, textTransform: 'uppercase', marginBottom: 4 },
  authText: { fontSize: 6, color: MUTED, lineHeight: 1.3 },
  signatureLine: { height: 14, borderBottomWidth: 1, borderBottomColor: '#9FB3C8', marginTop: 10 },
  signatureLabel: { fontSize: 5, color: MUTED, textTransform: 'uppercase', marginTop: 3 },
  footer: {
    position: 'absolute',
    bottom: 18,
    left: 32,
    right: 32,
    paddingTop: 6,
    borderTopWidth: 1,
    borderTopColor: BORDER,
  },
  footerNote: { fontSize: 5.5, color: MUTED, marginBottom: 3, textAlign: 'center' },
  footerMeta: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  footerText: { fontSize: 5, color: MUTED },
  pageNumber: { fontSize: 5.5, fontWeight: 700, color: NAVY },
});

interface ReportPDFDocumentProps {
  invoices: Invoice[];
  payments: Payment[];
  jobCards?: JobCard[];
  dateRange?: DateRange;
  settings: WorkshopSettings | null;
  userRole?: string;
}

export function ReportPDFDocument({
  invoices,
  payments,
  jobCards = [],
  dateRange,
  settings,
  userRole = 'Authorized Official',
}: ReportPDFDocumentProps) {
  const currency = settings?.currency || 'Ush';

  const dateIntervalLabel = dateRange?.from
    ? dateRange.to
      ? `${format(dateRange.from, 'MMM dd, yyyy')} - ${format(dateRange.to, 'MMM dd, yyyy')}`
      : `From ${format(dateRange.from, 'MMM dd, yyyy')}`
    : 'Global Archive (All Time)';

  const formatValue = (val: number) => {
    return `${currency} ${Math.round(val || 0).toLocaleString()}`;
  };

  // Calculate Metrics
  const grossBilled = invoices.reduce((sum, inv) => sum + (Number(inv.grandTotal) || 0), 0);
  const netCollected = payments.reduce((sum, pay) => sum + (Number(pay.amount) || 0), 0);
  const totalTax = invoices.reduce((sum, inv) => sum + (Number(inv.tax) || 0), 0);
  const totalOutstanding = invoices.reduce((sum, inv) => sum + (Number(inv.balance) || 0), 0);
  const activeBays = jobCards.filter(j => !['Completed', 'Cancelled', 'Delivered', 'Paid'].includes(j.status)).length;
  const completedJobs = jobCards.filter(j => j.status === 'Completed').length;
  const totalJobs = jobCards.length || 1;
  const efficiency = Math.round((completedJobs / totalJobs) * 100);

  const reportReference = `REP-${format(new Date(), 'yyyyMMdd-HHmm')}`;

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <View style={styles.topRule} fixed />

        {/* Header Block */}
        <View style={styles.header}>
          <View style={styles.brand}>
            {settings?.logoUrl ? (
              <View style={styles.logoFrame}>
                <Image src={settings.logoUrl} style={styles.logo} />
              </View>
            ) : null}
            <View style={styles.brandCopy}>
              <Text style={styles.workshopName}>{safeText(settings?.workshopName || 'MAKROS SYSTEM')}</Text>
              <Text style={styles.legalName}>{safeText(settings?.businessRegistrationName || 'FORENSIC OPERATIONAL & FISCAL LEDGER')}</Text>
              {settings?.tin && <Text style={styles.contactText}>TIN: {safeText(settings.tin)}</Text>}
              <Text style={styles.contactText}>{safeText(settings?.address, 120)}</Text>
              <Text style={styles.contactText}>Tel: {safeText(settings?.phone)} | Email: {safeText(settings?.email)}</Text>
            </View>
          </View>

          <View style={styles.titleBlock}>
            <Text style={styles.documentTitle}>INTELLIGENCE LEDGER</Text>
            <Text style={styles.documentNumber}>#{reportReference}</Text>
            <Text style={styles.documentStatus}>FORENSIC AUDIT RECORD</Text>
          </View>
        </View>

        {/* Summary Info Bar */}
        <View style={styles.summaryBar}>
          <View style={styles.summaryCell}>
            <Text style={styles.microLabel}>Filter interval</Text>
            <Text style={styles.summaryValue}>{safeText(dateIntervalLabel)}</Text>
          </View>
          <View style={styles.summaryCell}>
            <Text style={styles.microLabel}>Report date</Text>
            <Text style={styles.summaryValue}>{formatPdfDate(new Date())}</Text>
          </View>
          <View style={styles.summaryCell}>
            <Text style={styles.microLabel}>Audit authority</Text>
            <Text style={styles.summaryValue}>{safeText(userRole)}</Text>
          </View>
          <View style={styles.summaryCellLast}>
            <Text style={styles.microLabel}>Ledger status</Text>
            <Text style={styles.summaryValue}>CERTIFIED SYNC</Text>
          </View>
        </View>

        {/* KPI Summary Matrix */}
        <View style={styles.kpiGrid} wrap={false}>
          <View style={styles.kpiCard}>
            <Text style={styles.kpiLabel}>Gross Authorized</Text>
            <Text style={styles.kpiValue}>{formatValue(grossBilled)}</Text>
            <Text style={styles.kpiSubtext}>Total Invoiced Value</Text>
          </View>
          <View style={styles.kpiCard}>
            <Text style={styles.kpiLabel}>Net Realized Cash</Text>
            <Text style={[styles.kpiValue, { color: SUCCESS }]}>{formatValue(netCollected)}</Text>
            <Text style={styles.kpiSubtext}>Verified Collections</Text>
          </View>
          <View style={styles.kpiCard}>
            <Text style={styles.kpiLabel}>Outstanding Debt</Text>
            <Text style={[styles.kpiValue, { color: totalOutstanding > 0 ? DANGER : NAVY }]}>
              {formatValue(totalOutstanding)}
            </Text>
            <Text style={styles.kpiSubtext}>Receivables At Risk</Text>
          </View>
          <View style={styles.kpiCard}>
            <Text style={styles.kpiLabel}>Job Velocity</Text>
            <Text style={styles.kpiValue}>{efficiency}%</Text>
            <Text style={styles.kpiSubtext}>{activeBays} Bays Active</Text>
          </View>
        </View>

        {/* Section 01: Invoices & Fiscal Ledger */}
        <View style={styles.sectionHeading} wrap={false}>
          <Text style={styles.sectionNumber}>01</Text>
          <Text style={styles.sectionTitle}>Fiscal Invoices &amp; Revenue Ledger</Text>
          <Text style={styles.sectionHint}>{invoices.length} Transactions Recorded</Text>
        </View>

        <View style={styles.table}>
          <View style={styles.tableHeader} wrap={false}>
            <Text style={[styles.colNo, styles.tableLabel]}>NO.</Text>
            <Text style={[styles.colRef, styles.tableLabel]}>INVOICE #</Text>
            <Text style={[styles.colDate, styles.tableLabel]}>DATE</Text>
            <Text style={[styles.colAmount, styles.tableLabel]}>BILLED</Text>
            <Text style={[styles.colPaid, styles.tableLabel]}>SETTLED</Text>
            <Text style={[styles.colBalance, styles.tableLabel]}>BALANCE</Text>
            <Text style={[styles.colStatus, styles.tableLabel]}>STATUS</Text>
          </View>

          {invoices.slice(0, 25).map((inv, i) => (
            <View key={inv.invoiceId || i} style={[styles.tableRow, ...(i % 2 ? [styles.tableRowAlt] : [])]} wrap={false}>
              <Text style={[styles.colNo, styles.cellIndex]}>{String(i + 1).padStart(2, '0')}</Text>
              <View style={styles.colRef}>
                <Text style={styles.cellText}>{safeText(inv.invoiceNumber || inv.invoiceId.slice(-8).toUpperCase())}</Text>
                <Text style={styles.cellSubtext}>UID: {safeText(inv.customerId.slice(-6).toUpperCase())}</Text>
              </View>
              <Text style={[styles.colDate, styles.cellText]}>{formatPdfDate(inv.issuedAt)}</Text>
              <Text style={[styles.colAmount, styles.cellText]}>{formatValue(inv.grandTotal)}</Text>
              <Text style={[styles.colPaid, styles.cellText, { color: SUCCESS }]}>{formatValue(inv.amountPaid)}</Text>
              <Text style={[styles.colBalance, styles.cellText, { color: inv.balance > 0 ? DANGER : INK }]}>
                {formatValue(inv.balance)}
              </Text>
              <Text style={[styles.colStatus, styles.cellText]}>{safeText(inv.paymentStatus)}</Text>
            </View>
          ))}

          {invoices.length === 0 && (
            <View style={[styles.tableRow, { justifyContent: 'center', paddingVertical: 14 }]}>
              <Text style={{ fontSize: 6.5, color: MUTED, fontStyle: 'italic' }}>
                No invoice records detected in the active filter interval.
              </Text>
            </View>
          )}

          {invoices.length > 0 && (
            <View style={styles.totalRow} wrap={false}>
              <Text style={[styles.colNo, styles.totalLabel]}>TOTAL</Text>
              <Text style={[styles.colRef, styles.totalLabel]}>{invoices.length} Invoices</Text>
              <Text style={styles.colDate} />
              <Text style={[styles.colAmount, styles.totalLabel]}>{formatValue(grossBilled)}</Text>
              <Text style={[styles.colPaid, styles.totalLabel, { color: SUCCESS }]}>{formatValue(netCollected)}</Text>
              <Text style={[styles.colBalance, styles.totalLabel, { color: totalOutstanding > 0 ? DANGER : NAVY }]}>
                {formatValue(totalOutstanding)}
              </Text>
              <Text style={styles.colStatus} />
            </View>
          )}
        </View>

        {/* Section 02: Settlement Channels / Payments Ledger */}
        <View style={styles.sectionHeading} wrap={false}>
          <Text style={styles.sectionNumber}>02</Text>
          <Text style={styles.sectionTitle}>Settlement Channels &amp; Collections</Text>
          <Text style={styles.sectionHint}>{payments.length} Payments Verified</Text>
        </View>

        <View style={styles.table}>
          <View style={styles.tableHeader} wrap={false}>
            <Text style={[styles.colNo, styles.tableLabel]}>NO.</Text>
            <Text style={[styles.colRef, styles.tableLabel]}>RECEIPT / ID</Text>
            <Text style={[styles.colDate, styles.tableLabel]}>PAYMENT DATE</Text>
            <Text style={[styles.colCustomer, styles.tableLabel]}>METHOD</Text>
            <Text style={[styles.colAmount, styles.tableLabel]}>AMOUNT</Text>
            <Text style={[styles.colStatus, styles.tableLabel]}>STATUS</Text>
          </View>

          {payments.slice(0, 15).map((pay, i) => (
            <View key={pay.paymentId || i} style={[styles.tableRow, ...(i % 2 ? [styles.tableRowAlt] : [])]} wrap={false}>
              <Text style={[styles.colNo, styles.cellIndex]}>{String(i + 1).padStart(2, '0')}</Text>
              <View style={styles.colRef}>
                <Text style={styles.cellText}>{safeText(pay.receiptNumber || pay.paymentId.slice(-10).toUpperCase())}</Text>
                <Text style={styles.cellSubtext}>INV: {safeText(pay.invoiceId.slice(-8).toUpperCase())}</Text>
              </View>
              <Text style={[styles.colDate, styles.cellText]}>{formatPdfDate(pay.paidAt)}</Text>
              <Text style={[styles.colCustomer, styles.cellText]}>{safeText(pay.method)}</Text>
              <Text style={[styles.colAmount, styles.cellText, { color: SUCCESS }]}>{formatValue(pay.amount)}</Text>
              <Text style={[styles.colStatus, styles.cellText]}>{safeText(pay.status)}</Text>
            </View>
          ))}

          {payments.length === 0 && (
            <View style={[styles.tableRow, { justifyContent: 'center', paddingVertical: 14 }]}>
              <Text style={{ fontSize: 6.5, color: MUTED, fontStyle: 'italic' }}>
                No payment receipts found for this interval.
              </Text>
            </View>
          )}

          {payments.length > 0 && (
            <View style={styles.totalRow} wrap={false}>
              <Text style={[styles.colNo, styles.totalLabel]}>TOTAL</Text>
              <Text style={[styles.colRef, styles.totalLabel]}>{payments.length} Collections</Text>
              <Text style={styles.colDate} />
              <Text style={styles.colCustomer} />
              <Text style={[styles.colAmount, styles.totalLabel, { color: SUCCESS }]}>{formatValue(netCollected)}</Text>
              <Text style={styles.colStatus} />
            </View>
          )}
        </View>

        {/* Audit & Authorization Block */}
        <View style={styles.authBlock} wrap={false}>
          <View style={styles.authLeft}>
            <Text style={styles.authTitle}>Forensic Analytical Certification</Text>
            <Text style={styles.authText}>
              This analytical report was compiled from immutable transaction traces and operational registries within Makros System. All tax obligations, revenue disbursements, and outstanding liabilities are calculated in accordance with configured workshop parameters.
            </Text>
          </View>
          <View style={styles.authRight}>
            <Text style={styles.authTitle}>Audit Clearance</Text>
            <Text style={[styles.authText, { fontWeight: 700 }]}>{safeText(userRole)}</Text>
            <View style={styles.signatureLine} />
            <Text style={styles.signatureLabel}>Authorized Signature &amp; Stamp</Text>
          </View>
        </View>

        {/* Footer */}
        <View style={styles.footer} fixed>
          <Text style={styles.footerNote}>{safeText(settings?.receiptFooterNote || 'Makros System Analytical OS • Internal Forensic Trace Active', 250)}</Text>
          <View style={styles.footerMeta}>
            <Text style={styles.footerText}>Certified Official Document - Generated by Makros System</Text>
            <Text
              style={styles.pageNumber}
              render={({ pageNumber, totalPages }) => `REP #${reportReference}  |  PAGE ${pageNumber} OF ${totalPages}`}
            />
          </View>
        </View>
      </Page>
    </Document>
  );
}
