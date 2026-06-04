'use client';

import { 
  collection, 
  doc, 
  getDoc, 
  getDocs, 
  setDoc, 
  updateDoc, 
  deleteDoc,
  query, 
  orderBy,
  serverTimestamp
} from 'firebase/firestore';
import { db, firebaseConfig } from '@/lib/firebase';
import { initializeApp, deleteApp } from 'firebase/app';
import { getAuth, createUserWithEmailAndPassword } from 'firebase/auth';
import { StaffMember } from '@/types/staff';
import { logAudit } from '@/lib/audit-logger';
import { errorEmitter } from '@/firebase/error-emitter';
import { FirestorePermissionError, type SecurityRuleContext } from '@/firebase/errors';

const COLLECTION_NAME = 'users';

/**
 * Technical registry service for personnel management.
 */

export const getAllUsers = async (): Promise<StaffMember[]> => {
  const q = query(collection(db, COLLECTION_NAME), orderBy('fullName', 'asc'));
  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => ({ ...doc.data(), userId: doc.id } as StaffMember));
};

export const getUserById = async (id: string): Promise<StaffMember | null> => {
  const docRef = doc(db, COLLECTION_NAME, id);
  const snapshot = await getDoc(docRef);
  return snapshot.exists() ? ({ ...snapshot.data(), userId: snapshot.id } as StaffMember) : null;
};

/**
 * Enrolls new personnel in the workshop OS.
 * Initiator must have 'Makros System Owner' authority.
 */
export const enrollStaff = async (data: Partial<StaffMember> & { password?: string }, initiatorId: string) => {
  const { password, ...staffData } = data;

  if (!staffData.email || !password) {
    throw new Error("Email and temporary password are required for enrollment.");
  }

  // Initialize a secondary Firebase instance to create the Auth user 
  // without signing out the administrator.
  const tempAppName = `enrollee-${Date.now()}`;
  const tempApp = initializeApp(firebaseConfig, tempAppName);
  const tempAuth = getAuth(tempApp);

  let authUid: string;
  try {
    const userCredential = await createUserWithEmailAndPassword(tempAuth, staffData.email, password);
    authUid = userCredential.user.uid;
  } catch (authErr: any) {
    await deleteApp(tempApp);
    throw authErr;
  }

  const docRef = doc(db, COLLECTION_NAME, authUid);
  const payload = {
    ...staffData,
    userId: authUid,
    status: 'Active',
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  };

  // Non-blocking write with error emission
  setDoc(docRef, payload).catch(async (err) => {
    errorEmitter.emit('permission-error', new FirestorePermissionError({
      path: docRef.path,
      operation: 'create',
      requestResourceData: payload,
    } satisfies SecurityRuleContext));
  });

  await deleteApp(tempApp);
  logAudit(initiatorId, 'ENROLL_STAFF', 'Users', authUid, `Enrolled new personnel: ${staffData.fullName} as ${staffData.role}`);
  return authUid;
};

export const updateStaffRecord = async (userId: string, data: Partial<StaffMember>, initiatorId: string) => {
  const docRef = doc(db, COLLECTION_NAME, userId);
  const payload = { ...data, updatedAt: serverTimestamp() };
  
  updateDoc(docRef, payload).catch(async (err) => {
    errorEmitter.emit('permission-error', new FirestorePermissionError({
      path: docRef.path,
      operation: 'update',
      requestResourceData: payload,
    } satisfies SecurityRuleContext));
  });

  logAudit(initiatorId, 'UPDATE_STAFF', 'Users', userId, `Synchronized personnel record for ${data.fullName || userId}`);
};

export const deactivateStaff = (userId: string, initiatorId: string) => {
  const docRef = doc(db, COLLECTION_NAME, userId);
  const payload = { status: 'Inactive', updatedAt: serverTimestamp() };
  
  updateDoc(docRef, payload).catch(async (err) => {
    errorEmitter.emit('permission-error', new FirestorePermissionError({
        path: docRef.path,
        operation: 'update',
        requestResourceData: payload,
    } satisfies SecurityRuleContext));
  });
  logAudit(initiatorId, 'DEACTIVATE_STAFF', 'Users', userId, `Decommissioned personnel authority.`);
};

export const activateStaff = (userId: string, initiatorId: string) => {
  const docRef = doc(db, COLLECTION_NAME, userId);
  const payload = { status: 'Active', updatedAt: serverTimestamp() };
  
  updateDoc(docRef, payload).catch(async (err) => {
    errorEmitter.emit('permission-error', new FirestorePermissionError({
        path: docRef.path,
        operation: 'update',
        requestResourceData: payload,
    } satisfies SecurityRuleContext));
  });
  logAudit(initiatorId, 'ACTIVATE_STAFF', 'Users', userId, `Restored personnel authority.`);
};

export const purgeStaffRecord = async (userId: string, initiatorId: string) => {
  const docRef = doc(db, COLLECTION_NAME, userId);
  deleteDoc(docRef).catch(async (err) => {
    errorEmitter.emit('permission-error', new FirestorePermissionError({
      path: docRef.path,
      operation: 'delete',
    } satisfies SecurityRuleContext));
  });
  logAudit(initiatorId, 'PURGE_STAFF', 'Users', userId, `Forensically removed personnel record from registry.`);
};
