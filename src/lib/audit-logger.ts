'use client';

import { collection, doc, setDoc, serverTimestamp } from 'firebase/firestore';
import { db } from './firebase';
import { errorEmitter } from '@/firebase/error-emitter';
import { FirestorePermissionError, type SecurityRuleContext } from '@/firebase/errors';

/**
 * @fileOverview Standardized helper for generating immutable system audit logs.
 */
export async function logAudit(
  userId: string, 
  action: string, 
  module: string, 
  recordId: string, 
  description: string
) {
  const logsCollection = collection(db, 'auditLogs');
  const logRef = doc(logsCollection);
  
  const logData = {
    logId: logRef.id,
    userId,
    action,
    module,
    recordId,
    description,
    createdAt: serverTimestamp(),
  };

  // Initiate the write using setDoc with a pre-generated ID to maintain consistency
  setDoc(logRef, logData).catch(async (serverError) => {
    const permissionError = new FirestorePermissionError({
      path: logRef.path,
      operation: 'create',
      requestResourceData: logData,
    } satisfies SecurityRuleContext);
    errorEmitter.emit('permission-error', permissionError);
  });
}
