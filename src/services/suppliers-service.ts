'use client';

import { 
  collection, 
  doc, 
  getDoc,
  getDocs,
  setDoc, 
  updateDoc, 
  deleteDoc,
  serverTimestamp
} from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Supplier } from '@/types/supplier';
import { logAudit } from '@/lib/audit-logger';
import { errorEmitter } from '@/firebase/error-emitter';
import { FirestorePermissionError, type SecurityRuleContext } from '@/firebase/errors';

const COLLECTION_NAME = 'suppliers';

/**
 * Technical Registry for Supply Chain Vendors.
 * Follows the non-blocking pattern for Firestore mutations.
 */

export const getSuppliers = async (): Promise<Supplier[]> => {
    const snapshot = await getDocs(collection(db, COLLECTION_NAME));
    return snapshot.docs.map(doc => ({ ...doc.data(), supplierId: doc.id })) as Supplier[];
};

export const getSupplierById = async (supplierId: string): Promise<Supplier | null> => {
    const docRef = doc(db, COLLECTION_NAME, supplierId);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      return { ...docSnap.data(), supplierId: docSnap.id } as Supplier;
    }

    return null;
};

export const createSupplier = (
  data: Omit<Supplier, 'supplierId' | 'createdAt' | 'updatedAt'>, 
  userId: string
) => {
  const docRef = doc(collection(db, COLLECTION_NAME));
  const payload = {
    ...data,
    supplierId: docRef.id,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  };

  setDoc(docRef, payload).catch(async (serverError) => {
    errorEmitter.emit('permission-error', new FirestorePermissionError({
      path: docRef.path,
      operation: 'create',
      requestResourceData: payload,
    } satisfies SecurityRuleContext));
  });

  logAudit(userId, 'CREATE', 'Suppliers', docRef.id, `Enrolled new technical vendor: ${data.supplierName}`);
  return docRef.id;
};

export const updateSupplier = (supplierId: string, data: Partial<Supplier>, userId: string = 'system') => {
    const docRef = doc(db, COLLECTION_NAME, supplierId);
    const payload = { ...data, updatedAt: serverTimestamp() };
    
    updateDoc(docRef, payload).catch(async (serverError) => {
        errorEmitter.emit('permission-error', new FirestorePermissionError({
          path: docRef.path,
          operation: 'update',
          requestResourceData: payload,
        } satisfies SecurityRuleContext));
    });
    
    logAudit(userId, 'UPDATE', 'Suppliers', supplierId, `Synchronized partner registry parameters.`);
};

export const deleteSupplier = (supplierId: string, userId: string = 'system') => {
    const docRef = doc(db, COLLECTION_NAME, supplierId);
    
    deleteDoc(docRef).catch(async (serverError) => {
        errorEmitter.emit('permission-error', new FirestorePermissionError({
          path: docRef.path,
          operation: 'delete',
        } satisfies SecurityRuleContext));
    });
    
    logAudit(userId, 'DELETE', 'Suppliers', supplierId, `Vendor record purged from registry.`);
};

export const deactivateSupplier = (supplierId: string, userId: string) => {
    const docRef = doc(db, COLLECTION_NAME, supplierId);
    const payload = { status: 'Inactive', updatedAt: serverTimestamp() };
    
    updateDoc(docRef, payload).catch(async (serverError) => {
        errorEmitter.emit('permission-error', new FirestorePermissionError({
          path: docRef.path,
          operation: 'update',
          requestResourceData: payload,
        } satisfies SecurityRuleContext));
    });
    
    logAudit(userId, 'DEACTIVATE', 'Suppliers', supplierId, `Vendor authority marked as inactive.`);
};
