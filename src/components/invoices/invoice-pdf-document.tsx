'use client';

import React from 'react';
import { Page, Text, View, Document, StyleSheet, Font, Image } from '@react-pdf/renderer';
import { Invoice } from '@/types/invoice';
import { Customer } from '@/types/customer';
import { Vehicle } from '@/types/vehicle';
import { JobPart } from '@/types/job-card';
import { WorkshopSettings } from '@/types/settings';

/**
 * @fileOverview Customer invoice PDF template with multi-page support.
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
    return 'Pending Sync';
  }

  if (isNaN(d.getTime())) return 'Invalid Date';
  return d.toISOString().split('T')[0];
};

const NAVY = '#102A43';
const INK = '#243B53';
const MUTED = '#627D98';
const BORDER = '#D9E2EC';
const PAPER = '#F7F9FC';
const ACCENT = '#F59E0B';
const SUCCESS = '#138A5B';

const styles = StyleSheet.create({
  page: {
    paddingTop: 30,
    paddingRight: 34,
    paddingBottom: 88,
    paddingLeft: 34,
    backgroundColor: '#FFFFFF',
    fontFamily: 'Inter',
    color: INK,
    fontSize: 8,
  },
  topRule: {
    height: 5,
    backgroundColor: ACCENT,
    marginBottom: 14,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  brand: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '57%',
  },
  logoFrame: {
    width: 50,
    height: 50,
    borderWidth: 1,
    borderColor: BORDER,
    backgroundColor: PAPER,
    padding: 4,
    marginRight: 11,
  },
  logo: { width: 40, height: 40, objectFit: 'contain' },
  brandCopy: { flex: 1 },
  workshopName: {
    fontSize: 14,
    fontWeight: 900,
    color: NAVY,
    textTransform: 'uppercase',
    marginBottom: 3,
  },
  legalName: {
    fontSize: 6.5,
    fontWeight: 700,
    color: MUTED,
    textTransform: 'uppercase',
    marginBottom: 4,
  },
  contactText: { fontSize: 6.5, color: MUTED, marginBottom: 2 },
  titleBlock: {
    width: '39%',
    backgroundColor: NAVY,
    padding: 12,
    minHeight: 78,
  },
  documentTitle: {
    fontSize: 17,
    fontWeight: 900,
    color: '#FFFFFF',
    textTransform: 'uppercase',
    letterSpacing: 0.6,
  },
  documentNumber: { marginTop: 5, fontSize: 9, fontWeight: 700, color: '#FFFFFF' },
  documentStatus: {
    alignSelf: 'flex-start',
    marginTop: 9,
    paddingVertical: 3,
    paddingHorizontal: 6,
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
    marginBottom: 18,
  },
  summaryCell: {
    flex: 1,
    paddingVertical: 8,
    paddingHorizontal: 10,
    borderRightWidth: 1,
    borderRightColor: BORDER,
  },
  summaryCellLast: { flex: 1, paddingVertical: 8, paddingHorizontal: 10 },
  microLabel: {
    fontSize: 5.5,
    fontWeight: 900,
    color: MUTED,
    letterSpacing: 0.7,
    textTransform: 'uppercase',
    marginBottom: 3,
  },
  summaryValue: { fontSize: 8, fontWeight: 700, color: NAVY },
  billingGrid: { flexDirection: 'row', marginBottom: 19 },
  billingCard: {
    width: '49%',
    borderTopWidth: 3,
    borderTopColor: NAVY,
    borderRightWidth: 1,
    borderBottomWidth: 1,
    borderLeftWidth: 1,
    borderColor: BORDER,
    padding: 11,
    minHeight: 95,
    marginRight: '2%',
  },
  billingCardLast: {
    width: '49%',
    borderTopWidth: 3,
    borderTopColor: NAVY,
    borderRightWidth: 1,
    borderBottomWidth: 1,
    borderLeftWidth: 1,
    borderColor: BORDER,
    padding: 11,
    minHeight: 95,
  },
  cardTitle: {
    fontSize: 6,
    fontWeight: 900,
    color: MUTED,
    letterSpacing: 1,
    textTransform: 'uppercase',
    marginBottom: 8,
  },
  entityName: {
    fontSize: 10.5,
    fontWeight: 900,
    color: NAVY,
    textTransform: 'uppercase',
    marginBottom: 5,
  },
  detailLine: { fontSize: 7, color: MUTED, marginBottom: 3, lineHeight: 1.25 },
  detailStrong: { fontWeight: 700, color: INK },
  sectionHeading: { flexDirection: 'row', alignItems: 'center', marginBottom: 7 },
  sectionNumber: {
    width: 20,
    height: 20,
    paddingTop: 6,
    marginRight: 7,
    backgroundColor: NAVY,
    color: '#FFFFFF',
    fontSize: 7,
    fontWeight: 900,
    textAlign: 'center',
  },
  sectionTitle: {
    flex: 1,
    fontSize: 8,
    fontWeight: 900,
    color: NAVY,
    letterSpacing: 0.7,
    textTransform: 'uppercase',
  },
  sectionHint: { fontSize: 6, color: MUTED },
  table: {
    borderLeftWidth: 1,
    borderRightWidth: 1,
    borderTopWidth: 1,
    borderColor: BORDER,
  },
  tableHeader: {
    flexDirection: 'row',
    backgroundColor: '#EAF0F6',
    paddingVertical: 7,
    paddingHorizontal: 8,
    borderBottomWidth: 1,
    borderBottomColor: BORDER,
  },
  tableRow: {
    flexDirection: 'row',
    alignItems: 'center',
    minHeight: 34,
    paddingVertical: 7,
    paddingHorizontal: 8,
    borderBottomWidth: 1,
    borderBottomColor: BORDER,
  },
  tableRowAlt: { backgroundColor: '#FAFCFE' },
  indexCol: { width: '7%' },
  descriptionCol: { width: '45%', paddingRight: 8 },
  quantityCol: { width: '10%', textAlign: 'center' },
  priceCol: { width: '19%', textAlign: 'right' },
  totalCol: { width: '19%', textAlign: 'right' },
  tableLabel: { fontSize: 5.5, fontWeight: 900, color: MUTED, letterSpacing: 0.5 },
  rowIndex: { fontSize: 6.5, fontWeight: 700, color: '#9FB3C8' },
  rowText: { fontSize: 7.5, fontWeight: 700, color: INK },
  rowDescription: { fontSize: 7.5, fontWeight: 700, color: INK, marginBottom: 2 },
  rowSubText: { fontSize: 6, color: MUTED },
  totalsArea: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginTop: 16,
  },
  paymentSummary: {
    width: '42%',
    paddingTop: 4,
  },
  paymentSummaryTitle: {
    fontSize: 6,
    fontWeight: 900,
    color: MUTED,
    letterSpacing: 0.8,
    textTransform: 'uppercase',
    marginBottom: 7,
  },
  paymentSummaryText: { fontSize: 7, color: MUTED, lineHeight: 1.4 },
  paidAmount: { marginTop: 7, fontSize: 8, fontWeight: 700, color: SUCCESS },
  totalsBox: {
    width: '49%',
    borderWidth: 1,
    borderColor: BORDER,
    backgroundColor: PAPER,
  },
  totalRows: { paddingVertical: 10, paddingHorizontal: 12 },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 7,
  },
  totalLabel: { fontSize: 7, fontWeight: 700, color: MUTED, textTransform: 'uppercase' },
  totalValue: { fontSize: 8, fontWeight: 700, color: INK, textAlign: 'right' },
  discountText: { color: SUCCESS },
  grandTotalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: BORDER,
  },
  grandTotalLabel: { fontSize: 8, fontWeight: 900, color: NAVY, textTransform: 'uppercase' },
  grandTotalValue: { fontSize: 12, fontWeight: 900, color: NAVY, textAlign: 'right' },
  balanceBlock: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: NAVY,
    paddingVertical: 11,
    paddingHorizontal: 12,
  },
  balanceLabel: { fontSize: 7, fontWeight: 900, color: '#BCCCDC', textTransform: 'uppercase' },
  balanceValue: { fontSize: 13, fontWeight: 900, color: ACCENT, textAlign: 'right' },
  instructionSection: { flexDirection: 'row', marginTop: 20 },
  instructionCard: {
    flex: 1,
    padding: 11,
    borderWidth: 1,
    borderColor: BORDER,
    minHeight: 86,
    marginRight: 12,
  },
  instructionCardLast: {
    flex: 1,
    padding: 11,
    borderWidth: 1,
    borderColor: BORDER,
    backgroundColor: '#FFFDF7',
    minHeight: 86,
  },
  instructionTitle: {
    fontSize: 6,
    fontWeight: 900,
    color: NAVY,
    letterSpacing: 0.8,
    textTransform: 'uppercase',
    marginBottom: 7,
  },
  bankRow: { flexDirection: 'row', marginBottom: 3 },
  bankLabel: { width: 66, fontSize: 5.5, fontWeight: 900, color: MUTED, textTransform: 'uppercase' },
  bankValue: { flex: 1, fontSize: 6.5, fontWeight: 700, color: INK },
  notesText: { fontSize: 7, color: INK, lineHeight: 1.4 },
  footer: {
    position: 'absolute',
    bottom: 22,
    left: 34,
    right: 34,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: BORDER,
  },
  footerNote: { fontSize: 6, color: MUTED, marginBottom: 5, textAlign: 'center' },
  footerMeta: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  footerText: { fontSize: 5.5, color: MUTED },
  pageNumber: { fontSize: 6, fontWeight: 700, color: NAVY },
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
  documentTitle = 'INVOICE',
}: InvoicePDFDocumentProps) {
  const currency = settings?.currency || 'Ush';
  const invoiceReference = safeText(invoice.invoiceNumber || invoice.invoiceId.slice(-8).toUpperCase());

  const formatValue = (val: number) => {
    return `${currency} ${Math.round(val).toLocaleString()}`;
  };

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <View style={styles.topRule} fixed />

        <View style={styles.header}>
          <View style={styles.brand}>
            {settings?.logoUrl ? (
              <View style={styles.logoFrame}>
                <Image src={settings.logoUrl} style={styles.logo} />
              </View>
            ) : null}
            <View style={styles.brandCopy}>
              <Text style={styles.workshopName}>{safeText(settings?.workshopName || 'MAKROS SYSTEM')}</Text>
              <Text style={styles.legalName}>{safeText(settings?.businessRegistrationName)}</Text>
              {settings?.tin && <Text style={styles.contactText}>TIN: {safeText(settings.tin)}</Text>}
              <Text style={styles.contactText}>{safeText(settings?.address, 150)}</Text>
              <Text style={styles.contactText}>Tel: {safeText(settings?.phone)} {settings?.additionalPhones?.join(' | ')}</Text>
              <Text style={styles.contactText}>Email: {safeText(settings?.email)}</Text>
              {settings?.website && <Text style={styles.contactText}>{safeText(settings.website)}</Text>}
            </View>
          </View>

          <View style={styles.titleBlock}>
            <Text style={styles.documentTitle}>{safeText(documentTitle, 30)}</Text>
            <Text style={styles.documentNumber}>#{invoiceReference}</Text>
            <Text style={styles.documentStatus}>{safeText(invoice.paymentStatus)}</Text>
          </View>
        </View>

        <View style={styles.summaryBar}>
          <View style={styles.summaryCell}>
            <Text style={styles.microLabel}>Issue date</Text>
            <Text style={styles.summaryValue}>{formatPdfDate(invoice.issuedAt)}</Text>
          </View>
          <View style={styles.summaryCell}>
            <Text style={styles.microLabel}>Due date</Text>
            <Text style={styles.summaryValue}>{invoice.dueDate ? safeText(invoice.dueDate) : 'On receipt'}</Text>
          </View>
          <View style={styles.summaryCell}>
            <Text style={styles.microLabel}>Job reference</Text>
            <Text style={styles.summaryValue}>{safeText(invoice.jobCardId.toUpperCase().slice(-8))}</Text>
          </View>
          <View style={styles.summaryCellLast}>
            <Text style={styles.microLabel}>Currency</Text>
            <Text style={styles.summaryValue}>{safeText(currency)}</Text>
          </View>
        </View>

        <View style={styles.billingGrid}>
          <View style={styles.billingCard}>
            <Text style={styles.cardTitle}>Bill to</Text>
            <Text style={styles.entityName}>{safeText(customer?.fullName || 'N/A')}</Text>
            <Text style={styles.detailLine}>Tel: <Text style={styles.detailStrong}>{safeText(customer?.phone)}</Text></Text>
            <Text style={styles.detailLine}>{safeText(customer?.email, 100)}</Text>
            <Text style={styles.detailLine}>{safeText(customer?.address, 200)}</Text>
          </View>

          <View style={styles.billingCardLast}>
            <Text style={styles.cardTitle}>Service vehicle</Text>
            <Text style={styles.entityName}>{safeText(vehicle?.make)} {safeText(vehicle?.model)}</Text>
            <Text style={styles.detailLine}>Registration: <Text style={styles.detailStrong}>{safeText(vehicle?.numberPlate)}</Text></Text>
            <Text style={styles.detailLine}>Model year: <Text style={styles.detailStrong}>{safeText(vehicle?.year)}</Text></Text>
            <Text style={styles.detailLine}>VIN / Chassis: <Text style={styles.detailStrong}>{safeText(vehicle?.vin || vehicle?.chassisNumber, 50)}</Text></Text>
          </View>
        </View>

        <View style={styles.sectionHeading} wrap={false}>
          <Text style={styles.sectionNumber}>01</Text>
          <Text style={styles.sectionTitle}>Itemized charges</Text>
          <Text style={styles.sectionHint}>Parts and labour</Text>
        </View>

        <View style={styles.table}>
          <View style={styles.tableHeader} wrap={false}>
            <Text style={[styles.indexCol, styles.tableLabel]}>NO.</Text>
            <Text style={[styles.descriptionCol, styles.tableLabel]}>DESCRIPTION</Text>
            <Text style={[styles.quantityCol, styles.tableLabel]}>QTY</Text>
            <Text style={[styles.priceCol, styles.tableLabel]}>UNIT PRICE</Text>
            <Text style={[styles.totalCol, styles.tableLabel]}>AMOUNT</Text>
          </View>

          {parts?.map((part, i) => (
            <View key={i} style={[styles.tableRow, ...(i % 2 ? [styles.tableRowAlt] : [])]} wrap={false}>
              <Text style={[styles.indexCol, styles.rowIndex]}>{String(i + 1).padStart(2, '0')}</Text>
              <View style={styles.descriptionCol}>
                <Text style={styles.rowDescription}>{safeText(part.itemName || part.itemId, 150)}</Text>
                <Text style={styles.rowSubText}>Inventory item</Text>
              </View>
              <Text style={[styles.quantityCol, styles.rowText]}>{part.quantityUsed}</Text>
              <Text style={[styles.priceCol, styles.rowText]}>{formatValue(part.unitPrice)}</Text>
              <Text style={[styles.totalCol, styles.rowText]}>{formatValue(part.unitPrice * part.quantityUsed)}</Text>
            </View>
          ))}

          {invoice.laborTotal > 0 && (
            <View style={[styles.tableRow, ...((parts?.length || 0) % 2 ? [styles.tableRowAlt] : [])]} wrap={false}>
              <Text style={[styles.indexCol, styles.rowIndex]}>{String((parts?.length || 0) + 1).padStart(2, '0')}</Text>
              <View style={styles.descriptionCol}>
                <Text style={styles.rowDescription}>Labor &amp; Diagnostic Charges</Text>
                <Text style={styles.rowSubText}>Repair, maintenance and diagnostic service fees</Text>
              </View>
              <Text style={[styles.quantityCol, styles.rowText]}>1</Text>
              <Text style={[styles.priceCol, styles.rowText]}>{formatValue(invoice.laborTotal)}</Text>
              <Text style={[styles.totalCol, styles.rowText]}>{formatValue(invoice.laborTotal)}</Text>
            </View>
          )}
        </View>

        <View style={styles.totalsArea} wrap={false}>
          <View style={styles.paymentSummary}>
            <Text style={styles.paymentSummaryTitle}>Payment summary</Text>
            <Text style={styles.paymentSummaryText}>Status: {safeText(invoice.paymentStatus)}</Text>
            <Text style={styles.paymentSummaryText}>Invoice reference: #{invoiceReference}</Text>
            <Text style={styles.paidAmount}>Amount received: {formatValue(invoice.amountPaid)}</Text>
          </View>

          <View style={styles.totalsBox}>
            <View style={styles.totalRows}>
              <View style={styles.totalRow}>
                <Text style={styles.totalLabel}>Subtotal</Text>
                <Text style={styles.totalValue}>{formatValue(invoice.laborTotal + invoice.partsTotal)}</Text>
              </View>

              {invoice.discount > 0 && (
                <View style={styles.totalRow}>
                  <Text style={[styles.totalLabel, styles.discountText]}>Discount</Text>
                  <Text style={[styles.totalValue, styles.discountText]}>-{formatValue(invoice.discount)}</Text>
                </View>
              )}

              <View style={styles.totalRow}>
                <Text style={styles.totalLabel}>Tax</Text>
                <Text style={styles.totalValue}>{formatValue(invoice.tax)}</Text>
              </View>

              <View style={styles.grandTotalRow}>
                <Text style={styles.grandTotalLabel}>Invoice total</Text>
                <Text style={styles.grandTotalValue}>{formatValue(invoice.grandTotal)}</Text>
              </View>
            </View>

            <View style={styles.balanceBlock}>
              <Text style={styles.balanceLabel}>Balance due</Text>
              <Text style={styles.balanceValue}>{formatValue(invoice.balance)}</Text>
            </View>
          </View>
        </View>

        {(settings?.bankName || invoice.notes) && (
          <View style={styles.instructionSection}>
            {settings?.bankName && (
              <View style={invoice.notes ? styles.instructionCard : styles.instructionCardLast} wrap={false}>
                <Text style={styles.instructionTitle}>Payment instructions</Text>
                <View style={styles.bankRow}>
                  <Text style={styles.bankLabel}>Bank</Text>
                  <Text style={styles.bankValue}>{safeText(settings.bankName)}</Text>
                </View>
                <View style={styles.bankRow}>
                  <Text style={styles.bankLabel}>Branch</Text>
                  <Text style={styles.bankValue}>{safeText(settings.bankBranch)}</Text>
                </View>
                <View style={styles.bankRow}>
                  <Text style={styles.bankLabel}>Account</Text>
                  <Text style={styles.bankValue}>{safeText(settings.bankAccountName)}</Text>
                </View>
                <View style={styles.bankRow}>
                  <Text style={styles.bankLabel}>Account no.</Text>
                  <Text style={styles.bankValue}>{safeText(settings.bankAccountNumber)}</Text>
                </View>
                <View style={styles.bankRow}>
                  <Text style={styles.bankLabel}>SWIFT</Text>
                  <Text style={styles.bankValue}>{safeText(settings.bankSwiftCode)}</Text>
                </View>
              </View>
            )}

            {invoice.notes && (
              <View style={styles.instructionCardLast} wrap={false}>
                <Text style={styles.instructionTitle}>Notes &amp; terms</Text>
                <Text style={styles.notesText}>{safeText(invoice.notes, 1000)}</Text>
              </View>
            )}
          </View>
        )}

        <View style={styles.footer} fixed>
          <Text style={styles.footerNote}>{safeText(settings?.receiptFooterNote || 'Thank you for your business.', 300)}</Text>
          <View style={styles.footerMeta}>
            <Text style={styles.footerText}>Computer-generated document - no signature required</Text>
            <Text
              style={styles.pageNumber}
              render={({ pageNumber, totalPages }) => `INV ${invoiceReference}  |  PAGE ${pageNumber} OF ${totalPages}`}
            />
          </View>
        </View>
      </Page>
    </Document>
  );
}
