'use client';

import React from 'react';
import { Page, Text, View, Document, StyleSheet, Font, Image } from '@react-pdf/renderer';
import { JobCard, JobTask, JobPart } from '@/types/job-card';
import { Customer } from '@/types/customer';
import { StaffMember } from '@/types/staff';
import { WorkshopSettings } from '@/types/settings';
import { getMeterUnit } from '@/services/asset-resolver-service';

/**
 * @fileOverview Workshop job card PDF template.
 * Supports both vehicle and plant assets without changing the underlying data flow.
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
  if (typeof date === 'object' && 'toDate' in date) d = date.toDate();
  else if (typeof date === 'object' && 'seconds' in date) d = new Date(date.seconds * 1000);
  else d = new Date(date);
  if (isNaN(d.getTime())) return 'Invalid Date';
  return d.toISOString().split('T')[0];
};

const NAVY = '#102A43';
const INK = '#243B53';
const MUTED = '#627D98';
const BORDER = '#D9E2EC';
const PAPER = '#F7F9FC';
const ACCENT = '#F59E0B';

const styles = StyleSheet.create({
  page: {
    paddingTop: 30,
    paddingRight: 34,
    paddingBottom: 82,
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
  logo: {
    width: 40,
    height: 40,
    objectFit: 'contain',
  },
  brandCopy: { flex: 1 },
  workshopName: {
    fontSize: 14,
    fontWeight: 900,
    color: NAVY,
    textTransform: 'uppercase',
    marginBottom: 4,
  },
  contactText: {
    fontSize: 7,
    color: MUTED,
    marginBottom: 2,
  },
  titleBlock: {
    width: '39%',
    backgroundColor: NAVY,
    padding: 12,
    minHeight: 68,
  },
  documentTitle: {
    fontSize: 16,
    fontWeight: 900,
    color: '#FFFFFF',
    letterSpacing: 0.7,
  },
  documentSubtitle: {
    marginTop: 3,
    fontSize: 6,
    color: '#BCCCDC',
    letterSpacing: 1.3,
  },
  documentNumber: {
    marginTop: 9,
    fontSize: 9,
    fontWeight: 700,
    color: '#FFFFFF',
  },
  metaBar: {
    flexDirection: 'row',
    backgroundColor: PAPER,
    borderWidth: 1,
    borderColor: BORDER,
    marginBottom: 18,
  },
  metaCell: {
    flex: 1,
    paddingVertical: 8,
    paddingHorizontal: 10,
    borderRightWidth: 1,
    borderRightColor: BORDER,
  },
  metaCellLast: {
    flex: 1,
    paddingVertical: 8,
    paddingHorizontal: 10,
  },
  microLabel: {
    fontSize: 5.5,
    fontWeight: 900,
    color: MUTED,
    letterSpacing: 0.8,
    textTransform: 'uppercase',
    marginBottom: 3,
  },
  metaValue: {
    fontSize: 8,
    fontWeight: 700,
    color: NAVY,
  },
  statusValue: {
    color: '#B45309',
  },
  infoGrid: {
    flexDirection: 'row',
    marginBottom: 18,
  },
  infoCard: {
    width: '32%',
    borderTopWidth: 3,
    borderTopColor: NAVY,
    borderRightWidth: 1,
    borderBottomWidth: 1,
    borderLeftWidth: 1,
    borderColor: BORDER,
    padding: 10,
    minHeight: 88,
    marginRight: '2%',
  },
  infoCardLast: {
    width: '32%',
    borderTopWidth: 3,
    borderTopColor: NAVY,
    borderRightWidth: 1,
    borderBottomWidth: 1,
    borderLeftWidth: 1,
    borderColor: BORDER,
    padding: 10,
    minHeight: 88,
  },
  cardTitle: {
    fontSize: 6,
    fontWeight: 900,
    color: MUTED,
    letterSpacing: 1,
    textTransform: 'uppercase',
    marginBottom: 8,
  },
  primaryValue: {
    fontSize: 10,
    fontWeight: 900,
    color: NAVY,
    textTransform: 'uppercase',
    marginBottom: 5,
  },
  detailLine: {
    fontSize: 7,
    color: MUTED,
    marginBottom: 3,
    lineHeight: 1.25,
  },
  detailStrong: { fontWeight: 700, color: INK },
  concern: {
    flexDirection: 'row',
    marginBottom: 19,
    borderWidth: 1,
    borderColor: BORDER,
    backgroundColor: '#FFFDF7',
  },
  concernMarker: {
    width: 7,
    backgroundColor: ACCENT,
  },
  concernBody: {
    flex: 1,
    paddingVertical: 11,
    paddingHorizontal: 12,
  },
  concernTitle: {
    fontSize: 6,
    fontWeight: 900,
    color: '#B45309',
    letterSpacing: 1,
    textTransform: 'uppercase',
    marginBottom: 6,
  },
  concernText: {
    fontSize: 9,
    color: INK,
    lineHeight: 1.45,
  },
  section: { marginBottom: 17 },
  sectionHeading: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 7,
  },
  sectionNumber: {
    width: 20,
    height: 20,
    backgroundColor: NAVY,
    color: '#FFFFFF',
    fontSize: 7,
    fontWeight: 900,
    textAlign: 'center',
    paddingTop: 6,
    marginRight: 7,
  },
  sectionTitle: {
    flex: 1,
    fontSize: 8,
    fontWeight: 900,
    color: NAVY,
    letterSpacing: 0.7,
    textTransform: 'uppercase',
  },
  sectionCount: {
    fontSize: 6,
    color: MUTED,
  },
  table: {
    borderLeftWidth: 1,
    borderRightWidth: 1,
    borderTopWidth: 1,
    borderColor: BORDER,
  },
  tableHeader: {
    flexDirection: 'row',
    backgroundColor: '#EAF0F6',
    borderBottomWidth: 1,
    borderBottomColor: BORDER,
    paddingVertical: 6,
    paddingHorizontal: 8,
  },
  tableRow: {
    flexDirection: 'row',
    alignItems: 'center',
    minHeight: 29,
    paddingVertical: 7,
    paddingHorizontal: 8,
    borderBottomWidth: 1,
    borderBottomColor: BORDER,
  },
  tableRowAlt: { backgroundColor: '#FAFCFE' },
  indexCol: { width: '7%' },
  descriptionCol: { width: '58%' },
  quantityCol: { width: '14%', textAlign: 'center' },
  statusCol: { width: '21%', textAlign: 'right' },
  tableLabel: {
    fontSize: 5.5,
    fontWeight: 900,
    color: MUTED,
    letterSpacing: 0.6,
  },
  rowIndex: { fontSize: 6.5, fontWeight: 700, color: '#9FB3C8' },
  rowText: { fontSize: 7.5, fontWeight: 700, color: INK },
  rowMuted: { fontSize: 6.5, color: MUTED },
  completed: { color: '#138A5B' },
  signoff: {
    flexDirection: 'row',
    marginTop: 7,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: BORDER,
  },
  signoffCell: { flex: 1, marginRight: 24 },
  signoffCellLast: { flex: 1 },
  signLine: { borderBottomWidth: 1, borderBottomColor: '#9FB3C8', height: 18 },
  signLabel: { marginTop: 4, fontSize: 5.5, color: MUTED, textTransform: 'uppercase' },
  footer: {
    position: 'absolute',
    bottom: 24,
    left: 34,
    right: 34,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: BORDER,
  },
  footerText: { fontSize: 5.5, color: MUTED },
  pageNumber: { fontSize: 6, fontWeight: 700, color: NAVY },
});

interface JobCardPDFDocumentProps {
  jobCard: JobCard;
  customer: Customer | null;
  vehicle: any | null;
  tasks: JobTask[] | null;
  parts: JobPart[] | null;
  mechanic: StaffMember | null;
  settings: WorkshopSettings | null;
  invoiceNumber?: string;
}

export function JobCardPDFDocument({
  jobCard,
  customer,
  vehicle: asset,
  tasks,
  parts,
  mechanic,
  settings,
  invoiceNumber,
}: JobCardPDFDocumentProps) {
  const isPlant = jobCard.assetType === 'Plant';
  const assetName = isPlant ? safeText(asset?.name) : `${safeText(asset?.make)} ${safeText(asset?.model)}`;
  const assetIDLabel = isPlant ? 'Asset ID' : 'Number Plate';
  const assetIDVal = isPlant ? safeText(asset?.assetId) : safeText(asset?.numberPlate);
  const telemetryLabel = isPlant ? 'Telemetry' : 'Odometer';
  const telemetryUnit = isPlant ? getMeterUnit(asset?.meterType) : 'KM';
  const telemetryVal = isPlant ? safeText(asset?.meterReading?.toLocaleString()) : safeText(asset?.mileage?.toLocaleString());
  const technicalRefLabel = isPlant ? 'Serial S/N' : 'VIN';
  const technicalRefVal = isPlant ? safeText(asset?.serialNumber) : safeText(asset?.vin || asset?.chassisNumber);
  const shortJobId = safeText(jobCard.jobCardId.toUpperCase().slice(-8));

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <View style={styles.topRule} fixed />

        <View style={styles.header}>
          <View style={styles.brand}>
            {settings?.logoUrl && (
              <View style={styles.logoFrame}>
                <Image src={settings.logoUrl} style={styles.logo} />
              </View>
            )}
            <View style={styles.brandCopy}>
              <Text style={styles.workshopName}>{safeText(settings?.workshopName || 'MAKROS SYSTEM')}</Text>
              <Text style={styles.contactText}>{safeText(settings?.address)}</Text>
              <Text style={styles.contactText}>{safeText(settings?.phone)} | {safeText(settings?.email)}</Text>
            </View>
          </View>

          <View style={styles.titleBlock}>
            <Text style={styles.documentTitle}>JOB CARD</Text>
            <Text style={styles.documentSubtitle}>WORKSHOP SERVICE RECORD</Text>
            <Text style={styles.documentNumber}>REF / {shortJobId}</Text>
          </View>
        </View>

        <View style={styles.metaBar}>
          <View style={styles.metaCell}>
            <Text style={styles.microLabel}>Date received</Text>
            <Text style={styles.metaValue}>{formatPdfDate(jobCard.createdAt)}</Text>
          </View>
          <View style={styles.metaCell}>
            <Text style={styles.microLabel}>Current status</Text>
            <Text style={[styles.metaValue, styles.statusValue]}>{safeText(jobCard.status)}</Text>
          </View>
          <View style={styles.metaCell}>
            <Text style={styles.microLabel}>Invoice reference</Text>
            <Text style={styles.metaValue}>{invoiceNumber ? `#${safeText(invoiceNumber)}` : 'Not invoiced'}</Text>
          </View>
          <View style={styles.metaCellLast}>
            <Text style={styles.microLabel}>Asset category</Text>
            <Text style={styles.metaValue}>{isPlant ? 'Plant / Equipment' : 'Motor Vehicle'}</Text>
          </View>
        </View>

        <View style={styles.infoGrid}>
          <View style={styles.infoCard}>
            <Text style={styles.cardTitle}>Customer</Text>
            <Text style={styles.primaryValue}>{safeText(customer?.fullName || 'N/A')}</Text>
            <Text style={styles.detailLine}>Tel: <Text style={styles.detailStrong}>{safeText(customer?.phone)}</Text></Text>
            <Text style={styles.detailLine}>{safeText(customer?.address)}</Text>
          </View>

          <View style={styles.infoCard}>
            <Text style={styles.cardTitle}>{isPlant ? 'Equipment' : 'Vehicle'}</Text>
            <Text style={styles.primaryValue}>{assetName}</Text>
            <Text style={styles.detailLine}>{assetIDLabel}: <Text style={styles.detailStrong}>{assetIDVal}</Text></Text>
            <Text style={styles.detailLine}>{telemetryLabel}: <Text style={styles.detailStrong}>{telemetryVal} {telemetryUnit}</Text></Text>
            <Text style={styles.detailLine}>{technicalRefLabel}: <Text style={styles.detailStrong}>{technicalRefVal}</Text></Text>
          </View>

          <View style={styles.infoCardLast}>
            <Text style={styles.cardTitle}>Assigned technician</Text>
            <Text style={styles.primaryValue}>{safeText(mechanic?.fullName || 'Unassigned')}</Text>
            <Text style={styles.detailLine}>Role: <Text style={styles.detailStrong}>{safeText(mechanic?.role || mechanic?.specialization)}</Text></Text>
            <Text style={styles.detailLine}>Responsibility: Lead technician</Text>
          </View>
        </View>

        <View style={styles.concern}>
          <View style={styles.concernMarker} />
          <View style={styles.concernBody}>
            <Text style={styles.concernTitle}>Customer concern / reported fault</Text>
            <Text style={styles.concernText}>{safeText(jobCard.reportedIssue, 1000)}</Text>
          </View>
        </View>

        {tasks && tasks.length > 0 && (
          <View style={styles.section}>
            <View style={styles.sectionHeading} wrap={false}>
              <Text style={styles.sectionNumber}>01</Text>
              <Text style={styles.sectionTitle}>Work scope</Text>
              <Text style={styles.sectionCount}>{tasks.length} {tasks.length === 1 ? 'task' : 'tasks'}</Text>
            </View>
            <View style={styles.table}>
              <View style={styles.tableHeader} wrap={false}>
                <Text style={[styles.indexCol, styles.tableLabel]}>NO.</Text>
                <Text style={[styles.descriptionCol, styles.tableLabel]}>TASK DESCRIPTION</Text>
                <Text style={[styles.quantityCol, styles.tableLabel]}>HOURS</Text>
                <Text style={[styles.statusCol, styles.tableLabel]}>STATUS</Text>
              </View>
              {tasks.map((task, i) => (
                <View key={i} style={[styles.tableRow, ...(i % 2 ? [styles.tableRowAlt] : [])]} wrap={false}>
                  <Text style={[styles.indexCol, styles.rowIndex]}>{String(i + 1).padStart(2, '0')}</Text>
                  <Text style={[styles.descriptionCol, styles.rowText]}>{safeText(task.taskDescription)}</Text>
                  <Text style={[styles.quantityCol, styles.rowText]}>{task.estimatedHours}</Text>
                  <Text style={[styles.statusCol, styles.rowText, ...(task.status === 'Completed' ? [styles.completed] : [])]}>{task.status}</Text>
                </View>
              ))}
            </View>
          </View>
        )}

        {parts && parts.length > 0 && (
          <View style={styles.section}>
            <View style={styles.sectionHeading} wrap={false}>
              <Text style={styles.sectionNumber}>02</Text>
              <Text style={styles.sectionTitle}>Parts issued</Text>
              <Text style={styles.sectionCount}>{parts.length} {parts.length === 1 ? 'item' : 'items'}</Text>
            </View>
            <View style={styles.table}>
              <View style={styles.tableHeader} wrap={false}>
                <Text style={[styles.indexCol, styles.tableLabel]}>NO.</Text>
                <Text style={[styles.descriptionCol, styles.tableLabel]}>ITEM DESCRIPTION</Text>
                <Text style={[styles.quantityCol, styles.tableLabel]}>QTY</Text>
                <Text style={[styles.statusCol, styles.tableLabel]}>STOCK REF.</Text>
              </View>
              {parts.map((part, i) => (
                <View key={i} style={[styles.tableRow, ...(i % 2 ? [styles.tableRowAlt] : [])]} wrap={false}>
                  <Text style={[styles.indexCol, styles.rowIndex]}>{String(i + 1).padStart(2, '0')}</Text>
                  <Text style={[styles.descriptionCol, styles.rowText]}>{safeText(part.itemName || part.itemId)}</Text>
                  <Text style={[styles.quantityCol, styles.rowText]}>{part.quantityUsed}</Text>
                  <Text style={[styles.statusCol, styles.rowMuted]}>{safeText(part.itemId.slice(-6).toUpperCase())}</Text>
                </View>
              ))}
            </View>
          </View>
        )}

        <View style={styles.signoff} wrap={false}>
          <View style={styles.signoffCell}>
            <View style={styles.signLine} />
            <Text style={styles.signLabel}>Technician signature / date</Text>
          </View>
          <View style={styles.signoffCellLast}>
            <View style={styles.signLine} />
            <Text style={styles.signLabel}>Customer approval / date</Text>
          </View>
        </View>

        <View style={styles.footer} fixed>
          <Text style={styles.footerText}>Internal workshop record - not valid as an invoice</Text>
          <Text
            style={styles.pageNumber}
            render={({ pageNumber, totalPages }) => `JOB ${shortJobId}  |  PAGE ${pageNumber} OF ${totalPages}`}
          />
        </View>
      </Page>
    </Document>
  );
}
