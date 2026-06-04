'use client';

import { 
  collection, 
  doc, 
  setDoc, 
  updateDoc, 
  deleteDoc, 
  serverTimestamp
} from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { MakrosService } from '@/types/makros-service';
import { errorEmitter } from '@/firebase/error-emitter';
import { FirestorePermissionError, type SecurityRuleContext } from '@/firebase/errors';
import { logAudit } from '@/lib/audit-logger';

const COLLECTION_NAME = 'services';

/**
 * Standardized Service layer for Workshop Catalog operations.
 */

export const createService = (data: Omit<MakrosService, 'serviceId' | 'createdAt' | 'updatedAt'>) => {
  const docRef = doc(collection(db, COLLECTION_NAME));
  const payload = {
    ...data,
    serviceId: docRef.id,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  };
  
  setDoc(docRef, payload).catch(async (serverError) => {
    const permissionError = new FirestorePermissionError({
      path: docRef.path,
      operation: 'create',
      requestResourceData: payload,
    } satisfies SecurityRuleContext);
    errorEmitter.emit('permission-error', permissionError);
  });
  
  return docRef.id;
};

export const updateService = (serviceId: string, data: Partial<MakrosService>) => {
    const docRef = doc(db, COLLECTION_NAME, serviceId);
    const payload = { ...data, updatedAt: serverTimestamp() };
    
    updateDoc(docRef, payload).catch(async (serverError) => {
        const permissionError = new FirestorePermissionError({
          path: docRef.path,
          operation: 'update',
          requestResourceData: payload,
        } satisfies SecurityRuleContext);
        errorEmitter.emit('permission-error', permissionError);
    });
};

export const deleteService = (serviceId: string) => {
    const docRef = doc(db, COLLECTION_NAME, serviceId);
    deleteDoc(docRef).catch(async (serverError) => {
        const permissionError = new FirestorePermissionError({
          path: docRef.path,
          operation: 'delete',
        } satisfies SecurityRuleContext);
        errorEmitter.emit('permission-error', permissionError);
    });
};
