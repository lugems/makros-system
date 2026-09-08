'use client';

import React from 'react';
import { Page, Text, View, Document, StyleSheet, Font, Image } from '@react-pdf/renderer';
import { Payment } from '@/types/payment';
import { Customer } from '@/types/customer';
import { Invoice } from '@/types/invoice';
import { StaffMember } from '@/types/staff';
import { WorkshopSettings } from '@/types/settings';

/**
 * @fileOverview Customer payment receipt PDF template.
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
  topRule: { height: 5, backgroundColor: ACCENT, marginBottom: 14 },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  brand: { flexDirection: 'row', alignItems: 'center', width: '57%' },
  logoFrame: {
    width: 50,
    height: 50,
    padding: 4,
    marginRight: 11,
    borderWidth: 1,
    borderColor: BORDER,
    backgroundColor: PAPER,
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
    minHeight: 78,
    padding: 12,
    backgroundColor: NAVY,
  },
  documentTitle: {
    fontSize: 17,
    fontWeight: 900,
    color: '#FFFFFF',
    letterSpacing: 0.6,
  },
  documentNumber: { marginTop: 5, fontSize: 9, fontWeight: 700, color: '#FFFFFF' },
  clearedBadge: {
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
    marginBottom: 19,
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
  recipientCard: {
    flexDirection: 'row',
    borderTopWidth: 3,
    borderTopColor: NAVY,
    borderRightWidth: 1,
    borderBottomWidth: 1,
    borderLeftWidth: 1,
    borderColor: BORDER,
    marginBottom: 19,
  },
  recipientDetails: { width: '58%', padding: 12 },
  invoiceDetails: {
    width: '42%',
    padding: 12,
    backgroundColor: PAPER,
    borderLeftWidth: 1,
    borderLeftColor: BORDER,
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
    fontSize: 11,
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
  transaction: {
    flexDirection: 'row',
    alignItems: 'stretch',
    borderWidth: 1,
    borderColor: BORDER,
    marginBottom: 18,
  },
  transactionCopy: { width: '60%', padding: 14 },
  transactionAmount: {
    width: '40%',
    padding: 14,
    justifyContent: 'center',
    alignItems: 'flex-end',
    backgroundColor: NAVY,
  },
  transactionTitle: { fontSize: 9, fontWeight: 900, color: NAVY, textTransform: 'uppercase', marginBottom: 5 },
  transactionText: { fontSize: 7, color: MUTED, marginBottom: 3 },
  amountLabel: {
    fontSize: 6,
    fontWeight: 900,
    color: '#BCCCDC',
    letterSpacing: 0.8,
    textTransform: 'uppercase',
    marginBottom: 6,
  },
  amountValue: { fontSize: 18, fontWeight: 900, color: ACCENT, textAlign: 'right' },
  confirmationStrip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 12,
    backgroundColor: '#EAF8F1',
    borderLeftWidth: 5,
    borderLeftColor: SUCCESS,
    marginBottom: 20,
  },
  confirmationMark: {
    width: 26,
    height: 26,
    paddingTop: 7,
    marginRight: 10,
    borderRadius: 13,
    backgroundColor: SUCCESS,
    color: '#FFFFFF',
    fontSize: 8,
    fontWeight: 900,
    textAlign: 'center',
  },
  confirmationCopy: { flex: 1 },
  confirmationTitle: { fontSize: 8, fontWeight: 900, color: SUCCESS, textTransform: 'uppercase', marginBottom: 2 },
  confirmationText: { fontSize: 6.5, color: MUTED },
  lowerGrid: { flexDirection: 'row', alignItems: 'stretch' },
  bankCard: {
    width: '49%',
    padding: 11,
    borderWidth: 1,
    borderColor: BORDER,
    backgroundColor: PAPER,
    marginRight: '2%',
    minHeight: 96,
  },
  authorizationCard: {
    width: '49%',
    padding: 11,
    borderWidth: 1,
    borderColor: BORDER,
    minHeight: 96,
  },
  lowerTitle: {
    fontSize: 6,
    fontWeight: 900,
    color: NAVY,
    letterSpacing: 0.8,
    textTransform: 'uppercase',
    marginBottom: 8,
  },
  bankRow: { flexDirection: 'row', marginBottom: 3 },
  bankLabel: { width: 66, fontSize: 5.5, fontWeight: 900, color: MUTED, textTransform: 'uppercase' },
  bankValue: { flex: 1, fontSize: 6.5, fontWeight: 700, color: INK },
  authName: { fontSize: 9, fontWeight: 900, color: NAVY, textTransform: 'uppercase', marginBottom: 4 },
  authRole: { fontSize: 6.5, color: MUTED, marginBottom: 13 },
  signatureLine: { height: 16, borderBottomWidth: 1, borderBottomColor: '#9FB3C8' },
  signatureLabel: { marginTop: 4, fontSize: 5.5, color: MUTED, textTransform: 'uppercase' },
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

interface ReceiptPDFDocumentProps {
  payment: Payment;
  customer: Customer | null;
  invoice: Invoice | null;
  recorder: StaffMember | null;
  settings: WorkshopSettings | null;
}

export function ReceiptPDFDocument({
  payment,
  customer,
  invoice,
  recorder,
  settings,
}: ReceiptPDFDocumentProps) {
  const currency = settings?.currency || 'Ush';
  const id = payment.paymentId || (payment as any).id || 'TBD';
  const receiptReference = safeText(payment.receiptNumber || id.toUpperCase().slice(-12));
  const invoiceReference = safeText(invoice?.invoiceNumber || payment.invoiceId.slice(-8).toUpperCase());
  const formattedAmount = `${currency} ${payment.amount.toLocaleString()}`;

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
            <Text style={styles.documentTitle}>RECEIPT</Text>
            <Text style={styles.documentNumber}>#{receiptReference}</Text>
            <Text style={styles.clearedBadge}>{safeText(payment.status)}</Text>
          </View>
        </View>

        <View style={styles.summaryBar}>
          <View style={styles.summaryCell}>
            <Text style={styles.microLabel}>Payment date</Text>
            <Text style={styles.summaryValue}>{formatPdfDate(payment.paidAt)}</Text>
          </View>
          <View style={styles.summaryCell}>
            <Text style={styles.microLabel}>Payment method</Text>
            <Text style={styles.summaryValue}>{safeText(payment.method)}</Text>
          </View>
          <View style={styles.summaryCell}>
            <Text style={styles.microLabel}>Invoice reference</Text>
            <Text style={styles.summaryValue}>#{invoiceReference}</Text>
          </View>
          <View style={styles.summaryCellLast}>
            <Text style={styles.microLabel}>Currency</Text>
            <Text style={styles.summaryValue}>{safeText(currency)}</Text>
          </View>
        </View>

        <View style={styles.recipientCard} wrap={false}>
          <View style={styles.recipientDetails}>
            <Text style={styles.cardTitle}>Received from</Text>
            <Text style={styles.entityName}>{safeText(customer?.fullName || 'N/A')}</Text>
            <Text style={styles.detailLine}>Tel: <Text style={styles.detailStrong}>{safeText(customer?.phone)}</Text></Text>
            <Text style={styles.detailLine}>{safeText(customer?.email)}</Text>
          </View>
          <View style={styles.invoiceDetails}>
            <Text style={styles.cardTitle}>Applied to invoice</Text>
            <Text style={styles.entityName}>#{invoiceReference}</Text>
            <Text style={styles.detailLine}>Payment ID: <Text style={styles.detailStrong}>{safeText(id, 80)}</Text></Text>
            <Text style={styles.detailLine}>Status: <Text style={styles.detailStrong}>{safeText(payment.status)}</Text></Text>
          </View>
        </View>

        <View style={styles.sectionHeading} wrap={false}>
          <Text style={styles.sectionNumber}>01</Text>
          <Text style={styles.sectionTitle}>Payment details</Text>
        </View>

        <View style={styles.transaction} wrap={false}>
          <View style={styles.transactionCopy}>
            <Text style={styles.transactionTitle}>Workshop service payment</Text>
            <Text style={styles.transactionText}>Method: {safeText(payment.method)}</Text>
            <Text style={styles.transactionText}>Transaction reference: {safeText(payment.transactionRef || 'SYSTEM_VERIFIED')}</Text>
            <Text style={styles.transactionText}>Linked invoice: #{invoiceReference}</Text>
          </View>
          <View style={styles.transactionAmount}>
            <Text style={styles.amountLabel}>Amount received</Text>
            <Text style={styles.amountValue}>{formattedAmount}</Text>
          </View>
        </View>

        <View style={styles.confirmationStrip} wrap={false}>
          <Text style={styles.confirmationMark}>OK</Text>
          <View style={styles.confirmationCopy}>
            <Text style={styles.confirmationTitle}>Payment recorded</Text>
            <Text style={styles.confirmationText}>This receipt confirms that {formattedAmount} was recorded against invoice #{invoiceReference}.</Text>
          </View>
        </View>

        <View style={styles.lowerGrid} wrap={false}>
          {settings?.bankName && (
            <View style={styles.bankCard}>
              <Text style={styles.lowerTitle}>Bank information</Text>
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

          <View style={[styles.authorizationCard, ...(!settings?.bankName ? [{ width: '100%' as const }] : [])]}>
            <Text style={styles.lowerTitle}>Payment authorization</Text>
            <Text style={styles.authName}>{safeText(recorder?.fullName || 'Registry Administrator')}</Text>
            <Text style={styles.authRole}>{safeText(recorder?.role || recorder?.specialization || 'Authorized official')}</Text>
            <View style={styles.signatureLine} />
            <Text style={styles.signatureLabel}>Authorized signature / stamp</Text>
          </View>
        </View>

        <View style={styles.footer} fixed>
          <Text style={styles.footerNote}>{safeText(settings?.receiptFooterNote || 'Thank you for choosing Makros System.', 300)}</Text>
          <View style={styles.footerMeta}>
            <Text style={styles.footerText}>Computer-generated payment record</Text>
            <Text
              style={styles.pageNumber}
              render={({ pageNumber, totalPages }) => `RCT ${receiptReference}  |  PAGE ${pageNumber} OF ${totalPages}`}
            />
          </View>
        </View>
      </Page>
    </Document>
  );
}
