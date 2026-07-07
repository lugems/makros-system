'use client';

import React from 'react';
import { Page, Text, View, Document, StyleSheet, Font, Image } from '@react-pdf/renderer';
import { Invoice } from '@/types/invoice';
import { Customer } from '@/types/customer';
import { Vehicle } from '@/types/vehicle';
import { JobPart } from '@/types/job-card';
import { WorkshopSettings } from '@/types/settings';

/**
 * @fileOverview High-fidelity PDF Document Template for Makros System.
 * Utilizes local font sources and a rigid grid system to ensure forensic stability.
 * Optimized for multi-page overflow handling without footer collision.
 */

// 1. Register high-density local fonts
Font.register({
  family: 'Inter',
  fonts: [
    { src: '/fonts/Inter_18pt-Regular.ttf', fontWeight: 400 },
    { src: '/fonts/Inter_18pt-Italic.ttf', fontWeight: 400, fontStyle: 'italic' },
    { src: '/fonts/Inter_18pt-Bold.ttf', fontWeight: 700 },
    { src: '/fonts/Inter_18pt-Black.ttf', fontWeight: 900 },
  ],
});

// 2. Technical Text Safety Helper
const safeText = (value: string | number | undefined | null, maxLength: number = 500) => {
  if (value === undefined || value === null) return '';
  const str = String(value);
  return str.length > maxLength ? str.substring(0, maxLength) + '...' : str;
};

// Forensic Date Formatter for PDF environment
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
    return 'Pending Sync';
  }
  
  if (isNaN(d.getTime())) return 'Invalid Date';
  return d.toISOString().split('T')[0];
};

// 3. Technical Styles (React-PDF Compatible)
const styles = StyleSheet.create({
  page: {
    paddingTop: 40,
    paddingRight: 40,
    paddingBottom: 90, // Increased to ensure content breaks before the fixed footer
    paddingLeft: 40,
    backgroundColor: '#FFFFFF',
    fontFamily: 'Inter',
    color: '#0F172A',
    fontSize: 10,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 30,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
    paddingBottom: 20,
  },
  logoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  logo: {
    width: 64,
    height: 64,
    borderRadius: 8,
  },
  workshopInfo: {
    marginLeft: 12,
    flex: 1,
  },
  workshopName: {
    fontSize: 14,
    fontWeight: 900,
    textTransform: 'uppercase',
    marginBottom: 2,
    flexWrap: 'wrap',
  },
  workshopLegal: {
    fontSize: 8,
    color: '#64748B',
    textTransform: 'uppercase',
    fontWeight: 700,
    marginBottom: 2,
    flexWrap: 'wrap',
  },
  contactText: {
    fontSize: 7,
    color: '#94A3B8',
    fontWeight: 400,
    flexWrap: 'wrap',
  },
  invoiceMeta: {
    textAlign: 'right',
    width: 180,
  },
  invoiceTitle: {
    fontSize: 9,
    fontWeight: 900,
    textTransform: 'uppercase',
    color: '#3B82F6',
    letterSpacing: 1.5,
    marginBottom: 4,
  },
  documentType: {
    fontSize: 10,
    fontWeight: 900,
    textTransform: 'uppercase',
    color: '#0F172A',
    marginBottom: 4,
  },
  invoiceNumber: {
    fontSize: 18,
    fontWeight: 900,
    marginBottom: 4,
    flexWrap: 'wrap',
  },
  metaLabelValue: {
    fontSize: 8,
    color: '#64748B',
    marginBottom: 1,
  },
  
  // Details Grid
  detailsGrid: {
    flexDirection: 'row',
    marginBottom: 30,
    gap: 20,
  },
  detailCol: {
    flex: 1,
  },
  sectionTitle: {
    fontSize: 8,
    fontWeight: 900,
    textTransform: 'uppercase',
    color: '#94A3B8',
    letterSpacing: 1,
    marginBottom: 6,
  },
  entityName: {
    fontSize: 11,
    fontWeight: 700,
    textTransform: 'uppercase',
    marginBottom: 4,
    flexWrap: 'wrap',
  },
  entityText: {
    fontSize: 8,
    color: '#64748B',
    marginBottom: 2,
    flexWrap: 'wrap',
  },

  // Table Configuration (Fixed Widths)
  table: {
    marginTop: 10,
    borderWidth: 1,
    borderColor: '#F1F5F9',
    borderRadius: 8,
    overflow: 'hidden',
  },
  tableHeader: {
    flexDirection: 'row',
    backgroundColor: '#F8FAFC',
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  tableRow: {
    flexDirection: 'row',
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
    minHeight: 35,
  },
  colDesc: { width: '55%', paddingRight: 10 },
  colQty: { width: '10%', textAlign: 'center' },
  colPrice: { width: '17.5%', textAlign: 'right' },
  colTotal: { width: '17.5%', textAlign: 'right' },
  
  headerText: {
    fontSize: 7,
    fontWeight: 900,
    textTransform: 'uppercase',
    color: '#64748B',
  },
  rowText: {
    fontSize: 8,
    fontWeight: 700,
    flexWrap: 'wrap',
  },
  rowSubText: {
    fontSize: 7,
    color: '#94A3B8',
    marginTop: 2,
    fontStyle: 'italic',
    flexWrap: 'wrap',
  },

  // Totals Section
  totalsContainer: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: 20,
  },
  totalsBox: {
    width: 250,
    backgroundColor: '#F8FAFC',
    padding: 15,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#F1F5F9',
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    marginBottom: 6,
    gap: 10,
  },
  grandTotalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    marginTop: 8,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#E2E8F0',
    gap: 10,
  },
  totalLabel: {
    fontSize: 8,
    fontWeight: 700,
    textTransform: 'uppercase',
    color: '#64748B',
    flexShrink: 0,
  },
  totalValue: {
    fontSize: 9,
    fontWeight: 700,
    textAlign: 'right',
    flex: 1,
  },
  grandTotalLabel: {
    fontSize: 9,
    fontWeight: 900,
    textTransform: 'uppercase',
    color: '#3B82F6',
    flexShrink: 0,
  },
  grandTotalValue: {
    fontSize: 14,
    fontWeight: 900,
    color: '#3B82F6',
    textAlign: 'right',
    flex: 1,
  },

  // Notes
  notesSection: {
    marginTop: 20,
    padding: 10,
    backgroundColor: '#F1F5F9',
    borderRadius: 8,
  },
  notesTitle: {
    fontSize: 7,
    fontWeight: 900,
    textTransform: 'uppercase',
    color: '#64748B',
    marginBottom: 4,
  },
  notesContent: {
    fontSize: 8,
    color: '#475569',
    fontStyle: 'italic',
    lineHeight: 1.4,
    flexWrap: 'wrap',
  },

  // Fixed Footer
  footer: {
    position: 'absolute',
    bottom: 30,
    left: 40,
    right: 40,
    textAlign: 'center',
    paddingTop: 15,
    borderTopWidth: 1,
    borderTopStyle: 'dashed',
    borderTopColor: '#E2E8F0',
  },
  footerNote: {
    fontSize: 7,
    color: '#94A3B8',
    marginBottom: 8,
    fontStyle: 'italic',
    flexWrap: 'wrap',
  },
  certification: {
    fontSize: 6,
    fontWeight: 900,
    textTransform: 'uppercase',
    color: '#CBD5E1',
    letterSpacing: 2,
  },
});

