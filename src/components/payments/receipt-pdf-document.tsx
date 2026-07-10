'use client';

import React from 'react';
import { Page, Text, View, Document, StyleSheet, Font, Image } from '@react-pdf/renderer';
import { Payment } from '@/types/payment';
import { Customer } from '@/types/customer';
import { Invoice } from '@/types/invoice';
import { StaffMember } from '@/types/staff';
import { WorkshopSettings } from '@/types/settings';

/**
 * @fileOverview High-fidelity PDF Receipt Template.
 * Refined to display certified receipt numbers and comprehensive bank authority details.
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

// Technical Text Safety Helper
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

const styles = StyleSheet.create({
  page: {
    padding: 40,
    paddingBottom: 100, 
    backgroundColor: '#FFFFFF',
    fontFamily: 'Inter',
    color: '#0F172A',
    fontSize: 10,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 40,
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
    flexWrap: 'wrap',
  },
  contactText: {
    fontSize: 7,
    color: '#94A3B8',
    fontWeight: 400,
    flexWrap: 'wrap',
  },
  receiptMeta: {
    textAlign: 'right',
    width: 200,
  },
  receiptTitle: {
    fontSize: 9,
    fontWeight: 900,
    textTransform: 'uppercase',
    color: '#3B82F6',
    letterSpacing: 1.5,
    marginBottom: 4,
  },
  receiptNumber: {
    fontSize: 16,
    fontWeight: 900,
    marginBottom: 4,
    color: '#0F172A',
    flexWrap: 'wrap',
  },
  entityText: {
    fontSize: 8,
    color: '#64748B',
    marginBottom: 2,
    flexWrap: 'wrap',
  },
  
  detailsGrid: {
    flexDirection: 'row',
    marginBottom: 40,
    gap: 30,
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
    marginBottom: 8,
  },
  entityName: {
    fontSize: 11,
    fontWeight: 700,
    textTransform: 'uppercase',
    marginBottom: 4,
    flexWrap: 'wrap',
  },

  ledgerContainer: {
    marginTop: 10,
    borderWidth: 1,
    borderColor: '#F1F5F9',
    borderRadius: 12,
    overflow: 'hidden',
  },
  ledgerHeader: {
    flexDirection: 'row',
    backgroundColor: '#F8FAFC',
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  ledgerRow: {
    flexDirection: 'row',
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
    alignItems: 'center',
    minHeight: 50,
  },
  colMain: { flex: 3, paddingRight: 10 },
  colVal: { flex: 1, textAlign: 'right' },
  
  labelText: {
    fontSize: 7,
    fontWeight: 900,
    textTransform: 'uppercase',
    color: '#64748B',
  },
  valueText: {
    fontSize: 14,
    fontWeight: 900,
    color: '#0F172A',
    textAlign: 'right',
  },
  
  summaryBox: {
    marginTop: 20,
    flexDirection: 'row',
    justifyContent: 'flex-end',
  },
  totalContainer: {
    width: 220,
    backgroundColor: '#0F172A',
    padding: 20,
    borderRadius: 16,
  },
  totalLabel: {
    fontSize: 8,
    fontWeight: 700,
    textTransform: 'uppercase',
    color: '#3B82F6',
    marginBottom: 4,
  },
  totalAmount: {
    fontSize: 18,
    fontWeight: 900,
    color: '#FFFFFF',
    textAlign: 'right',
  },

  instructionSection: {
    marginTop: 30,
    flexDirection: 'row',
    gap: 20,
  },
  bankSection: {
    flex: 1,
    padding: 12,
    backgroundColor: '#F8FAFC',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#F1F5F9',
  },
  bankRow: {
    flexDirection: 'row',
    marginBottom: 2,
  },
  bankLabel: {
    fontSize: 6,
    fontWeight: 900,
    textTransform: 'uppercase',
    color: '#94A3B8',
    width: 70,
  },
  bankValue: {
    fontSize: 7,
    fontWeight: 700,
    color: '#0F172A',
  },

  footer: {
    position: 'absolute',
    bottom: 40,
    left: 40,
    right: 40,
    textAlign: 'center',
    paddingTop: 20,
    borderTopWidth: 1,
    borderTopStyle: 'dashed',
    borderTopColor: '#E2E8F0',
  },
  footerNote: {
    fontSize: 8,
    color: '#94A3B8',
    fontStyle: 'italic',
    marginBottom: 8,
    flexWrap: 'wrap',
  },
  certification: {
    fontSize: 7,
    fontWeight: 900,
    textTransform: 'uppercase',
    color: '#CBD5E1',
    letterSpacing: 2,
  },
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
  settings 
}: ReceiptPDFDocumentProps) {
  const currency = settings?.currency || 'Ush';
  const id = payment.paymentId || (payment as any).id || 'TBD';

  return (
    <Document>
      <Page size="A4" style={styles.page}>
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
              
              <View style={{ marginTop: 4 }}>
                  <Text style={styles.contactText}>Phone: {safeText(settings?.phone)} {settings?.additionalPhones?.join(' | ')}</Text>
                  <Text style={styles.contactText}>Email: {safeText(settings?.email)}</Text>
                  {settings?.website && <Text style={styles.contactText}>Web: {safeText(settings.website)}</Text>}
              </View>
            </View>
          </View>
          <View style={styles.receiptMeta}>
            <Text style={styles.receiptTitle}>Certified Receipt</Text>
            <Text style={styles.receiptNumber}>#{safeText(payment.receiptNumber || id.toUpperCase().slice(-12))}</Text>
            <Text style={styles.entityText}>Settlement Date: {formatPdfDate(payment.paidAt)}</Text>
          </View>
        </View>

        <View style={styles.detailsGrid}>
          <View style={styles.detailCol}>
            <Text style={styles.sectionTitle}>Fiscal Recipient</Text>
            <Text style={styles.entityName}>{safeText(customer?.fullName || 'N/A')}</Text>
            <Text style={styles.entityText}>{safeText(customer?.phone)}</Text>
            <Text style={styles.entityText}>{safeText(customer?.email)}</Text>
          </View>
          <View style={styles.detailCol}>
            <Text style={styles.sectionTitle}>Registry Synchronization</Text>
            <Text style={styles.entityName}>Source Invoice</Text>
            <Text style={styles.entityText}>#{safeText(invoice?.invoiceNumber || payment.invoiceId.slice(-8).toUpperCase())}</Text>
            <Text style={styles.entityText}>Payment Channel: {safeText(payment.method)}</Text>
          </View>
        </View>

        <Text style={styles.sectionTitle}>Transaction Specification</Text>
        <View style={styles.ledgerContainer}>
          <View style={styles.ledgerHeader}>
            <Text style={[styles.labelText, styles.colMain]}>Description</Text>
            <Text style={[styles.labelText, styles.colVal]}>Amount ({currency})</Text>
          </View>
          <View style={styles.ledgerRow} wrap={false}>
            <View style={styles.colMain}>
              <Text style={styles.entityName}>Workshop Service Settlement</Text>
              <Text style={styles.entityText}>Authorization Reference: {safeText(payment.transactionRef || 'SYSTEM_VERIFIED')}</Text>
            </View>
            <View style={styles.colVal}>
              <Text style={styles.valueText}>{currency} {payment.amount.toLocaleString()}</Text>
            </View>
          </View>
        </View>

        <View style={styles.summaryBox} wrap={false}>
          <View style={styles.totalContainer}>
            <Text style={styles.totalLabel}>Total Disbursed</Text>
            <Text style={styles.totalAmount}>{currency} {payment.amount.toLocaleString()}</Text>
          </View>
        </View>

        {/* Bank Instructions Section */}
        {settings?.bankName && (
            <View style={styles.instructionSection} wrap={false}>
                <View style={styles.bankSection}>
                    <Text style={styles.sectionTitle}>Technical Instructions</Text>
                    <View style={styles.bankRow}>
                        <Text style={styles.bankLabel}>Bank Name:</Text>
                        <Text style={styles.bankValue}>{safeText(settings.bankName)}</Text>
                    </View>
                    <View style={styles.bankRow}>
                        <Text style={styles.bankLabel}>Branch:</Text>
                        <Text style={styles.bankValue}>{safeText(settings.bankBranch)}</Text>
                    </View>
                    <View style={styles.bankRow}>
                        <Text style={styles.bankLabel}>Account Title:</Text>
                        <Text style={styles.bankValue}>{safeText(settings.bankAccountName)}</Text>
                    </View>
                    <View style={styles.bankRow}>
                        <Text style={styles.bankLabel}>Account No:</Text>
                        <Text style={styles.bankValue}>{safeText(settings.bankAccountNumber)}</Text>
                    </View>
                    <View style={styles.bankRow}>
                        <Text style={styles.bankLabel}>SWIFT Code:</Text>
                        <Text style={styles.bankValue}>{safeText(settings.bankSwiftCode)}</Text>
                    </View>
                </View>
            </View>
        )}

        <View style={styles.footer} fixed>
          <Text style={styles.footerNote}>{safeText(settings?.receiptFooterNote || 'Thank you for choosing Makros System.', 300)}</Text>
          <Text style={styles.certification}>MAKROS SYSTEM TREASURY CONTROL • CERTIFIED DIGITAL RECORD</Text>
        </View>
      </Page>
    </Document>
  );
}
