
'use client';

import { useState, useEffect, useRef } from 'react';
import { 
  onSnapshot, 
  DocumentReference, 
  DocumentSnapshot, 
  DocumentData, 
  FirestoreError,
  refEqual
} from 'firebase/firestore';
import { errorEmitter } from '../error-emitter';
import { FirestorePermissionError } from '../errors';

/**
 * @fileOverview A standardized hook for real-time Firestore document streams.
 * Utilizes internal stabilization to prevent infinite loops from unstable reference objects.
 */
export function useDoc<T = DocumentData>(docRef: DocumentReference<T> | null) {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<FirestoreError | null>(null);

  // Stabilize the document reference to prevent unnecessary effect re-runs.
  const memoRef = useRef<DocumentReference<T> | null>(null);
  if (docRef && (!memoRef.current || !refEqual(docRef, memoRef.current))) {
    memoRef.current = docRef;
  }
  const stableRef = docRef ? memoRef.current : null;

  useEffect(() => {
    if (!stableRef) {
      setData(null);
      setLoading(false);
      return;
    }

    setLoading(true);
    const unsubscribe = onSnapshot(
      stableRef,
      (snapshot: DocumentSnapshot<T>) => {
        setData(snapshot.exists() ? { ...snapshot.data(), id: snapshot.id } as T : null);
        setLoading(false);
      },
      (err: FirestoreError) => {
        console.error("useDoc error:", err);
        setError(err);
        setLoading(false);

        if (err.code === 'permission-denied') {
          const permissionError = new FirestorePermissionError({
            path: stableRef.path,
            operation: 'get',
          });
          errorEmitter.emit('permission-error', permissionError);
        }
      }
    );

    return () => unsubscribe();
  }, [stableRef]);

  return { data, loading, error };
}
