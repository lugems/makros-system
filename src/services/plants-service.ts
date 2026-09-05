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
import { PlantEquipment } from '@/types/plant-equipment';
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

  logAudit(userId, 'CREATE', 'PlantsAndEquipment', docRef.id, `Registered plant asset: ${data.name} (${data.assetId})`);
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

  logAudit(userId, 'UPDATE', 'PlantsAndEquipment', id, `Synchronized technical dossier for plant: ${id}`);
};

export const deletePlant = (id: string, userId: string) => {
    const docRef = doc(db, COLLECTION_NAME, id);
    deleteDoc(docRef).catch(async (err) => {
        errorEmitter.emit('permission-error', new FirestorePermissionError({
            path: docRef.path,
            operation: 'delete',
        } satisfies SecurityRuleContext));
    });
    logAudit(userId, 'DELETE', 'PlantsAndEquipment', id, `Purged plant record from registry.`);
};
