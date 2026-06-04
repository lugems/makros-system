'use client';

import { 
  collection, 
  doc, 
  setDoc, 
  updateDoc, 
  serverTimestamp 
} from 'firebase/firestore';
import { initializeApp, getApp, getApps } from 'firebase/app';
import { getAuth, createUserWithEmailAndPassword } from 'firebase/auth';
import { db } from '@/lib/firebase';
import { firebaseConfig } from '@/firebase/config';
import { Customer } from '@/types/customer';
import { logAudit } from '@/lib/audit-logger';
import { errorEmitter } from '@/firebase/error-emitter';
import { FirestorePermissionError, type SecurityRuleContext } from '@/firebase/errors';

const COLLECTION_NAME = 'customers';

/**
 * Initializes a secondary Auth instance to allow user creation without logging out the current staff session.
 */
const getSecondaryAuth = () => {
    const secondaryAppName = 'SecondaryAuthApp';
    let app;
    if (getApps().find(a => a.name === secondaryAppName)) {
        app = getApp(secondaryAppName);
    } else {
        app = initializeApp(firebaseConfig, secondaryAppName);
    }
    return getAuth(app);
};

/**
 * ENROLL CUSTOMER ACCOUNT:
 * 1. Creates Firebase Auth user.
 * 2. Creates profile in /users/ with 'Customer' role.
 * 3. Creates record in /customers/ using Auth UID.
 */
export const enrollCustomerAccount = async (
  data: Omit<Customer, 'customerId' | 'createdAt' | 'updatedAt'> & { password?: string }, 
  initiatorId: string
) => {
  if (!data.email || !data.password) throw new Error("Credentials required for account creation.");

  // 1. Create Auth User (Blocking step as we need the UID)
  const secondaryAuth = getSecondaryAuth();
  const userCredential = await createUserWithEmailAndPassword(secondaryAuth, data.email, data.password);
  const uid = userCredential.user.uid;

  const now = serverTimestamp();

  // 2. Initialize User Profile (MASTER for identity/imagery)
  const userRef = doc(db, 'users', uid);
  const userProfile = {
      userId: uid,
      fullName: data.fullName,
      email: data.email,
      phone: data.phone,
      role: 'Customer',
      status: 'Active',
      createdAt: now,
      updatedAt: now,
  };

  // 3. Initialize Customer Record (CRM specific data)
  const customerRef = doc(db, 'customers', uid);
  const customerRecord = {
      customerId: uid,
      fullName: data.fullName,
      email: data.email,
      phone: data.phone,
      address: data.address || '',
      status: 'Active',
      createdAt: now,
      updatedAt: now,
      createdBy: initiatorId,
  };

  // Commit records using non-blocking setDoc pattern
  setDoc(userRef, userProfile).catch(async (err) => {
    errorEmitter.emit('permission-error', new FirestorePermissionError({
      path: userRef.path,
      operation: 'create',
      requestResourceData: userProfile,
    } satisfies SecurityRuleContext));
  });

  setDoc(customerRef, customerRecord).catch(async (err) => {
    errorEmitter.emit('permission-error', new FirestorePermissionError({
      path: customerRef.path,
      operation: 'create',
      requestResourceData: customerRecord,
    } satisfies SecurityRuleContext));
  });

  logAudit(initiatorId, 'ENROLL_CUSTOMER_ACCOUNT', 'Customers', uid, `Enrolled new customer user: ${data.fullName}`);
  return uid;
};

export const createCustomer = (
  data: Omit<Customer, 'customerId' | 'createdAt' | 'updatedAt'>, 
  userId: string
) => {
  const docRef = doc(collection(db, COLLECTION_NAME));
  const payload = {
    ...data,
    customerId: docRef.id,
    status: 'Active',
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

  logAudit(userId, 'CREATE', 'Customers', docRef.id, `Enrolled new client: ${data.fullName}`);
  return docRef.id;
};

export const updateCustomer = (
  customerId: string, 
  data: Partial<Customer>, 
  userId: string
) => {
  const docRef = doc(db, COLLECTION_NAME, customerId);
  const payload = { ...data, updatedAt: serverTimestamp() };
  
  updateDoc(docRef, payload).catch(async (err) => {
    errorEmitter.emit('permission-error', new FirestorePermissionError({
      path: docRef.path,
      operation: 'update',
      requestResourceData: payload,
    } satisfies SecurityRuleContext));
  });

  logAudit(userId, 'UPDATE', 'Customers', customerId, `Synchronized client record: ${data.fullName || customerId}`);
};

export const deactivateCustomer = (customerId: string, userId: string) => {
  const docRef = doc(db, COLLECTION_NAME, customerId);
  const payload = { status: 'Inactive', updatedAt: serverTimestamp() };
  
  updateDoc(docRef, payload).catch(async (err) => {
    errorEmitter.emit('permission-error', new FirestorePermissionError({
      path: docRef.path,
      operation: 'update',
      requestResourceData: payload,
    } satisfies SecurityRuleContext));
  });
  
  logAudit(userId, 'DEACTIVATE', 'Customers', customerId, `Decommissioned client record.`);
};
