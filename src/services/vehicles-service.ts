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
import { Vehicle } from '@/types/vehicle';
import { logAudit } from '@/lib/audit-logger';
import { errorEmitter } from '@/firebase/error-emitter';
import { FirestorePermissionError, type SecurityRuleContext } from '@/firebase/errors';

const COLLECTION_NAME = 'vehicles';

export const getVehicles = async (): Promise<Vehicle[]> => {
  const q = query(collection(db, COLLECTION_NAME), orderBy('createdAt', 'desc'));
  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => ({ ...doc.data(), vehicleId: doc.id } as Vehicle));
};

export const getVehiclesByCustomer = async (customerId: string): Promise<Vehicle[]> => {
  const q = query(collection(db, COLLECTION_NAME), where('customerId', '==', customerId), orderBy('createdAt', 'desc'));
  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => ({ ...doc.data(), vehicleId: doc.id } as Vehicle));
};

export const getVehicleById = async (vehicleId: string): Promise<Vehicle | null> => {
  const docRef = doc(db, COLLECTION_NAME, vehicleId);
  const snapshot = await getDoc(docRef);
  return snapshot.exists() ? ({ ...snapshot.data(), vehicleId: snapshot.id } as Vehicle) : null;
};

export const registerVehicle = (
  data: Omit<Vehicle, 'vehicleId' | 'createdAt' | 'updatedAt'>, 
  userId: string
) => {
  const docRef = doc(collection(db, COLLECTION_NAME));
  const payload = {
    ...data,
    vehicleId: docRef.id,
    status: data.status || 'Active',
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

  logAudit(userId, 'CREATE', 'Vehicles', docRef.id, `Registered asset: ${data.numberPlate}`);
  return docRef.id;
};

export const updateVehicle = (
  vehicleId: string, 
  data: Partial<Vehicle>, 
  userId: string
) => {
  const docRef = doc(db, COLLECTION_NAME, vehicleId);
  const payload = { ...data, updatedAt: serverTimestamp() };
  
  updateDoc(docRef, payload).catch(async (err) => {
    errorEmitter.emit('permission-error', new FirestorePermissionError({
      path: docRef.path,
      operation: 'update',
      requestResourceData: payload,
    } satisfies SecurityRuleContext));
  });

  logAudit(userId, 'UPDATE', 'Vehicles', vehicleId, `Synchronized technical data for ${vehicleId}`);
};

export const decommissionVehicle = (vehicleId: string, userId: string) => {
    const docRef = doc(db, COLLECTION_NAME, vehicleId);
    const payload = { status: 'Inactive', updatedAt: serverTimestamp() };
    
    updateDoc(docRef, payload).catch(async (err) => {
        errorEmitter.emit('permission-error', new FirestorePermissionError({
          path: docRef.path,
          operation: 'update',
          requestResourceData: payload,
        } satisfies SecurityRuleContext));
    });
    logAudit(userId, 'DEACTIVATE', 'Vehicles', vehicleId, `Asset marked as out-of-service.`);
};

export const deleteVehicleRecord = (vehicleId: string, userId: string) => {
    const docRef = doc(db, COLLECTION_NAME, vehicleId);
    deleteDoc(docRef).catch(async (err) => {
        errorEmitter.emit('permission-error', new FirestorePermissionError({
          path: docRef.path,
          operation: 'delete',
        } satisfies SecurityRuleContext));
    });
    logAudit(userId, 'DELETE', 'Vehicles', vehicleId, `Asset removed from registry.`);
};
