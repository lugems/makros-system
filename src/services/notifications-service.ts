
'use client';

import { 
  collection, 
  doc, 
  setDoc, 
  updateDoc, 
  getDoc,
  serverTimestamp 
} from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { CommunicationLog, CommunicationStatus, CommunicationPriority, CommunicationModule } from '@/types/communication';
import { logAudit } from '@/lib/audit-logger';
import { errorEmitter } from '@/firebase/error-emitter';
import { FirestorePermissionError, type SecurityRuleContext } from '@/firebase/errors';

const COLLECTION_NAME = 'communicationLogs';

/**
 * Initializes a new forensic interaction record in the workshop ledger.
 * Captures sender identity and contextual dossier links.
 */
export const createNotification = async (
  data: Omit<CommunicationLog, 'logId' | 'createdAt' | 'updatedAt' | 'fromName' | 'fromRole' | 'fromUserId' | 'createdBy'>,
  userId: string
) => {
  const docRef = doc(collection(db, COLLECTION_NAME));
  
  // Resolve sender metadata for forensic traceability
  const userRef = doc(db, 'users', userId);
  const userSnap = await getDoc(userRef);
  const userData = userSnap.exists() ? userSnap.data() : {};

  const payload = {
    ...data,
    logId: docRef.id,
    fromUserId: userId,
    fromName: userData.fullName || 'Unknown Personnel',
    fromRole: userData.role || 'Guest',
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

  logAudit(userId, 'LOG_COMMUNICATION', 'Communications', docRef.id, `Registered ${data.direction} ${data.channel} trace: ${data.subject}`);
  return docRef.id;
};

/**
 * SYSTEM ALERT PROTOCOL:
 * Triggers a proactive system-generated notification for staff.
 */
export const triggerSystemAlert = async (params: {
    subject: string;
    message: string;
    targetUserId?: string;
    targetRole?: string;
    priority?: CommunicationPriority;
    module?: CommunicationModule;
    jobCardId?: string;
    invoiceId?: string;
    customerId?: string;
}) => {
    const docRef = doc(collection(db, COLLECTION_NAME));
    const payload = {
        logId: docRef.id,
        subject: params.subject,
        message: params.message,
        channel: 'In-App',
        direction: 'Internal',
        priority: params.priority || 'Normal',
        status: 'Open',
        module: params.module || 'General',
        toUserId: params.targetUserId || null,
        toRole: params.targetRole || null,
        jobCardId: params.jobCardId || null,
        invoiceId: params.invoiceId || null,
        customerId: params.customerId || null,
        requiresFollowUp: true,
        isCustomerVisible: false,
        isInternalOnly: true,
        fromUserId: 'SYSTEM',
        fromName: 'Workshop OS Engine',
        fromRole: 'Automation',
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
        createdBy: 'SYSTEM'
    };

    setDoc(docRef, payload).catch(async (err) => {
        errorEmitter.emit('permission-error', new FirestorePermissionError({
          path: docRef.path,
          operation: 'create',
          requestResourceData: payload,
        } satisfies SecurityRuleContext));
    });

    return docRef.id;
};

/**
 * Updates the technical state of an interaction record.
 */
export const updateNotificationStatus = (
  logId: string, 
  status: CommunicationStatus, 
  userId: string
) => {
  const docRef = doc(db, COLLECTION_NAME, logId);
  const updateData = { 
    status, 
    updatedAt: serverTimestamp() 
  };
  
  updateDoc(docRef, updateData).catch(async (err) => {
    errorEmitter.emit('permission-error', new FirestorePermissionError({
      path: docRef.path,
      operation: 'update',
      requestResourceData: updateData,
    } satisfies SecurityRuleContext));
  });
  
  logAudit(userId, 'UPDATE_COMM_STATUS', 'Communications', logId, `Interaction state shifted to ${status}`);
};
