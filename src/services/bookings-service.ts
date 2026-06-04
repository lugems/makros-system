
'use client';

import { 
  collection, 
  doc, 
  setDoc, 
  updateDoc, 
  serverTimestamp,
  deleteDoc
} from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Booking, BookingStatus } from '@/types/booking';
import { logAudit } from '@/lib/audit-logger';
import { errorEmitter } from '@/firebase/error-emitter';
import { FirestorePermissionError, type SecurityRuleContext } from '@/firebase/errors';

const COLLECTION_NAME = 'bookings';

/**
 * Technical Registry for Service Intakes.
 * All mutations are non-blocking and emit contextual errors.
 */

export const createBooking = (
  data: Omit<Booking, 'bookingId' | 'createdAt' | 'updatedAt'>, 
  userId: string
) => {
  const docRef = doc(collection(db, COLLECTION_NAME));
  const payload = {
    ...data,
    bookingId: docRef.id,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  };
  
  setDoc(docRef, payload).catch(async (err) => {
    errorEmitter.emit('permission-error', new FirestorePermissionError({
      path: docRef.path,
      operation: 'create',
      requestResourceData: payload,
    } satisfies SecurityRuleContext));
  });

  logAudit(userId, 'CREATE', 'Bookings', docRef.id, `Scheduled new appointment for Vehicle: ${data.vehicleId}`);
  return docRef.id;
};

export const updateBooking = (
    bookingId: string, 
    data: Partial<Booking>, 
    userId: string
) => {
    const docRef = doc(db, COLLECTION_NAME, bookingId);
    const payload = { ...data, updatedAt: serverTimestamp() };
    
    updateDoc(docRef, payload).catch(async (err) => {
        errorEmitter.emit('permission-error', new FirestorePermissionError({
            path: docRef.path,
            operation: 'update',
            requestResourceData: payload,
        } satisfies SecurityRuleContext));
    });
    
    logAudit(userId, 'UPDATE', 'Bookings', bookingId, `Synchronized appointment record.`);
};

export const updateBookingStatus = (bookingId: string, status: BookingStatus, userId: string) => {
    const docRef = doc(db, COLLECTION_NAME, bookingId);
    const payload = { status, updatedAt: serverTimestamp() };

    updateDoc(docRef, payload).catch(async (err) => {
        errorEmitter.emit('permission-error', new FirestorePermissionError({
            path: docRef.path,
            operation: 'update',
            requestResourceData: payload,
        } satisfies SecurityRuleContext));
    });

    logAudit(userId, 'UPDATE_STATUS', 'Bookings', bookingId, `Appointment marked as: ${status}`);
};

export const deleteBooking = (bookingId: string, userId: string) => {
    const docRef = doc(db, COLLECTION_NAME, bookingId);
    deleteDoc(docRef).catch(async (err) => {
        errorEmitter.emit('permission-error', new FirestorePermissionError({
            path: docRef.path,
            operation: 'delete',
        } satisfies SecurityRuleContext));
    });
    logAudit(userId, 'DELETE', 'Bookings', bookingId, `Purged appointment from registry.`);
};
