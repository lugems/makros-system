'use client';

import { 
  collection, 
  doc, 
  getDoc, 
  getDocs, 
  setDoc, 
  updateDoc, 
  query, 
  where, 
  orderBy,
  serverTimestamp,
  deleteDoc
} from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { CommunicationLog, CommunicationStatus, CommunicationPriority } from '@/types/communication';
import { logAudit } from '@/lib/audit-logger';
import { errorEmitter } from '@/firebase/error-emitter';
import { FirestorePermissionError, type SecurityRuleContext } from '@/firebase/errors';

const COLLECTION_NAME = 'communicationLogs';

/**
 * Technical Registry Service for Forensic Interactions.
 * Implements high-fidelity tracing with atomic audit integration.
 */

/**
 * EVALUATOR: Automated Notification Logic
 * Analyzes logs for specific trigger criteria (Urgent, Client Reply, Approval, Payment).
 */
const triggerNotificationLogic = (data: Partial<CommunicationLog>): Partial<CommunicationLog> => {
    const updates: Partial<CommunicationLog> = {};
    const message = (data.message || '').toLowerCase();
    const subject = (data.subject || '').toLowerCase();

    // 1. Urgent Communication Detection
    if (data.priority === 'Urgent') {
        updates.requiresFollowUp = true;
    }

    // 2. Customer Reply / Incoming Trace
    if (data.direction === 'Incoming' && data.fromRole === 'Customer') {
        updates.priority = 'High' as CommunicationPriority;
        updates.requiresFollowUp = true;
    }

    // 3. Payment Follow-Up Detection
    if (data.module === 'Invoicing' && (subject.includes('payment') || message.includes('payment'))) {
        updates.requiresFollowUp = true;
        if (!data.priority || data.priority === 'Low') updates.priority = 'Normal';
    }

    // 4. Customer Approval Request Detection
    if (subject.includes('approval') || message.includes('approve') || message.includes('confirm')) {
        updates.requiresFollowUp = true;
        if (data.isCustomerVisible) {
            updates.priority = 'High';
        }
    }

    return updates;
};

export const createCommunicationLog = async (
  data: Omit<CommunicationLog, 'logId' | 'createdAt' | 'updatedAt' | 'fromName' | 'fromRole' | 'fromUserId' | 'createdBy'>, 
  userId: string
) => {
  const docRef = doc(collection(db, COLLECTION_NAME));
  
  // Resolve initiator metadata for the forensic trace
  const userRef = doc(db, 'users', userId);
  const userSnap = await getDoc(userRef);
  const userData = userSnap.exists() ? userSnap.data() : {};

  // Evaluate notification triggers
  const automatedUpdates = triggerNotificationLogic(data as any);

  const payload = {
    ...data,
    ...automatedUpdates,
    logId: docRef.id,
    fromUserId: userId,
    fromName: userData.fullName || 'Authorized Personnel',
    fromRole: userData.role || 'Staff',
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
    createdBy: userId,
  };

  setDoc(docRef, payload).catch(async (err) => {
    errorEmitter.emit('permission-error', new FirestorePermissionError({
      path: docRef.path,
      operation: 'create',
      requestResourceData: payload,
    } satisfies SecurityRuleContext));
  });

  // Determine specific audit action and description
  let auditAction = 'CREATE_COMM_LOG';
  let auditDesc = `Registered communication: ${data.subject}`;

  if (data.direction === 'Internal' || data.isInternalOnly) {
      auditAction = 'CREATE_INTERNAL_NOTE';
      auditDesc = `Created internal technical note: ${data.subject}`;
  } else if (data.isCustomerVisible || data.direction === 'Outgoing') {
      auditAction = 'CREATE_CUSTOMER_MSG';
      auditDesc = `Created customer outreach message: ${data.subject}`;
  }

  if (data.module === 'Invoicing' && (data.subject.toLowerCase().includes('payment') || data.message.toLowerCase().includes('payment'))) {
      auditAction = 'CREATE_PAYMENT_FOLLOWUP';
      auditDesc = `Created fiscal payment follow-up: ${data.subject}`;
  } else if (data.module === 'Job Card') {
      auditAction = 'CREATE_JOBCARD_NOTE';
      auditDesc = `Created job card technical note: ${data.subject}`;
  } else if (data.bookingId && (data.requiresFollowUp || automatedUpdates.requiresFollowUp)) {
      auditAction = 'CREATE_BOOKING_FOLLOWUP';
      auditDesc = `Created booking schedule follow-up: ${data.subject}`;
  }

  logAudit(userId, auditAction, 'Communications', docRef.id, auditDesc);
  
  return docRef.id;
};

