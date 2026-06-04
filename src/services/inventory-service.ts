'use client';

import { 
  collection, 
  doc, 
  getDoc,
  setDoc, 
  updateDoc, 
  deleteDoc,
  serverTimestamp,
  runTransaction
} from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { InventoryItem } from '@/types/inventory';
import { logAudit } from '@/lib/audit-logger';
import { errorEmitter } from '@/firebase/error-emitter';
import { FirestorePermissionError, type SecurityRuleContext } from '@/firebase/errors';

const COLLECTION_NAME = 'inventory';


export const getInventoryItemById = async (itemId: string): Promise<InventoryItem | null> => {
    const docRef = doc(db, COLLECTION_NAME, itemId);
    const docSnap = await getDoc(docRef);
  
    if (docSnap.exists()) {
      return { ...docSnap.data(), itemId: docSnap.id } as InventoryItem;
    }
  
    return null;
  };

/**
 * Enrolls a new SKU into the workshop catalog.
 * Follows the non-blocking pattern for Firestore mutations.
 */
export const createInventoryItem = (
  data: Omit<InventoryItem, 'itemId' | 'createdAt' | 'updatedAt'>, 
  userId: string
) => {
  const docRef = doc(collection(db, COLLECTION_NAME));
  const payload = {
    ...data,
    itemId: docRef.id,
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

  logAudit(userId, 'CREATE', 'Inventory', docRef.id, `Enrolled new SKU: ${data.itemName}`);
  return docRef.id;
};

/**
 * Synchronizes technical specifications for an existing catalog item.
 * Follows the non-blocking pattern for Firestore mutations.
 */
export const updateInventoryItem = (itemId: string, data: Partial<InventoryItem>, userId: string) => {
    const docRef = doc(db, COLLECTION_NAME, itemId);
    const payload = { ...data, updatedAt: serverTimestamp() };
    
    updateDoc(docRef, payload).catch(async (serverError) => {
        errorEmitter.emit('permission-error', new FirestorePermissionError({
          path: docRef.path,
          operation: 'update',
          requestResourceData: payload,
        } satisfies SecurityRuleContext));
    });
    
    logAudit(userId, 'UPDATE', 'Inventory', itemId, `Synchronized technical specs for SKU.`);
};

/**
 * Atomic transaction to deduct inventory, preventing negative stock levels.
 */
export const deductInventoryQuantity = async (itemId: string, amount: number, userId: string) => {
  await runTransaction(db, async (transaction) => {
    const docRef = doc(db, COLLECTION_NAME, itemId);
    const snapshot = await transaction.get(docRef);
    
    if (!snapshot.exists()) throw new Error("SKU not found.");
    
    const currentQty = snapshot.data().quantity;
    if (currentQty < amount) throw new Error("Inventory exhaustion. Insufficient stock.");

    transaction.update(docRef, { 
      quantity: currentQty - amount,
      updatedAt: serverTimestamp() 
    });
  });

  logAudit(userId, 'DEDUCT_STOCK', 'Inventory', itemId, `Manual deduction of ${amount} units.`);
};

/**
 * Decommissions a SKU from the catalog.
 * Follows the non-blocking pattern for Firestore mutations.
 */
export const deleteInventoryItem = (itemId: string, userId: string) => {
  const docRef = doc(db, COLLECTION_NAME, itemId);
  
  deleteDoc(docRef).catch(async (serverError) => {
    errorEmitter.emit('permission-error', new FirestorePermissionError({
      path: docRef.path,
      operation: 'delete',
    } satisfies SecurityRuleContext));
  });
  
  logAudit(userId, 'DELETE', 'Inventory', itemId, `Purged SKU from catalog.`);
};
