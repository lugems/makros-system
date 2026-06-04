
'use client';

import { useMemo, DependencyList } from 'react';
import { app, db, auth } from '@/lib/firebase';
import { FirebaseApp } from 'firebase/app';
import { Firestore } from 'firebase/firestore';
import { Auth } from 'firebase/auth';

/**
 * @fileOverview Barrel file for Firebase services, providing initialization and hooks.
 */

export function initializeFirebase(): {
  firebaseApp: FirebaseApp;
  firestore: Firestore;
  auth: Auth;
} {
  return { firebaseApp: app, firestore: db, auth };
}

/**
 * A specialized memoization hook for Firebase references and queries.
 * Helps prevent infinite render loops by stabilizing complex Firestore objects.
 * Use this when creating queries or references that depend on dynamic props or state.
 */
export function useMemoFirebase<T>(factory: () => T, deps: DependencyList): T {
  // eslint-disable-next-line react-hooks/exhaustive-deps
  return useMemo(factory, deps);
}

export * from './provider';
export * from './client-provider';
export * from './firestore/use-collection';
export * from './firestore/use-doc';
export * from './auth/use-user';
