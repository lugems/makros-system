'use client';

import { db } from '@/lib/firebase';
import { doc, setDoc, serverTimestamp } from 'firebase/firestore';
import { WorkshopSettings } from '@/types/settings';
import { errorEmitter } from '@/firebase/error-emitter';
import { FirestorePermissionError, type SecurityRuleContext } from '@/firebase/errors';
import { logAudit } from '@/lib/audit-logger';

/**
 * Synchronizes workshop configuration with the master registry in Firestore.
 * Path: settings/workshop
 * Uses an atomic setDoc with merge: true to handle both initial enrollment and updates.
 */
export const updateSettings = async (settings: Partial<WorkshopSettings>, userId: string) => {
  const settingsRef = doc(db, 'settings', 'workshop');
  
  // Prepare payload with server-side update telemetry
  const payload: any = {
    ...settings,
    updatedAt: serverTimestamp(),
  };

  // Standard non-blocking mutation with merge: true to handle both create and update scenarios
  setDoc(settingsRef, payload, { merge: true }).catch(async (serverError) => {
      // Create and emit a rich, contextual error for the global listener
      const permissionError = new FirestorePermissionError({
          path: settingsRef.path,
          operation: 'write',
          requestResourceData: payload,
      } satisfies SecurityRuleContext);
      
      errorEmitter.emit('permission-error', permissionError);
  });

  // Log the action in the immutable audit registry
  logAudit(userId, 'UPDATE_SETTINGS', 'Settings', 'workshop', 'Synchronized global workshop parameters with master registry.');
};
