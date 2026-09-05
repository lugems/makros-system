'use client';

import { 
  collection, 
  doc, 
  setDoc, 
  updateDoc, 
  deleteDoc,
  serverTimestamp,
  getDoc
} from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { PlantEquipment, PlantStatus } from '@/types/plant-equipment';
import { logAudit } from '@/lib/audit-logger';
import { errorEmitter } from '@/firebase/error-emitter';
import { FirestorePermissionError, type SecurityRuleContext } from '@/firebase/errors';

const COLLECTION_NAME = 'plantsAndEquipment';

export const registerPlant = (
  data: Omit<PlantEquipment, 'id' | 'createdAt' | 'updatedAt'>, 
  userId: string
) => {
  const docRef = doc(collection(db, COLLECTION_NAME));
  const payload = {
    ...data,
    id: docRef.id,
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

  logAudit(userId, 'CREATE_PLANT', 'PlantsAndEquipment', docRef.id, `Registered plant asset: ${data.name} (${data.assetId})`);
  return docRef.id;
};

export const updatePlant = (
  id: string, 
  data: Partial<PlantEquipment>, 
  userId: string
) => {
  const docRef = doc(db, COLLECTION_NAME, id);
  const payload = { ...data, updatedAt: serverTimestamp() };
  
  updateDoc(docRef, payload).catch(async (err) => {
    errorEmitter.emit('permission-error', new FirestorePermissionError({
      path: docRef.path,
      operation: 'update',
      requestResourceData: payload,
    } satisfies SecurityRuleContext));
  });

  logAudit(userId, 'UPDATE_PLANT', 'PlantsAndEquipment', id, `Synchronized technical dossier for plant: ${id}`);
};

export const updatePlantMeter = (
  id: string, 
  newReading: number, 
  userId: string
) => {
  const docRef = doc(db, COLLECTION_NAME, id);
  const payload = { 
    meterReading: newReading, 
    updatedAt: serverTimestamp() 
  };
  
  updateDoc(docRef, payload).catch(async (err) => {
    errorEmitter.emit('permission-error', new FirestorePermissionError({
      path: docRef.path,
      operation: 'update',
      requestResourceData: payload,
    } satisfies SecurityRuleContext));
  });

  logAudit(userId, 'UPDATE_METER', 'PlantsAndEquipment', id, `Recalibrated meter telemetry to ${newReading.toLocaleString()} units.`);
};

export const updatePlantStatus = (
  id: string, 
  status: PlantStatus, 
  userId: string
) => {
  const docRef = doc(db, COLLECTION_NAME, id);
  const payload = { 
    status, 
    updatedAt: serverTimestamp() 
  };
  
  updateDoc(docRef, payload).catch(async (err) => {
    errorEmitter.emit('permission-error', new FirestorePermissionError({
      path: docRef.path,
      operation: 'update',
      requestResourceData: payload,
    } satisfies SecurityRuleContext));
  });

  logAudit(userId, 'UPDATE_PLANT_STATUS', 'PlantsAndEquipment', id, `Asset state shifted to: ${status}`);
};

export const decommissionPlant = (id: string, userId: string) => {
    const docRef = doc(db, COLLECTION_NAME, id);
    const payload = { status: 'Decommissioned' as PlantStatus, updatedAt: serverTimestamp() };
    
    updateDoc(docRef, payload).catch(async (err) => {
        errorEmitter.emit('permission-error', new FirestorePermissionError({
          path: docRef.path,
          operation: 'update',
          requestResourceData: payload,
        } satisfies SecurityRuleContext));
    });
    
    logAudit(userId, 'DECOMMISSION_PLANT', 'PlantsAndEquipment', id, `Asset forensically decommissioned from active service.`);
};

export const deletePlant = (id: string, userId: string) => {
    const docRef = doc(db, COLLECTION_NAME, id);
    deleteDoc(docRef).catch(async (err) => {
        errorEmitter.emit('permission-error', new FirestorePermissionError({
            path: docRef.path,
            operation: 'delete',
        } satisfies SecurityRuleContext));
    });
    logAudit(userId, 'PURGE_PLANT', 'PlantsAndEquipment', id, `Purged plant record from registry.`);
};