/**
 * ASSIGNMENT PROTOCOL: Manager assigns communication to staff
 */
export const assignCommunicationToStaff = async (
    logId: string,
    targetUserId: string,
    managerId: string
) => {
    const docRef = doc(db, COLLECTION_NAME, logId);
    const targetUserRef = doc(db, 'users', targetUserId);
    const targetUserSnap = await getDoc(targetUserRef);
    
    if (!targetUserSnap.exists()) throw new Error("Target personnel record not located.");
    const targetData = targetUserSnap.data();

    const payload = {
        toUserId: targetUserId,
        toName: targetData.fullName,
        toRole: targetData.role,
        status: 'Pending Response' as CommunicationStatus,
        updatedAt: serverTimestamp()
    };

    updateDoc(docRef, payload).catch(async (err) => {
        errorEmitter.emit('permission-error', new FirestorePermissionError({
            path: docRef.path,
            operation: 'update',
            requestResourceData: payload,
        } satisfies SecurityRuleContext));
    });

    logAudit(managerId, 'ASSIGN_COMMUNICATION', 'Communications', logId, `Assigned interaction dossier to ${targetData.fullName}.`);
};

export const getCommunicationLogs = async (): Promise<CommunicationLog[]> => {
  const q = query(collection(db, COLLECTION_NAME), orderBy('createdAt', 'desc'));
  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => ({ ...doc.data(), logId: doc.id } as CommunicationLog));
};

export const getCommunicationLogById = async (id: string): Promise<CommunicationLog | null> => {
  const docRef = doc(db, COLLECTION_NAME, id);
  const snapshot = await getDoc(docRef);
  return snapshot.exists() ? ({ ...snapshot.data(), logId: snapshot.id } as CommunicationLog) : null;
};

export const updateCommunicationLog = (
  logId: string, 
  data: Partial<CommunicationLog>, 
  userId: string
) => {
  const docRef = doc(db, COLLECTION_NAME, logId);
  const payload = { ...data, updatedAt: serverTimestamp() };
  
  updateDoc(docRef, payload).catch(async (err) => {
    errorEmitter.emit('permission-error', new FirestorePermissionError({
      path: docRef.path,
      operation: 'update',
      requestResourceData: payload,
    } satisfies SecurityRuleContext));
  });

  logAudit(userId, 'UPDATE_COMMUNICATION', 'Communications', logId, `Recalibrated interaction parameters for: ${data.subject || logId}`);
};

export const resolveCommunicationLog = (logId: string, userId: string) => {
  const docRef = doc(db, COLLECTION_NAME, logId);
  const payload = { status: 'Resolved' as CommunicationStatus, updatedAt: serverTimestamp() };
  
  updateDoc(docRef, payload).catch(async (err) => {
    errorEmitter.emit('permission-error', new FirestorePermissionError({
      path: docRef.path,
      operation: 'update',
      requestResourceData: payload,
    } satisfies SecurityRuleContext));
  });
  
  logAudit(userId, 'RESOLVE_COMM_TRACE', 'Communications', logId, `Interaction trace marked as Resolved.`);
};

export const closeCommunicationLog = (logId: string, userId: string) => {
  const docRef = doc(db, COLLECTION_NAME, logId);
  const payload = { status: 'Closed' as CommunicationStatus, updatedAt: serverTimestamp() };
  
  updateDoc(docRef, payload).catch(async (err) => {
    errorEmitter.emit('permission-error', new FirestorePermissionError({
      path: docRef.path,
      operation: 'update',
      requestResourceData: payload,
    } satisfies SecurityRuleContext));
  });
  
  logAudit(userId, 'CLOSE_COMM_TRACE', 'Communications', logId, `Interaction marked as Closed/Archived.`);
};

export const getCommunicationLogsByCustomer = async (customerId: string): Promise<CommunicationLog[]> => {
  const q = query(collection(db, COLLECTION_NAME), where('customerId', '==', customerId), orderBy('createdAt', 'desc'));
  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => ({ ...doc.data(), logId: doc.id } as CommunicationLog));
};

export const getCommunicationLogsByJobCard = async (jobCardId: string): Promise<CommunicationLog[]> => {
  const q = query(collection(db, COLLECTION_NAME), where('jobCardId', '==', jobCardId), orderBy('createdAt', 'desc'));
  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => ({ ...doc.data(), logId: doc.id } as CommunicationLog));
};

export const getCommunicationLogsByInvoice = async (invoiceId: string): Promise<CommunicationLog[]> => {
  const q = query(collection(db, COLLECTION_NAME), where('invoiceId', '==', invoiceId), orderBy('createdAt', 'desc'));
  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => ({ ...doc.data(), logId: doc.id } as CommunicationLog));
};
