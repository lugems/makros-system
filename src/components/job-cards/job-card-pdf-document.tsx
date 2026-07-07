'use client';

import React from 'react';
import { Page, Text, View, Document, StyleSheet, Font, Image } from '@react-pdf/renderer';
import { JobCard, JobTask, JobPart } from '@/types/job-card';
import { Customer } from '@/types/customer';
import { Vehicle } from '@/types/vehicle';
import { StaffMember } from '@/types/staff';
import { WorkshopSettings } from '@/types/settings';

/**
 * @fileOverview High-fidelity Job Card PDF Document Template.
 * Optimized for forensic repair documentation and technical archival.
 */

// Register fonts for professional technical typography
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
  if (typeof date === 'object' && 'toDate' in date) d = date.toDate();
  else if (typeof date === 'object' && 'seconds' in date) d = new Date(date.seconds * 1000);
  else d = new Date(date);
  if (isNaN(d.getTime())) return 'Invalid Date';
  return d.toISOString().split('T')[0];
};

const styles = StyleSheet.create({
  page: {
    paddingTop: 40,
    paddingRight: 40,
    paddingBottom: 90,
    paddingLeft: 40,
    backgroundColor: '#FFFFFF',
    fontFamily: 'Inter',
    color: '#0F172A',
    fontSize: 9,
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
    width: 54,
    height: 54,
    borderRadius: 8,
  },
  workshopInfo: {
    marginLeft: 12,
    flex: 1,
  },
  workshopName: {
    fontSize: 12,
    fontWeight: 900,
    textTransform: 'uppercase',
    marginBottom: 2,
  },
  contactText: {
    fontSize: 7,
    color: '#94A3B8',
    fontWeight: 400,
    marginBottom: 1,
  },
  dossierMeta: {
    textAlign: 'right',
    width: 200,
  },
  dossierTitle: {
    fontSize: 9,
    fontWeight: 900,
    textTransform: 'uppercase',
    color: '#023891',
    letterSpacing: 1.5,
    marginBottom: 4,
  },
  dossierID: {
    fontSize: 16,
    fontWeight: 900,
    marginBottom: 4,
  },
  statusBadge: {
    backgroundColor: '#F1F5F9',
    padding: '4 8',
    borderRadius: 4,
    fontSize: 7,
    fontWeight: 900,
    textTransform: 'uppercase',
    color: '#64748B',
    alignSelf: 'flex-end',
  },
  
  grid: {
    flexDirection: 'row',
    marginBottom: 30,
    gap: 20,
  },
  col: {
    flex: 1,
  },
  sectionHeader: {
    fontSize: 7,
    fontWeight: 900,
    textTransform: 'uppercase',
    color: '#94A3B8',
    letterSpacing: 1,
    marginBottom: 8,
    borderBottomWidth: 0.5,
    borderBottomColor: '#F1F5F9',
    paddingBottom: 4,
  },
  valBig: {
    fontSize: 10,
    fontWeight: 700,
    textTransform: 'uppercase',
    marginBottom: 4,
  },
  valSmall: {
    fontSize: 7,
    color: '#64748B',
    marginBottom: 2,
  },

  diagnosisBox: {
    marginBottom: 30,
    padding: 15,
    backgroundColor: '#F8FAFC',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#F1F5F9',
  },
  diagnosisText: {
    fontSize: 9,
    color: '#334155',
    lineHeight: 1.5,
    fontStyle: 'italic',
  },

  table: {
    marginTop: 10,
    borderWidth: 1,
    borderColor: '#F1F5F9',
    borderRadius: 8,
    overflow: 'hidden',
    marginBottom: 20,
  },
  tableHeader: {
    flexDirection: 'row',
    backgroundColor: '#F8FAFC',
    padding: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  tableRow: {
    flexDirection: 'row',
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
    minHeight: 30,
    alignItems: 'center',
  },
  colDesc: { width: '65%' },
  colQty: { width: '15%', textAlign: 'center' },
  colStat: { width: '20%', textAlign: 'right' },
  
  rowText: { fontSize: 8, fontWeight: 700 },
  rowSubText: { fontSize: 7, color: '#94A3B8', marginTop: 1 },

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
  certification: {
    fontSize: 6,
    fontWeight: 900,
    textTransform: 'uppercase',
    color: '#CBD5E1',
    letterSpacing: 2,
  },
});

interface JobCardPDFDocumentProps {
  jobCard: JobCard;
  customer: Customer | null;
  vehicle: Vehicle | null;
  tasks: JobTask[] | null;
  parts: JobPart[] | null;
  mechanic: StaffMember | null;
  settings: WorkshopSettings | null;
}

export function JobCardPDFDocument({ 
  jobCard, 
  customer, 
  vehicle, 
  tasks, 
  parts, 
  mechanic, 
  settings 
}: JobCardPDFDocumentProps) {
  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <View style={styles.header}>
          <View style={styles.logoContainer}>
            {settings?.logoUrl && <Image src={settings.logoUrl} style={styles.logo} />}
            <View style={styles.workshopInfo}>
              <Text style={styles.workshopName}>{safeText(settings?.workshopName || 'MAKROS SYSTEM')}</Text>
              <Text style={styles.contactText}>{safeText(settings?.address)}</Text>
              <Text style={styles.contactText}>{safeText(settings?.phone)} | {safeText(settings?.email)}</Text>
            </View>
          </View>
          <View style={styles.dossierMeta}>
            <Text style={styles.dossierTitle}>Certified Repair Dossier</Text>
            <Text style={styles.dossierID}>#{safeText(jobCard.jobCardId.toUpperCase().slice(-8))}</Text>
            <Text style={styles.valSmall}>Intake: {formatPdfDate(jobCard.createdAt)}</Text>
            <View style={styles.statusBadge}>
                <Text>{safeText(jobCard.status)}</Text>
            </View>
          </View>
        </View>

        <View style={styles.grid}>
          <View style={styles.col}>
            <Text style={styles.sectionHeader}>Client Identification</Text>
            <Text style={styles.valBig}>{safeText(customer?.fullName || 'N/A')}</Text>
            <Text style={styles.valSmall}>Contact: {safeText(customer?.phone)}</Text>
            <Text style={styles.valSmall}>{safeText(customer?.address)}</Text>
          </View>
          <View style={styles.col}>
            <Text style={styles.sectionHeader}>Technical Asset</Text>
            <Text style={styles.valBig}>{safeText(vehicle?.make)} {safeText(vehicle?.model)}</Text>
            <Text style={styles.valSmall}>Plate: {safeText(vehicle?.numberPlate)}</Text>
            <Text style={styles.valSmall}>Odometer: {safeText(vehicle?.mileage)} KM</Text>
          </View>
          <View style={styles.col}>
            <Text style={styles.sectionHeader}>Personnel</Text>
            <Text style={styles.valBig}>{safeText(mechanic?.fullName || 'Unassigned')}</Text>
            <Text style={styles.valSmall}>Lead Technician</Text>
            <Text style={styles.valSmall}>{safeText(mechanic?.specialization)}</Text>
          </View>
        </View>

        <View style={styles.diagnosisBox}>
          <Text style={styles.sectionHeader}>Incident & Diagnosis Log</Text>
          <Text style={styles.diagnosisText}>&quot;{safeText(jobCard.reportedIssue, 1000)}&quot;</Text>
        </View>

        {tasks && tasks.length > 0 && (
          <View wrap={false}>
            <Text style={styles.sectionHeader}>Technical Roadmap (Tasks)</Text>
            <View style={styles.table}>
              <View style={styles.tableHeader}>
                <Text style={[styles.colDesc, { fontSize: 7, fontWeight: 900, color: '#64748B' }]}>DESCRIPTION</Text>
                <Text style={[styles.colQty, { fontSize: 7, fontWeight: 900, color: '#64748B' }]}>HOURS</Text>
                <Text style={[styles.colStat, { fontSize: 7, fontWeight: 900, color: '#64748B' }]}>STATUS</Text>
              </View>
              {tasks.map((task, i) => (
                <View key={i} style={styles.tableRow} wrap={false}>
                  <View style={styles.colDesc}>
                    <Text style={styles.rowText}>{safeText(task.taskDescription)}</Text>
                  </View>
                  <View style={styles.colQty}><Text style={styles.rowText}>{task.estimatedHours}</Text></View>
                  <View style={styles.colStat}><Text style={[styles.rowText, { color: task.status === 'Completed' ? '#10B981' : '#64748B' }]}>{task.status}</Text></View>
                </View>
              ))}
            </View>
          </View>
        )}

        {parts && parts.length > 0 && (
          <View wrap={false}>
            <Text style={styles.sectionHeader}>Material Allocation (Parts)</Text>
            <View style={styles.table}>
              <View style={styles.tableHeader}>
                <Text style={[styles.colDesc, { fontSize: 7, fontWeight: 900, color: '#64748B' }]}>ITEM DESCRIPTION</Text>
                <Text style={[styles.colQty, { fontSize: 7, fontWeight: 900, color: '#64748B' }]}>QTY</Text>
                <Text style={[styles.colStat, { fontSize: 7, fontWeight: 900, color: '#64748B' }]}>REF</Text>
              </View>
              {parts.map((part, i) => (
                <View key={i} style={styles.tableRow} wrap={false}>
                  <View style={styles.colDesc}>
                    <Text style={styles.rowText}>{safeText(part.itemName || part.itemId)}</Text>
                  </View>
                  <View style={styles.colQty}><Text style={styles.rowText}>{part.quantityUsed}</Text></View>
                  <View style={styles.colStat}><Text style={styles.valSmall}>{safeText(part.itemId.slice(-6).toUpperCase())}</Text></View>
                </View>
              ))}
            </View>
          </View>
        )}

        <View style={styles.footer} fixed>
          <Text style={styles.valSmall}>Certified by Makros System Professional Workshop OS</Text>
          <Text style={styles.certification}>INTERNAL TECHNICAL RECORD • DO NOT USE FOR BILLING</Text>
        </View>
      </Page>
    </Document>
  );
}