interface InvoicePDFDocumentProps {
  invoice: Invoice;
  customer: Customer | null;
  vehicle: Vehicle | null;
  parts: JobPart[] | null;
  settings: WorkshopSettings | null;
  documentTitle?: string;
}

export function InvoicePDFDocument({ 
    invoice, 
    customer, 
    vehicle, 
    parts, 
    settings,
    documentTitle = 'INVOICE'
}: InvoicePDFDocumentProps) {
  const currency = settings?.currency || 'Ush';
  
  const formatValue = (val: number) => {
    return `${currency} ${Math.round(val).toLocaleString()}`;
  };

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* 1. Header */}
        <View style={styles.header}>
          <View style={styles.logoContainer}>
            {settings?.logoUrl ? (
                <Image src={settings.logoUrl} style={styles.logo} />
            ) : null}
            <View style={styles.workshopInfo}>
              <Text style={styles.workshopName}>{safeText(settings?.workshopName || 'MAKROS SYSTEM')}</Text>
              <Text style={styles.workshopLegal}>{safeText(settings?.businessRegistrationName)}</Text>
              {settings?.tin && <Text style={styles.contactText}>TIN: {safeText(settings.tin)}</Text>}
              <Text style={styles.contactText}>{safeText(settings?.address, 150)}</Text>
            </View>
          </View>
          <View style={styles.invoiceMeta}>
            <Text style={styles.invoiceTitle}>Certified Document</Text>
            <Text style={styles.documentType}>{documentTitle}</Text>
            <Text style={styles.invoiceNumber}>#{safeText(invoice.invoiceNumber || invoice.invoiceId.slice(-8).toUpperCase())}</Text>
            <Text style={styles.metaLabelValue}>Issue Date: {formatPdfDate(invoice.issuedAt)}</Text>
            {invoice.dueDate && (
                <Text style={styles.metaLabelValue}>Due Date: {safeText(invoice.dueDate)}</Text>
            )}
          </View>
        </View>

        {/* 2. Dossier Grid */}
        <View style={styles.detailsGrid}>
          <View style={styles.detailCol}>
            <Text style={styles.sectionTitle}>Fiscal Recipient</Text>
            <Text style={styles.entityName}>{safeText(customer?.fullName || 'N/A')}</Text>
            <Text style={styles.entityText}>{safeText(customer?.phone)}</Text>
            <Text style={styles.entityText}>{safeText(customer?.email, 100)}</Text>
            <Text style={styles.entityText}>{safeText(customer?.address, 200)}</Text>
          </View>
          <View style={styles.detailCol}>
            <Text style={styles.sectionTitle}>Technical Asset</Text>
            <Text style={styles.entityName}>{safeText(vehicle?.make)} {safeText(vehicle?.model)}</Text>
            <Text style={styles.entityText}>Number Plate: {safeText(vehicle?.numberPlate)}</Text>
            <Text style={styles.entityText}>Year: {safeText(vehicle?.year)}</Text>
            <Text style={styles.entityText}>VIN: {safeText(vehicle?.vin || vehicle?.chassisNumber, 50)}</Text>
          </View>
        </View>

        {/* 3. Ledger Table */}
        <Text style={styles.sectionTitle}>Technical Ledger Entries</Text>
        <View style={styles.table}>
          <View style={styles.tableHeader}>
            <Text style={[styles.headerText, styles.colDesc]}>Service Description</Text>
            <Text style={[styles.headerText, styles.colQty]}>Qty</Text>
            <Text style={[styles.headerText, styles.colPrice]}>Unit Price</Text>
            <Text style={[styles.headerText, styles.colTotal]}>Total</Text>
          </View>

          {/* Labor Row: wrap=false to prevent split across pages */}
          <View style={styles.tableRow} wrap={false}>
            <View style={styles.colDesc}>
              <Text style={styles.rowText}>Labor & Diagnostic Procedures</Text>
              <Text style={styles.rowSubText}>Service fees for repair and maintenance cycles.</Text>
            </View>
            <View style={styles.colQty}><Text style={styles.rowText}>1</Text></View>
            <View style={styles.colPrice}><Text style={styles.rowText}>{formatValue(invoice.laborTotal)}</Text></View>
            <View style={styles.colTotal}><Text style={styles.rowText}>{formatValue(invoice.laborTotal)}</Text></View>
          </View>

          {parts?.map((part, i) => (
            <View key={i} style={styles.tableRow} wrap={false}>
              <View style={styles.colDesc}>
                <Text style={styles.rowText}>{safeText(part.itemName || part.itemId, 150)}</Text>
                <Text style={styles.rowSubText}>Inventory Stock Allocation</Text>
              </View>
              <View style={styles.colQty}><Text style={styles.rowText}>{part.quantityUsed}</Text></View>
              <View style={styles.colPrice}><Text style={styles.rowText}>{formatValue(part.unitPrice)}</Text></View>
              <View style={styles.colTotal}><Text style={styles.rowText}>{formatValue(part.unitPrice * part.quantityUsed)}</Text></View>
            </View>
          ))}
        </View>

        {/* 4. Totals Block: wrap=false to ensure all totals stay together on one page */}
        <View style={styles.totalsContainer} wrap={false}>
          <View style={styles.totalsBox}>
            <View style={styles.totalRow}>
              <Text style={styles.totalLabel}>Subtotal</Text>
              <Text style={styles.totalValue}>{formatValue(invoice.laborTotal + invoice.partsTotal)}</Text>
            </View>
            
            {invoice.discount > 0 && (
              <View style={styles.totalRow}>
                <Text style={[styles.totalLabel, { color: '#10B981' }]}>Discount</Text>
                <Text style={[styles.totalValue, { color: '#10B981' }]}>-{formatValue(invoice.discount)}</Text>
              </View>
            )}

            <View style={styles.totalRow}>
              <Text style={styles.totalLabel}>Tax Provision</Text>
              <Text style={styles.totalValue}>{formatValue(invoice.tax)}</Text>
            </View>

            <View style={styles.grandTotalRow}>
              <Text style={styles.grandTotalLabel}>Grand Total</Text>
              <Text style={styles.grandTotalValue}>{formatValue(invoice.grandTotal)}</Text>
            </View>
          </View>
        </View>

        {/* 5. Remarks */}
        {invoice.notes && (
            <View style={styles.notesSection} wrap={false}>
                <Text style={styles.notesTitle}>Fiscal Remarks & Terms</Text>
                <Text style={styles.notesContent}>{safeText(invoice.notes, 1000)}</Text>
            </View>
        )}

        {/* 6. Footer */}
        <View style={styles.footer} fixed>
          <Text style={styles.footerNote}>{safeText(settings?.receiptFooterNote || 'Thank you for trusting MAKROS HOLDINGS UGANDA LIMITED.', 300)}</Text>
          <Text style={styles.certification}>MAKROS SYSTEM FINANCIAL ANALYSIS OS • CERTIFIED DIGITAL RECORD</Text>
        </View>
      </Page>
    </Document>
  );
}
